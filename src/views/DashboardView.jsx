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
import { useTranslation } from '../hooks/useTranslation'

const RECENT_LIMIT = 5

const sectionLinkClasses = buttonClasses({ variant: 'ghost', size: 'sm' })

/** Panel: resumen de la colección, lenguajes, estadísticas agregadas y actividad reciente. */
export default function DashboardView({ savedRepos, isLoading, savedLoadError, onReloadSaved, onOpenDetail }) {
  const { t } = useTranslation()

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
    if (isLoading && savedRepos.length === 0) return <PageLoader label={t('saved.loading')} />

    if (savedRepos.length === 0) {
      return (
        <EmptyState
          icon={<DashboardIcon className="size-6" />}
          title={t('dashboard.empty.title')}
          message={t('dashboard.empty.message')}
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
      <div className="flex flex-col gap-6">
        <SummaryCards total={savedRepos.length} statusCounts={summary.statusCounts} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <DashboardCard title={t('repo.languages')} style={{ animationDelay: '80ms' }}>
            <LanguageDistribution languages={summary.languages} />
          </DashboardCard>

          <DashboardCard title={t('dashboard.stats')} style={{ animationDelay: '120ms' }}>
            <CollectionStats totals={summary.totals} onOpenDetail={onOpenDetail} />
          </DashboardCard>

          <DashboardCard
            title={t('dashboard.recentlySaved')}
            style={{ animationDelay: '160ms' }}
            action={
              <Link to="/guardados" className={sectionLinkClasses}>
                {t('dashboard.viewCollection')}
                <ArrowRightIcon className="size-3.5" />
              </Link>
            }
          >
            <RecentList
              repos={summary.recentlySaved}
              dateKey="savedAt"
              datePrefix={t('repo.saved')}
              onOpenDetail={onOpenDetail}
            />
          </DashboardCard>

          <DashboardCard title={t('dashboard.recentActivity')} style={{ animationDelay: '200ms' }}>
            <RecentList
              repos={summary.recentlyUpdated}
              dateKey="updatedAt"
              datePrefix={t('dashboard.updatedOnGitHub')}
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
        eyebrow={t('dashboard.eyebrow')}
        title={t('dashboard.title')}
        titleId="dashboard-title"
        description={t('dashboard.description')}
      >
        <nav aria-label={t('dashboard.shortcuts')} className="flex flex-wrap gap-2">
          <Link to="/guardados" className={buttonClasses()}>
            {t('dashboard.viewCollection')}
          </Link>
          <Link to="/comparar" className={buttonClasses({ variant: 'primary' })}>
            <CompareIcon className="size-4" />
            {t('nav.compare')}
          </Link>
        </nav>
      </PageHeader>

      {renderContent()}
    </section>
  )
}
