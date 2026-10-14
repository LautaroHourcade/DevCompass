import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader'
import CollectionStats from '../components/dashboard/CollectionStats'
import DashboardCard from '../components/dashboard/DashboardCard'
import LanguageDistribution from '../components/dashboard/LanguageDistribution'
import RecentList from '../components/dashboard/RecentList'
import SummaryCards from '../components/dashboard/SummaryCards'
import EmptyState from '../components/ui/EmptyState'
import ErrorMessage from '../components/ui/ErrorMessage'
import PageLoader from '../components/ui/PageLoader'
import { ArrowRightIcon, CompareIcon, DashboardIcon, SearchIcon } from '../components/ui/Icons'
import { buttonClasses } from '../components/ui/buttonStyles'
import {
  countByStatus,
  getCollectionTotals,
  getLanguageDistribution,
  getRecentlySaved,
  getRecentlyUpdated,
} from '../utils/collectionStats'

const RECENT_LIMIT = 5

const sectionLinkClasses = buttonClasses({ variant: 'ghost', size: 'sm' })

/** Panel: resumen de la colección, lenguajes, estadísticas agregadas y actividad reciente. */
export default function DashboardView({ savedRepos, isLoading, savedLoadError, onReloadSaved, onOpenDetail }) {
  // Todo se calcula en el navegador a partir de la colección ya cargada.
  const summary = useMemo(
    () => ({
      statusCounts: countByStatus(savedRepos),
      languages: getLanguageDistribution(savedRepos),
      totals: getCollectionTotals(savedRepos),
      recentlySaved: getRecentlySaved(savedRepos, RECENT_LIMIT),
      recentlyUpdated: getRecentlyUpdated(savedRepos, RECENT_LIMIT),
    }),
    [savedRepos],
  )

  function renderContent() {
    if (savedLoadError) return <ErrorMessage error={savedLoadError} onRetry={onReloadSaved} />
    if (isLoading && savedRepos.length === 0) return <PageLoader label="Cargando tu colección…" />

    if (savedRepos.length === 0) {
      return (
        <EmptyState
          icon={<DashboardIcon className="size-6" />}
          title="Tu panel está vacío"
          message="Guarda algunos repositorios y aquí verás el resumen de tu colección, sus lenguajes y la actividad reciente."
          action={
            <Link to="/" className={buttonClasses({ variant: 'primary' })}>
              <SearchIcon className="size-4" />
              Explorar repositorios
            </Link>
          }
        />
      )
    }

    return (
      <div className="flex flex-col gap-6">
        <SummaryCards total={savedRepos.length} statusCounts={summary.statusCounts} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <DashboardCard title="Lenguajes" style={{ animationDelay: '80ms' }}>
            <LanguageDistribution languages={summary.languages} />
          </DashboardCard>

          <DashboardCard title="Estadísticas" style={{ animationDelay: '120ms' }}>
            <CollectionStats totals={summary.totals} onOpenDetail={onOpenDetail} />
          </DashboardCard>

          <DashboardCard
            title="Guardados recientemente"
            style={{ animationDelay: '160ms' }}
            action={
              <Link to="/guardados" className={sectionLinkClasses}>
                Ver colección
                <ArrowRightIcon className="size-3.5" />
              </Link>
            }
          >
            <RecentList
              repos={summary.recentlySaved}
              dateKey="savedAt"
              datePrefix="Guardado"
              onOpenDetail={onOpenDetail}
            />
          </DashboardCard>

          <DashboardCard title="Actividad reciente en GitHub" style={{ animationDelay: '200ms' }}>
            <RecentList
              repos={summary.recentlyUpdated}
              dateKey="updatedAt"
              datePrefix="Actualizado en GitHub"
              onOpenDetail={onOpenDetail}
            />
          </DashboardCard>
        </div>
      </div>
    )
  }

  return (
    <section aria-labelledby="dashboard-title" className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Resumen de tu colección"
        title="Tu panel"
        titleId="dashboard-title"
        description="Un vistazo rápido a tu colección y a lo último que ha pasado en ella."
      >
        <nav aria-label="Accesos rápidos" className="flex flex-wrap gap-2">
          <Link to="/guardados" className={buttonClasses()}>
            Ver colección
          </Link>
          <Link to="/comparar" className={buttonClasses({ variant: 'primary' })}>
            <CompareIcon className="size-4" />
            Comparar
          </Link>
        </nav>
      </PageHeader>

      {renderContent()}
    </section>
  )
}
