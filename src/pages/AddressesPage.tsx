import { useState } from 'react'
import { Link } from 'react-router'
import { AddressCard } from '../address/AddressCard'
import { addressService } from '../address/address.service'
import { Alert } from '../components/Alert'
import { getErrorMessage } from '../lib/errors'
import { useAsync } from '../lib/useAsync'

export function AddressesPage() {
  // Incrementar a versão força o useAsync a buscar de novo após uma alteração.
  const [version, setVersion] = useState(0)
  const { data: addresses, error, loading } = useAsync(`addresses:${version}`, addressService.list)
  const [pending, setPending] = useState<number | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  async function run(id: number, action: () => Promise<unknown>) {
    setActionError(null)
    setPending(id)
    try {
      await action()
      setVersion((v) => v + 1)
    } catch (err) {
      setActionError(getErrorMessage(err))
    } finally {
      setPending(null)
    }
  }

  return (
    <section className="page page-narrow">
      <div className="page-heading">
        <h1 className="page-title">Meus endereços</h1>
        {/* Com a lista vazia, o próprio aviso já oferece o botão de cadastro. */}
        {addresses && addresses.length > 0 && (
          <Link to="/account/addresses/new" className="btn-primary btn-sm">
            Novo endereço
          </Link>
        )}
      </div>

      {actionError && <Alert variant="error">{actionError}</Alert>}

      {error ? (
        <Alert variant="error">{getErrorMessage(error)}</Alert>
      ) : loading && !addresses ? (
        <div className="skeleton-line" style={{ height: 120 }} />
      ) : addresses && addresses.length > 0 ? (
        <div className="address-list">
          {addresses.map((address) => {
            const busy = pending === address.id
            return (
              <AddressCard
                key={address.id}
                address={address}
                actions={
                  <>
                    <Link to={`/account/addresses/${address.id}/edit`}>Editar</Link>
                    {!address.isDefault && (
                      <button
                        type="button"
                        className="btn-link"
                        disabled={busy}
                        onClick={() =>
                          run(address.id, () => addressService.update(address.id, { isDefault: true }))
                        }
                      >
                        Tornar padrão
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn-link btn-link-danger"
                      disabled={busy}
                      onClick={() => {
                        if (window.confirm('Excluir este endereço?')) {
                          run(address.id, () => addressService.remove(address.id))
                        }
                      }}
                    >
                      Excluir
                    </button>
                  </>
                }
              />
            )
          })}
        </div>
      ) : (
        <div className="empty-state empty-state-card">
          <p>Você ainda não cadastrou nenhum endereço.</p>
          <Link to="/account/addresses/new" className="btn-primary btn-sm">
            Cadastrar endereço
          </Link>
        </div>
      )}
    </section>
  )
}
