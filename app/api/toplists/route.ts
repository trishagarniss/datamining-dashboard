import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { data, error } = await supabase.rpc('get_top_lists')
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch top lists' }, { status: 500 })
  }
}
