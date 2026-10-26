import { useEffect, useRef } from 'react'
import { CloseIcon, SearchIcon } from '../ui/Icons'
import { useTranslation } from '../../hooks/useTranslation'

// Elementos donde "/" se escribe con normalidad en lugar de saltar al buscador.
const EDITABLE_TAGS = ['INPUT', 'TEXTAREA', 'SELECT']

/** Buscador principal con aspecto de barra de comandos. Atajo: "/" lo enfoca desde cualquier parte. */
export default function SearchBar({ value, onChange }) {
  const inputRef = useRef(null)
  const { t } = useTranslation()

  useEffect(() => {
    function handleKeyDown(event) {
      const target = event.target
      const isTyping = EDITABLE_TAGS.includes(target.tagName) || target.isContentEditable
      const isDialogOpen = Boolean(document.querySelector('dialog[open]'))
      // El buscador puede estar oculto (otra pantalla): entonces no tiene tamaño.
      const isVisible = inputRef.current?.offsetParent !== null

      if (event.key !== '/' || isTyping || isDialogOpen || !isVisible || event.metaKey || event.ctrlKey) return
      event.preventDefault()
      inputRef.current.focus()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

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
    <form role="search" onSubmit={handleSubmit} className="group relative">
      <label htmlFor="repo-search" className="sr-only">
        {t('explore.search.label')}
      </label>
      <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted transition-colors duration-150 group-focus-within:text-accent" />
      <input
        ref={inputRef}
        id="repo-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t('explore.search.placeholder')}
        autoComplete="off"
        spellCheck="false"
        className="h-14 w-full rounded-xl border border-line-strong bg-surface pr-14 pl-12 text-base text-fg shadow-card transition-[border-color,box-shadow] duration-150 ease-out placeholder:text-subtle hover:border-[color-mix(in_oklab,var(--color-fg),transparent_70%)] focus:border-accent focus:ring-4 focus:ring-accent-soft focus:outline-none"
      />
      {value ? (
        <button
          type="button"
          onClick={handleClear}
          aria-label={t('explore.search.clear')}
          className="absolute top-1/2 right-3 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-muted transition-[background-color,color,scale] duration-150 hover:bg-surface-2 hover:text-fg active:scale-[0.94]"
        >
          <CloseIcon className="size-4" />
        </button>
      ) : (
        <kbd
          aria-hidden="true"
          title={t('explore.search.shortcut')}
          className="kbd pointer-events-none absolute top-1/2 right-4 hidden -translate-y-1/2 sm:inline-flex"
        >
          /
        </kbd>
      )}
    </form>
  )
}
