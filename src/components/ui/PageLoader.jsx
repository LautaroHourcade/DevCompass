import { CompassIcon } from './Icons'

/** Estado de carga a pantalla completa (p. ej. mientras se comprueba la sesión). */
export default function PageLoader({ label = 'Cargando…' }) {
  return (
    <p role="status" className="flex flex-col items-center gap-3 py-24 text-sm text-muted animate-fade-in">
      <CompassIcon className="size-8 animate-spin text-accent [animation-duration:2s]" />
      {label}
    </p>
  )
}
