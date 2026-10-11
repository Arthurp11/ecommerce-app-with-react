import { useEffect, useState } from 'react'

interface AsyncState<T> {
  data: T | undefined
  error: unknown
  loading: boolean
}

interface Settled<T> {
  key: string
  data?: T
  error?: unknown
}

/**
 * Executa `fn` sempre que `key` muda e descarta respostas de chamadas antigas.
 * `fn` deve depender apenas do que está representado em `key`.
 */
export function useAsync<T>(key: string, fn: () => Promise<T>): AsyncState<T> {
  const [settled, setSettled] = useState<Settled<T> | null>(null)

  useEffect(() => {
    let ignore = false

    fn().then(
      (data) => !ignore && setSettled({ key, data }),
      (error: unknown) => !ignore && setSettled({ key, error }),
    )

    return () => {
      ignore = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `key` identifica a chamada
  }, [key])

  const current = settled?.key === key ? settled : null

  return {
    data: current?.data,
    error: current?.error,
    loading: current === null,
  }
}
