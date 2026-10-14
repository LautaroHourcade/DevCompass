import { useCallback, useEffect, useRef, useState } from 'react'
import { buildSearchQuery, searchRepositories } from '../services/githubService'
import { useDebouncedValue } from './useDebouncedValue'

const SEARCH_DELAY_MS = 400

const EMPTY_RESULTS = { searchKey: null, repos: [], totalCount: 0, hasMore: false, page: 0, status: 'loading', error: null }

/**
 * Busca repositorios en GitHub a partir del texto, los filtros y el orden.
 * - Espera a que el usuario deje de escribir (debounce).
 * - Cancela la petición anterior si llega una nueva (AbortController).
 * - Permite cargar más resultados de forma incremental.
 *
 * Los resultados guardan la búsqueda a la que pertenecen (searchKey): si no coincide con la
 * búsqueda actual es que la nueva todavía está cargando. Así no hace falta reiniciar el estado
 * dentro del efecto.
 *
 * status: 'loading' | 'loading-more' | 'success' | 'error'
 */
export function useRepositorySearch({ text, filters, sort }) {
  const query = useDebouncedValue(buildSearchQuery(text, filters), SEARCH_DELAY_MS)
  // Reintentar la primera página vuelve a lanzar el efecto aunque la búsqueda no cambie.
  const [retryCount, setRetryCount] = useState(0)
  const searchKey = `${query}|${sort}|${retryCount}`

  const [results, setResults] = useState(EMPTY_RESULTS)
  const controllerRef = useRef(null)

  // Cancela la petición en curso y devuelve una señal para la nueva.
  const startRequest = useCallback(() => {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    return controller.signal
  }, [])

  // Primera página de cada búsqueda.
  useEffect(() => {
    const signal = startRequest()

    searchRepositories({ query, sort, page: 1, signal })
      .then((result) => {
        setResults({
          searchKey,
          repos: result.items,
          totalCount: result.totalCount,
          hasMore: result.hasMore,
          page: 1,
          status: 'success',
          error: null,
        })
      })
      .catch((error) => {
        if (error.name === 'AbortError') return
        setResults({ ...EMPTY_RESULTS, searchKey, status: 'error', error })
      })

    return () => controllerRef.current?.abort()
  }, [query, sort, searchKey, startRequest])

  const isCurrent = results.searchKey === searchKey
  const current = isCurrent ? results : EMPTY_RESULTS

  // Página siguiente de la búsqueda actual (desde un botón, no desde un efecto).
  const loadMore = useCallback(async () => {
    const nextPage = results.page + 1
    const signal = startRequest()
    setResults((previous) => ({ ...previous, status: 'loading-more', error: null }))

    try {
      const result = await searchRepositories({ query, sort, page: nextPage, signal })
      setResults((previous) => ({
        ...previous,
        repos: mergeWithoutDuplicates(previous.repos, result.items),
        totalCount: result.totalCount,
        hasMore: result.hasMore,
        page: nextPage,
        status: 'success',
      }))
    } catch (error) {
      if (error.name === 'AbortError') return
      // Falló "cargar más": se conservan los resultados ya cargados.
      setResults((previous) => ({ ...previous, status: 'error', error }))
    }
  }, [query, sort, results.page, startRequest])

  // Si falló la primera página se reintenta desde el principio; si falló
  // "cargar más", se reintenta solo la página siguiente.
  const retry = useCallback(() => {
    if (current.repos.length > 0) loadMore()
    else setRetryCount((count) => count + 1)
  }, [current.repos.length, loadMore])

  return {
    repos: current.repos,
    totalCount: current.totalCount,
    hasMore: current.hasMore,
    status: current.status,
    error: current.error,
    loadMore,
    retry,
  }
}

// GitHub puede repetir algún repositorio entre páginas si el ranking cambia.
function mergeWithoutDuplicates(currentRepos, newRepos) {
  const knownIds = new Set(currentRepos.map((repo) => repo.id))
  return [...currentRepos, ...newRepos.filter((repo) => !knownIds.has(repo.id))]
}
