import { useState, type FormEvent } from 'react'
import type { Category, Product } from '../catalog/catalog.service'
import { Alert } from '../components/Alert'
import { FormField } from '../components/FormField'
import { getErrorMessage } from '../lib/errors'
import type { ProductInput } from './admin.service'

const MAX_IMAGES = 20

interface ProductFormProps {
  initial?: Product
  categories: Category[]
  submitLabel: string
  onSubmit: (input: ProductInput) => Promise<void>
  onCancel: () => void
}

function centsToInput(cents: number) {
  return (cents / 100).toFixed(2).replace('.', ',')
}

// Aceita "1234,56", "1.234,56" e "1234.56".
function parsePriceToCents(value: string): number | null {
  const normalized = value.trim().replace(/\s|R\$/g, '')
  const decimal = normalized.includes(',')
    ? normalized.replace(/\./g, '').replace(',', '.')
    : normalized
  if (!/^\d+(\.\d{1,2})?$/.test(decimal)) return null
  return Math.round(Number(decimal) * 100)
}

function isUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function ProductForm({ initial, categories, submitLabel, onSubmit, onCancel }: ProductFormProps) {
  const [values, setValues] = useState({
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    price: initial ? centsToInput(initial.priceInCents) : '',
    stock: String(initial?.stock ?? 0),
    sku: initial?.sku ?? '',
    categoryId: String(initial?.category.id ?? categories[0]?.id ?? ''),
    images: initial?.images.join('\n') ?? '',
    isActive: initial?.isActive ?? true,
  })
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function set<K extends keyof typeof values>(key: K, value: (typeof values)[K]) {
    setValues((current) => ({ ...current, [key]: value }))
  }

  const images = values.images
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const priceInCents = parsePriceToCents(values.price)
    if (priceInCents === null) {
      setError('Preço inválido. Use o formato 199,90.')
      return
    }
    const invalidImage = images.find((image) => !isUrl(image))
    if (invalidImage) {
      setError(`Imagem com URL inválida: ${invalidImage}`)
      return
    }
    if (images.length > MAX_IMAGES) {
      setError(`No máximo ${MAX_IMAGES} imagens.`)
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({
        name: values.name.trim(),
        description: values.description.trim(),
        priceInCents,
        stock: Number(values.stock),
        sku: values.sku.trim(),
        categoryId: Number(values.categoryId),
        images,
        isActive: values.isActive,
      })
    } catch (err) {
      setError(getErrorMessage(err))
      setSubmitting(false)
    }
  }

  return (
    <form className="address-form" onSubmit={handleSubmit}>
      {error && <Alert variant="error">{error}</Alert>}

      <FormField
        label="Nome"
        required
        minLength={2}
        maxLength={200}
        value={values.name}
        onChange={(e) => set('name', e.target.value)}
      />

      <div className="form-field">
        <label htmlFor="product-description">Descrição</label>
        <textarea
          id="product-description"
          required
          rows={5}
          value={values.description}
          onChange={(e) => set('description', e.target.value)}
        />
      </div>

      <div className="form-row">
        <FormField
          label="Preço (R$)"
          inputMode="decimal"
          placeholder="199,90"
          required
          value={values.price}
          onChange={(e) => set('price', e.target.value)}
        />
        <FormField
          label="Estoque"
          type="number"
          min={0}
          step={1}
          required
          value={values.stock}
          onChange={(e) => set('stock', e.target.value)}
        />
      </div>

      <div className="form-row">
        <FormField
          label="SKU"
          required
          maxLength={64}
          value={values.sku}
          onChange={(e) => set('sku', e.target.value)}
        />
        <div className="form-field">
          <label htmlFor="product-category">Categoria</label>
          <select
            id="product-category"
            required
            value={values.categoryId}
            onChange={(e) => set('categoryId', e.target.value)}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="product-images">Imagens (uma URL por linha; a primeira é a capa)</label>
        <textarea
          id="product-images"
          rows={3}
          placeholder="https://exemplo.com/foto.jpg"
          value={values.images}
          onChange={(e) => set('images', e.target.value)}
        />
        {images.length > 0 && (
          <div className="image-previews">
            {images.slice(0, MAX_IMAGES).map((image) =>
              isUrl(image) ? <img key={image} src={image} alt="" /> : null,
            )}
          </div>
        )}
      </div>

      <label className="checkbox">
        <input
          type="checkbox"
          checked={values.isActive}
          onChange={(e) => set('isActive', e.target.checked)}
        />
        Ativo (visível na loja)
      </label>
      {initial?.isActive && !values.isActive && (
        <p className="cart-item-problem">
          Ao salvar inativo, o produto some da loja e da lista do admin, e não dá para reativá-lo
          por aqui (a API não lista produtos inativos).
        </p>
      )}

      <div className="form-actions">
        <button type="button" className="btn-secondary" disabled={submitting} onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Salvando…' : submitLabel}
        </button>
      </div>
    </form>
  )
}
