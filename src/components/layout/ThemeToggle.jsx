import { MoonIcon, SunIcon } from '../ui/Icons'
import { buttonClasses } from '../ui/buttonStyles'

// Los dos iconos están siempre montados y se cruzan con desenfoque: parece un solo icono que se transforma.
const ICON_BASE = 'absolute inset-0 m-auto size-[1.8rem] transition-[opacity,scale,filter] duration-200 ease-out'
const ICON_VISIBLE = 'opacity-100 scale-100 blur-none'
const ICON_HIDDEN = 'opacity-0 scale-75 blur-[2px]'

export default function ThemeToggle({ theme, onToggle, className = '' }) {
  const isDark = theme === 'dark'
  const label = isDark ? 'Activar modo claro' : 'Activar modo oscuro'

  function handleClick(event) {
    event.preventDefault()
    // El nuevo tema se abre en círculo desde el centro del botón.
    const bounds = event.currentTarget.getBoundingClientRect()
    onToggle({ x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      title={label}
      className={buttonClasses({ variant: 'ghost', size: 'icon', className: `relative ${className}` })}
    >
      <SunIcon className={`${ICON_BASE} ${isDark ? ICON_VISIBLE : ICON_HIDDEN}`} />
      <MoonIcon className={`${ICON_BASE} ${isDark ? ICON_HIDDEN : ICON_VISIBLE}`} />
    </button>
  )
}
