import { useState, type FormEvent } from 'react'
import { Alert } from '../components/Alert'
import { FormField } from '../components/FormField'
import { getErrorMessage } from '../lib/errors'
import { formatZipCode, lookupZipCode, type Address, type AddressInput } from './address.service'

const STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
  'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

interface AddressFormProps {
  initial?: Address
  submitLabel: string
  onSubmit: (input: AddressInput) => Promise<void>
  onCancel?: () => void
}

export function AddressForm({ initial, submitLabel, onSubmit, onCancel }: AddressFormProps) {
  const [values, setValues] = useState({
    recipientName: initial?.recipientName ?? '',
    zipCode: formatZipCode(initial?.zipCode ?? ''),
    street: initial?.street ?? '',
    number: initial?.number ?? '',
    complement: initial?.complement ?? '',
    neighborhood: initial?.neighborhood ?? '',
    city: initial?.city ?? '',
    state: initial?.state ?? '',
    isDefault: false,
  })
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [lookingUp, setLookingUp] = useState(false)

  function set<K extends keyof typeof values>(key: K, value: (typeof values)[K]) {
    setValues((current) => ({ ...current, [key]: value }))
  }

  async function handleZipCodeChange(raw: string) {
    const zipCode = formatZipCode(raw)
    set('zipCode', zipCode)

    if (zipCode.replace(/\D/g, '').length !== 8) return
    setLookingUp(true)
    const found = await lookupZipCode(zipCode)
    setLookingUp(false)
    if (found) {
      // Só preenche o que o ViaCEP trouxe; CEPs genéricos de cidade vêm sem rua/bairro.
      // Se o usuário já trocou o CEP enquanto buscava, descarta o resultado antigo.
      setValues((current) =>
        current.zipCode !== zipCode
          ? current
          : {
              ...current,
              street: found.street || current.street,
              neighborhood: found.neighborhood || current.neighborhood,
              city: found.city || current.city,
              state: found.state || current.state,
            },
      )
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    const { isDefault, complement, ...rest } = values
    const input: AddressInput = {
      ...rest,
      recipientName: rest.recipientName.trim(),
      zipCode: rest.zipCode.replace(/\D/g, ''),
      // String vazia (e não undefined) para que a edição consiga apagar o complemento.
      complement: complement.trim(),
      ...(isDefault && { isDefault: true }),
    }

    try {
      await onSubmit(input)
    } catch (err) {
      setError(getErrorMessage(err))
      setSubmitting(false)
    }
  }

  return (
    <form className="address-form" onSubmit={handleSubmit}>
      {error && <Alert variant="error">{error}</Alert>}

      <FormField
        label="Nome de quem vai receber"
        autoComplete="name"
        required
        maxLength={120}
        value={values.recipientName}
        onChange={(e) => set('recipientName', e.target.value)}
      />

      <div className="form-row">
        <FormField
          label={lookingUp ? 'CEP (buscando…)' : 'CEP'}
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="00000-000"
          required
          pattern="\d{5}-?\d{3}"
          title="CEP com 8 dígitos"
          value={values.zipCode}
          onChange={(e) => handleZipCodeChange(e.target.value)}
        />
        <div className="form-field">
          <label htmlFor="address-state">Estado</label>
          <select
            id="address-state"
            required
            value={values.state}
            onChange={(e) => set('state', e.target.value)}
          >
            <option value="" disabled>
              UF
            </option>
            {STATES.map((uf) => (
              <option key={uf} value={uf}>
                {uf}
              </option>
            ))}
          </select>
        </div>
      </div>

      <FormField
        label="Cidade"
        autoComplete="address-level2"
        required
        maxLength={120}
        value={values.city}
        onChange={(e) => set('city', e.target.value)}
      />

      <FormField
        label="Rua"
        autoComplete="address-line1"
        required
        maxLength={200}
        value={values.street}
        onChange={(e) => set('street', e.target.value)}
      />

      <div className="form-row">
        <FormField
          label="Número"
          required
          maxLength={20}
          value={values.number}
          onChange={(e) => set('number', e.target.value)}
        />
        <FormField
          label="Complemento (opcional)"
          autoComplete="address-line2"
          maxLength={120}
          value={values.complement}
          onChange={(e) => set('complement', e.target.value)}
        />
      </div>

      <FormField
        label="Bairro"
        required
        maxLength={120}
        value={values.neighborhood}
        onChange={(e) => set('neighborhood', e.target.value)}
      />

      {/* A API não permite desmarcar o padrão: outro endereço precisa ser escolhido no lugar. */}
      {!initial?.isDefault && (
        <label className="checkbox">
          <input
            type="checkbox"
            checked={values.isDefault}
            onChange={(e) => set('isDefault', e.target.checked)}
          />
          Usar como endereço padrão
        </label>
      )}

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="btn-secondary" onClick={onCancel} disabled={submitting}>
            Cancelar
          </button>
        )}
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Salvando…' : submitLabel}
        </button>
      </div>
    </form>
  )
}
