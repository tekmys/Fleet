import { api } from './api'
import type { ResourceType } from '../types'

export interface Resource {
  id: string
  title: string
  type: ResourceType
  url: string
  textContent?: string
  moduleId: string
  createdAt: string
  isCompleted?: boolean
}

export interface Module {
  id: string
  title: string
  order: number
  courseId: string
  createdAt: string
  updatedAt: string
  resources: Resource[]
}

export const moduleService = {
  async list(courseId: string): Promise<Module[]> {
    const { data } = await api.get<{ success: true; data: Module[] }>(
      `/courses/${courseId}/modules`,
    )
    return data.data
  },

  async create(courseId: string, title: string): Promise<Module> {
    const { data } = await api.post<{ success: true; data: Module }>(
      `/courses/${courseId}/modules`,
      { title },
    )
    return data.data
  },

  async update(id: string, payload: { title?: string; order?: number }): Promise<Module> {
    const { data } = await api.patch<{ success: true; data: Module }>(`/modules/${id}`, payload)
    return data.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/modules/${id}`)
  },

  async addResource(
    moduleId: string,
    payload: { title: string; type: ResourceType; url: string; textContent?: string },
  ): Promise<Resource> {
    const { data } = await api.post<{ success: true; data: Resource }>(
      `/modules/${moduleId}/resources`,
      payload,
    )
    return data.data
  },

  async deleteResource(id: string): Promise<void> {
    await api.delete(`/resources/${id}`)
  },
}
