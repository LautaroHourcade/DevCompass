import LineChart from './LineChart'
import ErrorMessage from '../ui/ErrorMessage'
import FormAlert from '../ui/FormAlert'
import { ForkIcon, IssueIcon, StarIcon } from '../ui/Icons'
import { useRepositoryStats } from '../../hooks/useRepositoryStats'
import { formatDateTime, formatFullNumber } from '../../utils/formatters'

// Con menos de dos capturas no hay evolución que dibujar.
const MIN_POINTS_FOR_CHART = 2

/**
 * Historial de un repositorio guardado: estadísticas de la última captura y
 * dos gráficos separados (stars y forks) con su evolución.
 */
export default function RepoHistory({ githubId }) {
  const { status, snapshots, error, reload } = useRepositoryStats(githubId)

  return (
    <section aria-labelledby="repo-history-title" className="flex flex-col gap-3">
      <h3 id="repo-history-title" className="font-mono text-sm font-semibold uppercase tracking-wider text-muted">
        Evolución
      </h3>
      <HistoryContent status={status} snapshots={snapshots} error={error} onRetry={reload} />
    </section>
  )
}

function HistoryContent({ status, snapshots, error, onRetry }) {
  if (status === 'loading') {
    return <p className="h-40 rounded-lg bg-surface-2 animate-shimmer" aria-label="Cargando el historial" />
  }

  if (status === 'error') return <ErrorMessage error={error} onRetry={onRetry} />

  if (snapshots.length === 0) {
    return (
      <FormAlert type="info">
        Todavía no hay capturas de este repositorio. DevCompass registra sus estadísticas una vez al día: vuelve
        mañana para ver su evolución.
      </FormAlert>
    )
  }

  const latest = snapshots[snapshots.length - 1]
  const latestStats = [
    { label: 'Stars', value: latest.stars, Icon: StarIcon, iconClass: 'text-star' },
    { label: 'Forks', value: latest.forks, Icon: ForkIcon, iconClass: 'text-purple' },
    { label: 'Issues abiertos', value: latest.openIssues, Icon: IssueIcon, iconClass: 'text-info' },
  ]

  return (
    <>
      <div className="flex flex-col gap-2 rounded-lg border border-line bg-canvas p-3">
        <p className="text-xs text-muted">
          Última captura:{' '}
          <time dateTime={latest.capturedAt} className="font-medium text-fg">
            {formatDateTime(latest.capturedAt)}
          </time>
        </p>
        <dl className="flex flex-wrap gap-x-5 gap-y-1 font-mono text-sm">
          {latestStats.map(({ label, value, Icon, iconClass }) => (
            <div key={label} className="flex items-center gap-1.5">
              <dt className="flex items-center">
                <Icon className={`size-4 ${iconClass}`} />
                <span className="sr-only">{label}</span>
              </dt>
              <dd>{formatFullNumber(value)}</dd>
            </div>
          ))}
        </dl>
      </div>

      {snapshots.length < MIN_POINTS_FOR_CHART ? (
        <FormAlert type="info">
          Aún no hay historial suficiente para dibujar los gráficos: hace falta al menos una captura más.
          DevCompass registra una al día, así que mañana podrás ver cómo evolucionan las stars y los forks.
        </FormAlert>
      ) : (
        <div className="flex flex-col gap-3">
          <LineChart
            title="Stars"
            label="Stars"
            colorClass="text-star"
            points={snapshots.map((snapshot) => ({ date: snapshot.capturedAt, value: snapshot.stars }))}
          />
          <LineChart
            title="Forks"
            label="Forks"
            colorClass="text-purple"
            points={snapshots.map((snapshot) => ({ date: snapshot.capturedAt, value: snapshot.forks }))}
          />
        </div>
      )}
    </>
  )
}
