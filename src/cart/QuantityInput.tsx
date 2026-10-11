interface QuantityInputProps {
  value: number
  max: number
  disabled?: boolean
  onChange: (value: number) => void
  label?: string
}

// A API limita a quantidade por item a 999.
const API_MAX_QUANTITY = 999

export function QuantityInput({ value, max, disabled, onChange, label = 'Quantidade' }: QuantityInputProps) {
  const limit = Math.min(max, API_MAX_QUANTITY)

  return (
    <div className="quantity-input" role="group" aria-label={label}>
      <button
        type="button"
        aria-label="Diminuir quantidade"
        disabled={disabled || value <= 1}
        onClick={() => onChange(value - 1)}
      >
        −
      </button>
      <span aria-live="polite">{value}</span>
      <button
        type="button"
        aria-label="Aumentar quantidade"
        disabled={disabled || value >= limit}
        onClick={() => onChange(value + 1)}
      >
        +
      </button>
    </div>
  )
}
