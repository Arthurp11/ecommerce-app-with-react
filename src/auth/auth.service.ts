import { request } from '../lib/api'
import type { Tokens } from '../lib/tokens'

export type UserRole = 'customer' | 'admin'

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
}

interface MessageResponse {
  message: string
}

export interface ProfileInput {
  name?: string
  email?: string
  password?: string
}

export const authService = {
  login: (email: string, password: string) =>
    request<Tokens & MessageResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
      auth: false,
    }),

  register: (name: string, email: string, password: string) =>
    request<User>('/user', {
      method: 'POST',
      body: { name, email, password },
      auth: false,
    }),

  logout: () => request<MessageResponse>('/auth/logout', { method: 'POST' }),

  me: () => request<User>('/user/me'),

  updateUser: (id: number, input: ProfileInput) =>
    request<User>(`/user/${id}`, { method: 'PATCH', body: input }),

  deleteUser: (id: number) => request<void>(`/user/${id}`, { method: 'DELETE' }),

  forgotPassword: (email: string) =>
    request<MessageResponse>('/auth/forgot-password', {
      method: 'POST',
      body: { email },
      auth: false,
    }),

  resetPassword: (token: string, newPassword: string) =>
    request<MessageResponse>('/auth/reset-password', {
      method: 'POST',
      body: { token, newPassword },
      auth: false,
    }),
}
