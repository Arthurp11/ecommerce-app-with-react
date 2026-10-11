import { useState } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import { Alert } from '../components/Alert'
import { ApiError } from '../lib/api'
import { getErrorMessage } from '../lib/errors'
import { formatDateTime } from '../lib/format'
import { useAsync } from '../lib/useAsync'
import { OrderAddressCard, OrderItemsCard, OrderPaymentsCard } from '../order/OrderSections'
import { OrderStatusBadge } from '../order/OrderStatusBadge'
import { orderService, type Order } from '../order/order.service'
import { PaymentPanel } from '../payment/PaymentPanel'
import type { Payment } from '../payment/payment.service'

const PAYMENT_RESULT: Record<Payment['status'], { variant: 'success' | 'error'; message: string } | undefined> = {
  pending: undefined,
  approved: { variant: 'success', message: 'Pagamento aprovado! Seu pedido foi confirmado.' },
  rejected: {
    variant: 'error',
    message: 'Pagamento recusado. O pedido foi cancelado e os itens voltaram ao estoque.',
  },
  refunded: {
    variant: 'error',
    message: 'O pedido não aguardava mais pagamento, então o valor foi estornado.',
  },
}

export function OrderDetailPage() {
  const id = Number(useParams().id)
  const location = useLocation()
  const justPlaced = (location.state as { justPlaced?: boolean } | null)?.justPlaced === true

  const fetched = useAsync(`order:${id}`, () => orderService.get(id))
  // Depois de cancelar ou pagar, o pedido atualizado substitui o carregado.
  const [updated, setUpdated] = useState<Order | null>(null)
  const order = updated?.id === id ? updated : fetched.data

  const [paymentResult, setPaymentResult] = useState<Payment | null>(null)
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

  const paymentFeedback = paymentResult && PAYMENT_RESULT[paymentResult.status]

  return (
    <section className="page page-narrow">
      <Link to="/orders" className="back-link">
        ← Meus pedidos
      </Link>

      {paymentFeedback && <Alert variant={paymentFeedback.variant}>{paymentFeedback.message}</Alert>}
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

      {order.status === 'pending_payment' && (
        <PaymentPanel
          key={order.id}
          orderId={order.id}
          totalInCents={order.totalInCents}
          onSettled={async (result) => {
            setUpdated(await orderService.get(id))
            setPaymentResult(result)
          }}
        />
      )}

      <OrderItemsCard order={order} />
      <OrderAddressCard order={order} />
      <OrderPaymentsCard order={order} />

      {order.status === 'pending_payment' && (
        <div className="order-actions">
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
