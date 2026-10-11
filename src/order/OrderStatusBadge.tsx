import { ORDER_STATUS_LABELS, type OrderStatus } from './order.service'

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`badge status-${status}`}>{ORDER_STATUS_LABELS[status]}</span>
}
