import { request } from '../lib/api'

export interface Category {
  id: number
  name: string
  slug: string
  description?: string | null
}

export interface Product {
  id: number
  name: string
  slug: string
  description: string
  priceInCents: number
  stock: number
  sku: string
  images: string[]
  isActive: boolean
  category: Category
  createdAt: string
  updatedAt: string
}

export interface Paginated<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export type ProductSort = 'newest' | 'price_asc' | 'price_desc'

export interface ProductQuery {
  search?: string
  categoryId?: number
  sort?: ProductSort
  page?: number
  limit?: number
}

function toSearchParams(query: ProductQuery) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') params.set(key, String(value))
  }
  return params.toString()
}

export const catalogService = {
  listProducts: (query: ProductQuery) =>
    request<Paginated<Product>>(`/products?${toSearchParams(query)}`, { auth: false }),

  getProduct: (slug: string) =>
    request<Product>(`/products/${encodeURIComponent(slug)}`, { auth: false }),

  listCategories: () => request<Category[]>('/categories', { auth: false }),
}
