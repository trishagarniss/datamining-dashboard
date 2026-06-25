'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
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

export default function CategoryPieChart({ movies }: Props) {
  const counts: Record<string, number> = {}
  for (const m of movies) {
    counts[m.klasifikasi] = (counts[m.klasifikasi] || 0) + 1
  }

  const data = Object.entries(counts).map(([name, value]) => ({
    name,
    value,
  }))

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Distribusi Kategori</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(1)}%`}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name] || '#999'} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
