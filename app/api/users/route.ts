import { NextRequest, NextResponse } from 'next/server'
import { addUser, findUserByNameAndOrganization, getUsers } from '@/lib/database'

export async function GET() {
  try {
    const users = getUsers()
    return NextResponse.json(users)
  } catch (error) {
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
    const existingUser = findUserByNameAndOrganization(name, organizationId)
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists in this organization' }, { status: 409 })
    }

    // Create new user
    const newUser = {
      id: crypto.randomUUID(),
      name,
      password,
      organizationId,
      createdAt: new Date().toISOString()
    }

    addUser(newUser)

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser
    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}
