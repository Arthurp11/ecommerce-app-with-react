import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { AddressCard } from '../address/AddressCard'
import { AddressForm } from '../address/AddressForm'
import { addressService } from '../address/address.service'
import { useCart } from '../cart/useCart'
import { Alert } from '../components/Alert'
import { getErrorMessage } from '../lib/errors'
import { formatPrice } from '../lib/format'
import { useAsync } from '../lib/useAsync'
import { orderService } from '../order/order.service'

export function CheckoutPage() {
  const navigate = useNavigate()
  const { cart, refresh: refreshCart } = useCart()

  const [version, setVersion] = useState(0)
  const addresses = useAsync(`addresses:${version}`, addressService.list)
  // `null` = usar o endereço padrão; um número = escolha explícita do usuário.
  const [chosenId, setChosenId] = useState<number | null>(null)
  const [addingAddress, setAddingAddress] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (cart && cart.items.length === 0 && !submitting) return <Navigate to="/cart" replace />

  const list = addresses.data ?? []
  const selected =
    list.find((address) => address.id === chosenId) ?? list.find((address) => address.isDefault) ?? list[0]
  const showForm = addingAddress || (!addresses.loading && !addresses.error && list.length === 0)

  async function placeOrder() {
    if (!selected) return
    setError(null)
    setSubmitting(true)
    try {
      const order = await orderService.checkout(selected.id)
      // O checkout esvazia o carrinho no servidor; sincroniza o contador do cabeçalho.
      await refreshCart().catch(() => {})
      navigate(`/orders/${order.id}`, { replace: true, state: { justPlaced: true } })
    } catch (err) {
      setError(getErrorMessage(err))
      setSubmitting(false)
    }
  }

  return (
    <section className="page">
      <Link to="/cart" className="back-link">
        ← Voltar ao carrinho
      </Link>
      <h1 className="page-title">Finalizar compra</h1>

      {error && <Alert variant="error">{error}</Alert>}

      <div className="cart-layout">
        <div className="checkout-section">
          <h2>Endereço de entrega</h2>

          {addresses.error ? (
            <Alert variant="error">{getErrorMessage(addresses.error)}</Alert>
          ) : addresses.loading && !addresses.data ? (
            <div className="skeleton-line" style={{ height: 120 }} />
          ) : showForm ? (
            <AddressForm
              submitLabel="Salvar e usar este endereço"
              onCancel={list.length > 0 ? () => setAddingAddress(false) : undefined}
              onSubmit={async (input) => {
                const created = await addressService.create(input)
                setChosenId(created.id)
                setAddingAddress(false)
                setVersion((v) => v + 1)
              }}
            />
          ) : (
            <>
              <div className="address-options" role="radiogroup" aria-label="Endereço de entrega">
                {list.map((address) => (
                  <label
                    key={address.id}
                    className={`address-option${address.id === selected?.id ? ' is-selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={address.id === selected?.id}
                      onChange={() => setChosenId(address.id)}
                    />
                    <AddressCard address={address} />
                  </label>
                ))}
              </div>
              <button type="button" className="btn-link" onClick={() => setAddingAddress(true)}>
                + Usar um novo endereço
              </button>
            </>
          )}
        </div>

        <aside className="cart-summary">
          <h2>Resumo do pedido</h2>

          {cart ? (
            <>
              <ul className="checkout-items">
                {cart.items.map((item) => (
                  <li key={item.id}>
                    <span>
                      {item.quantity}× {item.product.name}
                    </span>
                    <span>{formatPrice(item.lineTotalInCents)}</span>
                  </li>
                ))}
              </ul>
              <div className="cart-summary-row">
                <span>Subtotal</span>
                <span>{formatPrice(cart.subtotalInCents)}</span>
              </div>
              <div className="cart-summary-row">
                <span>Frete</span>
                <span>Grátis</span>
              </div>
              <div className="cart-summary-row cart-summary-total">
                <span>Total</span>
                <strong>{formatPrice(cart.subtotalInCents)}</strong>
              </div>
            </>
          ) : (
            <div className="skeleton-line" style={{ height: 80 }} />
          )}

          <button
            type="button"
            className="btn-primary btn-block"
            disabled={!selected || !cart || showForm || submitting}
            onClick={placeOrder}
          >
            {submitting ? 'Confirmando…' : 'Confirmar pedido'}
          </button>
          <p className="cart-summary-note">O pagamento é feito na próxima tela.</p>
        </aside>
      </div>
    </section>
  )
}
