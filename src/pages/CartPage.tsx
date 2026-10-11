import { useState } from 'react'
import { Link } from 'react-router'
import type { CartItem } from '../cart/cart.service'
import { QuantityInput } from '../cart/QuantityInput'
import { useCart } from '../cart/useCart'
import { Alert } from '../components/Alert'
import { getErrorMessage } from '../lib/errors'
import { formatPrice } from '../lib/format'

function itemProblem({ product, quantity }: CartItem): string | null {
  if (!product.isActive) return 'Produto indisponível. Remova-o para continuar.'
  if (product.stock <= 0) return 'Produto esgotado. Remova-o para continuar.'
  if (quantity > product.stock) return `Só restam ${product.stock} unidade(s). Ajuste a quantidade.`
  return null
}

export function CartPage() {
  const { cart, updateItem, removeItem, clear } = useCart()
  // Id do item sendo alterado, ou 'all' ao esvaziar; trava os controles enquanto a API responde.
  const [pending, setPending] = useState<number | 'all' | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function run(target: number | 'all', action: () => Promise<void>) {
    setError(null)
    setPending(target)
    try {
      await action()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setPending(null)
    }
  }

  if (!cart) {
    return (
      <section className="page" aria-busy>
        <h1 className="page-title">Carrinho</h1>
        <div className="skeleton-line" style={{ height: 96, marginTop: 24 }} />
      </section>
    )
  }

  if (cart.items.length === 0) {
    return (
      <section className="page">
        <h1 className="page-title">Carrinho</h1>
        <div className="empty-state">
          <p>Seu carrinho está vazio.</p>
          <Link to="/" className="btn-primary btn-sm">
            Ver produtos
          </Link>
        </div>
      </section>
    )
  }

  const hasProblems = cart.items.some((item) => itemProblem(item) !== null)

  return (
    <section className="page">
      <div className="page-heading">
        <h1 className="page-title">Carrinho</h1>
        <button
          type="button"
          className="btn-link"
          disabled={pending !== null}
          onClick={() => {
            if (window.confirm('Remover todos os itens do carrinho?')) run('all', clear)
          }}
        >
          Esvaziar carrinho
        </button>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <div className="cart-layout">
        <ul className="cart-items">
          {cart.items.map((item) => {
            const { product } = item
            const problem = itemProblem(item)
            const busy = pending === item.id || pending === 'all'

            return (
              <li key={item.id} className={`cart-item${busy ? ' is-busy' : ''}`}>
                <Link to={`/products/${product.slug}`} className="cart-item-image">
                  {product.images[0] ? (
                    <img src={product.images[0]} alt="" />
                  ) : (
                    <span className="product-card-placeholder" aria-hidden>
                      {product.name.charAt(0)}
                    </span>
                  )}
                </Link>

                <div className="cart-item-info">
                  <Link to={`/products/${product.slug}`} className="cart-item-name">
                    {product.name}
                  </Link>
                  <span className="cart-item-unit">{formatPrice(product.priceInCents)} cada</span>
                  {problem && <span className="cart-item-problem">{problem}</span>}

                  <div className="cart-item-actions">
                    <QuantityInput
                      value={item.quantity}
                      max={Math.max(product.stock, 1)}
                      disabled={busy || !product.isActive}
                      onChange={(quantity) => run(item.id, () => updateItem(item.id, quantity))}
                    />
                    <button
                      type="button"
                      className="btn-link"
                      disabled={busy}
                      onClick={() => run(item.id, () => removeItem(item.id))}
                    >
                      Remover
                    </button>
                  </div>
                </div>

                <span className="cart-item-total">{formatPrice(item.lineTotalInCents)}</span>
              </li>
            )
          })}
        </ul>

        <aside className="cart-summary">
          <h2>Resumo</h2>
          <div className="cart-summary-row">
            <span>
              Subtotal ({cart.itemCount} {cart.itemCount === 1 ? 'item' : 'itens'})
            </span>
            <strong>{formatPrice(cart.subtotalInCents)}</strong>
          </div>
          <p className="cart-summary-note">Frete grátis.</p>

          {hasProblems ? (
            <button type="button" className="btn-primary btn-block" disabled>
              Finalizar compra
            </button>
          ) : (
            <Link to="/checkout" className="btn-primary btn-block">
              Finalizar compra
            </Link>
          )}
          {hasProblems && (
            <p className="cart-item-problem">Resolva os itens destacados antes de continuar.</p>
          )}

          <Link to="/" className="cart-summary-continue">
            Continuar comprando
          </Link>
        </aside>
      </div>
    </section>
  )
}
