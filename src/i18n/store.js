// Idioma de la interfaz. Vive fuera de React para que también lo usen los services
// (mensajes de error) y los formatos de fecha y número. Los componentes lo leen con useTranslation.
import es from './translations/es'
import en from './translations/en'

const STORAGE_KEY = 'devcompass-language'
const DEFAULT_LANGUAGE = 'es'

export const LANGUAGES = {
  es: { label: 'Español', translations: es },
  en: { label: 'English', translations: en },
}

const listeners = new Set()

/** Idioma guardado; si no hay, el del navegador (español si empieza por "es", si no inglés). */
function getInitialLanguage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (LANGUAGES[stored]) return stored
  } catch {
    // Sin almacenamiento disponible se usa el idioma del navegador.
  }
  return navigator.language?.toLowerCase().startsWith('es') ? 'es' : 'en'
}

let currentLanguage = getInitialLanguage()
applyToDocument(currentLanguage)

/** <html lang> y la descripción de la página siguen al idioma elegido. */
function applyToDocument(language) {
  document.documentElement.lang = language
  document.querySelector('meta[name="description"]')?.setAttribute('content', translate('meta.description', {}, language))
}

export function getLanguage() {
  return currentLanguage
}

/** Locale para Intl (fechas, números, ordenación). */
export function getLocale() {
  return currentLanguage
}

export function setLanguage(language) {
  if (!LANGUAGES[language] || language === currentLanguage) return

  currentLanguage = language
  applyToDocument(language)

  try {
    localStorage.setItem(STORAGE_KEY, language)
  } catch {
    // Sin almacenamiento el idioma funciona igual durante la sesión.
  }

  listeners.forEach((listener) => listener())
}

/** Para useSyncExternalStore: avisa cuando cambia el idioma. */
export function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function lookup(translations, key) {
  return key.split('.').reduce((node, part) => node?.[part], translations)
}

/**
 * Texto de una clave ("saved.title"). vars sustituye {nombre}; si vars.count es un número
 * se elige la forma plural (clave_one / clave_other). Si falta en el idioma, se usa el español;
 * si tampoco existe, se devuelve la clave para que se note en desarrollo.
 */
export function translate(key, vars = {}, language = currentLanguage) {
  const candidates = [language, DEFAULT_LANGUAGE]
  let text

  for (const candidate of candidates) {
    const translations = LANGUAGES[candidate].translations
    if (typeof vars.count === 'number') {
      const pluralForm = new Intl.PluralRules(candidate).select(vars.count)
      text = lookup(translations, `${key}_${pluralForm}`) ?? lookup(translations, `${key}_other`)
    }
    text ??= lookup(translations, key)
    if (typeof text === 'string') break
  }

  if (typeof text !== 'string') return key

  return text.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? String(vars[name]) : match))
}
