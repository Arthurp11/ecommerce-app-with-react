import { request } from '../lib/api'
import type { Paginated } from '../catalog/catalog.service'
import type { Payment } from '../payment/payment.service'

export type OrderStatus = 'pending_payment' | 'paid' | 'shipped' | 'delivered' | 'cancelled'

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: 'Aguardando pagamento',
  paid: 'Pago',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
}

export interface ShippingAddress {
  recipientName: string
  zipCode: string
  street: string
  number: string
  complement?: string | null
  neighborhood: string
  city: string
  state: string
}

export interface OrderItem {
  id: number
  /** Id do produto, ou `null` se ele foi excluído depois da compra. */
  product: number | null
  productName: string
  sku: string
  unitPriceInCents: number
  quantity: number
  lineTotalInCents: number
}

export interface Order {
  id: number
  status: OrderStatus
  subtotalInCents: number
  shippingInCents: number
  totalInCents: number
  shippingAddress: ShippingAddress
  items: OrderItem[]
  /** Só vem no detalhe do pedido (`GET /orders/:id`). */
  payments?: Payment[]
  createdAt: string
  updatedAt: string
}

export interface OrderQuery {
  status?: OrderStatus
  page?: number
  limit?: number
}

export const orderService = {
  checkout: (addressId: number) => request<Order>('/orders', { method: 'POST', body: { addressId } }),

  list: ({ status, page = 1, limit = 10 }: OrderQuery) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (status) params.set('status', status)
    return request<Paginated<Order>>(`/orders?${params}`)
  },

  get: (id: number) => request<Order>(`/orders/${id}`),

  cancel: (id: number) => request<Order>(`/orders/${id}/cancel`, { method: 'POST' }),
}
