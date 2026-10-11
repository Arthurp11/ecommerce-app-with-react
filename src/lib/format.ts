const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

// A API trabalha com centavos para evitar erros de ponto flutuante.
export function formatPrice(priceInCents: number) {
  return currency.format(priceInCents / 100)
}
