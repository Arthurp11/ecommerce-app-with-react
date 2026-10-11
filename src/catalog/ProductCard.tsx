import { Link } from 'react-router'
import { formatPrice } from '../lib/format'
import type { Product } from './catalog.service'

export function ProductCard({ product }: { product: Product }) {
  const [cover] = product.images
  const outOfStock = product.stock <= 0

  return (
    <Link to={`/products/${product.slug}`} className="product-card">
      <div className="product-card-image">
        {cover ? (
          <img src={cover} alt={product.name} loading="lazy" />
        ) : (
          <span className="product-card-placeholder" aria-hidden>
            {product.name.charAt(0)}
          </span>
        )}
        {outOfStock && <span className="badge badge-muted">Esgotado</span>}
      </div>

      <div className="product-card-body">
        <span className="product-card-category">{product.category.name}</span>
        <h3 className="product-card-name">{product.name}</h3>
        <span className="product-card-price">{formatPrice(product.priceInCents)}</span>
      </div>
    </Link>
  )
}
