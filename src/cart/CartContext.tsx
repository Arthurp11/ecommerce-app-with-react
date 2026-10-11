import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { useAuth } from '../auth/useAuth'
import { CartContext } from './cart-context'
import { cartService, type Cart } from './cart.service'

interface OwnedCart {
  userId: number
  cart: Cart
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const userId = user?.id ?? null

  // Guardamos o dono do carrinho para nunca exibir o carrinho de outro usuário após trocar de conta.
  const [owned, setOwned] = useState<OwnedCart | null>(null)
  const cart = owned && owned.userId === userId ? owned.cart : null

  useEffect(() => {
    if (userId === null) return
    let ignore = false

    cartService
      .get()
      .then((cart) => !ignore && setOwned({ userId, cart }))
      .catch(() => {
        // Sem carrinho no cabeçalho não impede a navegação; a página do carrinho mostra o erro.
      })

    return () => {
      ignore = true
    }
  }, [userId])

  const store = useCallback(
    (cart: Cart) => {
      if (userId !== null) setOwned({ userId, cart })
    },
    [userId],
  )

  const refresh = useCallback(async () => {
    store(await cartService.get())
  }, [store])

  const addItem = useCallback(
    async (productId: number, quantity: number) => store(await cartService.addItem(productId, quantity)),
    [store],
  )

  const updateItem = useCallback(
    async (itemId: number, quantity: number) => store(await cartService.updateItem(itemId, quantity)),
    [store],
  )

  const removeItem = useCallback(
    async (itemId: number) => {
      await cartService.removeItem(itemId)
      await refresh()
    },
    [refresh],
  )

  const clear = useCallback(async () => {
    await cartService.clear()
    await refresh()
  }, [refresh])

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount: cart?.itemCount ?? 0,
        addItem,
        updateItem,
        removeItem,
        clear,
        refresh,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
