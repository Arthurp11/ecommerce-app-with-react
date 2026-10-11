import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router'
import { catalogService } from '../catalog/catalog.service'
import { Alert } from '../components/Alert'
import { Pagination } from '../components/Pagination'
import { getErrorMessage } from '../lib/errors'
import { formatPrice } from '../lib/format'
import { useAsync } from '../lib/useAsync'
import { adminService } from './admin.service'

const PAGE_SIZE = 20

export function AdminProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') ?? ''
  const page = Math.max(1, Number(searchParams.get('page')) || 1)

  const [version, setVersion] = useState(0)
  const { data, error, loading } = useAsync(`admin-products:${search}:${page}:${version}`, () =>
    catalogService.listProducts({ search, page, limit: PAGE_SIZE }),
  )

  const [pendingId, setPendingId] = useState<number | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = String(new FormData(event.currentTarget).get('search') ?? '').trim()
    setSearchParams(value ? { search: value } : {})
  }

  async function deactivate(id: number, name: string) {
    if (
      !window.confirm(
        `Desativar "${name}"? Ele some da loja e desta lista (a API não lista produtos inativos).`,
      )
    ) {
      return
    }
    setActionError(null)
    setPendingId(id)
    try {
      await adminService.deactivateProduct(id)
      setVersion((v) => v + 1)
    } catch (err) {
      setActionError(getErrorMessage(err))
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div className="admin-section">
      <div className="page-heading">
        <h2>Produtos</h2>
        <Link to="/admin/products/new" className="btn-primary btn-sm">
          Novo produto
        </Link>
      </div>

      <form className="catalog-search" role="search" onSubmit={handleSearch}>
        <input
          key={search}
          name="search"
          type="search"
          placeholder="Buscar por nome…"
          defaultValue={search}
          aria-label="Buscar produtos"
        />
        <button type="submit" className="btn-secondary btn-sm">
          Buscar
        </button>
      </form>

      {actionError && <Alert variant="error">{actionError}</Alert>}

      {error ? (
        <Alert variant="error">{getErrorMessage(error)}</Alert>
      ) : loading ? (
        <div className="skeleton-line" style={{ height: 200 }} />
      ) : data && data.data.length > 0 ? (
        <>
          <ul className="admin-list">
            {data.data.map((product) => (
              <li key={product.id} className="admin-list-row">
                <div className="admin-product">
                  <div className="cart-item-image admin-product-thumb">
                    {product.images[0] ? (
                      <img src={product.images[0]} alt="" />
                    ) : (
                      <span className="product-card-placeholder" aria-hidden>
                        {product.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="admin-list-main">
                    <strong>{product.name}</strong>
                    <span>
                      {product.sku} · {product.category.name} · {formatPrice(product.priceInCents)}{' '}
                      · {product.stock > 0 ? `${product.stock} em estoque` : 'Esgotado'}
                    </span>
                  </div>
                </div>
                <div className="admin-list-actions">
                  <Link to={`/products/${product.slug}`}>Ver</Link>
                  <Link to={`/admin/products/${product.slug}/edit`}>Editar</Link>
                  <button
                    type="button"
                    className="btn-link btn-link-danger"
                    disabled={pendingId === product.id}
                    onClick={() => deactivate(product.id, product.name)}
                  >
                    Desativar
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <Pagination
            page={data.meta.page}
            totalPages={data.meta.totalPages}
            onChange={(next) => {
              const params = new URLSearchParams(searchParams)
              if (next > 1) params.set('page', String(next))
              else params.delete('page')
              setSearchParams(params)
            }}
          />
        </>
      ) : (
        <div className="empty-state empty-state-card">
          <p>{search ? 'Nenhum produto encontrado.' : 'Nenhum produto ativo cadastrado.'}</p>
        </div>
      )}
    </div>
  )
}
