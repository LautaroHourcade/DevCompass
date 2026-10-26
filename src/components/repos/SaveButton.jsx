import { useState } from 'react'
import { BookmarkIcon } from '../ui/Icons'
import { buttonClasses } from '../ui/buttonStyles'
import { useTranslation } from '../../hooks/useTranslation'

/** Indicador de actividad: un arco que gira rápido (un giro ágil hace que la espera parezca más corta). */
function Spinner({ className }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`animate-spin-fast motion-reduce:animate-none ${className}`}>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5" />
      <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

/**
 * Botón para guardar / quitar un repositorio.
 * - compact: solo icono (tarjetas).
 * - normal: icono + texto (detalle).
 * Mientras el servidor responde (guardar pide los datos a GitHub y puede tardar unos segundos)
 * muestra un indicador e ignora más clics (sin deshabilitar el botón, para no perder el foco).
 * Al terminar, el marcador se asienta con un pequeño escalado que confirma la acción.
 */
export default function SaveButton({ repo, isSaved, onToggleSave, compact = false }) {
  // Solo se anima tras un clic del usuario, no al cargar una colección ya guardada.
  const { t } = useTranslation()
  const [hasToggled, setHasToggled] = useState(false)
  const [isPending, setIsPending] = useState(false)

  async function handleClick(event) {
    event.preventDefault()
    if (isPending) return

    setHasToggled(true)
    setIsPending(true)
    try {
      // onToggleSave muestra el resultado (o el error) con un aviso.
      await onToggleSave(repo)
    } finally {
      setIsPending(false)
    }
  }

  const iconSize = compact ? 'size-[1.8rem]' : 'size-4'
  const label = isSaved ? t('repo.unsave') : t('repo.save')
  const pendingLabel = isSaved ? t('repo.removing') : t('common.saving')

  // key: al cambiar de estado el icono se vuelve a montar y repite la animación.
  const icon = isPending ? (
    <Spinner className={iconSize} />
  ) : (
    <span key={String(isSaved)} className={isSaved && hasToggled ? 'flex animate-mark' : 'flex'}>
      <BookmarkIcon filled={isSaved} className={iconSize} />
    </span>
  )

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-busy={isPending}
        aria-pressed={isSaved}
        aria-label={`${isPending ? pendingLabel : label}: ${repo.name}`}
        title={isPending ? pendingLabel : label}
        className={buttonClasses({
          variant: 'ghost',
          size: 'icon',
          className: isSaved ? 'text-accent hover:text-accent' : '',
        })}
      >
        {icon}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-busy={isPending}
      aria-pressed={isSaved}
      className={buttonClasses({ className: isSaved ? 'border-accent/50 text-accent' : '' })}
    >
      {icon}
      {isPending ? pendingLabel : isSaved ? t('repo.saved') : t('common.save')}
    </button>
  )
}
