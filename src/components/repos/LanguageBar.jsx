import LanguageTag from './LanguageTag'
import { getLanguageColor } from '../../constants/languageColors'
import { useTranslation } from '../../hooks/useTranslation'

const MAX_VISIBLE_LANGUAGES = 6

// Agrupa los lenguajes minoritarios en "Otros" para que la barra sea legible.
function groupSmallLanguages(languages, othersLabel) {
  if (languages.length <= MAX_VISIBLE_LANGUAGES) return languages

  const visible = languages.slice(0, MAX_VISIBLE_LANGUAGES - 1)
  const othersPercentage = languages
    .slice(MAX_VISIBLE_LANGUAGES - 1)
    .reduce((sum, language) => sum + language.percentage, 0)

  return [...visible, { name: othersLabel, percentage: othersPercentage }]
}

function formatPercentage(value) {
  return `${value < 0.1 ? '<0.1' : value.toFixed(1)}%`
}

export default function LanguageBar({ languages }) {
  const { t } = useTranslation()
  const groupedLanguages = groupSmallLanguages(languages, t('repo.otherLanguages'))

  return (
    <div className="flex flex-col gap-3">
      <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
        {groupedLanguages.map((language) => (
          <span
            key={language.name}
            className="h-full origin-left animate-fade-in"
            style={{
              width: `${language.percentage}%`,
              backgroundColor: getLanguageColor(language.name),
            }}
          />
        ))}
      </div>

      <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
        {groupedLanguages.map((language) => (
          <li key={language.name} className="flex items-center gap-1.5">
            <LanguageTag language={language.name} />
            <span className="font-mono text-xs text-muted">{formatPercentage(language.percentage)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
