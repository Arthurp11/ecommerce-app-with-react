import { useState } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import { formatZipCode } from '../address/address.service'
import { Alert } from '../components/Alert'
import { ApiError } from '../lib/api'
import { getErrorMessage } from '../lib/errors'
import { formatDateTime, formatPrice } from '../lib/format'
import { useAsync } from '../lib/useAsync'
import { OrderStatusBadge } from '../order/OrderStatusBadge'
import { orderService, type Order } from '../order/order.service'

export function OrderDetailPage() {
  const id = Number(useParams().id)
  const location = useLocation()
  const justPlaced = (location.state as { justPlaced?: boolean } | null)?.justPlaced === true

  const fetched = useAsync(`order:${id}`, () => orderService.get(id))
  // Depois de cancelar, a resposta da API substitui o pedido carregado.
  const [updated, setUpdated] = useState<Order | null>(null)
  const order = updated?.id === id ? updated : fetched.data

  const [cancelling, setCancelling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function cancel() {
    if (!window.confirm('Cancelar este pedido? Os itens voltam para o estoque.')) return
    setError(null)
    setCancelling(true)
    try {
      setUpdated(await orderService.cancel(id))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setCancelling(false)
    }
  }

  if (fetched.loading && !order) {
    return (
      <section className="page page-narrow" aria-busy>
        <div className="skeleton-line" style={{ height: 32, width: '50%' }} />
        <div className="skeleton-line" style={{ height: 240, marginTop: 24 }} />
      </section>
    )
  }

  if (!order) {
    const notFound = fetched.error instanceof ApiError && fetched.error.status === 404
    return (
      <section className="page page-narrow">
        <div className="empty-state">
          {notFound ? (
            <p>Pedido não encontrado.</p>
          ) : (
            <Alert variant="error">{getErrorMessage(fetched.error)}</Alert>
          )}
          <Link to="/orders" className="btn-secondary btn-sm">
            Ver meus pedidos
          </Link>
        </div>
      </section>
    )
  }

  const address = order.shippingAddress

  return (
    <section className="page page-narrow">
      <Link to="/orders" className="back-link">
        ← Meus pedidos
      </Link>

      {justPlaced && order.status === 'pending_payment' && (
        <Alert variant="success">Pedido criado com sucesso! Agora é só concluir o pagamento.</Alert>
      )}
      {error && <Alert variant="error">{error}</Alert>}

      <div className="page-heading order-heading">
        <div>
          <h1 className="page-title">Pedido #{order.id}</h1>
          <span className="order-date">Feito em {formatDateTime(order.createdAt)}</span>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="order-card">
        <h2>Itens</h2>
        <ul className="order-items">
          {order.items.map((item) => (
            <li key={item.id}>
              <div>
                <span className="order-item-name">{item.productName}</span>
                <span className="order-item-meta">
                  {item.quantity} × {formatPrice(item.unitPriceInCents)}
                </span>
              </div>
              <strong>{formatPrice(item.lineTotalInCents)}</strong>
            </li>
          ))}
        </ul>

        <div className="order-totals">
          <div className="cart-summary-row">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotalInCents)}</span>
          </div>
          <div className="cart-summary-row">
            <span>Frete</span>
            <span>{order.shippingInCents > 0 ? formatPrice(order.shippingInCents) : 'Grátis'}</span>
          </div>
          <div className="cart-summary-row cart-summary-total">
            <span>Total</span>
            <strong>{formatPrice(order.totalInCents)}</strong>
          </div>
        </div>
      </div>

      <div className="order-card">
        <h2>Entrega</h2>
        <address className="order-address">
          <strong>{address.recipientName}</strong>
          <br />
          {address.street}, {address.number}
          {address.complement && ` — ${address.complement}`}
          <br />
          {address.neighborhood}, {address.city} - {address.state}
          <br />
          CEP {formatZipCode(address.zipCode)}
        </address>
      </div>

      {order.status === 'pending_payment' && (
        <div className="order-actions">
          {/* O botão de pagar entra na etapa de pagamento. */}
          <button
            type="button"
            className="btn-secondary btn-link-danger"
            disabled={cancelling}
            onClick={cancel}
          >
            {cancelling ? 'Cancelando…' : 'Cancelar pedido'}
          </button>
        </div>
      )}
    </section>
  )
}
