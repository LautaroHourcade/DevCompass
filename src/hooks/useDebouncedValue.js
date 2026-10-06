import { useEffect, useState } from 'react'

/** Devuelve el valor solo cuando deja de cambiar durante `delay` ms. */
export function useDebouncedValue(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timeoutId)
  }, [value, delay])

  return debouncedValue
}
