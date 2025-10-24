import { NextRequest, NextResponse } from 'next/server'
import { getUsersByOrganization } from '@/lib/supabase-db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const organizationId = request.nextUrl.searchParams.get('organizationId')
    
    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 })
    }

    const users = await getUsersByOrganization(organizationId)
    // Remove passwords from response
    const usersWithoutPasswords = users.map(({ password, ...user }) => user)
    
    return NextResponse.json(usersWithoutPasswords)
  } catch (error) {
    console.error('Get organization users error:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

