import { useId, useState } from 'react'
import { CheckIcon, SearchIcon } from '../ui/Icons'
import { CONTROL_CLASSES } from '../ui/formStyles'

/**
 * Selección de los repositorios guardados que se comparan (máximo maxSelected).
 * Marcar o desmarcar solo cambia la comparación: la colección no se toca.
 * - selectedIds: ids de GitHub seleccionados. onToggle(repo): añade o quita el repositorio.
 */
export default function ComparePicker({ repos, selectedIds, maxSelected, onToggle }) {
  const [query, setQuery] = useState('')
  const searchId = useId()
  const isFull = selectedIds.length >= maxSelected

  const normalizedQuery = query.trim().toLowerCase()
  const visibleRepos = normalizedQuery
    ? repos.filter((repo) => repo.fullName.toLowerCase().includes(normalizedQuery))
    : repos

  return (
    <fieldset className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-5 shadow-card animate-fade-up">
      <legend className="sr-only">Repositorios para comparar</legend>

      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-2xs tracking-[0.14em] text-muted uppercase" aria-hidden="true">
          Elige repositorios
        </p>
        <p role="status" className="text-sm text-muted">
          <span className="font-mono font-medium text-fg tabular-nums">{selectedIds.length}</span> de {maxSelected} seleccionados
          {isFull && ' · quita uno para elegir otro'}
        </p>
      </div>

      <label htmlFor={searchId} className="sr-only">
        Buscar en tu colección
      </label>
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
        <input
          id={searchId}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar en tu colección…"
          className={`${CONTROL_CLASSES} pl-9`}
        />
      </div>

      {visibleRepos.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted">Ningún repositorio guardado coincide con la búsqueda.</p>
      ) : (
        <ul className="grid max-h-[28rem] gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
          {visibleRepos.map((repo) => {
            const isChecked = selectedIds.includes(repo.id)
            const isDisabled = !isChecked && isFull

            return (
              <li key={repo.id}>
                <label
                  className={`flex h-full items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors ${
                    isChecked ? 'border-accent/60 bg-accent-soft' : 'border-line-strong bg-surface'
                  } ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-accent/60'}`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    disabled={isDisabled}
                    onChange={() => onToggle(repo)}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={`flex size-4 shrink-0 items-center justify-center rounded border peer-focus-visible:ring-2 peer-focus-visible:ring-accent ${
                      isChecked ? 'border-accent bg-accent text-on-accent' : 'border-line'
                    }`}
                  >
                    {isChecked && <CheckIcon className="size-3" strokeWidth={3} />}
                  </span>
                  <span className="min-w-0 truncate">{repo.fullName}</span>
                </label>
              </li>
            )
          })}
        </ul>
      )}
    </fieldset>
  )
}
