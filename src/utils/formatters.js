const LOCALE = 'es'

const compactNumberFormatter = new Intl.NumberFormat(LOCALE, {
  notation: 'compact',
  maximumFractionDigits: 1,
})

const fullNumberFormatter = new Intl.NumberFormat(LOCALE)

const dateFormatter = new Intl.DateTimeFormat(LOCALE, { dateStyle: 'medium' })

const timeFormatter = new Intl.DateTimeFormat(LOCALE, { timeStyle: 'short' })

const relativeTimeFormatter = new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' })

// Unidades de mayor a menor, con su duración en segundos.
const TIME_UNITS = [
  { unit: 'year', seconds: 60 * 60 * 24 * 365 },
  { unit: 'month', seconds: 60 * 60 * 24 * 30 },
  { unit: 'week', seconds: 60 * 60 * 24 * 7 },
  { unit: 'day', seconds: 60 * 60 * 24 },
  { unit: 'hour', seconds: 60 * 60 },
  { unit: 'minute', seconds: 60 },
]

/** 15300 -> "15 mil" */
export function formatNumber(value) {
  return compactNumberFormatter.format(value)
}

/** 15300 -> "15.300" */
export function formatFullNumber(value) {
  return fullNumberFormatter.format(value)
}

/** "2024-05-01T10:00:00Z" -> "1 may 2024" */
export function formatDate(isoDate) {
  return dateFormatter.format(new Date(isoDate))
}

/** Date -> "18:30" */
export function formatTime(date) {
  return timeFormatter.format(date)
}

/** "2024-05-01T10:00:00Z" -> "hace 3 días" */
export function formatRelativeDate(isoDate) {
  const elapsedSeconds = (new Date(isoDate).getTime() - Date.now()) / 1000

  for (const { unit, seconds } of TIME_UNITS) {
    if (Math.abs(elapsedSeconds) >= seconds) {
      return relativeTimeFormatter.format(Math.round(elapsedSeconds / seconds), unit)
    }
  }

  return 'hace un momento'
}

/** Devuelve la fecha de hace N días en formato YYYY-MM-DD. */
export function getDateDaysAgo(days) {
  const date = new Date()
  date.setDate(date.getDate() - Number(days))
  return date.toISOString().slice(0, 10)
}
