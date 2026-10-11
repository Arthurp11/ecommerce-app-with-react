import { useState } from 'react'
import { Alert } from '../components/Alert'
import { getErrorMessage } from '../lib/errors'
import { formatPrice } from '../lib/format'
import { paymentService, type Payment } from './payment.service'

interface PaymentPanelProps {
  orderId: number
  totalInCents: number
  /** Chamado depois que o pagamento muda o status do pedido, para a página recarregá-lo. */
  onSettled: (result: Payment) => Promise<void>
}

export function PaymentPanel({ orderId, totalInCents, onSettled }: PaymentPanelProps) {
  const [payment, setPayment] = useState<Payment | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function run(action: () => Promise<void>) {
    setError(null)
    setBusy(true)
    try {
      await action()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  function startPayment() {
    return run(async () => {
      const created = await paymentService.pay(orderId)
      if (created.checkoutUrl) {
        // Provedor real: o pagamento acontece na página dele, que depois volta para a loja.
        window.location.assign(created.checkoutUrl)
        return
      }
      setPayment(created)
    })
  }

  function simulate(approve: boolean) {
    if (!payment) return
    return run(async () => {
      const result = approve
        ? await paymentService.approveMock(payment.externalId)
        : await paymentService.rejectMock(payment.externalId)
      await onSettled(result)
    })
  }

  return (
    <div className="order-card payment-panel">
      <h2>Pagamento</h2>
      {error && <Alert variant="error">{error}</Alert>}

      {!payment ? (
        <>
          <p>Seu pedido está reservado. Conclua o pagamento para confirmá-lo.</p>
          <button type="button" className="btn-primary" disabled={busy} onClick={startPayment}>
            {busy ? 'Iniciando…' : `Pagar ${formatPrice(totalInCents)}`}
          </button>
        </>
      ) : (
        <>
          <Alert variant="success">
            Pagamento criado ({formatPrice(payment.amountInCents)}). Ambiente de testes: escolha o
            resultado que o provedor deve devolver.
          </Alert>
          <div className="payment-simulate">
            <button
              type="button"
              className="btn-primary"
              disabled={busy}
              onClick={() => simulate(true)}
            >
              Simular aprovação
            </button>
            <button
              type="button"
              className="btn-secondary btn-link-danger"
              disabled={busy}
              onClick={() => simulate(false)}
            >
              Simular recusa
            </button>
          </div>
          <p className="payment-note">Uma recusa cancela o pedido e devolve os itens ao estoque.</p>
        </>
      )}
    </div>
  )
}
