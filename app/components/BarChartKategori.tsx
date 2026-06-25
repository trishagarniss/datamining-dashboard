'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface Props {
  data: { klasifikasi: string; count: number; avg_rating: number; avg_sentiment: number }[]
}

export default function BarChartKategori({ data }: Props) {
  const chartData = data.map((d) => ({
    name: d.klasifikasi,
    Rating: d.avg_rating,
    Sentimen: d.avg_sentiment,
  }))

  return (
    <div className="rounded-2xl border border-gray-100 bg-white/80 backdrop-blur-sm p-6 shadow-sm card-hover">
      <h2 className="text-lg font-semibold text-gray-800 mb-1">Rata-rata per Kategori</h2>
      <p className="text-sm text-gray-400 mb-4">Perbandingan rating dan sentimen tiap kategori</p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} barGap={8} barCategoryGap={20}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis yAxisId="left" orientation="left" stroke="#6366f1" domain={[0, 10]} tick={{ fontSize: 12 }} />
          <YAxis yAxisId="right" orientation="right" stroke="#a78bfa" domain={[0, 1]} tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
          />
          <Legend
            formatter={(value: string) => <span className="text-sm font-medium text-gray-600">{value}</span>}
          />
          <Bar yAxisId="left" dataKey="Rating" fill="#6366f1" radius={[6, 6, 0, 0]} name="Rating" />
          <Bar yAxisId="right" dataKey="Sentimen" fill="#a78bfa" radius={[6, 6, 0, 0]} name="Sentimen" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
