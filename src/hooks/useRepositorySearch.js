import { useCallback, useEffect, useRef, useState } from 'react'
import { buildSearchQuery, searchRepositories } from '../services/githubService'
import { useDebouncedValue } from './useDebouncedValue'

const SEARCH_DELAY_MS = 400

/**
 * Busca repositorios en GitHub a partir del texto, los filtros y el orden.
 * - Espera a que el usuario deje de escribir (debounce).
 * - Cancela la petición anterior si llega una nueva (AbortController).
 * - Permite cargar más resultados de forma incremental.
 *
 * status: 'loading' | 'loading-more' | 'success' | 'error'
 */
export function useRepositorySearch({ text, filters, sort }) {
  const [repos, setRepos] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)
  const controllerRef = useRef(null)

  const query = useDebouncedValue(buildSearchQuery(text, filters), SEARCH_DELAY_MS)

  const fetchPage = useCallback(
    async (pageToLoad) => {
      controllerRef.current?.abort()
      const controller = new AbortController()
      controllerRef.current = controller

      setStatus(pageToLoad === 1 ? 'loading' : 'loading-more')
      setError(null)

      try {
        const result = await searchRepositories({
          query,
          sort,
          page: pageToLoad,
          signal: controller.signal,
        })

        setRepos((previous) =>
          pageToLoad === 1 ? result.items : mergeWithoutDuplicates(previous, result.items),
        )
        setTotalCount(result.totalCount)
        setHasMore(result.hasMore)
        setPage(pageToLoad)
        setStatus('success')
      } catch (requestError) {
        if (requestError.name === 'AbortError') return
        setError(requestError)
        setStatus('error')
      }
    },
    [query, sort],
  )

  useEffect(() => {
    fetchPage(1)
    return () => controllerRef.current?.abort()
  }, [fetchPage])

  const loadMore = useCallback(() => fetchPage(page + 1), [fetchPage, page])

  // Si falló la primera página se reintenta desde el principio; si falló
  // "cargar más", se reintenta solo la página siguiente.
  const retry = useCallback(
    () => fetchPage(repos.length > 0 ? page + 1 : 1),
    [fetchPage, page, repos.length],
  )

  return { repos, totalCount, hasMore, status, error, loadMore, retry }
}

// GitHub puede repetir algún repositorio entre páginas si el ranking cambia.
function mergeWithoutDuplicates(currentRepos, newRepos) {
  const knownIds = new Set(currentRepos.map((repo) => repo.id))
  return [...currentRepos, ...newRepos.filter((repo) => !knownIds.has(repo.id))]
}
