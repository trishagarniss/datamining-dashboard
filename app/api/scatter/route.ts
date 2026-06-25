import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sample = Math.min(parseInt(searchParams.get('sample') || '3000'), 10000)
    const { data, error } = await supabase.rpc('get_scatter_data', { sample_count: sample })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch scatter data' }, { status: 500 })
  }
}
