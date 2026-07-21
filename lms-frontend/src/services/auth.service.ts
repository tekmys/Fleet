import { api } from './api'
import type { LoginResponse, User } from '../types'

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await api.post<{ success: true; data: LoginResponse }>('/auth/login', {
      email,
      password,
    })
    return data.data
  },

  async register(name: string, email: string, password: string, role: string): Promise<LoginResponse> {
    const { data } = await api.post<{ success: true; data: LoginResponse }>('/auth/register', {
      name,
      email,
      password,
      role,
    })
    return data.data
  },

  async logout(refreshToken: string): Promise<void> {
    await api.post('/auth/logout', { refreshToken })
  },

  async me(): Promise<User> {
    const { data } = await api.get<{ success: true; data: User }>('/auth/me')
    return data.data
  },
}
