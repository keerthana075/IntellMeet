import { apiRequest, refreshAccessToken, setAccessToken } from './client'
import type { User } from '../types'

type AuthResponse = {
  success: true
  data: {
    user: User
    accessToken: string
  }
}

export async function login(email: string, password: string) {
  const response = await apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    retryAuth: false,
  })
  setAccessToken(response.data.accessToken)
  return response.data.user
}

export async function register(name: string, email: string, password: string) {
  const response = await apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
    retryAuth: false,
  })
  setAccessToken(response.data.accessToken)
  return response.data.user
}

export async function restoreSession() {
  const session = await refreshAccessToken()
  return session?.user as User | undefined
}

export async function logout() {
  try {
    await apiRequest<void>('/auth/logout', { method: 'POST', retryAuth: false })
  } finally {
    setAccessToken(null)
  }
}
