import { NextRequest, NextResponse } from 'next/server'
import { findUserByNameAndOrganization } from '@/lib/supabase-db'

export async function POST(request: NextRequest) {
  try {
    const { name, password, organizationId } = await request.json()
    
    if (!name || !password || !organizationId) {
      return NextResponse.json({ error: 'Name, password, and organization ID are required' }, { status: 400 })
    }

    const user = await findUserByNameAndOrganization(name, organizationId)
    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Failed to authenticate' }, { status: 500 })
  }
}
