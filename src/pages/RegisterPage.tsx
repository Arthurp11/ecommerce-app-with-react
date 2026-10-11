import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../auth/useAuth'
import { Alert } from '../components/Alert'
import { AuthLayout } from '../components/AuthLayout'
import { FormField } from '../components/FormField'
import { getErrorMessage } from '../lib/errors'

const MIN_PASSWORD_LENGTH = 6

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }

    setSubmitting(true)
    try {
      await register(name.trim(), email, password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Criar conta"
      subtitle="Leva menos de um minuto"
      footer={
        <>
          Já tem conta? <Link to="/login">Entrar</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <Alert variant="error">{error}</Alert>}

        <FormField
          label="Nome"
          autoComplete="name"
          required
          minLength={2}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
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
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          placeholder={`Mínimo de ${MIN_PASSWORD_LENGTH} caracteres`}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <FormField
          label="Confirmar senha"
          type="password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Criando conta…' : 'Criar conta'}
        </button>
      </form>
    </AuthLayout>
  )
}
