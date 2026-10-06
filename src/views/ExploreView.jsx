import { useState } from 'react'
import SearchBar from '../components/search/SearchBar'
import FiltersPanel from '../components/search/FiltersPanel'
import RepoGrid from '../components/repos/RepoGrid'
import EmptyState from '../components/ui/EmptyState'
import ErrorMessage from '../components/ui/ErrorMessage'
import { SearchIcon } from '../components/ui/Icons'
import { buttonClasses } from '../components/ui/buttonStyles'
import { useRepositorySearch } from '../hooks/useRepositorySearch'
import { DEFAULT_FILTERS, DEFAULT_SORT } from '../constants/filters'
import { formatFullNumber } from '../utils/formatters'

export default function ExploreView({ isSaved, onToggleSave, onOpenDetail }) {
  const [text, setText] = useState('')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [sort, setSort] = useState(DEFAULT_SORT)

  const { repos, totalCount, hasMore, status, error, loadMore, retry } = useRepositorySearch({
    text,
    filters,
    sort,
  })

  const hasActiveFilters = Object.values(filters).some(Boolean)
  const isSearching = text.trim() !== '' || hasActiveFilters

  function handleFilterChange(name, value) {
    setFilters((current) => ({ ...current, [name]: value }))
  }

  function handleReset() {
    setText('')
    setFilters(DEFAULT_FILTERS)
  }

  function handleLoadMore(event) {
    event.preventDefault()
    loadMore()
  }

  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby="explore-title" className="flex flex-col gap-5">
        <header className="flex flex-col gap-2 animate-fade-up">
          <p className="font-mono text-sm text-accent">
            <span aria-hidden="true">$ </span>explore --github
          </p>
          <h1 id="explore-title" className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Descubre repositorios que merecen tu atención
          </h1>
          <p className="max-w-[64rem] text-base text-muted">
            Busca entre millones de proyectos de GitHub, filtra los que te interesan y guárdalos para
            seguirlos más tarde.
          </p>
        </header>

        <SearchBar value={text} onChange={setText} />

        <FiltersPanel
          filters={filters}
          sort={sort}
          onFilterChange={handleFilterChange}
          onSortChange={setSort}
          onReset={handleReset}
          hasActiveFilters={hasActiveFilters}
        />
      </section>

      <section aria-labelledby="results-title" className="flex flex-col gap-4">
        <header className="flex items-baseline justify-between gap-4">
          <h2 id="results-title" className="font-mono text-lg font-semibold">
            {isSearching ? 'Resultados' : 'Populares en GitHub'}
          </h2>
          <p aria-live="polite" className="text-sm text-muted">
            {getResultsSummary(status, totalCount)}
          </p>
        </header>

        <ResultsContent
          repos={repos}
          status={status}
          error={error}
          retry={retry}
          isSaved={isSaved}
          onToggleSave={onToggleSave}
          onOpenDetail={onOpenDetail}
          onReset={handleReset}
        />

        {hasMore && repos.length > 0 && status !== 'error' && (
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={status === 'loading-more'}
            className={buttonClasses({ className: 'self-center' })}
          >
            {status === 'loading-more' ? 'Cargando…' : 'Cargar más repositorios'}
          </button>
        )}
      </section>
    </div>
  )
}

function ResultsContent({ repos, status, error, retry, isSaved, onToggleSave, onOpenDetail, onReset }) {
  function handleReset(event) {
    event.preventDefault()
    onReset()
  }

  if (status === 'loading') {
    return <RepoGrid isLoading />
  }

  if (status === 'error' && repos.length === 0) {
    return <ErrorMessage error={error} onRetry={retry} />
  }

  if (repos.length === 0) {
    return (
      <EmptyState
        icon={<SearchIcon className="size-6" />}
        title="Sin resultados"
        message="No hemos encontrado repositorios con esos criterios. Prueba con otras palabras o quita algún filtro."
        action={
          <button type="button" onClick={handleReset} className={buttonClasses()}>
            Limpiar búsqueda
          </button>
        }
      />
    )
  }

  return (
    <>
      <RepoGrid repos={repos} isSaved={isSaved} onToggleSave={onToggleSave} onOpenDetail={onOpenDetail} />
      {/* Falló "cargar más": se mantienen los resultados y se ofrece reintentar */}
      {status === 'error' && <ErrorMessage error={error} onRetry={retry} />}
    </>
  )
}

function getResultsSummary(status, totalCount) {
  if (status === 'loading') return 'Buscando…'
  if (status === 'error') return ''
  if (totalCount === 1) return '1 repositorio'
  return `${formatFullNumber(totalCount)} repositorios`
}
