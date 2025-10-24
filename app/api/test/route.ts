import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  // Get all organizations for debugging
  const { data: orgs, error: orgError } = await supabase
    .from('organizations')
    .select('*')
  
  return NextResponse.json({ 
    message: 'API is working',
    timestamp: new Date().toISOString(),
    organizations: orgs,
    orgError: orgError?.message
  })
}
