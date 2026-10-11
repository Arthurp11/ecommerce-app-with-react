import { Link, NavLink, Outlet } from 'react-router'
import { useAuth } from '../auth/useAuth'
import { useCart } from '../cart/useCart'

export function AppLayout() {
  const { user, loading, logout } = useAuth()
  const { itemCount } = useCart()

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <Link to="/" className="app-brand">
            Ecommerce
          </Link>

          <nav className="app-nav">
            <NavLink to="/" end>
              Produtos
            </NavLink>
            {user && <NavLink to="/account/addresses">Endereços</NavLink>}
          </nav>

          <div className="app-header-actions">
            <NavLink to="/cart" className="app-cart" aria-label={`Carrinho, ${itemCount} itens`}>
              Carrinho
              {itemCount > 0 && <span className="app-cart-count">{itemCount}</span>}
            </NavLink>

            {loading ? null : user ? (
              <>
                <span className="app-user">Olá, {user.name.split(' ')[0]}</span>
                <button type="button" className="btn-secondary btn-sm" onClick={logout}>
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary btn-sm">
                  Entrar
                </Link>
                <Link to="/register" className="btn-primary btn-sm">
                  Criar conta
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
