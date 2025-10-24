import { NextResponse } from 'next/server'
import { getUsers } from '@/lib/database'

export async function GET() {
  try {
    const users = getUsers()
    // Return users without passwords
    const safeUsers = users.map(({ password, ...user }) => user)
    return NextResponse.json(safeUsers)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

