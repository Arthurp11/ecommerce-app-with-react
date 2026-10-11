import { tokenStorage, type Tokens } from './tokens'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string | string[]) {
    super(Array.isArray(message) ? message.join('\n') : message)
    this.status = status
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  auth?: boolean
}

// Dispara quando o refresh falha, para o AuthContext deslogar o usuário.
export const SESSION_EXPIRED_EVENT = 'auth:session-expired'

let refreshPromise: Promise<boolean> | null = null

async function refreshTokens(): Promise<boolean> {
  const refreshToken = tokenStorage.getRefreshToken()
  if (!refreshToken) return false

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    if (!response.ok) return false

    tokenStorage.set((await response.json()) as Tokens)
    return true
  } catch {
    return false
  }
}

// Garante um único refresh mesmo com várias requisições recebendo 401 ao mesmo tempo.
function refreshOnce(): Promise<boolean> {
  refreshPromise ??= refreshTokens().finally(() => {
    refreshPromise = null
  })
  return refreshPromise
}

async function send(path: string, { method = 'GET', body, auth = true }: RequestOptions) {
  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const accessToken = tokenStorage.getAccessToken()
  if (auth && accessToken) headers.Authorization = `Bearer ${accessToken}`

  return fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let response = await send(path, options)

  if (response.status === 401 && options.auth !== false) {
    if (await refreshOnce()) {
      response = await send(path, options)
    } else {
      tokenStorage.clear()
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
    }
  }

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new ApiError(response.status, data?.message ?? 'Erro inesperado')
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}
