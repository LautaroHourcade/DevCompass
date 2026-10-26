// Opciones de los filtros de búsqueda.
// "value" es lo que entiende la API de GitHub, "label" lo que ve el usuario
// ("labelKey" si el texto se traduce: ver translateOptions en hooks/useTranslation.js).

export const LANGUAGE_OPTIONS = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'swift', label: 'Swift' },
  { value: 'dart', label: 'Dart' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'vue', label: 'Vue' },
  { value: 'shell', label: 'Shell' },
  { value: 'lua', label: 'Lua' },
  { value: 'scala', label: 'Scala' },
]

export const LICENSE_OPTIONS = [
  { value: 'mit', label: 'MIT' },
  { value: 'apache-2.0', label: 'Apache 2.0' },
  { value: 'gpl-3.0', label: 'GPL 3.0' },
  { value: 'gpl-2.0', label: 'GPL 2.0' },
  { value: 'agpl-3.0', label: 'AGPL 3.0' },
  { value: 'lgpl-3.0', label: 'LGPL 3.0' },
  { value: 'bsd-3-clause', label: 'BSD 3-Clause' },
  { value: 'bsd-2-clause', label: 'BSD 2-Clause' },
  { value: 'mpl-2.0', label: 'Mozilla 2.0' },
  { value: 'isc', label: 'ISC' },
  { value: 'unlicense', label: 'Unlicense' },
  { value: 'cc0-1.0', label: 'CC0 1.0' },
]

// Más intuitivo que pedir una fecha exacta: "actualizado en los últimos X días".
export const UPDATED_WITHIN_OPTIONS = [
  { value: '7', labelKey: 'filters.updated.week' },
  { value: '30', labelKey: 'filters.updated.month' },
  { value: '180', labelKey: 'filters.updated.sixMonths' },
  { value: '365', labelKey: 'filters.updated.year' },
]

export const SORT_OPTIONS = [
  { value: 'best-match', labelKey: 'filters.sort.bestMatch' },
  { value: 'stars', labelKey: 'filters.sort.stars' },
  { value: 'forks', labelKey: 'filters.sort.forks' },
  { value: 'updated', labelKey: 'filters.sort.updated' },
]

export const DEFAULT_FILTERS = {
  language: '',
  minStars: '',
  minForks: '',
  updatedWithin: '',
  license: '',
}

export const DEFAULT_SORT = 'stars'

// Si el usuario no escribe nada ni filtra, mostramos repositorios populares.
export const DEFAULT_QUERY = 'stars:>=1000'
