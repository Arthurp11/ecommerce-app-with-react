import { createContext } from 'react'
import type { Cart } from './cart.service'

export interface CartContextValue {
  /** `null` enquanto não há usuário logado ou o carrinho ainda não carregou. */
  cart: Cart | null
  itemCount: number
  addItem: (productId: number, quantity: number) => Promise<void>
  updateItem: (itemId: number, quantity: number) => Promise<void>
  removeItem: (itemId: number) => Promise<void>
  clear: () => Promise<void>
  /** Recarrega do servidor (ex.: depois do checkout esvaziar o carrinho). */
  refresh: () => Promise<void>
}

export const CartContext = createContext<CartContextValue | null>(null)
