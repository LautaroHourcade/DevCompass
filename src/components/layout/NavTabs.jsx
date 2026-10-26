import { useLayoutEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from '../../hooks/useTranslation'

/**
 * Pestañas de navegación con el indicador recortado por clip-path.
 * La lista se dibuja dos veces: la de abajo con el estilo normal y la de arriba con el estilo
 * "activo", recortada para que solo se vea la pestaña actual. Al navegar se anima el recorte,
 * así fondo y color del texto cambian a la vez, sin estados intermedios desajustados.
 * - items: secciones visibles. activeTo: ruta de la sección actual (o null). savedCount: contador de Guardados.
 */
export default function NavTabs({ items, activeTo, savedCount }) {
  const listRef = useRef(null)
  const [clipPath, setClipPath] = useState(null)
  const { t } = useTranslation()

  useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return

    function updateClip() {
      const activeLink = list.querySelector(`[data-to="${activeTo}"]`)
      if (!activeLink) {
        setClipPath(null)
        return
      }
      const left = activeLink.offsetLeft
      const right = list.offsetWidth - (left + activeLink.offsetWidth)
      setClipPath(`inset(0 ${right}px 0 ${left}px round 0.8rem)`)
    }

    updateClip()
    // Las fuentes o el contador pueden cambiar el ancho de las pestañas.
    const observer = new ResizeObserver(updateClip)
    observer.observe(list)
    return () => observer.disconnect()
  }, [activeTo, items.length, savedCount, t])

  return (
    <nav aria-label={t('header.mainNav')} className="relative">
      <ul ref={listRef} className="flex items-center gap-0.5">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.to === '/'}
              data-to={item.to}
              className="flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium text-muted transition-colors duration-150 hover:bg-surface-2 hover:text-fg"
            >
              <TabContent item={item} savedCount={savedCount} />
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Copia "activa": solo decorativa, recortada sobre la pestaña actual. */}
      <ul
        aria-hidden="true"
        inert
        style={{ clipPath: clipPath ?? 'inset(0 50% 0 50% round 0.8rem)', opacity: clipPath ? 1 : 0 }}
        className="pointer-events-none absolute inset-0 flex items-center gap-0.5 transition-[clip-path,opacity] duration-250 ease-in-out motion-reduce:transition-none"
      >
        {items.map((item) => (
          <li key={item.to} className="flex h-9 items-center gap-2 rounded-lg bg-fg px-3 text-sm font-medium text-canvas">
            <TabContent item={item} savedCount={savedCount} isActiveCopy />
          </li>
        ))}
      </ul>
    </nav>
  )
}

function TabContent({ item, savedCount, isActiveCopy = false }) {
  const { t } = useTranslation()

  return (
    <>
      {t(item.labelKey)}
      {item.to === '/guardados' && savedCount > 0 && (
        <span
          className={`font-mono text-xs tabular-nums ${isActiveCopy ? 'text-canvas/60' : 'text-subtle'}`}
        >
          {savedCount}
        </span>
      )}
    </>
  )
}
