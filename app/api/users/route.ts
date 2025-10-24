import { NextRequest, NextResponse } from 'next/server'
import { createUser, findUserByNameAndOrganization, getUsersByOrganization } from '@/lib/supabase-db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')
    
    if (!organizationId) {
      return NextResponse.json({ error: 'organizationId is required' }, { status: 400 })
    }
    
    const users = await getUsersByOrganization(organizationId)
    return NextResponse.json(users)
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, password, organizationId } = await request.json()
    
    if (!name || !password || !organizationId) {
      return NextResponse.json({ error: 'Name, password, and organization ID are required' }, { status: 400 })
    }

    // Check if user already exists in this organization
    const existingUser = await findUserByNameAndOrganization(name, organizationId)
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists in this organization' }, { status: 409 })
    }

    // Create new user
    const newUser = await createUser({
      name,
      password,
      organization_id: organizationId,
      created_at: new Date().toISOString()
    })

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser
    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}
