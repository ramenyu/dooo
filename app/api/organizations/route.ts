import { NextRequest, NextResponse } from 'next/server'
import { getOrganizations, addOrganization, findOrganizationByDomain } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const organizations = getOrganizations()
    return NextResponse.json(organizations)
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
    const existingOrg = findOrganizationByDomain(domain)
    if (existingOrg) {
      return NextResponse.json({ error: 'Organization with this domain already exists' }, { status: 409 })
    }

    const newOrganization = {
      id: crypto.randomUUID(),
      name,
      domain,
      createdAt: new Date().toISOString()
    }

    addOrganization(newOrganization)
    return NextResponse.json(newOrganization, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 })
  }
}

