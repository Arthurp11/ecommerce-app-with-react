import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../auth/useAuth'
import { Alert } from '../components/Alert'
import { FormField } from '../components/FormField'
import { getErrorMessage } from '../lib/errors'

const MIN_PASSWORD_LENGTH = 6

type Feedback = { variant: 'success' | 'error'; message: string } | null

function ProfileSection() {
  const { user, updateProfile } = useAuth()
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [saving, setSaving] = useState(false)

  const changed = name.trim() !== user?.name || email.trim().toLowerCase() !== user?.email

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user) return
    setFeedback(null)
    setSaving(true)

    // Manda só o que mudou, para não disparar a checagem de e-mail duplicado à toa.
    const input: { name?: string; email?: string } = {}
    if (name.trim() !== user.name) input.name = name.trim()
    if (email.trim().toLowerCase() !== user.email) input.email = email.trim()

    try {
      await updateProfile(input)
      setFeedback({ variant: 'success', message: 'Dados atualizados.' })
    } catch (err) {
      setFeedback({ variant: 'error', message: getErrorMessage(err) })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="order-card account-section" onSubmit={handleSubmit}>
      <h2>Dados pessoais</h2>
      {feedback && <Alert variant={feedback.variant}>{feedback.message}</Alert>}

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

      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={saving || !changed}>
          {saving ? 'Salvando…' : 'Salvar dados'}
        </button>
      </div>
    </form>
  )
}

function PasswordSection() {
  const { updateProfile } = useAuth()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFeedback(null)

    if (password !== confirmPassword) {
      setFeedback({ variant: 'error', message: 'As senhas não coincidem.' })
      return
    }

    setSaving(true)
    try {
      await updateProfile({ password })
      setPassword('')
      setConfirmPassword('')
      setFeedback({
        variant: 'success',
        message: 'Senha alterada. Outros dispositivos precisarão entrar novamente.',
      })
    } catch (err) {
      setFeedback({ variant: 'error', message: getErrorMessage(err) })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="order-card account-section" onSubmit={handleSubmit}>
      <h2>Alterar senha</h2>
      {feedback && <Alert variant={feedback.variant}>{feedback.message}</Alert>}

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

      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Salvando…' : 'Alterar senha'}
        </button>
      </div>
    </form>
  )
}

function DeleteAccountSection() {
  const { deleteAccount } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!window.confirm('Excluir sua conta? Endereços e carrinho serão apagados. Isso não pode ser desfeito.')) {
      return
    }
    setError(null)
    setDeleting(true)
    try {
      await deleteAccount()
      navigate('/', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
      setDeleting(false)
    }
  }

  return (
    <div className="order-card account-section account-danger">
      <h2>Excluir conta</h2>
      {error && <Alert variant="error">{error}</Alert>}
      <p>
        Apaga sua conta, endereços e carrinho. Contas que já fizeram pedidos não podem ser
        excluídas.
      </p>
      <div className="form-actions">
        <button
          type="button"
          className="btn-secondary btn-link-danger"
          disabled={deleting}
          onClick={handleDelete}
        >
          {deleting ? 'Excluindo…' : 'Excluir minha conta'}
        </button>
      </div>
    </div>
  )
}

export function AccountPage() {
  return (
    <section className="page page-narrow">
      <h1 className="page-title">Minha conta</h1>
      <ProfileSection />
      <PasswordSection />
      <DeleteAccountSection />
    </section>
  )
}
