import type { FormEvent } from 'react'
import { useSearchParams } from 'react-router'
import { catalogService, type ProductQuery, type ProductSort } from '../catalog/catalog.service'
import { ProductCard } from '../catalog/ProductCard'
import { Alert } from '../components/Alert'
import { Pagination } from '../components/Pagination'
import { getErrorMessage } from '../lib/errors'
import { useAsync } from '../lib/useAsync'

const PAGE_SIZE = 12

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: 'newest', label: 'Mais recentes' },
  { value: 'price_asc', label: 'Menor preço' },
  { value: 'price_desc', label: 'Maior preço' },
]

function isSort(value: string | null): value is ProductSort {
  return SORT_OPTIONS.some((option) => option.value === value)
}

export function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const search = searchParams.get('search') ?? ''
  const categoryId = Number(searchParams.get('categoryId')) || undefined
  const sortParam = searchParams.get('sort')
  const sort: ProductSort = isSort(sortParam) ? sortParam : 'newest'
  const page = Math.max(1, Number(searchParams.get('page')) || 1)

  const query: ProductQuery = { search, categoryId, sort, page, limit: PAGE_SIZE }
  const products = useAsync(JSON.stringify(query), () => catalogService.listProducts(query))
  const categories = useAsync('categories', catalogService.listCategories)

  // Qualquer mudança de filtro volta para a página 1.
  function updateParams(changes: Record<string, string | undefined>) {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      for (const [key, value] of Object.entries(changes)) {
        if (value) next.set(key, value)
        else next.delete(key)
      }
      if (!('page' in changes)) next.delete('page')
      return next
    })
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = new FormData(event.currentTarget).get('search')
    updateParams({ search: String(value ?? '').trim() })
  }

  function changePage(nextPage: number) {
    updateParams({ page: nextPage > 1 ? String(nextPage) : undefined })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <section className="page">
      <h1 className="page-title">Produtos</h1>

      <div className="catalog-toolbar">
        <form className="catalog-search" role="search" onSubmit={handleSearch}>
          <input
            key={search}
            name="search"
            type="search"
            placeholder="Buscar produtos…"
            defaultValue={search}
            aria-label="Buscar produtos"
          />
          <button type="submit" className="btn-primary btn-sm">
            Buscar
          </button>
        </form>

        <select
          aria-label="Ordenar por"
          value={sort}
          onChange={(e) => updateParams({ sort: e.target.value === 'newest' ? undefined : e.target.value })}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {categories.data && categories.data.length > 0 && (
        <div className="category-chips" role="group" aria-label="Categorias">
          <button
            type="button"
            className="chip"
            aria-pressed={!categoryId}
            onClick={() => updateParams({ categoryId: undefined })}
          >
            Todas
          </button>
          {categories.data.map((category) => (
            <button
              key={category.id}
              type="button"
              className="chip"
              aria-pressed={categoryId === category.id}
              onClick={() => updateParams({ categoryId: String(category.id) })}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}

      {products.error ? (
        <Alert variant="error">{getErrorMessage(products.error)}</Alert>
      ) : products.loading ? (
        <div className="catalog-grid" aria-busy>
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="product-card skeleton" />
          ))}
        </div>
      ) : products.data && products.data.data.length > 0 ? (
        <>
          <p className="catalog-count">
            {products.data.meta.total}{' '}
            {products.data.meta.total === 1 ? 'produto encontrado' : 'produtos encontrados'}
          </p>
          <div className="catalog-grid">
            {products.data.data.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <Pagination
            page={products.data.meta.page}
            totalPages={products.data.meta.totalPages}
            onChange={changePage}
          />
        </>
      ) : (
        <div className="empty-state">
          <p>Nenhum produto encontrado.</p>
          {(search || categoryId) && (
            <button
              type="button"
              className="btn-secondary btn-sm"
              onClick={() => setSearchParams({})}
            >
              Limpar filtros
            </button>
          )}
        </div>
      )}
    </section>
  )
}
