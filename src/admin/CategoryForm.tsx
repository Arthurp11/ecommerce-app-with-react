import { useState, type FormEvent } from 'react'
import type { Category } from '../catalog/catalog.service'
import { Alert } from '../components/Alert'
import { FormField } from '../components/FormField'
import { getErrorMessage } from '../lib/errors'
import type { CategoryInput } from './admin.service'

interface CategoryFormProps {
  initial?: Category
  submitLabel: string
  onSubmit: (input: CategoryInput) => Promise<void>
  onCancel?: () => void
}

export function CategoryForm({ initial, submitLabel, onSubmit, onCancel }: CategoryFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await onSubmit({ name: name.trim(), description: description.trim() })
      if (!initial) {
        setName('')
        setDescription('')
      }
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      {error && <Alert variant="error">{error}</Alert>}
      <div className="form-row">
        <FormField
          label="Nome"
          required
          minLength={2}
          maxLength={100}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <FormField
          label="Descrição (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="form-actions">
        {onCancel && (
          <button type="button" className="btn-secondary btn-sm" disabled={submitting} onClick={onCancel}>
            Cancelar
          </button>
        )}
        <button type="submit" className="btn-primary btn-sm" disabled={submitting}>
          {submitting ? 'Salvando…' : submitLabel}
        </button>
      </div>
    </form>
  )
}
