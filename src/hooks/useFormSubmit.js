import { useCallback, useState } from 'react'

/**
 * Estado común de un formulario que envía datos: si se está enviando y el error a mostrar.
 * Uso:
 *   const { isSubmitting, error, run } = useFormSubmit()
 *   const ok = await run(() => signIn({ email, password }))
 */
export function useFormSubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const run = useCallback(async (action) => {
    setIsSubmitting(true)
    setError('')

    try {
      await action()
      return true
    } catch (caughtError) {
      setError(caughtError.message)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  return { isSubmitting, error, setError, run }
}
