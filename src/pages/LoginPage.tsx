import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, type Location } from 'react-router'
import { useAuth } from '../auth/useAuth'
import { Alert } from '../components/Alert'
import { AuthLayout } from '../components/AuthLayout'
import { FormField } from '../components/FormField'
import { getErrorMessage } from '../lib/errors'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: Location } | null)?.from?.pathname ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Entrar"
      subtitle="Acesse sua conta para continuar"
      footer={
        <>
          Não tem conta? <Link to="/register">Cadastre-se</Link>
        </>
      }
    >
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
        <FormField
          label="Senha"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Link to="/forgot-password" className="auth-link-right">
          Esqueceu a senha?
        </Link>

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </AuthLayout>
  )
}
