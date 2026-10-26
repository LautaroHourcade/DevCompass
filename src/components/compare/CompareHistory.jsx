import MultiLineChart from '../stats/MultiLineChart'
import ErrorMessage from '../ui/ErrorMessage'
import FormAlert from '../ui/FormAlert'
import { useTranslation } from '../../hooks/useTranslation'

// Con menos de dos capturas no hay evolución que dibujar.
const MIN_POINTS_FOR_CHART = 2

/**
 * Evolución de las stars de los repositorios comparados, a partir de las capturas de Supabase.
 * Los repositorios sin historial suficiente se indican aparte: su tabla de estadísticas sigue disponible.
 * - items: [{ repo, color, snapshots }]
 * - status / error / onRetry: estado de la carga del historial (useComparisonStats).
 */
export default function CompareHistory({ items, status, error, onRetry }) {
  const { t } = useTranslation()

  return (
    <section
      aria-labelledby="compare-history-title"
      className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-5 shadow-card animate-fade-up"
    >
      <h2 id="compare-history-title" className="font-mono text-2xs tracking-[0.14em] text-muted uppercase">
        {t('compare.history.title')}
      </h2>
      <HistoryContent items={items} status={status} error={error} onRetry={onRetry} />
    </section>
  )
}

function HistoryContent({ items, status, error, onRetry }) {
  const { t } = useTranslation()

  if (status === 'loading') {
    return <p className="h-56 rounded-lg bg-surface-2 animate-shimmer" aria-label={t('history.loading')} />
  }

  if (status === 'error') return <ErrorMessage error={error} onRetry={onRetry} />

  const withHistory = items.filter(({ snapshots }) => snapshots.length >= MIN_POINTS_FOR_CHART)
  const withoutHistory = items.filter(({ snapshots }) => snapshots.length < MIN_POINTS_FOR_CHART)

  return (
    <>
      {withoutHistory.length > 0 && (
        <FormAlert type="info">
          {withHistory.length === 0
            ? t('compare.history.noneWithHistory')
            : t('compare.history.someWithoutHistory', { names: withoutHistory.map(({ repo }) => repo.name).join(', ') })}{' '}
          {t('compare.history.explanation')}
        </FormAlert>
      )}

      {withHistory.length > 0 && (
        <MultiLineChart
          title={t('compare.history.chartTitle')}
          label="Stars"
          series={withHistory.map(({ repo, color, snapshots }) => ({
            id: repo.id,
            label: repo.name,
            color,
            points: snapshots.map((snapshot) => ({ date: snapshot.capturedAt, value: snapshot.stars })),
          }))}
        />
      )}
    </>
  )
}
