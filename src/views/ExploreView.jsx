import { useState } from 'react'
import SearchBar from '../components/search/SearchBar'
import FiltersPanel from '../components/search/FiltersPanel'
import { SelectField } from '../components/search/FilterField'
import RepoGrid from '../components/repos/RepoGrid'
import EmptyState from '../components/ui/EmptyState'
import ErrorMessage from '../components/ui/ErrorMessage'
import { SearchIcon } from '../components/ui/Icons'
import { buttonClasses } from '../components/ui/buttonStyles'
import { useRepositorySearch } from '../hooks/useRepositorySearch'
import { DEFAULT_FILTERS, DEFAULT_SORT, SORT_OPTIONS } from '../constants/filters'
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
    <div className="flex flex-col gap-10">
      <section aria-labelledby="explore-title" className="relative isolate z-20 flex flex-col gap-6">
        {/* Retícula de puntos tras el titular: el "papel milimetrado" de la brújula */}
        <div aria-hidden="true" className="dot-grid pointer-events-none absolute -inset-x-6 -top-12 bottom-0 -z-10" />

        <header className="flex flex-col gap-4 pt-2 sm:pt-6">
          <p className="flex items-center gap-3 font-mono text-2xs tracking-[0.14em] text-muted uppercase animate-fade-up">
            <span className="text-accent">000°</span>
            <span>Explorar GitHub</span>
            <span aria-hidden="true" className="ruler max-w-[24rem] min-w-[4rem] flex-1" />
          </p>
          <h1
            id="explore-title"
            style={{ animationDelay: '40ms' }}
            className="max-w-[80rem] text-4xl leading-[1.05] font-semibold tracking-[-0.04em] animate-fade-up sm:text-5xl"
          >
            Encuentra el próximo repositorio <span className="text-muted">que vale la pena seguir.</span>
          </h1>
          <p style={{ animationDelay: '80ms' }} className="max-w-[56rem] text-base text-muted animate-fade-up sm:text-lg">
            Busca entre millones de proyectos, filtra lo que te interesa y guárdalo para seguir su evolución día a día.
          </p>
        </header>

        <div style={{ animationDelay: '120ms' }} className="flex flex-col gap-3 animate-fade-up">
          <SearchBar value={text} onChange={setText} />
          <FiltersPanel filters={filters} onFilterChange={handleFilterChange} onReset={handleReset} />
        </div>
      </section>

      <section aria-labelledby="results-title" className="flex flex-col gap-4">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
          <div className="flex items-baseline gap-3">
            <h2 id="results-title" className="text-lg font-semibold tracking-[-0.02em]">
              {isSearching ? 'Resultados' : 'Populares en GitHub'}
            </h2>
            <p aria-live="polite" className="font-mono text-xs text-muted tabular-nums">
              {getResultsSummary(status, totalCount)}
            </p>
          </div>
          <SelectField
            id="filter-sort"
            label="Ordenar"
            value={sort}
            options={SORT_OPTIONS}
            onChange={setSort}
            className="w-full min-[480px]:w-[26rem]"
          />
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
            className={buttonClasses({ className: 'mt-2 self-center' })}
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
