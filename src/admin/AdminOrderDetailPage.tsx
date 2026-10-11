import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { Alert } from '../components/Alert'
import { getErrorMessage } from '../lib/errors'
import { formatDateTime } from '../lib/format'
import { useAsync } from '../lib/useAsync'
import { OrderAddressCard, OrderItemsCard, OrderPaymentsCard } from '../order/OrderSections'
import { OrderStatusBadge } from '../order/OrderStatusBadge'
import { ORDER_STATUS_LABELS, type OrderStatus } from '../order/order.service'
import { adminService, type AdminOrder } from './admin.service'
import { OrderStatusActions } from './OrderStatusActions'

export function AdminOrderDetailPage() {
  const id = Number(useParams().id)
  const fetched = useAsync(`admin-order:${id}`, () => adminService.getOrder(id))
  const [updated, setUpdated] = useState<AdminOrder | null>(null)
  const order = updated?.id === id ? updated : fetched.data

  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ variant: 'success' | 'error'; message: string } | null>(
    null,
  )

  async function changeStatus(next: OrderStatus) {
    setFeedback(null)
    setSaving(true)
    try {
      await adminService.updateOrderStatus(id, next)
      // Recarrega pelo detalhe para vir com itens, pagamentos e cliente atualizados.
      setUpdated(await adminService.getOrder(id))
      setFeedback({ variant: 'success', message: `Status alterado para "${ORDER_STATUS_LABELS[next]}".` })
    } catch (err) {
      setFeedback({ variant: 'error', message: getErrorMessage(err) })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-section page-narrow admin-form-page">
      <Link to="/admin/orders" className="back-link">
        ← Pedidos
      </Link>

      {fetched.loading && !order ? (
        <div className="skeleton-line" style={{ height: 320 }} />
      ) : !order ? (
        <Alert variant="error">{getErrorMessage(fetched.error)}</Alert>
      ) : (
        <>
          <div className="page-heading order-heading">
            <div>
              <h2>Pedido #{order.id}</h2>
              <span className="order-date">Feito em {formatDateTime(order.createdAt)}</span>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>

          {feedback && <Alert variant={feedback.variant}>{feedback.message}</Alert>}
          <OrderStatusActions status={order.status} disabled={saving} onChange={changeStatus} />

          <div className="order-card">
            <h2>Cliente</h2>
            <p className="order-address">
              <strong>{order.user.name}</strong>
              <br />
              {order.user.email}
            </p>
          </div>

          <OrderItemsCard order={order} />
          <OrderAddressCard order={order} />
          <OrderPaymentsCard order={order} />
        </>
      )}
    </div>
  )
}
