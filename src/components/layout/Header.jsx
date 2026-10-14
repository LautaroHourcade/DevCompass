import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import MobileMenu from './MobileMenu'
import NavTabs from './NavTabs'
import ThemeToggle from './ThemeToggle'
import UserMenu from './UserMenu'
import { CompassMark, MenuIcon } from '../ui/Icons'
import { buttonClasses } from '../ui/buttonStyles'
import { NAV_ITEMS, getSectionForPath } from '../../constants/navigation'
import { useShortestRotation } from '../../hooks/useShortestRotation'

export default function Header({ user, savedCount, theme, onToggleTheme, onSignOut }) {
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const visibleItems = NAV_ITEMS.filter((item) => !item.requiresAuth || user)
  const section = getSectionForPath(location.pathname)
  // La aguja de la marca apunta al rumbo de la sección actual.
  const needleRotation = useShortestRotation(section?.bearing ?? 0)

  function handleOpenMenu(event) {
    event.preventDefault()
    setIsMenuOpen(true)
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/80 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-14 max-w-page items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2.5 rounded-lg">
          <CompassMark bearing={needleRotation} className="size-8 text-fg" />
          <span className="text-[1.6rem] font-semibold tracking-[-0.02em]">DevCompass</span>
          <span className="sr-only">, ir a Explorar</span>
        </Link>

        {/* Móvil: el nombre de la sección actual junto a la marca */}
        {section && (
          <p className="flex min-w-0 items-center gap-2 text-sm text-muted lg:hidden">
            <span aria-hidden="true" className="text-line-strong">
              /
            </span>
            <span className="truncate">{section.label}</span>
          </p>
        )}

        <div className="hidden flex-1 justify-center lg:flex">
          <NavTabs items={visibleItems} activeTo={section?.to ?? null} savedCount={savedCount} />
        </div>

        <div className="ml-auto flex items-center gap-1 lg:ml-0">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} className="hidden lg:inline-flex" />
          {user ? (
            <div className="hidden lg:block">
              <UserMenu user={user} onSignOut={onSignOut} />
            </div>
          ) : (
            <Link to="/entrar" className={buttonClasses({ variant: 'primary', size: 'sm', className: 'hidden lg:inline-flex' })}>
              Entrar
            </Link>
          )}
          <button
            type="button"
            onClick={handleOpenMenu}
            aria-label="Abrir menú"
            aria-expanded={isMenuOpen}
            className={buttonClasses({ variant: 'ghost', size: 'icon', className: 'lg:hidden' })}
          >
            <MenuIcon className="size-5" />
          </button>
        </div>
      </div>

      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        items={visibleItems}
        user={user}
        savedCount={savedCount}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onSignOut={onSignOut}
      />
    </header>
  )
}
