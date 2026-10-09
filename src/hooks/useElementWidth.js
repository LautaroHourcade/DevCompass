import { useEffect, useRef, useState } from 'react'

/** Ancho actual (en px) de un elemento. Se actualiza al cambiar el tamaño de la ventana o del contenedor. */
export function useElementWidth() {
  const ref = useRef(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return [ref, width]
}
