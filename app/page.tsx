'use client'

import { useEffect, useState, useCallback } from 'react'
import { BarChart3, TrendingUp, Table2, Film, Inbox } from 'lucide-react'
import { Movie } from './types'
import SummaryCards from './components/SummaryCards'
import CategoryPieChart from './components/CategoryPieChart'
import BarChartKategori from './components/BarChartKategori'
import RatingHistogram from './components/RatingHistogram'
import SentimentHistogram from './components/SentimentHistogram'
import ScatterChart from './components/ScatterChart'
import KategoriCards from './components/KategoriCards'
import InsightCard from './components/InsightCard'
import TopList from './components/TopList'
import MovieTable from './components/MovieTable'

type Tab = 'overview' | 'analysis' | 'data'

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'overview', label: 'Overview', icon: BarChart3 },
  { key: 'analysis', label: 'Analysis', icon: TrendingUp },
  { key: 'data', label: 'Data', icon: Table2 },
]

interface OverviewStats {
  total_count: number
  avg_rating: number
  avg_sentiment: number
  kategori_data: { klasifikasi: string; count: number; avg_rating: number; avg_sentiment: number }[]
  rating_dist: { range: string; count: number }[]
  sentiment_dist: { range: string; count: number }[]
}

const initialStats: OverviewStats = {
  total_count: 0,
  avg_rating: 0,
  avg_sentiment: 0,
  kategori_data: [],
  rating_dist: [],
  sentiment_dist: [],
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [loading, setLoading] = useState(true)

  const [stats, setStats] = useState<OverviewStats>(initialStats)
  const [statsLoading, setStatsLoading] = useState(true)

  const [scatterData, setScatterData] = useState<any[]>([])
  const [scatterLoading, setScatterLoading] = useState(true)

  const [topLists, setTopLists] = useState<{ top_hits: Movie[]; top_flop: Movie[] }>({ top_hits: [], top_flop: [] })
  const [topListsLoading, setTopListsLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    setStatsLoading(true)
    try {
      const res = await fetch('/api/stats')
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setStats(data)
    } catch (err) {
      console.error('Error fetching stats:', err)
    } finally {
      setStatsLoading(false)
      setLoading(false)
    }
  }, [])

  const fetchScatter = useCallback(async () => {
    setScatterLoading(true)
    try {
      const res = await fetch('/api/scatter?sample=8000')
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setScatterData(data.data || [])
    } catch (err) {
      console.error('Error fetching scatter:', err)
    } finally {
      setScatterLoading(false)
    }
  }, [])

  const fetchTopLists = useCallback(async () => {
    setTopListsLoading(true)
    try {
      const res = await fetch('/api/toplists')
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setTopLists(data)
    } catch (err) {
      console.error('Error fetching toplists:', err)
    } finally {
      setTopListsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
    fetchScatter()
    fetchTopLists()
  }, [fetchStats, fetchScatter, fetchTopLists])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Memuat data...</p>
        </div>
      </div>
    )
  }

  if (stats.total_count === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Inbox className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-400">Belum ada data. Pastikan tabel movies terisi.</p>
        </div>
      </div>
    )
  }

  const moviesForTable: Movie[] = [] // Table fetches its own data server-side

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <header className="rounded-2xl gradient-header p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-4 mb-2">
          <Film className="w-10 h-10 text-indigo-200" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Dashboard Klasifikasi Film</h1>
            <p className="text-indigo-200 text-sm mt-1">
              Analisis klasifikasi 4 kategori berdasarkan rating dan sentimen &mdash; {stats.total_count.toLocaleString()} film
            </p>
          </div>
        </div>
      </header>

      <nav className="flex gap-1 bg-white/60 backdrop-blur-sm rounded-xl p-1.5 border border-gray-100 shadow-sm">
        {TABS.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-white text-indigo-700 shadow-sm border border-gray-100'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </nav>

      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fadeIn">
          {statsLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <SummaryCards
                totalCount={stats.total_count}
                avgRating={stats.avg_rating}
                avgSentiment={stats.avg_sentiment}
                hitsCount={stats.kategori_data.find((k) => k.klasifikasi === 'Hits')?.count || 0}
              />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CategoryPieChart data={stats.kategori_data} />
                <BarChartKategori data={stats.kategori_data} />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RatingHistogram data={stats.rating_dist} />
                <SentimentHistogram data={stats.sentiment_dist} />
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'analysis' && (
        <div className="space-y-6 animate-fadeIn">
          {scatterLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
          ) : (
            <ScatterChart data={scatterData} />
          )}

          {statsLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <InsightCard
                totalCount={stats.total_count}
                avgRating={stats.avg_rating}
                avgSentiment={stats.avg_sentiment}
                kategoriData={stats.kategori_data}
              />
              <KategoriCards data={stats.kategori_data} totalCount={stats.total_count} />
              <TopList topHits={topLists.top_hits} topFlop={topLists.top_flop} loading={topListsLoading} />
            </>
          )}
        </div>
      )}

      {activeTab === 'data' && (
        <div className="space-y-6 animate-fadeIn">
          <MovieTable />
        </div>
      )}

      <footer className="text-center text-xs text-gray-400 py-4 border-t border-gray-100">
        Data Mining Project - Sains Data UNS
      </footer>
    </div>
  )
}
