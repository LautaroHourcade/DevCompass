import { MoonIcon, SunIcon } from '../ui/Icons'
import { buttonClasses } from '../ui/buttonStyles'

export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark'
  const label = isDark ? 'Activar modo claro' : 'Activar modo oscuro'

  function handleClick(event) {
    event.preventDefault()
    onToggle()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      title={label}
      className={buttonClasses({ variant: 'ghost', size: 'icon' })}
    >
      {/* key: fuerza la animación de entrada al cambiar de icono */}
      <span key={theme} className="animate-pop-in">
        {isDark ? <SunIcon className="size-5" /> : <MoonIcon className="size-5" />}
      </span>
    </button>
  )
}
