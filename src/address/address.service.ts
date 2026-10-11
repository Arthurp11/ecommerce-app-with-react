import { request } from '../lib/api'

export interface Address {
  id: number
  recipientName: string
  zipCode: string
  street: string
  number: string
  complement?: string | null
  neighborhood: string
  city: string
  state: string
  isDefault: boolean
}

export type AddressInput = Omit<Address, 'id' | 'isDefault'> & { isDefault?: boolean }

export const addressService = {
  list: () => request<Address[]>('/addresses'),

  get: (id: number) => request<Address>(`/addresses/${id}`),

  create: (input: AddressInput) => request<Address>('/addresses', { method: 'POST', body: input }),

  update: (id: number, input: Partial<AddressInput>) =>
    request<Address>(`/addresses/${id}`, { method: 'PATCH', body: input }),

  remove: (id: number) => request<void>(`/addresses/${id}`, { method: 'DELETE' }),
}

export function formatZipCode(zipCode: string) {
  const digits = zipCode.replace(/\D/g, '').slice(0, 8)
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits
}

interface ViaCepResponse {
  logradouro: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean | string
}

// Preenchimento automático pelo CEP (serviço público ViaCEP). Falhas são silenciosas: o usuário digita à mão.
export async function lookupZipCode(zipCode: string) {
  const digits = zipCode.replace(/\D/g, '')
  if (digits.length !== 8) return null

  try {
    const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
    if (!response.ok) return null
    const data = (await response.json()) as ViaCepResponse
    if (data.erro) return null
    return { street: data.logradouro, neighborhood: data.bairro, city: data.localidade, state: data.uf }
  } catch {
    return null
  }
}
