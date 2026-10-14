import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

/**
 * Carga datos asíncronos asociados a una clave (un usuario, un repositorio...).
 * - key: cuando cambia, se vuelven a cargar. Con key null/undefined no se carga nada.
 * - load: función que devuelve una promesa con los datos.
 * - initialData: valor mientras no hay datos (usa una constante para no cambiar en cada render).
 *
 * "Cargando" no se guarda en el estado: se deduce de si los datos que hay corresponden a la clave
 * actual. Así, al cambiar de usuario nunca se ven por un instante los datos del anterior y no hace
 * falta reiniciar el estado dentro del efecto (lo que provocaría un render extra).
 *
 * setData permite actualizar los datos en local tras una operación confirmada por el servidor.
 */
export function useLoadedData(key, load, initialData) {
  const [reloadCount, setReloadCount] = useState(0)
  const requestKey = key == null ? null : `${key}::${reloadCount}`
  const [result, setResult] = useState({ requestKey: null, data: initialData, error: null })

  // Siempre la última función de carga, sin que sea una dependencia del efecto.
  const loadRef = useRef(load)
  useLayoutEffect(() => {
    loadRef.current = load
  })

  useEffect(() => {
    if (requestKey === null) return

    let isActive = true
    loadRef.current()
      .then((data) => {
        if (isActive) setResult({ requestKey, data, error: null })
      })
      .catch((error) => {
        if (isActive) setResult({ requestKey, data: initialData, error })
      })

    return () => {
      isActive = false
    }
    // initialData es una constante del llamador: no debe relanzar la carga.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey])

  const isCurrent = requestKey !== null && result.requestKey === requestKey

  const setData = useCallback((update) => {
    setResult((current) => ({
      ...current,
      data: typeof update === 'function' ? update(current.data) : update,
    }))
  }, [])

  const reload = useCallback(() => setReloadCount((count) => count + 1), [])

  return {
    data: isCurrent ? result.data : initialData,
    isLoading: requestKey !== null && !isCurrent,
    error: isCurrent ? result.error : null,
    setData,
    reload,
  }
}
