import { useId, type InputHTMLAttributes } from 'react'

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function FormField({ label, ...inputProps }: FormFieldProps) {
  const id = useId()

  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <input id={id} {...inputProps} />
    </div>
  )
}
