import { request } from '../lib/api'
import type { Category, Product } from '../catalog/catalog.service'

export interface CategoryInput {
  name: string
  description?: string
}

export interface ProductInput {
  name: string
  description: string
  priceInCents: number
  stock: number
  sku: string
  images: string[]
  isActive: boolean
  categoryId: number
}

// Endpoints que exigem role `admin` (a API responde 403 para os demais).
export const adminService = {
  createCategory: (input: CategoryInput) =>
    request<Category>('/categories', { method: 'POST', body: input }),

  updateCategory: (id: number, input: Partial<CategoryInput>) =>
    request<Category>(`/categories/${id}`, { method: 'PATCH', body: input }),

  deleteCategory: (id: number) => request<void>(`/categories/${id}`, { method: 'DELETE' }),

  createProduct: (input: ProductInput) =>
    request<Product>('/products', { method: 'POST', body: input }),

  updateProduct: (id: number, input: Partial<ProductInput>) =>
    request<Product>(`/products/${id}`, { method: 'PATCH', body: input }),

  /** A API não apaga o produto: só marca como inativo (some da loja). */
  deactivateProduct: (id: number) => request<void>(`/products/${id}`, { method: 'DELETE' }),
}
