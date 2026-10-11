import { ApiError } from './api'

// A API responde em inglês; traduzimos os casos mais comuns.
const TRANSLATIONS: Record<string, string> = {
  'Invalid credentials': 'E-mail ou senha inválidos.',
  'Invalid or expired password reset token': 'Link de redefinição inválido ou expirado.',
}

const PATTERNS: [RegExp, (match: RegExpExecArray) => string][] = [
  [/^User with email .+ already exists$/, () => 'Já existe uma conta com este e-mail.'],
  [
    /^Only (\d+) unit\(s\) of (.+) available$/,
    ([, stock, name]) => `Só há ${stock} unidade(s) de ${name} disponível(is).`,
  ],
]

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 429) return 'Muitas tentativas. Aguarde um minuto e tente novamente.'

    for (const [pattern, translate] of PATTERNS) {
      const match = pattern.exec(error.message)
      if (match) return translate(match)
    }
    return TRANSLATIONS[error.message] ?? error.message
  }
  if (error instanceof TypeError) return 'Não foi possível conectar ao servidor.'
  return 'Erro inesperado. Tente novamente.'
}
