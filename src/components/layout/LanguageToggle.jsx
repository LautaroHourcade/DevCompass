import { buttonClasses } from '../ui/buttonStyles'
import { useTranslation } from '../../hooks/useTranslation'

// Solo hay dos idiomas: el botón alterna entre ellos y muestra el código del actual.
const NEXT_LANGUAGE = { es: 'en', en: 'es' }

export default function LanguageToggle({ className = '' }) {
  const { t, language, setLanguage } = useTranslation()
  const label = t('header.switchLanguage')

  function handleClick(event) {
    event.preventDefault()
    setLanguage(NEXT_LANGUAGE[language])
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      title={label}
      className={buttonClasses({ variant: 'ghost', size: 'icon', className })}
    >
      {/* key: al cambiar de idioma el código entra con un fundido corto */}
      <span
        key={language}
        aria-hidden="true"
        className="font-mono text-xs font-semibold tracking-[0.06em] uppercase transition-[opacity,translate] duration-200 ease-out starting:translate-y-1 starting:opacity-0"
      >
        {language}
      </span>
    </button>
  )
}
