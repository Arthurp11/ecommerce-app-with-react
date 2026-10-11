import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useAuth } from '../auth/useAuth'
import type { Product } from '../catalog/catalog.service'
import { Alert } from '../components/Alert'
import { getErrorMessage } from '../lib/errors'
import { QuantityInput } from './QuantityInput'
import { useCart } from './useCart'

export function AddToCart({ product }: { product: Product }) {
  const { user } = useAuth()
  const { cart, addItem } = useCart()
  const navigate = useNavigate()
  const location = useLocation()

  const [quantity, setQuantity] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [added, setAdded] = useState(false)

  // O que já está no carrinho conta para o limite de estoque.
  const inCart = cart?.items.find((item) => item.product.id === product.id)?.quantity ?? 0
  const available = product.stock - inCart
  const selected = Math.max(1, Math.min(quantity, available))

  if (product.stock <= 0) {
    return (
      <button type="button" className="btn-primary btn-block" disabled>
        Esgotado
      </button>
    )
  }

  async function handleAdd() {
    if (!user) {
      navigate('/login', { state: { from: location } })
      return
    }

    setError(null)
    setAdded(false)
    setSubmitting(true)
    try {
      await addItem(product.id, selected)
      setAdded(true)
      setQuantity(1)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="add-to-cart">
      {available > 0 ? (
        <div className="add-to-cart-row">
          <QuantityInput
            value={selected}
            max={available}
            disabled={submitting}
            onChange={setQuantity}
          />
          <button
            type="button"
            className="btn-primary btn-block"
            disabled={submitting}
            onClick={handleAdd}
          >
            {submitting ? 'Adicionando…' : 'Adicionar ao carrinho'}
          </button>
        </div>
      ) : (
        <p className="add-to-cart-note">
          Você já tem todas as unidades disponíveis no <Link to="/cart">carrinho</Link>.
        </p>
      )}

      {inCart > 0 && available > 0 && (
        <p className="add-to-cart-note">
          {inCart} {inCart === 1 ? 'unidade' : 'unidades'} já no carrinho.
        </p>
      )}

      {added && (
        <Alert variant="success">
          Produto adicionado! <Link to="/cart">Ver carrinho</Link>
        </Alert>
      )}
      {error && <Alert variant="error">{error}</Alert>}
    </div>
  )
}
