const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const dateTime = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

// A API trabalha com centavos para evitar erros de ponto flutuante.
export function formatPrice(priceInCents: number) {
  return currency.format(priceInCents / 100)
}

export function formatDateTime(iso: string) {
  return dateTime.format(new Date(iso))
}
