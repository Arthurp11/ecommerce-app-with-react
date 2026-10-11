import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { SESSION_EXPIRED_EVENT } from '../lib/api'
import { tokenStorage } from '../lib/tokens'
import { authService, type ProfileInput, type User } from './auth.service'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(() => tokenStorage.getAccessToken() !== null)

  // Restaura a sessão a partir do token salvo.
  useEffect(() => {
    if (!tokenStorage.getAccessToken()) return

    authService
      .me()
      .then(setUser)
      .catch(() => tokenStorage.clear())
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const onExpired = () => setUser(null)
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired)
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { accessToken, refreshToken } = await authService.login(email, password)
    tokenStorage.set({ accessToken, refreshToken })
    setUser(await authService.me())
  }, [])

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      await authService.register(name, email, password)
      await login(email, password)
    },
    [login],
  )

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } finally {
      tokenStorage.clear()
      setUser(null)
    }
  }, [])

  const updateProfile = useCallback(
    async (input: ProfileInput) => {
      if (!user) return
      const updated = await authService.updateUser(user.id, input)

      // Trocar a senha invalida o refresh token no servidor; logar de novo evita cair a sessão depois.
      if (input.password) await login(updated.email, input.password)
      else setUser(updated)
    },
    [user, login],
  )

  const deleteAccount = useCallback(async () => {
    if (!user) return
    await authService.deleteUser(user.id)
    tokenStorage.clear()
    setUser(null)
  }, [user])

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateProfile, deleteAccount }}
    >
      {children}
    </AuthContext.Provider>
  )
}
