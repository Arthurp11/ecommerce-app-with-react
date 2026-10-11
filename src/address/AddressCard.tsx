import type { ReactNode } from 'react'
import { formatZipCode, type Address } from './address.service'

interface AddressCardProps {
  address: Address
  actions?: ReactNode
}

export function AddressCard({ address, actions }: AddressCardProps) {
  return (
    <div className="address-card">
      <div className="address-card-header">
        <strong>{address.recipientName}</strong>
        {address.isDefault && <span className="badge badge-accent">Padrão</span>}
      </div>
      <address>
        {address.street}, {address.number}
        {address.complement && ` — ${address.complement}`}
        <br />
        {address.neighborhood}, {address.city} - {address.state}
        <br />
        CEP {formatZipCode(address.zipCode)}
      </address>
      {actions && <div className="address-card-actions">{actions}</div>}
    </div>
  )
}
