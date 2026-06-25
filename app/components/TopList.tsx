'use client'

import { Movie } from '../types'
import { Loader2 } from 'lucide-react'

interface Props {
  topHits: Movie[]
  topFlop: Movie[]
  loading: boolean
}

export default function TopList({ topHits, topFlop, loading }: Props) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="rounded-2xl border border-gray-100 bg-white/80 backdrop-blur-sm p-6 shadow-sm card-hover">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">🔥 Top 10 Rating Tertinggi</h2>
        <p className="text-sm text-gray-400 mb-4">Film dengan rating terbaik</p>
        <div className="space-y-2">
          {topHits.map((m, idx) => (
            <div key={m.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-green-50/50 transition-colors">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${idx < 3 ? 'bg-amber-500' : 'bg-gray-300'}`}>
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{m.movie}</p>
                <p className="text-xs text-gray-400">{m.klasifikasi}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-700">{Number(m.avg_rating).toFixed(2)}</p>
                <p className="text-xs text-gray-400">{Number(m.avg_sentiment).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white/80 backdrop-blur-sm p-6 shadow-sm card-hover">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">💀 Top 10 Rating Terendah (Flop)</h2>
        <p className="text-sm text-gray-400 mb-4">Film flop dengan rating terburuk</p>
        <div className="space-y-2">
          {topFlop.map((m, idx) => (
            <div key={m.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-red-50/50 transition-colors">
              <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white bg-red-400">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{m.movie}</p>
                <p className="text-xs text-gray-400">{m.klasifikasi}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-700">{Number(m.avg_rating).toFixed(2)}</p>
                <p className="text-xs text-gray-400">{Number(m.avg_sentiment).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
