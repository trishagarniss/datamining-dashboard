'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Movie } from './types'
import SummaryCards from './components/SummaryCards'
import CategoryPieChart from './components/CategoryPieChart'
import ScatterChart from './components/ScatterChart'
import MovieTable from './components/MovieTable'

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMovies = async () => {
      const { data, error } = await supabase.from('movies').select('*')
      if (error) {
        console.error('Error fetching:', error)
      } else if (data) {
        setMovies(data)
      }
      setLoading(false)
    }
    fetchMovies()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">Memuat data...</p>
      </div>
    )
  }

  if (movies.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">Tidak ada data. Pastikan Supabase terhubung dengan benar.</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Dashboard Klasifikasi Film</h1>
        <p className="text-sm text-gray-500">Analisis klasifikasi 4 kategori berdasarkan rating dan sentimen</p>
      </header>

      <SummaryCards movies={movies} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryPieChart movies={movies} />
        <ScatterChart movies={movies} />
      </div>

      <MovieTable movies={movies} />
    </div>
  )
}
