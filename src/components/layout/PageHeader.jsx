import { useLocation } from 'react-router-dom'
import { formatBearing, getSectionForPath } from '../../constants/navigation'

/**
 * Cabecera de página con la "línea de rumbo" de DevCompass: el rumbo de la sección,
 * una etiqueta corta (eyebrow) y una regla; debajo, el título y la descripción.
 * titleId: para aria-labelledby de la sección. children: acciones a la derecha.
 */
export default function PageHeader({ eyebrow, title, titleId, description, children }) {
  const { pathname } = useLocation()
  const section = getSectionForPath(pathname)

  return (
    <header className="flex flex-col gap-4 animate-fade-up">
      <p className="flex items-center gap-3 font-mono text-2xs tracking-[0.14em] text-muted uppercase">
        {section && (
          <span className="text-accent tabular-nums">
            <span className="sr-only">Rumbo </span>
            {formatBearing(section.bearing)}
          </span>
        )}
        <span className="truncate">{eyebrow}</span>
        <span aria-hidden="true" className="ruler min-w-[4rem] flex-1" />
      </p>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 flex-col gap-2">
          <h1 id={titleId} className="text-3xl leading-[1.1] font-semibold tracking-[-0.035em] sm:text-4xl">
            {title}
          </h1>
          {description && <p className="max-w-[60rem] text-base text-muted">{description}</p>}
        </div>
        {children && <div className="flex shrink-0 flex-wrap gap-2">{children}</div>}
      </div>
    </header>
  )
}
