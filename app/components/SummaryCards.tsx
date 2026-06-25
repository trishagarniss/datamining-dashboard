'use client'

import { Movie } from '../types'

interface Props {
  movies: Movie[]
}

export default function SummaryCards({ movies }: Props) {
  const totalMovies = movies.length
  const avgRating = (movies.reduce((sum, m) => sum + m.avg_rating, 0) / totalMovies).toFixed(2)
  const avgSentiment = (movies.reduce((sum, m) => sum + m.avg_sentiment, 0) / totalMovies).toFixed(2)

  const kategoriCount: Record<string, number> = {}
  for (const m of movies) {
    kategoriCount[m.klasifikasi] = (kategoriCount[m.klasifikasi] || 0) + 1
  }

  const cards = [
    { label: 'Total Film', value: totalMovies, color: 'bg-blue-500' },
    { label: 'Rata-rata Rating', value: avgRating, color: 'bg-green-500' },
    { label: 'Rata-rata Sentiment', value: avgSentiment, color: 'bg-purple-500' },
    { label: 'Jumlah Kategori', value: Object.keys(kategoriCount).length, color: 'bg-amber-500' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${card.color}`} />
            <p className="text-sm text-gray-500">{card.label}</p>
          </div>
          <p className="text-2xl font-bold mt-2">{card.value}</p>
        </div>
      ))}
    </div>
  )
}
