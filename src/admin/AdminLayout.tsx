import { NavLink, Outlet } from 'react-router'

export function AdminLayout() {
  return (
    <section className="page">
      <h1 className="page-title">Administração</h1>
      <nav className="admin-tabs" aria-label="Seções do admin">
        <NavLink to="/admin/categories">Categorias</NavLink>
        <NavLink to="/admin/products">Produtos</NavLink>
      </nav>
      <Outlet />
    </section>
  )
}
