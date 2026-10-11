import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router'
import { authService } from '../auth/auth.service'
import { Alert } from '../components/Alert'
import { AuthLayout } from '../components/AuthLayout'
import { FormField } from '../components/FormField'
import { getErrorMessage } from '../lib/errors'

const MIN_PASSWORD_LENGTH = 6

// Acessada pelo link do e-mail: /reset-password?token=...
export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!token) return
    setError(null)

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }

    setSubmitting(true)
    try {
      await authService.resetPassword(token, password)
      setDone(true)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (!token) {
    return (
      <AuthLayout title="Link inválido" footer={<Link to="/forgot-password">Solicitar novo link</Link>}>
        <Alert variant="error">O link de redefinição está incompleto ou é inválido.</Alert>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Redefinir senha"
      subtitle="Escolha uma nova senha para sua conta"
      footer={<Link to="/login">Voltar para o login</Link>}
    >
      {done ? (
        <Alert variant="success">
          Senha redefinida com sucesso! <Link to="/login">Entrar agora</Link>
        </Alert>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <Alert variant="error">{error}</Alert>}

          <FormField
            label="Nova senha"
            type="password"
            autoComplete="new-password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            placeholder={`Mínimo de ${MIN_PASSWORD_LENGTH} caracteres`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <FormField
            label="Confirmar nova senha"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Salvando…' : 'Redefinir senha'}
          </button>
        </form>
      )}
    </AuthLayout>
  )
}
