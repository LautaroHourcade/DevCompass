import { Link } from 'react-router-dom'
import EmptyState from '../components/ui/EmptyState'
import { CompassMark } from '../components/ui/Icons'
import { buttonClasses } from '../components/ui/buttonStyles'
import { useTranslation } from '../hooks/useTranslation'

export default function NotFoundView() {
  const { t } = useTranslation()

  return (
    <EmptyState
      icon={<CompassMark className="size-8 text-fg" bearing={225} />}
      title={t('notFound.title')}
      message={t('notFound.message')}
      action={
        <Link to="/" className={buttonClasses({ variant: 'primary' })}>
          {t('notFound.action')}
        </Link>
      }
    />
  )
}
