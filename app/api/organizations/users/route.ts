import { NextRequest, NextResponse } from 'next/server'
import { getUsersByOrganization } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')
    
    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 })
    }

    const users = getUsersByOrganization(organizationId)
    // Remove passwords from response
    const usersWithoutPasswords = users.map(({ password, ...user }) => user)
    
    return NextResponse.json(usersWithoutPasswords)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

