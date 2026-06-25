'use client'

import { Film, Star, MessageSquare, Flame } from 'lucide-react'

interface Props {
  totalCount: number
  avgRating: number
  avgSentiment: number
  hitsCount: number
}

const cards = [
  {
    label: 'Total Film',
    icon: Film,
    gradient: 'gradient-card-blue',
    borderColor: 'border-blue-200',
    getValue: (p: Props) => p.totalCount.toLocaleString(),
    subtitle: 'film dianalisis',
  },
  {
    label: 'Rata-rata Rating',
    icon: Star,
    gradient: 'gradient-card-green',
    borderColor: 'border-green-200',
    getValue: (p: Props) => p.avgRating.toFixed(2),
    subtitle: 'dari skala 1-10',
  },
  {
    label: 'Rata-rata Sentimen',
    icon: MessageSquare,
    gradient: 'gradient-card-purple',
    borderColor: 'border-purple-200',
    getValue: (p: Props) => p.avgSentiment.toFixed(2),
    subtitle: 'dari skala 0-1',
  },
  {
    label: 'Film Hits',
    icon: Flame,
    gradient: 'gradient-card-amber',
    borderColor: 'border-amber-200',
    getValue: (p: Props) => p.hitsCount.toLocaleString(),
    subtitle: 'film terpopuler',
  },
]

export default function SummaryCards(props: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.label}
            className={`rounded-2xl border ${card.borderColor} ${card.gradient} p-5 card-hover cursor-default`}
          >
            <div className="flex items-center justify-between mb-3">
              <Icon className="w-6 h-6 text-gray-600" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{card.label}</span>
            </div>
            <p className="text-3xl font-bold text-gray-800">{card.getValue(props)}</p>
            <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
          </div>
        )
      })}
    </div>
  )
}
