import { Link, useNavigate, useParams } from 'react-router'
import { AddressForm } from '../address/AddressForm'
import { addressService } from '../address/address.service'
import { Alert } from '../components/Alert'
import { getErrorMessage } from '../lib/errors'
import { useAsync } from '../lib/useAsync'

const BACK = '/account/addresses'

export function NewAddressPage() {
  const navigate = useNavigate()

  return (
    <section className="page page-narrow">
      <Link to={BACK} className="back-link">
        ← Meus endereços
      </Link>
      <h1 className="page-title">Novo endereço</h1>
      <AddressForm
        submitLabel="Salvar endereço"
        onCancel={() => navigate(BACK)}
        onSubmit={async (input) => {
          await addressService.create(input)
          navigate(BACK)
        }}
      />
    </section>
  )
}

export function EditAddressPage() {
  const navigate = useNavigate()
  const id = Number(useParams().id)
  const { data: address, error, loading } = useAsync(`address:${id}`, () => addressService.get(id))

  return (
    <section className="page page-narrow">
      <Link to={BACK} className="back-link">
        ← Meus endereços
      </Link>
      <h1 className="page-title">Editar endereço</h1>

      {loading ? (
        <div className="skeleton-line" style={{ height: 320 }} />
      ) : error || !address ? (
        <Alert variant="error">{getErrorMessage(error)}</Alert>
      ) : (
        <AddressForm
          initial={address}
          submitLabel="Salvar alterações"
          onCancel={() => navigate(BACK)}
          onSubmit={async (input) => {
            await addressService.update(id, input)
            navigate(BACK)
          }}
        />
      )}
    </section>
  )
}
