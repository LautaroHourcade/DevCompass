import { useEffect, useRef } from 'react'
import { Link, NavLink } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import LanguageToggle from './LanguageToggle'
import { CloseIcon, LogOutIcon } from '../ui/Icons'
import { buttonClasses } from '../ui/buttonStyles'
import { formatBearing } from '../../constants/navigation'
import { getDisplayName, getInitials } from '../../services/authService'
import { useTranslation } from '../../hooks/useTranslation'

/**
 * Menú de navegación para móvil: una hoja que baja desde arriba (sobre <dialog>, con el foco atrapado).
 * Al elegir una sección se cierra solo.
 */
export default function MobileMenu({ isOpen, onClose, items, user, savedCount, theme, onToggleTheme, onSignOut }) {
  const dialogRef = useRef(null)
  const { t } = useTranslation()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen && !dialog.open) dialog.showModal()
    if (!isOpen && dialog.open) dialog.close()
  }, [isOpen])

  function handleCancel(event) {
    event.preventDefault()
    onClose()
  }

  function handleBackdropClick(event) {
    if (event.target === dialogRef.current) onClose()
  }

  function handleClose(event) {
    event.preventDefault()
    onClose()
  }

  function handleSignOut(event) {
    event.preventDefault()
    onClose()
    onSignOut()
  }

  return (
    <dialog
      ref={dialogRef}
      aria-label={t('header.navigationMenu')}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      className="dc-dialog dc-sheet m-0 mx-auto mt-2 w-[calc(100%-1.6rem)] max-w-[48rem] rounded-2xl border border-line-strong bg-raised p-0 text-fg shadow-pop"
    >
      <div className="flex flex-col gap-2 p-2">
        <header className="flex items-center justify-between py-1 pr-1 pl-3">
          <p className="font-mono text-xs tracking-[0.12em] text-muted uppercase">{t('header.navigation')}</p>
          <button
            type="button"
            onClick={handleClose}
            aria-label={t('header.closeMenu')}
            className={buttonClasses({ variant: 'ghost', size: 'icon' })}
          >
            <CloseIcon className="size-5" />
          </button>
        </header>

        <nav aria-label={t('header.mainNav')}>
          <ul className="flex flex-col">
            {items.map(({ to, labelKey, Icon, bearing }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex h-12 items-center gap-3 rounded-xl px-3 text-base transition-colors duration-100 ${
                      isActive ? 'bg-surface-2 font-medium text-fg [&_svg]:text-accent' : 'text-muted active:bg-surface-2'
                    }`
                  }
                >
                  <Icon className="size-[1.8rem]" />
                  <span className="flex-1">{t(labelKey)}</span>
                  {to === '/guardados' && savedCount > 0 && (
                    <span className="font-mono text-xs text-subtle tabular-nums">{savedCount}</span>
                  )}
                  <span className="font-mono text-2xs text-subtle tabular-nums">{formatBearing(bearing)}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <footer className="flex items-center gap-2 border-t border-line px-1 pt-2">
          {user ? (
            <>
              <Link
                to="/perfil"
                onClick={onClose}
                className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-1.5 active:bg-surface-2"
              >
                <span
                  aria-hidden="true"
                  className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-soft font-mono text-xs font-semibold text-accent"
                >
                  {getInitials(getDisplayName(user)) || '?'}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium">{getDisplayName(user)}</span>
                  <span className="truncate text-xs text-muted">{t('header.viewProfile')}</span>
                </span>
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                aria-label={t('header.signOut')}
                title={t('header.signOut')}
                className={buttonClasses({ variant: 'ghost', size: 'icon' })}
              >
                <LogOutIcon className="size-5" />
              </button>
            </>
          ) : (
            <Link to="/entrar" onClick={onClose} className={buttonClasses({ variant: 'primary', className: 'flex-1' })}>
              {t('header.signIn')}
            </Link>
          )}
          <LanguageToggle />
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </footer>
      </div>
    </dialog>
  )
}
