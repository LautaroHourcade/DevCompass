import { Link, NavLink } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import { BookmarkIcon, CompassIcon, ListIcon, LogOutIcon, SearchIcon, TagIcon, UserIcon } from '../ui/Icons'
import { buttonClasses } from '../ui/buttonStyles'
import { getDisplayName } from '../../services/authService'

// requiresAuth: solo se muestra con sesión iniciada.
const NAV_ITEMS = [
  { to: '/', label: 'Explorar', Icon: SearchIcon, requiresAuth: false },
  { to: '/guardados', label: 'Guardados', Icon: BookmarkIcon, requiresAuth: true },
  { to: '/listas', label: 'Listas', Icon: ListIcon, requiresAuth: true },
  { to: '/etiquetas', label: 'Etiquetas', Icon: TagIcon, requiresAuth: true },
]

function navLinkClasses({ isActive }) {
  return `inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors ${
    isActive ? 'bg-surface-2 text-fg [&>svg]:text-accent' : 'text-muted hover:bg-surface-2/60 hover:text-fg'
  }`
}

export default function Header({ user, savedCount, theme, onToggleTheme, onSignOut }) {
  const visibleItems = NAV_ITEMS.filter((item) => !item.requiresAuth || user)

  function handleSignOut(event) {
    event.preventDefault()
    onSignOut()
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-page items-center justify-between gap-2 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-mono text-lg font-bold">
          <CompassIcon className="size-7 text-accent" />
          <span className="hidden lg:inline">
            Dev<span className="text-accent">Compass</span>
          </span>
          <span className="sr-only lg:hidden">DevCompass, ir a Explorar</span>
        </Link>

        <nav aria-label="Principal" className="min-w-0">
          <ul className="flex gap-1">
            {visibleItems.map(({ to, label, Icon }) => (
              <li key={to}>
                <NavLink to={to} end={to === '/'} className={navLinkClasses} title={label}>
                  <Icon className="size-4" />
                  {/* En móvil solo se ve el icono; el texto sigue disponible para lectores de pantalla */}
                  <span className="sr-only sm:not-sr-only">{label}</span>
                  {to === '/guardados' && savedCount > 0 && (
                    <span className="rounded-full bg-accent-soft px-2 font-mono text-xs text-accent">
                      {savedCount}
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          {user ? (
            <>
              <NavLink to="/perfil" className={navLinkClasses} title="Tu perfil">
                <UserIcon className="size-4" />
                <span className="sr-only md:not-sr-only md:max-w-[16rem] md:truncate">{getDisplayName(user)}</span>
              </NavLink>
              <button
                type="button"
                onClick={handleSignOut}
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
                className={buttonClasses({ variant: 'ghost', size: 'icon' })}
              >
                <LogOutIcon className="size-5" />
              </button>
            </>
          ) : (
            <Link to="/entrar" className={buttonClasses({ variant: 'primary', size: 'sm' })}>
              Entrar
            </Link>
          )}
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </div>
    </header>
  )
}
