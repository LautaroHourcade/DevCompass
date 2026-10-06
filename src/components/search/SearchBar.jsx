import { useRef } from 'react'
import { CloseIcon, SearchIcon } from '../ui/Icons'

export default function SearchBar({ value, onChange }) {
  const inputRef = useRef(null)

  // La búsqueda ya se lanza sola mientras se escribe; Enter solo cierra el teclado en móvil.
  function handleSubmit(event) {
    event.preventDefault()
    inputRef.current?.blur()
  }

  function handleClear(event) {
    event.preventDefault()
    onChange('')
    inputRef.current?.focus()
  }

  return (
    <form role="search" onSubmit={handleSubmit} className="relative">
      <label htmlFor="repo-search" className="sr-only">
        Buscar repositorios
      </label>
      <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted" />
      <input
        ref={inputRef}
        id="repo-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Busca por nombre, tema o descripción (ej: react, machine learning)"
        autoComplete="off"
        className="h-14 w-full rounded-xl border border-line bg-surface pr-12 pl-12 text-base shadow-sm transition-[border-color,box-shadow] placeholder:text-muted/70 focus:border-accent focus:ring-4 focus:ring-accent/15 focus:outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Borrar búsqueda"
          className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer rounded-md p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-fg"
        >
          <CloseIcon className="size-4" />
        </button>
      )}
    </form>
  )
}
