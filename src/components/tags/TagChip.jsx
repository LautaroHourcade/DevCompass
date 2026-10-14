import { CloseIcon } from '../ui/Icons'

/** Etiqueta del usuario. Con onRemove muestra una "x" para quitarla del repositorio. */
export default function TagChip({ name, onRemove, isRemoving = false }) {
  function handleRemove(event) {
    event.preventDefault()
    onRemove()
  }

  return (
    <span
      className={`inline-flex h-7 items-center gap-1 rounded-md border border-line-strong bg-surface-2 pl-2 font-mono text-xs text-fg transition-opacity duration-150 animate-fade-in ${
        onRemove ? 'pr-0.5' : 'pr-2'
      } ${isRemoving ? 'opacity-50' : ''}`}
    >
      <span aria-hidden="true" className="text-accent">#</span>
      <span className="max-w-[16rem] truncate">{name}</span>
      {onRemove && (
        <button
          type="button"
          onClick={handleRemove}
          disabled={isRemoving}
          aria-label={`Quitar la etiqueta ${name}`}
          title="Quitar etiqueta"
          className="flex size-6 cursor-pointer items-center justify-center rounded text-muted transition-[background-color,color] duration-150 hover:bg-line-strong hover:text-fg disabled:cursor-wait"
        >
          <CloseIcon className="size-3" strokeWidth={2.5} />
        </button>
      )}
    </span>
  )
}
