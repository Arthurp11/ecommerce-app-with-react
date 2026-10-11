import { useState } from 'react'
import { catalogService } from '../catalog/catalog.service'
import { Alert } from '../components/Alert'
import { getErrorMessage } from '../lib/errors'
import { useAsync } from '../lib/useAsync'
import { adminService } from './admin.service'
import { CategoryForm } from './CategoryForm'

export function AdminCategoriesPage() {
  const [version, setVersion] = useState(0)
  const { data: categories, error, loading } = useAsync(
    `admin-categories:${version}`,
    catalogService.listCategories,
  )
  const reload = () => setVersion((v) => v + 1)

  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  async function remove(id: number, name: string) {
    if (!window.confirm(`Excluir a categoria "${name}"?`)) return
    setActionError(null)
    setDeletingId(id)
    try {
      await adminService.deleteCategory(id)
      reload()
    } catch (err) {
      setActionError(getErrorMessage(err))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="admin-section">
      <div className="page-heading">
        <h2>Categorias</h2>
        {!creating && (
          <button type="button" className="btn-primary btn-sm" onClick={() => setCreating(true)}>
            Nova categoria
          </button>
        )}
      </div>

      {creating && (
        <div className="order-card">
          <CategoryForm
            submitLabel="Criar categoria"
            onCancel={() => setCreating(false)}
            onSubmit={async (input) => {
              await adminService.createCategory(input)
              setCreating(false)
              reload()
            }}
          />
        </div>
      )}

      {actionError && <Alert variant="error">{actionError}</Alert>}

      {error ? (
        <Alert variant="error">{getErrorMessage(error)}</Alert>
      ) : loading && !categories ? (
        <div className="skeleton-line" style={{ height: 160 }} />
      ) : categories && categories.length > 0 ? (
        <ul className="admin-list">
          {categories.map((category) =>
            editingId === category.id ? (
              <li key={category.id}>
                <CategoryForm
                  initial={category}
                  submitLabel="Salvar"
                  onCancel={() => setEditingId(null)}
                  onSubmit={async (input) => {
                    await adminService.updateCategory(category.id, input)
                    setEditingId(null)
                    reload()
                  }}
                />
              </li>
            ) : (
              <li key={category.id} className="admin-list-row">
                <div className="admin-list-main">
                  <strong>{category.name}</strong>
                  <span>
                    /{category.slug}
                    {category.description && ` · ${category.description}`}
                  </span>
                </div>
                <div className="admin-list-actions">
                  <button type="button" className="btn-link" onClick={() => setEditingId(category.id)}>
                    Editar
                  </button>
                  <button
                    type="button"
                    className="btn-link btn-link-danger"
                    disabled={deletingId === category.id}
                    onClick={() => remove(category.id, category.name)}
                  >
                    Excluir
                  </button>
                </div>
              </li>
            ),
          )}
        </ul>
      ) : (
        !creating && (
          <div className="empty-state empty-state-card">
            <p>Nenhuma categoria cadastrada. Crie uma para poder cadastrar produtos.</p>
          </div>
        )
      )}
    </div>
  )
}
