import { useEffect, useId, useRef, useState } from 'react'
import { CheckIcon, ChevronDownIcon } from './Icons'

// Si queda menos espacio que esto bajo el botón (y más encima), el menú se abre hacia arriba.
const MIN_SPACE_BELOW_PX = 300
// Tiempo para seguir escribiendo una búsqueda por teclado ("ty" -> TypeScript).
const TYPEAHEAD_RESET_MS = 500

/**
 * Desplegable propio con el estilo de la web (sustituye al <select> nativo, cuyo menú
 * no se puede estilizar y sale en blanco en modo oscuro). Sigue el patrón ARIA de "listbox":
 * - Botón: flechas, Enter o Espacio lo abren.
 * - Menú: flechas, Inicio/Fin, escribir para saltar a una opción, Enter o Espacio para elegir,
 *   Esc para cerrar. Un clic fuera también lo cierra.
 * El menú se posiciona respecto al ancestro "relative" más cercano (el campo que lo envuelve)
 * y crece desde el borde por el que se abre.
 *
 * - options: [{ value, label, dotClass? }]. dotClass: punto de color delante del texto.
 * - labelledBy: id de la etiqueta visible del campo.
 * - triggerClassName: aspecto del botón (cada campo tiene el suyo).
 */
export default function SelectMenu({
  id,
  value,
  options,
  onChange,
  labelledBy,
  triggerClassName = '',
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [opensUp, setOpensUp] = useState(false)
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const listRef = useRef(null)
  const typeahead = useRef({ text: '', timeoutId: null })
  const listboxId = useId()

  const selectedIndex = options.findIndex((option) => option.value === value)
  const selected = options[selectedIndex] ?? options[0]

  // Al abrir, el foco pasa al menú; el clic fuera lo cierra.
  useEffect(() => {
    if (!isOpen) return

    listRef.current?.focus({ preventScroll: true })

    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) setIsOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [isOpen])

  // La opción activa siempre visible dentro del menú (listas largas como los lenguajes).
  useEffect(() => {
    if (!isOpen) return
    document.getElementById(`${listboxId}-${activeIndex}`)?.scrollIntoView({ block: 'nearest' })
  }, [isOpen, activeIndex, listboxId])

  function open() {
    const bounds = triggerRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - bounds.bottom
    setOpensUp(spaceBelow < MIN_SPACE_BELOW_PX && bounds.top > spaceBelow)
    setActiveIndex(Math.max(selectedIndex, 0))
    setIsOpen(true)
  }

  function close({ returnFocus = true } = {}) {
    setIsOpen(false)
    if (returnFocus) triggerRef.current?.focus()
  }

  function choose(index) {
    onChange(options[index].value)
    close()
  }

  function handleTriggerClick(event) {
    event.preventDefault()
    if (isOpen) close()
    else open()
  }

  function handleTriggerKeyDown(event) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      open()
    }
  }

  // Salta a la primera opción que empieza por lo que se ha escrito.
  function jumpToTypedOption(character) {
    const state = typeahead.current
    clearTimeout(state.timeoutId)
    state.text += character.toLowerCase()
    state.timeoutId = setTimeout(() => {
      state.text = ''
    }, TYPEAHEAD_RESET_MS)

    const match = options.findIndex((option) => option.label.toLowerCase().startsWith(state.text))
    if (match !== -1) setActiveIndex(match)
  }

  function handleListKeyDown(event) {
    const lastIndex = options.length - 1
    const moves = {
      ArrowDown: Math.min(activeIndex + 1, lastIndex),
      ArrowUp: Math.max(activeIndex - 1, 0),
      Home: 0,
      End: lastIndex,
    }

    if (event.key in moves) {
      event.preventDefault()
      setActiveIndex(moves[event.key])
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      choose(activeIndex)
    } else if (event.key === 'Escape') {
      event.preventDefault()
      close()
    } else if (event.key === 'Tab') {
      close({ returnFocus: false })
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      jumpToTypedOption(event.key)
    }
  }

  function handleOptionClick(event, index) {
    event.preventDefault()
    choose(index)
  }

  return (
    <div ref={rootRef} className="contents">
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        onClick={handleTriggerClick}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        aria-labelledby={labelledBy ? `${labelledBy} ${id}` : undefined}
        className={`flex min-w-0 cursor-pointer items-center gap-2 text-left focus:outline-none disabled:cursor-wait ${triggerClassName}`}
      >
        {selected?.dotClass && <span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${selected.dotClass}`} />}
        <span className="min-w-0 flex-1 truncate">{selected?.label}</span>
        <ChevronDownIcon
          className={`size-3.5 shrink-0 opacity-70 transition-transform duration-200 ease-out ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          tabIndex={-1}
          aria-labelledby={labelledBy}
          aria-activedescendant={`${listboxId}-${activeIndex}`}
          onKeyDown={handleListKeyDown}
          className={`absolute left-0 z-40 flex max-h-[28rem] w-max min-w-full max-w-[32rem] flex-col overflow-y-auto overscroll-contain rounded-xl border border-line-strong bg-raised p-1.5 [scrollbar-width:thin] shadow-pop transition-[opacity,scale] duration-150 ease-out starting:scale-[0.97] starting:opacity-0 focus:outline-none ${
            opensUp ? 'bottom-full mb-1.5 origin-bottom-left' : 'top-full mt-1.5 origin-top-left'
          }`}
        >
          {options.map((option, index) => {
            const isSelected = index === selectedIndex
            const isActive = index === activeIndex

            return (
              <li
                key={option.value}
                id={`${listboxId}-${index}`}
                role="option"
                aria-selected={isSelected}
                onClick={(event) => handleOptionClick(event, index)}
                onPointerMove={() => setActiveIndex(index)}
                className={`flex h-9 shrink-0 cursor-pointer items-center gap-2.5 rounded-md px-2.5 text-sm ${
                  isActive ? 'bg-surface-2 text-fg' : 'text-muted'
                } ${isSelected ? 'font-medium text-fg' : ''}`}
              >
                {option.dotClass && (
                  <span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${option.dotClass}`} />
                )}
                <span className="flex-1 truncate">{option.label}</span>
                {isSelected && <CheckIcon className="size-3.5 shrink-0 text-accent" strokeWidth={2.5} />}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
