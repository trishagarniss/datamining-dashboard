'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS: Record<string, string> = {
  Hits: '#22c55e',
  Average: '#3b82f6',
  Flop: '#ef4444',
  'Below Average': '#f59e0b',
}

const BADGE_CLASS: Record<string, string> = {
  Hits: 'bg-green-100 text-green-700 border-green-200',
  Average: 'bg-blue-100 text-blue-700 border-blue-200',
  Flop: 'bg-red-100 text-red-700 border-red-200',
  'Below Average': 'bg-amber-100 text-amber-700 border-amber-200',
}

interface Props {
  data: { klasifikasi: string; count: number; avg_rating: number; avg_sentiment: number }[]
}

export default function CategoryPieChart({ data }: Props) {
  const chartData = data.map((d) => ({ name: d.klasifikasi, value: d.count }))

  return (
    <div className="rounded-2xl border border-gray-100 bg-white/80 backdrop-blur-sm p-6 shadow-sm card-hover">
      <h2 className="text-lg font-semibold text-gray-800 mb-1">Distribusi Kategori</h2>
      <p className="text-sm text-gray-400 mb-4">Persentase film per kategori klasifikasi</p>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={55}
            paddingAngle={3}
            strokeWidth={2}
            label={({ name, percent }: { name?: string; percent?: number }) =>
              `${name ?? ''} ${((percent ?? 0) * 100).toFixed(1)}%`
            }
          >
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name] || '#999'} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
          />
          <Legend
            formatter={(value: string) => (
              <span className="text-sm font-medium text-gray-600">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-2 mt-2 justify-center">
        {chartData.map((d) => (
          <span
            key={d.name}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${BADGE_CLASS[d.name] || 'bg-gray-100 text-gray-700'}`}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[d.name] }} />
            {d.name}: {d.value.toLocaleString()} film
          </span>
        ))}
      </div>
    </div>
  )
}
