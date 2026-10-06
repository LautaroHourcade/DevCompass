import { BookmarkIcon } from '../ui/Icons'
import { buttonClasses } from '../ui/buttonStyles'

/**
 * Botón para guardar / quitar un repositorio.
 * - compact: solo icono (tarjetas).
 * - normal: icono + texto (detalle).
 */
export default function SaveButton({ repo, isSaved, onToggleSave, compact = false }) {
  function handleClick(event) {
    event.preventDefault()
    onToggleSave(repo)
  }

  const label = isSaved ? 'Quitar de guardados' : 'Guardar repositorio'
  const icon = <BookmarkIcon filled={isSaved} className="size-5" />

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={isSaved}
        aria-label={`${label}: ${repo.name}`}
        title={label}
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
      aria-pressed={isSaved}
      className={buttonClasses({ className: isSaved ? 'border-accent text-accent' : '' })}
    >
      {icon}
      {isSaved ? 'Guardado' : 'Guardar'}
    </button>
  )
}
