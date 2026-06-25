'use client'

import {
  ScatterChart as ReScatter,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ZAxis,
} from 'recharts'

const COLORS: Record<string, string> = {
  Hits: '#22c55e',
  Average: '#3b82f6',
  Flop: '#ef4444',
  'Below Average': '#f59e0b',
}

interface ScatterPoint {
  movie: string
  avg_rating: number
  avg_sentiment: number
  klasifikasi: string
}

interface Props {
  data: ScatterPoint[]
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100 shadow-lg p-3 text-sm">
        <p className="font-semibold text-gray-800 mb-1 max-w-[200px] truncate">{d.movie}</p>
        <p className="text-gray-500">Rating: <span className="font-medium text-gray-700">{Number(d.avg_rating).toFixed(2)}</span></p>
        <p className="text-gray-500">Sentimen: <span className="font-medium text-gray-700">{Number(d.avg_sentiment).toFixed(2)}</span></p>
      </div>
    )
  }
  return null
}

export default function ScatterChartView({ data }: Props) {
  const grouped: Record<string, { x: number; y: number; movie: string }[]> = {}
  for (const m of data) {
    if (!grouped[m.klasifikasi]) grouped[m.klasifikasi] = []
    grouped[m.klasifikasi].push({ x: m.avg_rating, y: m.avg_sentiment, movie: m.movie })
  }

  const scatterData = Object.entries(grouped).map(([kategori, points]) => ({
    id: kategori,
    name: kategori,
    color: COLORS[kategori] || '#999',
    data: points,
  }))

  return (
    <div className="rounded-2xl border border-gray-100 bg-white/80 backdrop-blur-sm p-6 shadow-sm card-hover">
      <h2 className="text-lg font-semibold text-gray-800 mb-1">Rating vs Sentimen</h2>
      <p className="text-sm text-gray-400 mb-4">Sebaran {data.length.toLocaleString()} sampel acak dari total film</p>
      <ResponsiveContainer width="100%" height={420}>
        <ReScatter margin={{ top: 20, right: 20, bottom: 40, left: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            type="number"
            dataKey="x"
            name="Rating"
            domain={[0, 10.5]}
            tick={{ fontSize: 12 }}
            label={{ value: 'Rata-rata Rating', position: 'bottom', offset: 0, style: { fontSize: 12, fill: '#9ca3af' } }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="Sentiment"
            domain={[-0.05, 1.05]}
            tick={{ fontSize: 12 }}
            label={{ value: 'Rata-rata Sentimen', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 12, fill: '#9ca3af' } }}
          />
          <ZAxis range={[40, 40]} />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
          <Legend
            formatter={(value: string) => (
              <span className="text-sm font-medium text-gray-600">{value}</span>
            )}
          />
          {scatterData.map((s) => (
            <Scatter key={s.id} name={s.name} data={s.data} fill={s.color} opacity={0.6} />
          ))}
        </ReScatter>
      </ResponsiveContainer>
    </div>
  )
}
