import { CompassMark } from './Icons'
import { useTranslation } from '../../hooks/useTranslation'

/** Estado de carga: la aguja de la brújula gira rápido (un giro ágil hace que la espera parezca más corta). */
export default function PageLoader({ label }) {
  const { t } = useTranslation()

  return (
    <p role="status" className="flex flex-col items-center gap-3 py-24 text-sm text-muted animate-fade-in">
      <CompassMark className="size-10 text-fg" needleClassName="animate-spin-fast motion-reduce:animate-none" />
      {label ?? t('common.loading')}
    </p>
  )
}
