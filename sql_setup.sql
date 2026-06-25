-- ============================================
-- 0. Extensions
-- ============================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================
-- 1. Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_movies_klasifikasi ON movies(klasifikasi);
CREATE INDEX IF NOT EXISTS idx_movies_avg_rating ON movies(avg_rating);
CREATE INDEX IF NOT EXISTS idx_movies_avg_sentiment ON movies(avg_sentiment);
CREATE INDEX IF NOT EXISTS idx_movies_kategori_rating ON movies(klasifikasi, avg_rating);
CREATE INDEX IF NOT EXISTS idx_movies_movie_trgm ON movies USING gin (movie gin_trgm_ops);

-- ============================================
-- 2. Materialized View — pre-computed overview
-- ============================================
DROP MATERIALIZED VIEW IF EXISTS mv_overview;

CREATE MATERIALIZED VIEW mv_overview AS
WITH kategori_agg AS (
  SELECT
    m.klasifikasi,
    COUNT(*) AS cnt,
    ROUND(AVG(m.avg_rating)::NUMERIC, 2) AS avg_rating,
    ROUND(AVG(m.avg_sentiment)::NUMERIC, 2) AS avg_sentiment
  FROM movies m
  GROUP BY m.klasifikasi
),
rating_bins AS (
  SELECT
    CASE WHEN m.avg_rating >= 10 THEN 10 ELSE FLOOR(m.avg_rating)::INT END AS sort_key,
    CASE WHEN m.avg_rating >= 10 THEN '10' ELSE FLOOR(m.avg_rating)::TEXT || '-' || (FLOOR(m.avg_rating) + 1)::TEXT END AS range,
    COUNT(*) AS cnt
  FROM movies m
  GROUP BY sort_key, range
),
sentiment_bins AS (
  SELECT
    CASE WHEN m.avg_sentiment >= 1.0 THEN 10 ELSE FLOOR(m.avg_sentiment * 10)::INT END AS sort_key,
    CASE WHEN m.avg_sentiment >= 1.0 THEN '1.0' ELSE FLOOR(m.avg_sentiment * 10)::TEXT || '-' || (FLOOR(m.avg_sentiment * 10) + 1)::TEXT END AS range,
    COUNT(*) AS cnt
  FROM movies m
  GROUP BY sort_key, range
)
SELECT
  (SELECT COUNT(*) FROM movies) AS total_count,
  (SELECT ROUND(AVG(m.avg_rating)::NUMERIC, 2) FROM movies m) AS avg_rating,
  (SELECT ROUND(AVG(m.avg_sentiment)::NUMERIC, 2) FROM movies m) AS avg_sentiment,
  (SELECT JSON_AGG(json_build_object(
    'klasifikasi', k.klasifikasi,
    'count', k.cnt,
    'avg_rating', k.avg_rating,
    'avg_sentiment', k.avg_sentiment
  ) ORDER BY k.cnt DESC) FROM kategori_agg k) AS kategori_data,
  (SELECT JSON_AGG(json_build_object('range', r.range, 'count', r.cnt) ORDER BY r.sort_key) FROM rating_bins r) AS rating_dist,
  (SELECT JSON_AGG(json_build_object('range', s.range, 'count', s.cnt) ORDER BY s.sort_key) FROM sentiment_bins s) AS sentiment_dist;

-- ============================================
-- 3. Scatter function (TABLESAMPLE BERNOULLI)
-- ============================================
CREATE OR REPLACE FUNCTION get_scatter_data(sample_count INT DEFAULT 3000)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT JSON_AGG(json_build_object(
    'movie', s.movie,
    'avg_rating', s.avg_rating,
    'avg_sentiment', s.avg_sentiment,
    'klasifikasi', s.klasifikasi
  ))
  INTO v_result
  FROM (SELECT m.movie, m.avg_rating, m.avg_sentiment, m.klasifikasi
        FROM movies m TABLESAMPLE BERNOULLI(5)
        LIMIT sample_count) s;

  RETURN json_build_object('data', COALESCE(v_result, '[]'::JSON), 'sample_count', sample_count);
END;
$$;

-- ============================================
-- 4. Top 10 Hits & Top 10 Flop
-- ============================================
CREATE OR REPLACE FUNCTION get_top_lists()
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_hits JSON;
  v_flop JSON;
BEGIN
  SELECT JSON_AGG(json_build_object(
    'id', t.id, 'movie', t.movie, 'avg_rating', t.avg_rating, 'avg_sentiment', t.avg_sentiment, 'klasifikasi', t.klasifikasi
  ))
  INTO v_hits
  FROM (SELECT m.id, m.movie, m.avg_rating, m.avg_sentiment, m.klasifikasi FROM movies m ORDER BY m.avg_rating DESC LIMIT 10) t;

  SELECT JSON_AGG(json_build_object(
    'id', t.id, 'movie', t.movie, 'avg_rating', t.avg_rating, 'avg_sentiment', t.avg_sentiment, 'klasifikasi', t.klasifikasi
  ))
  INTO v_flop
  FROM (SELECT m.id, m.movie, m.avg_rating, m.avg_sentiment, m.klasifikasi FROM movies m WHERE m.klasifikasi = 'Flop' ORDER BY m.avg_rating ASC LIMIT 10) t;

  RETURN json_build_object('top_hits', COALESCE(v_hits, '[]'::JSON), 'top_flop', COALESCE(v_flop, '[]'::JSON));
END;
$$;

-- ============================================
-- 5. Paginated movies with search & filter
-- ============================================
CREATE OR REPLACE FUNCTION get_movies_paginated(
  page_num INT DEFAULT 1,
  page_size INT DEFAULT 50,
  search_term TEXT DEFAULT '',
  kategori_filter TEXT DEFAULT '',
  rating_min NUMERIC DEFAULT 0,
  rating_max NUMERIC DEFAULT 10,
  sort_column TEXT DEFAULT 'movie',
  sort_direction TEXT DEFAULT 'asc'
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  offset_val INT;
  v_total BIGINT;
  v_result JSON;
BEGIN
  offset_val := (page_num - 1) * page_size;

  EXECUTE format(
    'SELECT COUNT(*) FROM movies m WHERE
      ($1 = '''' OR LOWER(m.movie) LIKE ''%%%%'' || LOWER($1) || ''%%%%'') AND
      ($2 = '''' OR $2 = ''All'' OR m.klasifikasi = $2) AND
      m.avg_rating >= $3 AND m.avg_rating <= $4'
  ) INTO v_total USING search_term, kategori_filter, rating_min, rating_max;

  EXECUTE format(
    'SELECT COALESCE(JSON_AGG(json_build_object(
      ''id'', sub.id, ''movie'', sub.movie, ''avg_rating'', sub.avg_rating,
      ''avg_sentiment'', sub.avg_sentiment, ''klasifikasi'', sub.klasifikasi
    )), ''[]''::JSON) FROM (
      SELECT m.id, m.movie, ROUND(m.avg_rating::NUMERIC, 2) AS avg_rating, ROUND(m.avg_sentiment::NUMERIC, 2) AS avg_sentiment, m.klasifikasi
      FROM movies m WHERE
        ($1 = '''' OR LOWER(m.movie) LIKE ''%%%%'' || LOWER($1) || ''%%%%'') AND
        ($2 = '''' OR $2 = ''All'' OR m.klasifikasi = $2) AND
        m.avg_rating >= $3 AND m.avg_rating <= $4
      ORDER BY %I %s
      LIMIT $5 OFFSET $6
    ) sub',
    sort_column, CASE WHEN sort_direction = 'asc' THEN 'ASC' ELSE 'DESC' END
  ) INTO v_result USING search_term, kategori_filter, rating_min, rating_max, page_size, offset_val;

  RETURN json_build_object(
    'data', v_result,
    'total', v_total,
    'page', page_num,
    'page_size', page_size,
    'total_pages', GREATEST(1, CEIL(v_total::NUMERIC / NULLIF(page_size, 0))::INT)
  );
END;
$$;
