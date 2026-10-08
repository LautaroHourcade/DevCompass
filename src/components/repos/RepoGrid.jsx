import RepoCard from './RepoCard'
import SkeletonCard from '../ui/SkeletonCard'

const SKELETON_COUNT = 6
const GRID_CLASSES = 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'

export default function RepoGrid({ repos, isLoading = false, isSaved, onToggleSave, onOpenDetail, renderActions }) {
  if (isLoading) {
    return (
      <ul className={GRID_CLASSES} aria-busy="true" aria-label="Cargando repositorios">
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
            renderActions={renderActions}
          />
        </li>
      ))}
    </ul>
  )
}
