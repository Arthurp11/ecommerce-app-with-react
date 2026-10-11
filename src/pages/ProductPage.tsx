import { Link, useParams } from 'react-router'
import { AddToCart } from '../cart/AddToCart'
import { catalogService } from '../catalog/catalog.service'
import { ProductGallery } from '../catalog/ProductGallery'
import { Alert } from '../components/Alert'
import { ApiError } from '../lib/api'
import { getErrorMessage } from '../lib/errors'
import { formatPrice } from '../lib/format'
import { useAsync } from '../lib/useAsync'

const LOW_STOCK_THRESHOLD = 5

export function ProductPage() {
  const { slug = '' } = useParams()
  const { data: product, error, loading } = useAsync(`product:${slug}`, () =>
    catalogService.getProduct(slug),
  )

  if (loading) {
    return (
      <section className="page product-detail" aria-busy>
        <div className="gallery-main skeleton" />
        <div className="product-info">
          <div className="skeleton-line" style={{ width: '40%' }} />
          <div className="skeleton-line" style={{ width: '80%', height: 32 }} />
          <div className="skeleton-line" style={{ width: '30%', height: 28 }} />
        </div>
      </section>
    )
  }

  if (error || !product) {
    const notFound = error instanceof ApiError && error.status === 404

    return (
      <section className="page">
        <div className="empty-state">
          {notFound ? (
            <>
              <h1 className="page-title">Produto não encontrado</h1>
              <p>Ele pode ter sido removido ou o link está incorreto.</p>
            </>
          ) : (
            <Alert variant="error">{getErrorMessage(error)}</Alert>
          )}
          <Link to="/" className="btn-secondary btn-sm">
            Ver todos os produtos
          </Link>
        </div>
      </section>
    )
  }

  const outOfStock = product.stock <= 0
  const lowStock = !outOfStock && product.stock <= LOW_STOCK_THRESHOLD

  return (
    <section className="page">
      <nav className="breadcrumb" aria-label="Navegação">
        <Link to="/">Produtos</Link>
        <span aria-hidden>/</span>
        <Link to={`/?categoryId=${product.category.id}`}>{product.category.name}</Link>
        <span aria-hidden>/</span>
        <span aria-current="page">{product.name}</span>
      </nav>

      <div className="product-detail">
        <ProductGallery key={product.id} images={product.images} alt={product.name} />

        <div className="product-info">
          <span className="product-card-category">{product.category.name}</span>
          <h1 className="product-title">{product.name}</h1>
          <p className="product-price">{formatPrice(product.priceInCents)}</p>

          <p className={`product-stock${outOfStock ? ' is-out' : lowStock ? ' is-low' : ''}`}>
            {outOfStock
              ? 'Esgotado'
              : lowStock
                ? `Últimas ${product.stock} unidades`
                : 'Em estoque'}
          </p>

          <AddToCart key={product.id} product={product} />

          <div className="product-description">
            <h2>Descrição</h2>
            <p>{product.description}</p>
          </div>

          <p className="product-sku">SKU: {product.sku}</p>
        </div>
      </div>
    </section>
  )
}
