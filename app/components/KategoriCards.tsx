'use client'

import { TrendingUp, TrendingDown, Minus, Star, BarChart3 } from 'lucide-react'

const KONFIG: Record<string, { icon: typeof Star; border: string; bg: string; header: string; label: string }> = {
  Hits: { icon: TrendingUp, border: 'border-green-200', bg: 'bg-gradient-to-r from-green-50 to-green-100/50', header: 'bg-green-500', label: 'text-green-700' },
  Average: { icon: Minus, border: 'border-blue-200', bg: 'bg-gradient-to-r from-blue-50 to-blue-100/50', header: 'bg-blue-500', label: 'text-blue-700' },
  Flop: { icon: TrendingDown, border: 'border-red-200', bg: 'bg-gradient-to-r from-red-50 to-red-100/50', header: 'bg-red-500', label: 'text-red-700' },
  'Below Average': { icon: BarChart3, border: 'border-amber-200', bg: 'bg-gradient-to-r from-amber-50 to-amber-100/50', header: 'bg-amber-500', label: 'text-amber-700' },
}

interface Props {
  data: { klasifikasi: string; count: number; avg_rating: number; avg_sentiment: number }[]
  totalCount: number
}

export default function KategoriCards({ data, totalCount }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {data.map((k) => {
        const cfg = KONFIG[k.klasifikasi] || KONFIG['Average']
        const Icon = cfg.icon
        const pct = ((k.count / totalCount) * 100).toFixed(1)

        return (
          <div key={k.klasifikasi} className={`rounded-2xl border ${cfg.border} ${cfg.bg} overflow-hidden card-hover`}>
            <div className={`${cfg.header} px-4 py-2 flex items-center gap-2`}>
              <Icon className="w-4 h-4 text-white" />
              <span className="text-sm font-semibold text-white">{k.klasifikasi}</span>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Jumlah Film</span>
                  <span className="font-semibold text-gray-700">{k.count.toLocaleString()} ({pct}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: cfg.header.replace('bg-', '#').replace('green-500', '22c55e').replace('blue-500', '3b82f6').replace('red-500', 'ef4444').replace('amber-500', 'f59e0b'),
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/70 rounded-lg p-2 text-center">
                  <p className="text-gray-400">Rating</p>
                  <p className="font-bold text-gray-800">{k.avg_rating}</p>
                </div>
                <div className="bg-white/70 rounded-lg p-2 text-center">
                  <p className="text-gray-400">Sentimen</p>
                  <p className="font-bold text-gray-800">{k.avg_sentiment}</p>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
