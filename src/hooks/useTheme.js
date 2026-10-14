import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'

const STORAGE_KEY = 'devcompass-theme'
const REVEAL_DURATION_MS = 420

// index.html ya aplica la clase .dark antes de pintar; aquí solo la leemos.
function getInitialTheme() {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme)
  const themeRef = useRef(theme)

  // useLayoutEffect: la clase debe estar puesta antes de que la View Transition capture la nueva vista.
  useLayoutEffect(() => {
    themeRef.current = theme
    document.documentElement.classList.toggle('dark', theme === 'dark')

    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // Sin almacenamiento disponible el tema funciona igual durante la sesión.
    }
  }, [theme])

  /**
   * Cambia entre claro y oscuro. origin (opcional): { x, y } del botón pulsado; desde ahí se abre
   * un círculo con el nuevo tema. Es una acción poco frecuente, así que se permite el detalle.
   * Sin soporte de View Transitions o con movimiento reducido, el cambio es instantáneo.
   */
  const toggleTheme = useCallback((origin) => {
    const nextTheme = themeRef.current === 'dark' ? 'light' : 'dark'

    if (!document.startViewTransition || !origin || prefersReducedMotion()) {
      setTheme(nextTheme)
      return
    }

    const transition = document.startViewTransition(() => {
      flushSync(() => setTheme(nextTheme))
    })

    transition.ready
      .then(() => {
        const radius = Math.hypot(
          Math.max(origin.x, window.innerWidth - origin.x),
          Math.max(origin.y, window.innerHeight - origin.y),
        )
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${origin.x}px ${origin.y}px)`,
              `circle(${radius}px at ${origin.x}px ${origin.y}px)`,
            ],
          },
          {
            duration: REVEAL_DURATION_MS,
            easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
            pseudoElement: '::view-transition-new(root)',
          },
        )
      })
      .catch(() => {
        // Si la transición se interrumpe, el tema ya está aplicado: no hay nada que hacer.
      })
  }, [])

  return { theme, toggleTheme }
}
