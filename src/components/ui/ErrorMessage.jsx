import { AlertIcon } from './Icons'
import { buttonClasses } from './buttonStyles'
import { formatTime } from '../../utils/formatters'
import { useTranslation } from '../../hooks/useTranslation'

export default function ErrorMessage({ error, onRetry }) {
  const { t } = useTranslation()

  function handleRetry(event) {
    event.preventDefault()
    onRetry()
  }

  return (
    <section
      role="alert"
      className="flex flex-col items-start gap-3 rounded-xl border border-danger/35 bg-danger/5 p-5 sm:flex-row sm:items-center animate-fade-up"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-danger/10 text-danger">
        <AlertIcon className="size-5" />
      </span>
      <div className="flex-1">
        <p className="font-medium">{error.message}</p>
        {error.resetAt && (
          <p className="text-sm text-muted">
            {t('errors.searchAgainAt', { time: formatTime(error.resetAt) })}
          </p>
        )}
      </div>
      {onRetry && (
        <button type="button" onClick={handleRetry} className={buttonClasses({ size: 'sm' })}>
          {t('common.retry')}
        </button>
      )}
    </section>
  )
}
