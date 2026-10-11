import { ApiError } from './api'

// A API responde em inglês; traduzimos os casos mais comuns.
const TRANSLATIONS: Record<string, string> = {
  'Invalid credentials': 'E-mail ou senha inválidos.',
  'Invalid or expired password reset token': 'Link de redefinição inválido ou expirado.',
  'Cart is empty': 'Seu carrinho está vazio.',
}

const PATTERNS: [RegExp, (match: RegExpExecArray) => string][] = [
  [/^User with email .+ already exists$/, () => 'Já existe uma conta com este e-mail.'],
  [
    /^Only (\d+) unit\(s\) of (.+) available$/,
    ([, stock, name]) => `Só há ${stock} unidade(s) de ${name} disponível(is).`,
  ],
  [/^(.+) is no longer available$/, ([, name]) => `${name} não está mais disponível.`],
  [/^Order with ID \d+ can no longer be cancelled$/, () => 'Este pedido não pode mais ser cancelado.'],
  [/^Order with ID \d+ is not awaiting payment$/, () => 'Este pedido não está mais aguardando pagamento.'],
]

function translate(message: string) {
  for (const [pattern, toMessage] of PATTERNS) {
    const match = pattern.exec(message)
    if (match) return toMessage(match)
  }
  return TRANSLATIONS[message] ?? message
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 429) return 'Muitas tentativas. Aguarde um minuto e tente novamente.'
    // O checkout junta vários problemas de estoque com "; ".
    return error.message.split('; ').map(translate).join('\n')
  }
  if (error instanceof TypeError) return 'Não foi possível conectar ao servidor.'
  return 'Erro inesperado. Tente novamente.'
}
