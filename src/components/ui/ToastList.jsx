import { AlertIcon, CheckIcon, CloseIcon, InfoIcon } from './Icons'

const TOAST_STYLES = {
  success: { Icon: CheckIcon, iconClass: 'text-accent' },
  info: { Icon: InfoIcon, iconClass: 'text-info' },
  error: { Icon: AlertIcon, iconClass: 'text-danger' },
}

export default function ToastList({ toasts, onDismiss }) {
  return (
    <section
      aria-label="Notificaciones"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-50 sm:left-auto sm:w-96"
    >
      <ol aria-live="polite" className="flex flex-col gap-2">
        {toasts.map((toast) => {
          const { Icon, iconClass } = TOAST_STYLES[toast.type] ?? TOAST_STYLES.info

          function handleDismiss(event) {
            event.preventDefault()
            onDismiss(toast.id)
          }

          return (
            <li
              key={toast.id}
              role={toast.type === 'error' ? 'alert' : 'status'}
              className="pointer-events-auto flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-sm shadow-lg animate-pop-in"
            >
              <Icon className={`size-5 ${iconClass}`} />
              <p className="flex-1">{toast.message}</p>
              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Cerrar notificación"
                className="rounded-md p-1 text-muted transition-colors hover:bg-surface-2 hover:text-fg"
              >
                <CloseIcon className="size-4" />
              </button>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
