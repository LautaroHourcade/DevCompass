import { Link, useSearchParams } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader'
import CompareHistory from '../components/compare/CompareHistory'
import ComparePicker from '../components/compare/ComparePicker'
import CompareTable from '../components/compare/CompareTable'
import EmptyState from '../components/ui/EmptyState'
import ErrorMessage from '../components/ui/ErrorMessage'
import FormAlert from '../components/ui/FormAlert'
import PageLoader from '../components/ui/PageLoader'
import { CompareIcon, SearchIcon } from '../components/ui/Icons'
import { buttonClasses } from '../components/ui/buttonStyles'
import { useComparisonStats } from '../hooks/useComparisonStats'
import { useTranslation } from '../hooks/useTranslation'

const MIN_SELECTED = 2
const MAX_SELECTED = 3

// Un color por posición en la comparación: se usa en la tabla y en el gráfico.
const SERIES_COLORS = ['var(--color-accent)', 'var(--color-purple)', 'var(--color-info)']

// La selección vive en la URL (?repos=1,2,3): se conserva al recargar y se puede compartir.
function parseSelectedIds(searchParams) {
  const ids = (searchParams.get('repos') ?? '')
    .split(',')
    .map(Number)
    .filter((id) => Number.isInteger(id) && id > 0)
  return [...new Set(ids)].slice(0, MAX_SELECTED)
}

/** Comparar de dos a tres repositorios de la colección: estadísticas actuales y evolución de las stars. */
export default function CompareView({ savedRepos, isLoading, savedLoadError, onReloadSaved, onOpenDetail }) {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()

  // Solo cuentan los ids que siguen en la colección (un repo quitado de guardados sale de la comparación).
  const selectedRepos = parseSelectedIds(searchParams)
    .map((id) => savedRepos.find((repo) => repo.id === id))
    .filter(Boolean)
  const selectedIds = selectedRepos.map((repo) => repo.id)

  const stats = useComparisonStats(selectedIds)

  function updateSelection(ids) {
    setSearchParams(ids.length > 0 ? { repos: ids.join(',') } : {}, { replace: true })
  }

  function handleToggle(repo) {
    if (selectedIds.includes(repo.id)) {
      updateSelection(selectedIds.filter((id) => id !== repo.id))
    } else if (selectedIds.length < MAX_SELECTED) {
      updateSelection([...selectedIds, repo.id])
    }
  }

  function handleRemove(repo) {
    updateSelection(selectedIds.filter((id) => id !== repo.id))
  }

  function renderComparison() {
    if (selectedRepos.length < MIN_SELECTED) {
      return (
        <FormAlert type="info">
          {selectedRepos.length === 0
            ? t('compare.pickTwoOrThree')
            : t('compare.pickOneMore')}
        </FormAlert>
      )
    }

    const items = selectedRepos.map((repo, index) => {
      const snapshots = stats.statsByRepo.get(repo.id) ?? []
      return {
        repo,
        color: SERIES_COLORS[index],
        snapshots,
        latestSnapshot: snapshots[snapshots.length - 1] ?? null,
      }
    })

    return (
      <>
        <CompareTable items={items} onRemove={handleRemove} onOpenDetail={onOpenDetail} />
        <CompareHistory items={items} status={stats.status} error={stats.error} onRetry={stats.reload} />
      </>
    )
  }

  function renderContent() {
    if (savedLoadError) return <ErrorMessage error={savedLoadError} onRetry={onReloadSaved} />
    if (isLoading && savedRepos.length === 0) return <PageLoader label={t('saved.loading')} />

    if (savedRepos.length < MIN_SELECTED) {
      return (
        <EmptyState
          icon={<CompareIcon className="size-6" />}
          title={t('compare.empty.title')}
          message={t('compare.empty.message')}
          action={
            <Link to="/" className={buttonClasses({ variant: 'primary' })}>
              <SearchIcon className="size-4" />
              {t('saved.empty.action')}
            </Link>
          }
        />
      )
    }

    return (
      <>
        <ComparePicker
          repos={savedRepos}
          selectedIds={selectedIds}
          maxSelected={MAX_SELECTED}
          onToggle={handleToggle}
        />
        {renderComparison()}
      </>
    )
  }

  return (
    <section aria-labelledby="compare-title" className="flex flex-col gap-6">
      <PageHeader
        eyebrow={t('compare.eyebrow')}
        title={t('compare.title')}
        titleId="compare-title"
        description={t('compare.description')}
      />

      {renderContent()}
    </section>
  )
}
