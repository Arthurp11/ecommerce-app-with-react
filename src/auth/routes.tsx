import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from './useAuth'

function FullPageLoader() {
  return <div className="page-loader">Carregando…</div>
}

// Só deixa passar usuários autenticados; guarda a rota de origem para voltar após o login.
export function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <FullPageLoader />
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  return <Outlet />
}

// Páginas de login/cadastro: quem já está logado vai para a home.
export function GuestRoute() {
  const { user, loading } = useAuth()

  if (loading) return <FullPageLoader />
  if (user) return <Navigate to="/" replace />
  return <Outlet />
}
