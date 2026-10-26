import RepoCard from './RepoCard'
import SkeletonCard from '../ui/SkeletonCard'
import { useTranslation } from '../../hooks/useTranslation'

const SKELETON_COUNT = 6
const GRID_CLASSES = 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'

export default function RepoGrid({ repos, isLoading = false, isSaved, onToggleSave, onOpenDetail, renderTracking, renderActions }) {
  const { t } = useTranslation()

  if (isLoading) {
    return (
      <ul className={GRID_CLASSES} aria-busy="true" aria-label={t('repo.loadingRepos')}>
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <li key={index}>
            <SkeletonCard />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <ul className={GRID_CLASSES}>
      {repos.map((repo, index) => (
        <li key={repo.id}>
          <RepoCard
            repo={repo}
            index={index}
            isSaved={isSaved(repo.id)}
            onToggleSave={onToggleSave}
            onOpenDetail={onOpenDetail}
            renderTracking={renderTracking}
            renderActions={renderActions}
          />
        </li>
      ))}
    </ul>
  )
}
