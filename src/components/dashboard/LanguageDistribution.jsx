import LanguageTag from '../repos/LanguageTag'
import { getLanguageColor } from '../../constants/languageColors'
import { UNKNOWN_LANGUAGE } from '../../utils/collectionStats'
import { useTranslation } from '../../hooks/useTranslation'

const MAX_VISIBLE_LANGUAGES = 6

/**
 * Distribución de la colección por lenguaje principal: una barra por lenguaje con su número de repositorios.
 * languages: resultado de getLanguageDistribution (ordenado de más a menos).
 */
export default function LanguageDistribution({ languages }) {
  const { t } = useTranslation()

  if (languages.length === 0) {
    return <p className="text-sm text-muted">{t('dashboard.noLanguages')}</p>
  }

  const visible = languages.slice(0, MAX_VISIBLE_LANGUAGES)
  const hiddenCount = languages.length - visible.length

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-3">
        {visible.map((language) => (
          <li key={language.name} className="flex flex-col gap-1.5 text-sm">
            <span className="flex items-center justify-between gap-3">
              <LanguageTag language={language.name === UNKNOWN_LANGUAGE ? t('dashboard.unknownLanguage') : language.name} />
              <span className="font-mono text-xs text-muted tabular-nums">
                {t('dashboard.repoCount', { count: language.count })} · {Math.round(language.percentage)}%
              </span>
            </span>
            <span aria-hidden="true" className="block h-1.5 overflow-hidden rounded-full bg-surface-2">
              <span
                className="block h-full origin-left rounded-full animate-grow-x motion-reduce:animate-none"
                style={{ width: `${language.percentage}%`, backgroundColor: getLanguageColor(language.name) }}
              />
            </span>
          </li>
        ))}
      </ul>
      {hiddenCount > 0 && (
        <p className="text-xs text-muted">
          {t('dashboard.moreLanguages', { count: hiddenCount })}
        </p>
      )}
    </div>
  )
}
