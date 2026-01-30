import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'

const httpLink = createHttpLink({
  uri: `${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/graphql`,
})

// OAuth token fetching for authenticated requests
let accessToken: string | null = null
let tokenExpiry: number | null = null

async function getAccessToken(): Promise<string | null> {
  // Return cached token if still valid
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken
  }

  const clientId = process.env.DRUPAL_CLIENT_ID
  const clientSecret = process.env.DRUPAL_CLIENT_SECRET
  const baseUrl = process.env.NEXT_PUBLIC_DRUPAL_BASE_URL

  if (!clientId || !clientSecret || !baseUrl) {
    return null
  }

  try {
    const response = await fetch(`${baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }),
    })

    if (!response.ok) {
      console.error('OAuth token request failed:', response.status)
      return null
    }

    const data = await response.json()
    accessToken = data.access_token
    tokenExpiry = Date.now() + (data.expires_in - 60) * 1000 // Refresh 60s before expiry

    return accessToken
  } catch (error) {
    console.error('Error fetching OAuth token:', error)
    return null
  }
}

const authLink = setContext(async (_, { headers }) => {
  const token = await getAccessToken()
  return {
    headers: {
      ...headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  }
})

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      fetchPolicy: 'no-cache',
    },
  },
})

// Check if Drupal is configured
export function isDrupalConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_DRUPAL_BASE_URL &&
    process.env.DRUPAL_CLIENT_ID &&
    process.env.DRUPAL_CLIENT_SECRET
  )
}
