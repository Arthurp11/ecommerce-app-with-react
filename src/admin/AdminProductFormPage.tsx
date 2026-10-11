import { Link, useNavigate, useParams } from 'react-router'
import { catalogService } from '../catalog/catalog.service'
import { Alert } from '../components/Alert'
import { getErrorMessage } from '../lib/errors'
import { useAsync } from '../lib/useAsync'
import { adminService } from './admin.service'
import { ProductForm } from './ProductForm'

const BACK = '/admin/products'

function NoCategories() {
  return (
    <div className="empty-state empty-state-card">
      <p>Cadastre uma categoria antes de criar produtos.</p>
      <Link to="/admin/categories" className="btn-primary btn-sm">
        Ir para categorias
      </Link>
    </div>
  )
}

export function AdminNewProductPage() {
  const navigate = useNavigate()
  const categories = useAsync('admin-product-categories', catalogService.listCategories)

  return (
    <div className="admin-section page-narrow admin-form-page">
      <Link to={BACK} className="back-link">
        ← Produtos
      </Link>
      <h2>Novo produto</h2>

      {categories.error ? (
        <Alert variant="error">{getErrorMessage(categories.error)}</Alert>
      ) : categories.loading ? (
        <div className="skeleton-line" style={{ height: 400 }} />
      ) : categories.data && categories.data.length > 0 ? (
        <ProductForm
          categories={categories.data}
          submitLabel="Criar produto"
          onCancel={() => navigate(BACK)}
          onSubmit={async (input) => {
            await adminService.createProduct(input)
            navigate(BACK)
          }}
        />
      ) : (
        <NoCategories />
      )}
    </div>
  )
}

// A API só busca produtos ativos por slug (não há GET por id para admin).
export function AdminEditProductPage() {
  const navigate = useNavigate()
  const { slug = '' } = useParams()
  const product = useAsync(`admin-product:${slug}`, () => catalogService.getProduct(slug))
  const categories = useAsync('admin-product-categories', catalogService.listCategories)

  const error = product.error ?? categories.error
  const loading = product.loading || categories.loading

  return (
    <div className="admin-section page-narrow admin-form-page">
      <Link to={BACK} className="back-link">
        ← Produtos
      </Link>
      <h2>Editar produto</h2>

      {error ? (
        <Alert variant="error">{getErrorMessage(error)}</Alert>
      ) : loading || !product.data || !categories.data ? (
        <div className="skeleton-line" style={{ height: 400 }} />
      ) : (
        <ProductForm
          initial={product.data}
          categories={categories.data}
          submitLabel="Salvar alterações"
          onCancel={() => navigate(BACK)}
          onSubmit={async (input) => {
            await adminService.updateProduct(product.data!.id, input)
            navigate(BACK)
          }}
        />
      )}
    </div>
  )
}
