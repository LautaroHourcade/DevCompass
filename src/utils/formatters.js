// Formatos de números y fechas en el idioma de la interfaz (es / en).
import { getLocale, translate } from '../i18n/store'

// Licencia sin identificador SPDX. Es un valor interno (también se guarda así en la base de datos):
// la interfaz lo traduce con formatLicense.
export const OTHER_LICENSE = 'Otra'

// Crear un Intl.*Format es caro: se guarda uno por idioma y tipo de formato.
const formatterCache = new Map()

function getFormatter(name, create) {
  const key = `${getLocale()}|${name}`
  if (!formatterCache.has(key)) formatterCache.set(key, create(getLocale()))
  return formatterCache.get(key)
}

const compactNumberFormatter = () =>
  getFormatter('compact', (locale) => new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }))
const fullNumberFormatter = () => getFormatter('number', (locale) => new Intl.NumberFormat(locale))
const dateFormatter = () => getFormatter('date', (locale) => new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }))
const timeFormatter = () => getFormatter('time', (locale) => new Intl.DateTimeFormat(locale, { timeStyle: 'short' }))
const dateTimeFormatter = () =>
  getFormatter('dateTime', (locale) => new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }))
const relativeTimeFormatter = () =>
  getFormatter('relative', (locale) => new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }))

// Unidades de mayor a menor, con su duración en segundos.
const TIME_UNITS = [
  { unit: 'year', seconds: 60 * 60 * 24 * 365 },
  { unit: 'month', seconds: 60 * 60 * 24 * 30 },
  { unit: 'week', seconds: 60 * 60 * 24 * 7 },
  { unit: 'day', seconds: 60 * 60 * 24 },
  { unit: 'hour', seconds: 60 * 60 },
  { unit: 'minute', seconds: 60 },
]

/** 15300 -> "15 mil" / "15.3K" */
export function formatNumber(value) {
  return compactNumberFormatter().format(value)
}

/** 15300 -> "15.300" / "15,300" */
export function formatFullNumber(value) {
  return fullNumberFormatter().format(value)
}

/** "2024-05-01T10:00:00Z" -> "1 may 2024" / "May 1, 2024" */
export function formatDate(isoDate) {
  return dateFormatter().format(new Date(isoDate))
}

/** "2024-05-01T10:00:00Z" -> "1 may 2024, 12:00" (hora local) */
export function formatDateTime(isoDate) {
  return dateTimeFormatter().format(new Date(isoDate))
}

/** Date -> "18:30" / "6:30 PM" */
export function formatTime(date) {
  return timeFormatter().format(date)
}

/** "2024-05-01T10:00:00Z" -> "hace 3 días" / "3 days ago" */
export function formatRelativeDate(isoDate) {
  const elapsedSeconds = (new Date(isoDate).getTime() - Date.now()) / 1000

  for (const { unit, seconds } of TIME_UNITS) {
    if (Math.abs(elapsedSeconds) >= seconds) {
      return relativeTimeFormatter().format(Math.round(elapsedSeconds / seconds), unit)
    }
  }

  return translate('dates.justNow')
}

/** Licencia para mostrar: null -> "Sin licencia", "Otra" -> "Otra" / "Other", "MIT" -> "MIT". */
export function formatLicense(license) {
  if (!license) return translate('repo.noLicense')
  if (license === OTHER_LICENSE) return translate('repo.otherLicense')
  return license
}

/** Devuelve la fecha de hace N días en formato YYYY-MM-DD. */
export function getDateDaysAgo(days) {
  const date = new Date()
  date.setDate(date.getDate() - Number(days))
  return date.toISOString().slice(0, 10)
}
