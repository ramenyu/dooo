import { NextRequest, NextResponse } from 'next/server'
import { createOrganization, findOrganizationByName } from '@/lib/supabase-db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const name = request.nextUrl.searchParams.get('name')
    
    if (name) {
      // Find organization by name
      const org = await findOrganizationByName(name)
      if (!org) {
        return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
      }
      return NextResponse.json(org)
    }
    
    // For now, return empty array since we don't have a getAllOrganizations function
    // This could be added if needed
    return NextResponse.json([])
  } catch (error) {
    console.error('Get organization error:', error)
    return NextResponse.json({ error: 'Failed to fetch organizations' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json()
    
    if (!name) {
      return NextResponse.json({ error: 'Organization name is required' }, { status: 400 })
    }

    // Check if organization with this name already exists
    const existingOrg = await findOrganizationByName(name)
    if (existingOrg) {
      return NextResponse.json({ error: 'Organization with this name already exists' }, { status: 409 })
    }

    const newOrganization = await createOrganization({
      name,
      created_at: new Date().toISOString()
    })
    
    return NextResponse.json(newOrganization, { status: 201 })
  } catch (error) {
    console.error('Organization creation error:', error)
    return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 })
  }
}

