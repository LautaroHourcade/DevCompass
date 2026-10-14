import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDownIcon, LogOutIcon, UserIcon } from '../ui/Icons'
import { getDisplayName, getInitials } from '../../services/authService'

const ITEM_CLASSES =
  'flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 text-sm text-fg transition-colors duration-100 hover:bg-surface-2'

/**
 * Avatar con menú desplegable (Perfil y Cerrar sesión).
 * El menú crece desde la esquina del botón que lo abre; Esc o un clic fuera lo cierran.
 */
export default function UserMenu({ user, onSignOut }) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)
  const triggerRef = useRef(null)
  const menuId = useId()
  const displayName = getDisplayName(user)

  useEffect(() => {
    if (!isOpen) return

    function handlePointerDown(event) {
      if (!containerRef.current?.contains(event.target)) setIsOpen(false)
    }

    function handleKeyDown(event) {
      if (event.key !== 'Escape') return
      setIsOpen(false)
      triggerRef.current?.focus()
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  function handleToggle(event) {
    event.preventDefault()
    setIsOpen((current) => !current)
  }

  function handleSignOut(event) {
    event.preventDefault()
    setIsOpen(false)
    onSignOut()
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-label={`Menú de ${displayName}`}
        className="flex h-9 cursor-pointer items-center gap-1.5 rounded-full py-0.5 pr-2 pl-0.5 text-muted transition-[background-color,color,scale] duration-150 hover:bg-surface-2 hover:text-fg active:scale-[0.97]"
      >
        <span
          aria-hidden="true"
          className="flex size-8 items-center justify-center rounded-full bg-accent-soft font-mono text-xs font-semibold text-accent ring-1 ring-line-strong"
        >
          {getInitials(displayName) || '?'}
        </span>
        <ChevronDownIcon
          className={`size-3.5 transition-transform duration-200 ease-out ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          id={menuId}
          className="absolute top-full right-0 z-40 mt-2 w-[24rem] origin-top-right rounded-xl border border-line-strong bg-raised p-1.5 shadow-pop transition-[opacity,scale] duration-150 ease-out starting:scale-96 starting:opacity-0"
        >
          <p className="flex flex-col border-b border-line px-2.5 pt-1.5 pb-2.5">
            <span className="truncate text-sm font-medium">{displayName}</span>
            <span className="truncate text-xs text-muted">{user.email}</span>
          </p>
          <ul className="flex flex-col pt-1.5">
            <li>
              <Link to="/perfil" onClick={() => setIsOpen(false)} className={ITEM_CLASSES}>
                <UserIcon className="size-4 text-muted" />
                Tu perfil
              </Link>
            </li>
            <li>
              <button type="button" onClick={handleSignOut} className={ITEM_CLASSES}>
                <LogOutIcon className="size-4 text-muted" />
                Cerrar sesión
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}
