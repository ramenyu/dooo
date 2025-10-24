import { NextRequest, NextResponse } from 'next/server'
import { createOrganization, findOrganizationByDomain } from '@/lib/supabase-db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // For now, return empty array since we don't have a getAllOrganizations function
    // This could be added if needed
    return NextResponse.json([])
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch organizations' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, domain } = await request.json()
    
    if (!name || !domain) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if organization with this domain already exists
    const existingOrg = await findOrganizationByDomain(domain)
    if (existingOrg) {
      return NextResponse.json({ error: 'Organization with this domain already exists' }, { status: 409 })
    }

    const newOrganization = await createOrganization({
      name,
      domain,
      created_at: new Date().toISOString()
    })
    
    return NextResponse.json(newOrganization, { status: 201 })
  } catch (error) {
    console.error('Organization creation error:', error)
    return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 })
  }
}

