import { AlertIcon } from './Icons'
import { buttonClasses } from './buttonStyles'
import { formatTime } from '../../utils/formatters'

export default function ErrorMessage({ error, onRetry }) {
  function handleRetry(event) {
    event.preventDefault()
    onRetry()
  }

  return (
    <section
      role="alert"
      className="flex flex-col items-start gap-3 rounded-xl border border-danger/40 bg-danger/5 p-5 sm:flex-row sm:items-center animate-fade-up"
    >
      <AlertIcon className="size-6 text-danger" />
      <div className="flex-1">
        <p className="font-medium">{error.message}</p>
        {error.resetAt && (
          <p className="text-sm text-muted">
            Podrás volver a buscar a partir de las {formatTime(error.resetAt)}.
          </p>
        )}
      </div>
      {onRetry && (
        <button type="button" onClick={handleRetry} className={buttonClasses({ size: 'sm' })}>
          Reintentar
        </button>
      )}
    </section>
  )
}
