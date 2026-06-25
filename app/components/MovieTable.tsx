'use client'

import { useState, useMemo } from 'react'
import { Movie } from '../types'

interface Props {
  movies: Movie[]
}

const KATEGORI = ['All', 'Hits', 'Average', 'Flop', 'Below Average']

export default function MovieTable({ movies }: Props) {
  const [search, setSearch] = useState('')
  const [filterKategori, setFilterKategori] = useState('All')
  const [sortKey, setSortKey] = useState<'movie' | 'avg_rating' | 'avg_sentiment'>('movie')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const filtered = useMemo(() => {
    let result = [...movies]

    if (filterKategori !== 'All') {
      result = result.filter((m) => m.klasifikasi === filterKategori)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((m) => m.movie.toLowerCase().includes(q))
    }

    result.sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      if (typeof aVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal as string) : (bVal as string).localeCompare(aVal)
      }
      return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number)
    })

    return result
  }, [movies, search, filterKategori, sortKey, sortDir])

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const badgeClass = (k: string) => {
    switch (k) {
      case 'Hits': return 'bg-green-100 text-green-800'
      case 'Average': return 'bg-blue-100 text-blue-800'
      case 'Flop': return 'bg-red-100 text-red-800'
      case 'Below Average': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Daftar Film</h2>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder="Cari film..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border px-3 py-2 text-sm"
        />
        <select
          value={filterKategori}
          onChange={(e) => setFilterKategori(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          {KATEGORI.map((k) => (
            <option key={k} value={k}>{k === 'All' ? 'Semua Kategori' : k}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="text-left px-3 py-2 cursor-pointer select-none" onClick={() => toggleSort('movie')}>
                Film {sortKey === 'movie' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th className="text-left px-3 py-2 cursor-pointer select-none" onClick={() => toggleSort('avg_rating')}>
                Rating {sortKey === 'avg_rating' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th className="text-left px-3 py-2 cursor-pointer select-none" onClick={() => toggleSort('avg_sentiment')}>
                Sentiment {sortKey === 'avg_sentiment' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th className="text-left px-3 py-2">Kategori</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id} className="border-t hover:bg-gray-50">
                <td className="px-3 py-2 max-w-[300px] truncate">{m.movie}</td>
                <td className="px-3 py-2">{m.avg_rating}</td>
                <td className="px-3 py-2">{m.avg_sentiment}</td>
                <td className="px-3 py-2">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${badgeClass(m.klasifikasi)}`}>
                    {m.klasifikasi}
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-400">Tidak ada data</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400 mt-2">Menampilkan {filtered.length} dari {movies.length} film</p>
    </div>
  )
}
