import { NextRequest, NextResponse } from 'next/server'

const DRUPAL_BASE_URL = process.env.NEXT_PUBLIC_DRUPAL_BASE_URL
const CLIENT_ID = process.env.DRUPAL_CLIENT_ID
const CLIENT_SECRET = process.env.DRUPAL_CLIENT_SECRET

let accessToken: string | null = null
let tokenExpiry: number | null = null

async function getAccessToken(): Promise<string | null> {
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken
  }

  if (!CLIENT_ID || !CLIENT_SECRET || !DRUPAL_BASE_URL) {
    return null
  }

  try {
    const response = await fetch(`${DRUPAL_BASE_URL}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
    })

    if (!response.ok) {
      console.error('OAuth token request failed:', response.status)
      return null
    }

    const data = await response.json()
    accessToken = data.access_token
    tokenExpiry = Date.now() + (data.expires_in - 60) * 1000

    return accessToken
  } catch (error) {
    console.error('Error fetching OAuth token:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  if (!DRUPAL_BASE_URL) {
    return NextResponse.json(
      { error: 'Drupal not configured' },
      { status: 503 }
    )
  }

  try {
    const body = await request.json()
    const token = await getAccessToken()

    const response = await fetch(`${DRUPAL_BASE_URL}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('GraphQL proxy error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
