import { useAuth } from '../auth/useAuth'

// Placeholder da área logada até as próximas telas (produtos, carrinho...) existirem.
export function HomePage() {
  const { user, logout } = useAuth()

  return (
    <main className="home-page">
      <header className="home-header">
        <span className="auth-brand">Ecommerce</span>
        <button type="button" className="btn-secondary" onClick={logout}>
          Sair
        </button>
      </header>

      <section className="home-content">
        <h1>Olá, {user?.name}!</h1>
        <p>
          Você está logado como <strong>{user?.email}</strong>
          {user?.role === 'admin' && ' (administrador)'}.
        </p>
      </section>
    </main>
  )
}
