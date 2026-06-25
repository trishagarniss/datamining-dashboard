-- ============================================
-- 1. Overview Stats (summary, pie, bar, histogram)
-- ============================================
CREATE OR REPLACE FUNCTION get_overview_stats()
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_total BIGINT;
  v_avg_rating NUMERIC;
  v_avg_sentiment NUMERIC;
  v_kategori JSON;
  v_rating_dist JSON;
  v_sentiment_dist JSON;
BEGIN
  SELECT COUNT(*), ROUND(AVG(m.avg_rating)::NUMERIC, 2), ROUND(AVG(m.avg_sentiment)::NUMERIC, 2)
  INTO v_total, v_avg_rating, v_avg_sentiment FROM movies m;

  SELECT JSON_AGG(json_build_object(
    'klasifikasi', k.klasifikasi,
    'count', k.cnt,
    'avg_rating', ROUND(k.avg_r::NUMERIC, 2),
    'avg_sentiment', ROUND(k.avg_s::NUMERIC, 2)
  ) ORDER BY k.cnt DESC)
  INTO v_kategori
  FROM (
    SELECT m.klasifikasi, COUNT(*) AS cnt, AVG(m.avg_rating) AS avg_r, AVG(m.avg_sentiment) AS avg_s
    FROM movies m GROUP BY m.klasifikasi
  ) k;

  WITH bins AS (
    SELECT
      CASE
        WHEN m.avg_rating >= 10 THEN '10'
        ELSE FLOOR(m.avg_rating)::TEXT || '-' || (FLOOR(m.avg_rating) + 1)::TEXT
      END AS range
    FROM movies m
  )
  SELECT JSON_AGG(json_build_object('range', b.range, 'count', b.cnt) ORDER BY b.range)
  INTO v_rating_dist
  FROM (SELECT b.range, COUNT(*) AS cnt FROM bins b GROUP BY b.range) b;

  WITH s_bins AS (
    SELECT
      CASE
        WHEN m.avg_sentiment >= 1.0 THEN '1.0'
        ELSE FLOOR(m.avg_sentiment * 10)::TEXT || '-' || (FLOOR(m.avg_sentiment * 10) + 1)::TEXT
      END AS range
    FROM movies m
  )
  SELECT JSON_AGG(json_build_object('range', b.range, 'count', b.cnt) ORDER BY b.range)
  INTO v_sentiment_dist
  FROM (SELECT b.range, COUNT(*) AS cnt FROM s_bins b GROUP BY b.range) b;

  RETURN json_build_object(
    'total_count', v_total,
    'avg_rating', v_avg_rating,
    'avg_sentiment', v_avg_sentiment,
    'kategori_data', COALESCE(v_kategori, '[]'::JSON),
    'rating_dist', COALESCE(v_rating_dist, '[]'::JSON),
    'sentiment_dist', COALESCE(v_sentiment_dist, '[]'::JSON)
  );
END;
$$;

-- ============================================
-- 2. Scatter data (random sample for chart)
-- ============================================
CREATE OR REPLACE FUNCTION get_scatter_data(sample_count INT DEFAULT 8000)
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
  FROM (SELECT m.movie, m.avg_rating, m.avg_sentiment, m.klasifikasi FROM movies m ORDER BY RANDOM() LIMIT sample_count) s;

  RETURN json_build_object('data', COALESCE(v_result, '[]'::JSON), 'sample_count', sample_count);
END;
$$;

-- ============================================
-- 3. Top 10 Hits & Top 10 Flop
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
-- 4. Paginated movies with search & filter
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
