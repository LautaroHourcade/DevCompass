import ThemeToggle from './ThemeToggle'
import { BookmarkIcon, CompassIcon, SearchIcon } from '../ui/Icons'

const NAV_ITEMS = [
  { view: 'explore', label: 'Explorar', Icon: SearchIcon },
  { view: 'saved', label: 'Guardados', Icon: BookmarkIcon },
]

export default function Header({ activeView, onChangeView, savedCount, theme, onToggleTheme }) {
  function handleLogoClick(event) {
    event.preventDefault()
    onChangeView('explore')
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-page items-center justify-between gap-3 px-4 sm:px-6">
        <a href="/" onClick={handleLogoClick} className="flex items-center gap-2 font-mono text-lg font-bold">
          <CompassIcon className="size-7 text-accent" />
          <span className="hidden sm:inline">
            Dev<span className="text-accent">Compass</span>
          </span>
        </a>

        <nav aria-label="Principal">
          <ul className="flex gap-1">
            {NAV_ITEMS.map(({ view, label, Icon }) => {
              const isActive = activeView === view

              function handleClick(event) {
                event.preventDefault()
                onChangeView(view)
              }

              return (
                <li key={view}>
                  <button
                    type="button"
                    onClick={handleClick}
                    aria-current={isActive ? 'page' : undefined}
                    className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors ${
                      isActive ? 'bg-surface-2 text-fg' : 'text-muted hover:bg-surface-2/60 hover:text-fg'
                    }`}
                  >
                    <Icon className={`size-4 ${isActive ? 'text-accent' : ''}`} />
                    {label}
                    {view === 'saved' && savedCount > 0 && (
                      <span className="rounded-full bg-accent-soft px-2 font-mono text-xs text-accent">
                        {savedCount}
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
    </header>
  )
}
