import { formatZipCode } from '../address/address.service'
import { formatDateTime, formatPrice } from '../lib/format'
import { PAYMENT_STATUS_LABELS } from '../payment/payment.service'
import type { Order } from './order.service'

// Seções do detalhe do pedido, compartilhadas entre a área do cliente e o admin.

export function OrderItemsCard({ order }: { order: Order }) {
  return (
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
  )
}

export function OrderAddressCard({ order }: { order: Order }) {
  const address = order.shippingAddress

  return (
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
  )
}

export function OrderPaymentsCard({ order }: { order: Order }) {
  if (!order.payments || order.payments.length === 0) return null

  return (
    <div className="order-card">
      <h2>Histórico de pagamentos</h2>
      <ul className="order-items">
        {order.payments.map((payment) => (
          <li key={payment.id}>
            <div>
              <span className="order-item-name">{formatPrice(payment.amountInCents)}</span>
              <span className="order-item-meta">{formatDateTime(payment.createdAt)}</span>
            </div>
            <span className={`badge payment-${payment.status}`}>
              {PAYMENT_STATUS_LABELS[payment.status]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
