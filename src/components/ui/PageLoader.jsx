import { CompassMark } from './Icons'

/** Estado de carga: la aguja de la brújula gira rápido (un giro ágil hace que la espera parezca más corta). */
export default function PageLoader({ label = 'Cargando…' }) {
  return (
    <p role="status" className="flex flex-col items-center gap-3 py-24 text-sm text-muted animate-fade-in">
      <CompassMark className="size-10 text-fg" needleClassName="animate-spin-fast motion-reduce:animate-none" />
      {label}
    </p>
  )
}
