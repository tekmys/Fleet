import { api } from './api'
import type { User, Role } from '../types'

export interface UserListParams {
  role?: Role
  page?: number
  limit?: number
}

export interface UserListResponse {
  users: User[]
  total: number
  page: number
  limit: number
}

export interface CreateUserPayload {
  name: string
  email: string
  password: string
  role: Role
}

export interface UpdateUserPayload {
  name?: string
  email?: string
  password?: string
  role?: Role
  isActive?: boolean
}

export const userService = {
  async list(params: UserListParams = {}): Promise<UserListResponse> {
    const { data } = await api.get<{ success: true; data: UserListResponse }>('/users', { params })
    return data.data
  },

  async create(payload: CreateUserPayload): Promise<User> {
    const { data } = await api.post<{ success: true; data: User }>('/users', payload)
    return data.data
  },

  async get(id: string): Promise<User> {
    const { data } = await api.get<{ success: true; data: User }>(`/users/${id}`)
    return data.data
  },

  async update(id: string, payload: UpdateUserPayload): Promise<User> {
    const { data } = await api.patch<{ success: true; data: User }>(`/users/${id}`, payload)
    return data.data
  },

  async deactivate(id: string): Promise<void> {
    await api.delete(`/users/${id}`)
  },
}
