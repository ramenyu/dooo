import { NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    // This endpoint is deprecated - use /api/users with organizationId instead
    return NextResponse.json({ 
      error: 'This endpoint is deprecated. Use /api/users?organizationId=... instead.',
      message: 'Please use the organization-specific user endpoint'
    }, { status: 410 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

