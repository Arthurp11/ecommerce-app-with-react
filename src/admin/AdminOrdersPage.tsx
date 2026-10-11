import { Link, useSearchParams } from 'react-router'
import { Alert } from '../components/Alert'
import { Pagination } from '../components/Pagination'
import { getErrorMessage } from '../lib/errors'
import { formatDateTime, formatPrice } from '../lib/format'
import { useAsync } from '../lib/useAsync'
import { OrderStatusBadge } from '../order/OrderStatusBadge'
import { ORDER_STATUS_LABELS, type OrderStatus } from '../order/order.service'
import { adminService } from './admin.service'

const STATUSES = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]

function isStatus(value: string | null): value is OrderStatus {
  return STATUSES.includes(value as OrderStatus)
}

export function AdminOrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const statusParam = searchParams.get('status')
  const status = isStatus(statusParam) ? statusParam : undefined
  const page = Math.max(1, Number(searchParams.get('page')) || 1)

  const { data, error, loading } = useAsync(`admin-orders:${status}:${page}`, () =>
    adminService.listOrders({ status, page }),
  )

  function update(next: { status?: string; page?: number }) {
    const params = new URLSearchParams()
    if (next.status) params.set('status', next.status)
    if (next.page && next.page > 1) params.set('page', String(next.page))
    setSearchParams(params)
  }

  return (
    <div className="admin-section">
      <div className="page-heading">
        <h2>Pedidos</h2>
        <select
          aria-label="Filtrar por status"
          className="select"
          value={status ?? ''}
          onChange={(e) => update({ status: e.target.value })}
        >
          <option value="">Todos os status</option>
          {STATUSES.map((value) => (
            <option key={value} value={value}>
              {ORDER_STATUS_LABELS[value]}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <Alert variant="error">{getErrorMessage(error)}</Alert>
      ) : loading ? (
        <div className="skeleton-line" style={{ height: 200 }} />
      ) : data && data.data.length > 0 ? (
        <>
          <ul className="order-list">
            {data.data.map((order) => {
              const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0)
              return (
                <li key={order.id}>
                  <Link to={`/admin/orders/${order.id}`} className="order-row">
                    <div className="order-row-main">
                      <strong>
                        #{order.id} · {order.user.name}
                      </strong>
                      <span>
                        {order.user.email} · {formatDateTime(order.createdAt)} · {itemCount}{' '}
                        {itemCount === 1 ? 'item' : 'itens'}
                      </span>
                    </div>
                    <OrderStatusBadge status={order.status} />
                    <strong className="order-row-total">{formatPrice(order.totalInCents)}</strong>
                  </Link>
                </li>
              )
            })}
          </ul>
          <Pagination
            page={data.meta.page}
            totalPages={data.meta.totalPages}
            onChange={(next) => update({ status, page: next })}
          />
        </>
      ) : (
        <div className="empty-state empty-state-card">
          <p>{status ? 'Nenhum pedido com este status.' : 'Nenhum pedido ainda.'}</p>
        </div>
      )}
    </div>
  )
}
