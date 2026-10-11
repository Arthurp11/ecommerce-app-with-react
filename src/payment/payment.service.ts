import { request } from '../lib/api'

export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'refunded'

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'Pendente',
  approved: 'Aprovado',
  rejected: 'Recusado',
  refunded: 'Estornado',
}

export interface Payment {
  id: number
  provider: string
  externalId: string
  amountInCents: number
  status: PaymentStatus
  /** Preenchido por provedores reais: o cliente paga na página do provedor. */
  checkoutUrl?: string | null
  createdAt: string
}

export const paymentService = {
  /** Cria o pagamento do pedido, ou devolve o que já está pendente. */
  pay: (orderId: number) => request<Payment>(`/orders/${orderId}/pay`, { method: 'POST' }),

  // Só existem fora de produção: simulam o webhook do provedor mock.
  approveMock: (externalId: string) =>
    request<Payment>(`/payments/mock/${encodeURIComponent(externalId)}/approve`, { method: 'POST' }),

  rejectMock: (externalId: string) =>
    request<Payment>(`/payments/mock/${encodeURIComponent(externalId)}/reject`, { method: 'POST' }),
}
