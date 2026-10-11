import { request } from '../lib/api'
import type { Category } from '../catalog/catalog.service'

export interface CategoryInput {
  name: string
  description?: string
}

// Endpoints que exigem role `admin` (a API responde 403 para os demais).
export const adminService = {
  createCategory: (input: CategoryInput) =>
    request<Category>('/categories', { method: 'POST', body: input }),

  updateCategory: (id: number, input: Partial<CategoryInput>) =>
    request<Category>(`/categories/${id}`, { method: 'PATCH', body: input }),

  deleteCategory: (id: number) => request<void>(`/categories/${id}`, { method: 'DELETE' }),
}
