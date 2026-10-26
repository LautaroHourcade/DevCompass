import { useCallback, useSyncExternalStore } from 'react'
import { getLanguage, setLanguage, subscribe, translate } from '../i18n/store'

/** Uso: const { t } = useTranslation(); t('saved.title') o t('saved.count', { count: 3 }) */
export function useTranslation() {
  const language = useSyncExternalStore(subscribe, getLanguage)

  // t cambia con el idioma: los useCallback/useMemo que lo usan se recalculan solos.
  const t = useCallback((key, vars) => translate(key, vars, language), [language])

  return { t, language, setLanguage }
}

/** Opciones con labelKey (constants/) -> opciones con label traducido, para SelectMenu. */
export function translateOptions(options, t) {
  return options.map((option) => (option.labelKey ? { ...option, label: t(option.labelKey) } : option))
}
