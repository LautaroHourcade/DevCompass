import { CloseIcon } from '../ui/Icons'

/** Etiqueta del usuario. Con onRemove muestra una "x" para quitarla del repositorio. */
export default function TagChip({ name, onRemove, isRemoving = false }) {
  function handleRemove(event) {
    event.preventDefault()
    onRemove()
  }

  return (
    <span
      className={`inline-flex h-7 items-center gap-1 rounded-full border border-purple/30 bg-purple/10 pl-3 font-mono text-xs text-purple animate-fade-in ${
        onRemove ? 'pr-1' : 'pr-3'
      } ${isRemoving ? 'opacity-50' : ''}`}
    >
      <span aria-hidden="true">#</span>
      <span className="max-w-[16rem] truncate">{name}</span>
      {onRemove && (
        <button
          type="button"
          onClick={handleRemove}
          disabled={isRemoving}
          aria-label={`Quitar la etiqueta ${name}`}
          title="Quitar etiqueta"
          className="flex size-5 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-purple/20 disabled:cursor-wait"
        >
          <CloseIcon className="size-3" strokeWidth={2.5} />
        </button>
      )}
    </span>
  )
}
