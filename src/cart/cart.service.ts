import { request } from '../lib/api'
import type { Product } from '../catalog/catalog.service'

export interface CartItem {
  id: number
  quantity: number
  lineTotalInCents: number
  product: Pick<Product, 'id' | 'name' | 'slug' | 'priceInCents' | 'images' | 'stock' | 'isActive'>
}

export interface Cart {
  id: number
  items: CartItem[]
  itemCount: number
  subtotalInCents: number
}

export const cartService = {
  get: () => request<Cart>('/cart'),

  addItem: (productId: number, quantity: number) =>
    request<Cart>('/cart/items', { method: 'POST', body: { productId, quantity } }),

  updateItem: (itemId: number, quantity: number) =>
    request<Cart>(`/cart/items/${itemId}`, { method: 'PATCH', body: { quantity } }),

  removeItem: (itemId: number) => request<void>(`/cart/items/${itemId}`, { method: 'DELETE' }),

  clear: () => request<void>('/cart', { method: 'DELETE' }),
}
