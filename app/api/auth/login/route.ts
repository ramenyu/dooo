import { NextRequest, NextResponse } from 'next/server'
import { findUserByNameAndOrganization } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { name, password, organizationId } = await request.json()
    
    if (!name || !password || !organizationId) {
      return NextResponse.json({ error: 'Name, password, and organization ID are required' }, { status: 400 })
    }

    const user = findUserByNameAndOrganization(name, organizationId)
    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to authenticate' }, { status: 500 })
  }
}
