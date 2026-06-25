import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const page = parseInt(searchParams.get('page') || '1')
    const search = searchParams.get('search') || ''
    const kategori = searchParams.get('kategori') || ''
    const ratingMin = parseFloat(searchParams.get('rating_min') || '0')
    const ratingMax = parseFloat(searchParams.get('rating_max') || '10')
    const sortBy = searchParams.get('sort_by') || 'movie'
    const sortDir = searchParams.get('sort_dir') || 'asc'

    const validSortColumns = ['movie', 'avg_rating', 'avg_sentiment']
    const safeSortBy = validSortColumns.includes(sortBy) ? sortBy : 'movie'
    const safeSortDir = sortDir === 'asc' ? 'asc' : 'desc'

    const { data, error } = await supabase.rpc('get_movies_paginated', {
      page_num: page,
      page_size: 50,
      search_term: search,
      kategori_filter: kategori,
      rating_min: ratingMin,
      rating_max: ratingMax,
      sort_column: safeSortBy,
      sort_direction: safeSortDir,
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch movies' }, { status: 500 })
  }
}
