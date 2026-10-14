import { describe, expect, it } from 'vitest'
import {
  UNKNOWN_LANGUAGE,
  countByStatus,
  getCollectionTotals,
  getLanguageDistribution,
  getRecentlySaved,
  getRecentlyUpdated,
} from './collectionStats'

function makeRepo(overrides) {
  return {
    id: 1,
    fullName: 'owner/repo',
    language: 'JavaScript',
    stars: 0,
    forks: 0,
    status: 'to_learn',
    notes: '',
    tagIds: [],
    savedAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

const repos = [
  makeRepo({
    id: 1,
    language: 'TypeScript',
    stars: 100,
    forks: 10,
    status: 'to_learn',
    tagIds: ['a'],
    savedAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z',
  }),
  makeRepo({
    id: 2,
    language: 'TypeScript',
    stars: 300,
    forks: 30,
    status: 'completed',
    notes: 'leer',
    tagIds: ['a', 'b'],
    savedAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-05-01T00:00:00Z',
  }),
  makeRepo({
    id: 3,
    language: null,
    stars: 200,
    forks: 20,
    status: 'in_progress',
    savedAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
  }),
]

describe('countByStatus', () => {
  it('cuenta los repositorios de cada estado, en el orden de STATUS_OPTIONS', () => {
    expect(countByStatus(repos).map(({ value, count }) => [value, count])).toEqual([
      ['to_learn', 1],
      ['in_progress', 1],
      ['completed', 1],
    ])
  })

  it('devuelve ceros con la colección vacía', () => {
    expect(countByStatus([]).every(({ count }) => count === 0)).toBe(true)
  })
})

describe('getLanguageDistribution', () => {
  it('agrupa por lenguaje, ordena de más a menos y calcula el porcentaje', () => {
    expect(getLanguageDistribution(repos)).toEqual([
      { name: 'TypeScript', count: 2, percentage: (2 / 3) * 100 },
      { name: UNKNOWN_LANGUAGE, count: 1, percentage: (1 / 3) * 100 },
    ])
  })

  it('devuelve una lista vacía sin repositorios (sin dividir entre cero)', () => {
    expect(getLanguageDistribution([])).toEqual([])
  })
})

describe('getCollectionTotals', () => {
  it('suma stars y forks, calcula la media y encuentra el más popular', () => {
    const totals = getCollectionTotals(repos)
    expect(totals.totalStars).toBe(600)
    expect(totals.totalForks).toBe(60)
    expect(totals.averageStars).toBe(200)
    expect(totals.mostStarred.id).toBe(2)
    expect(totals.withNotes).toBe(1)
    expect(totals.usedTags).toBe(2)
    expect(totals.languageCount).toBe(1)
  })

  it('no falla con la colección vacía', () => {
    expect(getCollectionTotals([])).toMatchObject({ totalStars: 0, averageStars: 0, mostStarred: null })
  })
})

describe('repositorios recientes', () => {
  it('ordena los guardados del más reciente al más antiguo y respeta el límite', () => {
    expect(getRecentlySaved(repos, 2).map((repo) => repo.id)).toEqual([1, 3])
  })

  it('ordena por última actividad en GitHub', () => {
    expect(getRecentlyUpdated(repos, 3).map((repo) => repo.id)).toEqual([2, 3, 1])
  })

  it('no modifica la lista original', () => {
    const ids = repos.map((repo) => repo.id)
    getRecentlySaved(repos, 3)
    expect(repos.map((repo) => repo.id)).toEqual(ids)
  })
})
