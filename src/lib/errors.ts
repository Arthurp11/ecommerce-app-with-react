import { ApiError } from './api'

// A API responde em inglês; traduzimos os casos mais comuns do fluxo de auth.
const TRANSLATIONS: Record<string, string> = {
  'Invalid credentials': 'E-mail ou senha inválidos.',
  'Invalid or expired password reset token': 'Link de redefinição inválido ou expirado.',
  'ThrottlerException: Too Many Requests': 'Muitas tentativas. Aguarde um minuto e tente novamente.',
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 429) return TRANSLATIONS['ThrottlerException: Too Many Requests']
    if (error.status === 409) return 'Já existe uma conta com este e-mail.'
    return TRANSLATIONS[error.message] ?? error.message
  }
  if (error instanceof TypeError) return 'Não foi possível conectar ao servidor.'
  return 'Erro inesperado. Tente novamente.'
}
