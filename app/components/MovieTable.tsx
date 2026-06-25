'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, SearchX, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

const ITEMS_PER_PAGE = 50
const KATEGORI = ['All', 'Hits', 'Average', 'Flop', 'Below Average']

const BADGE_CLASS: Record<string, string> = {
  Hits: 'bg-green-100 text-green-700 border-green-200',
  Average: 'bg-blue-100 text-blue-700 border-blue-200',
  Flop: 'bg-red-100 text-red-700 border-red-200',
  'Below Average': 'bg-amber-100 text-amber-700 border-amber-200',
}

const DOT_COLOR: Record<string, string> = {
  Hits: '#22c55e',
  Average: '#3b82f6',
  Flop: '#ef4444',
  'Below Average': '#f59e0b',
}

interface MovieRow {
  id: number
  movie: string
  avg_rating: number
  avg_sentiment: number
  klasifikasi: string
}

interface PaginatedResponse {
  data: MovieRow[] | null
  total: number
  page: number
  page_size: number
  total_pages: number
}

export default function MovieTable() {
  const [search, setSearch] = useState('')
  const [filterKategori, setFilterKategori] = useState('All')
  const [ratingMin, setRatingMin] = useState('')
  const [ratingMax, setRatingMax] = useState('')
  const [sortKey, setSortKey] = useState<'movie' | 'avg_rating' | 'avg_sentiment'>('movie')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<PaginatedResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        search,
        kategori: filterKategori,
        rating_min: ratingMin || '0',
        rating_max: ratingMax || '10',
        sort_by: sortKey,
        sort_dir: sortDir,
      })
      const res = await fetch(`/api/movies?${params}`)
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setData(json)
    } catch (err) {
      console.error('Error fetching movies:', err)
    } finally {
      setLoading(false)
    }
  }, [page, search, filterKategori, ratingMin, ratingMax, sortKey, sortDir])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir(key === 'movie' ? 'asc' : 'desc')
    }
    setPage(1)
  }

  const SortIcon = ({ column }: { column: typeof sortKey }) => {
    if (sortKey !== column) return <span className="text-gray-300 ml-1">↕</span>
    return <span className="text-indigo-500 ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  const movies = data?.data || []
  const total = data?.total || 0
  const totalPages = data?.total_pages || 1

  return (
    <div className="rounded-2xl border border-gray-100 bg-white/80 backdrop-blur-sm px-3 py-4 sm:px-5 sm:py-5 shadow-sm card-hover">

      <div className="flex items-center justify-between mb-4 px-2">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Daftar Film</h2>
          <p className="text-sm text-gray-400">{total.toLocaleString()} film ditemukan</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
          {filterKategori !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
              {filterKategori}
            </span>
          )}
          {(ratingMin || ratingMax) && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
              Rating {ratingMin || '0'}–{ratingMax || '10'}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3 mb-4 px-2">
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari film..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full rounded-xl border border-gray-200 pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all bg-white/70"
          />
        </div>
        <select
          value={filterKategori}
          onChange={(e) => { setFilterKategori(e.target.value); setPage(1) }}
          className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white/70"
        >
          {KATEGORI.map((k) => (
            <option key={k} value={k}>{k === 'All' ? 'Semua Kategori' : k}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Rating min (0)"
          value={ratingMin}
          onChange={(e) => { setRatingMin(e.target.value); setPage(1) }}
          className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white/70"
          min={0}
          max={10}
          step={0.1}
        />
        <input
          type="number"
          placeholder="Rating max (10)"
          value={ratingMax}
          onChange={(e) => { setRatingMax(e.target.value); setPage(1) }}
          className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white/70"
          min={0}
          max={10}
          step={0.1}
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100 relative min-h-[200px]">
        {loading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] flex items-center justify-center z-10">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          </div>
        )}
        <table className="w-full text-sm table-fixed">
          <thead className="bg-gray-50/80 backdrop-blur-sm">
            <tr>
              <th
                className="text-left px-3 py-3 font-semibold text-gray-600 cursor-pointer select-none hover:text-indigo-600 transition-colors w-[55%]"
                onClick={() => toggleSort('movie')}
              >
                Film <SortIcon column="movie" />
              </th>
              <th
                className="text-left px-3 py-3 font-semibold text-gray-600 cursor-pointer select-none hover:text-indigo-600 transition-colors w-[14%]"
                onClick={() => toggleSort('avg_rating')}
              >
                Rating <SortIcon column="avg_rating" />
              </th>
              <th
                className="text-left px-3 py-3 font-semibold text-gray-600 cursor-pointer select-none hover:text-indigo-600 transition-colors w-[16%]"
                onClick={() => toggleSort('avg_sentiment')}
              >
                Sentimen <SortIcon column="avg_sentiment" />
              </th>
              <th className="text-left px-3 py-3 font-semibold text-gray-600 w-[15%]">Kategori</th>
            </tr>
          </thead>
          <tbody>
            {movies.map((m) => (
              <tr key={m.id} className="border-t border-gray-50 hover:bg-indigo-50/30 transition-colors">
                <td className="px-3 py-3 text-gray-800 font-medium truncate" title={m.movie}>{m.movie}</td>
                <td className="px-3 py-3 text-gray-600">{Number(m.avg_rating).toFixed(2)}</td>
                <td className="px-3 py-3 text-gray-600">{Number(m.avg_sentiment).toFixed(2)}</td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${BADGE_CLASS[m.klasifikasi] || ''}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: DOT_COLOR[m.klasifikasi] }} />
                    {m.klasifikasi}
                  </span>
                </td>
              </tr>
            ))}
            {!loading && movies.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-12 text-gray-400">
                  <SearchX className="w-8 h-8 mx-auto mb-2" />
                  <p>Tidak ada film yang cocok</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-gray-400">
            Halaman {page} dari {totalPages.toLocaleString()}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <span className="text-xs text-gray-500 px-2">
              {page} / {totalPages.toLocaleString()}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
