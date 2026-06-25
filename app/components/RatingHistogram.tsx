'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface Props {
  data: { range: string; count: number }[]
}

export default function RatingHistogram({ data }: Props) {
  const maxCount = Math.max(...data.map((d) => d.count))
  const total = data.reduce((s, d) => s + d.count, 0)

  return (
    <div className="rounded-2xl border border-gray-100 bg-white/80 backdrop-blur-sm p-6 shadow-sm card-hover">
      <h2 className="text-lg font-semibold text-gray-800 mb-1">Distribusi Rating</h2>
      <p className="text-sm text-gray-400 mb-4">Sebaran rating film — total {total.toLocaleString()} film</p>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} barGap={0} barCategoryGap={1}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="range"
            tick={{ fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, maxCount + maxCount * 0.15]}
            tick={{ fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            }}
            formatter={(value: any, _name: any, props: any) => {
              const v = value ?? 0
              return [`${v.toLocaleString()} film (${((v / total) * 100).toFixed(1)}%)`, `Rating ${props.payload.range}`]
            }}
          />
          <Bar dataKey="count" radius={[2, 2, 0, 0]}>
            {data.map((entry, idx) => {
              const intensity = entry.count / maxCount
              const r = Math.round(99 + (55 - 99) * intensity)
              const g = Math.round(102 + (130 - 102) * intensity)
              const b = Math.round(241 + (255 - 241) * intensity)
              return <Cell key={idx} fill={`rgb(${r}, ${g}, ${b})`} />
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
