'use client'

import { ScatterChart as ReScatter, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Movie } from '../types'

const COLORS: Record<string, string> = {
  Hits: '#22c55e',
  Average: '#3b82f6',
  Flop: '#ef4444',
  'Below Average': '#f59e0b',
}

interface Props {
  movies: Movie[]
}

export default function ScatterChart({ movies }: Props) {
  const grouped: Record<string, { x: number; y: number }[]> = {}
  for (const m of movies) {
    if (!grouped[m.klasifikasi]) grouped[m.klasifikasi] = []
    grouped[m.klasifikasi].push({ x: m.avg_rating, y: m.avg_sentiment })
  }

  const scatterData = Object.entries(grouped).map(([kategori, data]) => ({
    id: kategori,
    name: kategori,
    color: COLORS[kategori] || '#999',
    data,
  }))

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Rating vs Sentiment per Film</h2>
      <ResponsiveContainer width="100%" height={400}>
        <ReScatter margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid />
          <XAxis type="number" dataKey="x" name="Rating" domain={[0, 11]} label={{ value: 'Avg Rating', position: 'bottom' }} />
          <YAxis type="number" dataKey="y" name="Sentiment" domain={[0, 1.1]} label={{ value: 'Avg Sentiment', angle: -90, position: 'insideLeft' }} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Legend />
          {scatterData.map((s) => (
            <Scatter key={s.id} name={s.name} data={s.data} fill={s.color} />
          ))}
        </ReScatter>
      </ResponsiveContainer>
    </div>
  )
}
