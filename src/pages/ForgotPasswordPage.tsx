import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { authService } from '../auth/auth.service'
import { Alert } from '../components/Alert'
import { AuthLayout } from '../components/AuthLayout'
import { FormField } from '../components/FormField'
import { getErrorMessage } from '../lib/errors'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      await authService.forgotPassword(email)
      setSent(true)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Esqueceu a senha?"
      subtitle="Informe seu e-mail e enviaremos um link para redefinir a senha"
      footer={<Link to="/login">Voltar para o login</Link>}
    >
      {sent ? (
        <Alert variant="success">
          Se existir uma conta com <strong>{email}</strong>, você receberá um e-mail com o link
          para redefinir a senha.
        </Alert>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <Alert variant="error">{error}</Alert>}

          <FormField
            label="E-mail"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Enviando…' : 'Enviar link'}
          </button>
        </form>
      )}
    </AuthLayout>
  )
}
