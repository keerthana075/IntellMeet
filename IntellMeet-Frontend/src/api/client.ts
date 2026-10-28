const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/$/, '')

let accessToken: string | null = null
let refreshPromise: Promise<string | null> | null = null

export class ApiError extends Error {
  status: number
  details?: unknown

  constructor(status: number, message: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

export function setAccessToken(token: string | null) {
  accessToken = token
}
export function getAccessToken(): string | null {
  return accessToken
}

async function parseResponse(response: Response) {
  if (response.status === 204) return undefined
  const text = await response.text()
  if (!text) return undefined
  try {
    return JSON.parse(text)
  } catch {
    throw new ApiError(response.status, 'Server returned an invalid response')
  }
}

export async function refreshAccessToken(): Promise<{ accessToken: string; user: unknown } | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { Accept: 'application/json' },
      })

      if (!response.ok) {
        setAccessToken(null)
        return null
      }

      const payload = await parseResponse(response) as { data?: { accessToken?: string; user?: unknown } }
      const token = payload?.data?.accessToken
      if (!token) {
        setAccessToken(null)
        return null
      }

      setAccessToken(token)
      return token
    })().finally(() => {
      refreshPromise = null
    })
  }

  const token = await refreshPromise
  if (!token) return null

  const response = await fetch(`${API_BASE_URL}/users/me`, {
    credentials: 'include',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })
  if (!response.ok) return null
  const payload = await parseResponse(response) as { data?: unknown }
  return { accessToken: token, user: payload?.data }
}

type RequestOptions = RequestInit & { retryAuth?: boolean }

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { retryAuth = true, headers, ...fetchOptions } = options
  const requestHeaders = new Headers(headers)

  requestHeaders.set('Accept', 'application/json')
  if (fetchOptions.body && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json')
  }
  if (accessToken) requestHeaders.set('Authorization', `Bearer ${accessToken}`)

  let response = await fetch(`${API_BASE_URL}${path}`, {
    ...fetchOptions,
    headers: requestHeaders,
    credentials: 'include',
  })

  if (response.status === 401 && retryAuth && !path.startsWith('/auth/')) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      requestHeaders.set('Authorization', `Bearer ${refreshed.accessToken}`)
      response = await fetch(`${API_BASE_URL}${path}`, {
        ...fetchOptions,
        headers: requestHeaders,
        credentials: 'include',
      })
    }
  }

  const payload = await parseResponse(response) as { error?: string; details?: unknown } | undefined
  if (!response.ok) {
    throw new ApiError(response.status, payload?.error || 'Request failed', payload?.details)
  }

  return payload as T
}
