import { request } from '../lib/api'
import type { Category, Paginated, Product } from '../catalog/catalog.service'
import type { Order, OrderQuery, OrderStatus } from '../order/order.service'

export interface CategoryInput {
  name: string
  description?: string
}

export interface AdminOrder extends Order {
  user: { id: number; name: string; email: string }
}

// Espelha ADMIN_STATUS_TRANSITIONS da API: para onde o admin pode mover cada status.
export const ADMIN_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: ['cancelled'],
  paid: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
}

export const STATUS_ACTION_LABELS: Partial<Record<OrderStatus, string>> = {
  shipped: 'Marcar como enviado',
  delivered: 'Marcar como entregue',
  cancelled: 'Cancelar pedido',
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

  listOrders: ({ status, page = 1, limit = 20 }: OrderQuery) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (status) params.set('status', status)
    return request<Paginated<AdminOrder>>(`/admin/orders?${params}`)
  },

  /** O detalhe usa o mesmo endpoint do cliente: para admins ele devolve qualquer pedido, com o cliente. */
  getOrder: (id: number) => request<AdminOrder>(`/orders/${id}`),

  updateOrderStatus: (id: number, status: OrderStatus) =>
    request<Order>(`/admin/orders/${id}/status`, { method: 'PATCH', body: { status } }),
}
