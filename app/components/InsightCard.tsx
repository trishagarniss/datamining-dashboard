'use client'

import { Lightbulb, Target, TrendingUp, Star } from 'lucide-react'

interface Props {
  totalCount: number
  avgRating: number
  avgSentiment: number
  kategoriData: { klasifikasi: string; count: number; avg_rating: number; avg_sentiment: number }[]
}

const EMOJI: Record<string, string> = {
  Hits: '🔥',
  Average: '👌',
  Flop: '💀',
  'Below Average': '⚠️',
}

const COLORS: Record<string, string> = {
  Hits: '#22c55e',
  Average: '#3b82f6',
  Flop: '#ef4444',
  'Below Average': '#f59e0b',
}

export default function InsightCard({ totalCount, avgRating, avgSentiment, kategoriData }: Props) {
  const hits = kategoriData.find((k) => k.klasifikasi === 'Hits')
  const hitsPct = hits ? ((hits.count / totalCount) * 100).toFixed(1) : '0'

  const tertinggi = [...kategoriData].sort((a, b) => b.avg_rating - a.avg_rating)[0]
  const terendah = [...kategoriData].sort((a, b) => a.avg_rating - b.avg_rating)[0]

  return (
    <div className="rounded-2xl border border-gray-100 bg-white/80 backdrop-blur-sm p-5 shadow-sm card-hover">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-amber-500" />
        <h3 className="text-sm font-semibold text-gray-700">Insight Cepat</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-50 p-3 text-center">
          <Target className="w-4 h-4 mx-auto mb-1 text-gray-400" />
          <p className="text-lg font-bold text-gray-800">{hitsPct}%</p>
          <p className="text-[10px] text-gray-400">Film termasuk Hits</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-50 p-3 text-center">
          <TrendingUp className="w-4 h-4 mx-auto mb-1 text-gray-400" />
          <p className="text-lg font-bold text-gray-800">{avgRating}</p>
          <p className="text-[10px] text-gray-400">Rata-rata rating</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-50 p-3 text-center">
          <Star className="w-4 h-4 mx-auto mb-1 text-gray-400" />
          <p className="text-sm font-bold text-gray-800 flex items-center justify-center gap-1">
            <span style={{ color: COLORS[tertinggi.klasifikasi] }}>{EMOJI[tertinggi.klasifikasi]}</span>
            {tertinggi.klasifikasi}
          </p>
          <p className="text-[10px] text-gray-400">Rating tertinggi ({tertinggi.avg_rating})</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-50 p-3 text-center">
          <Star className="w-4 h-4 mx-auto mb-1 text-gray-400" />
          <p className="text-sm font-bold text-gray-800 flex items-center justify-center gap-1">
            <span style={{ color: COLORS[terendah.klasifikasi] }}>{EMOJI[terendah.klasifikasi]}</span>
            {terendah.klasifikasi}
          </p>
          <p className="text-[10px] text-gray-400">Rating terendah ({terendah.avg_rating})</p>
        </div>
      </div>
    </div>
  )
}
