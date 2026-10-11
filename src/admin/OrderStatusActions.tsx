import type { OrderStatus } from '../order/order.service'
import { ADMIN_STATUS_TRANSITIONS, STATUS_ACTION_LABELS } from './admin.service'

interface OrderStatusActionsProps {
  status: OrderStatus
  disabled?: boolean
  onChange: (next: OrderStatus) => void
}

export function OrderStatusActions({ status, disabled, onChange }: OrderStatusActionsProps) {
  const transitions = ADMIN_STATUS_TRANSITIONS[status]
  if (transitions.length === 0) return null

  function handleClick(next: OrderStatus) {
    const message =
      next === 'cancelled'
        ? 'Cancelar este pedido? O estoque é devolvido e um pagamento aprovado vira estornado.'
        : `${STATUS_ACTION_LABELS[next]}?`
    if (window.confirm(message)) onChange(next)
  }

  return (
    <div className="order-actions">
      {transitions.map((next) => (
        <button
          key={next}
          type="button"
          className={next === 'cancelled' ? 'btn-secondary btn-sm btn-link-danger' : 'btn-primary btn-sm'}
          disabled={disabled}
          onClick={() => handleClick(next)}
        >
          {STATUS_ACTION_LABELS[next]}
        </button>
      ))}
    </div>
  )
}
