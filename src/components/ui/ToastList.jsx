import { AlertIcon, CheckIcon, CloseIcon, InfoIcon } from './Icons'

const TOAST_STYLES = {
  success: { Icon: CheckIcon, iconClass: 'bg-accent-soft text-accent' },
  info: { Icon: InfoIcon, iconClass: 'bg-info/10 text-info' },
  error: { Icon: AlertIcon, iconClass: 'bg-danger/10 text-danger' },
}

/**
 * Notificaciones abajo a la derecha. Entran desde abajo con una transición (no keyframes):
 * si llegan varias seguidas, las anteriores se recolocan sin saltos. Salen más rápido de lo que entran.
 */
export default function ToastList({ toasts, onDismiss }) {
  return (
    <section
      aria-label="Notificaciones"
      className="pointer-events-none fixed inset-x-3 bottom-3 z-50 sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[38rem]"
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
              className={`pointer-events-auto flex items-center gap-3 rounded-xl border border-line-strong bg-raised py-2.5 pr-2.5 pl-3 text-sm shadow-pop transition-[opacity,translate,scale] ease-out starting:translate-y-full starting:opacity-0 motion-reduce:starting:translate-y-0 ${
                toast.isLeaving ? 'translate-y-2 scale-[0.97] opacity-0 duration-150' : 'duration-300'
              }`}
            >
              <span className={`flex size-7 shrink-0 items-center justify-center rounded-md ${iconClass}`}>
                <Icon className="size-4" />
              </span>
              <p className="flex-1">{toast.message}</p>
              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Cerrar notificación"
                className="flex size-7 cursor-pointer items-center justify-center rounded-md text-muted transition-[background-color,color] duration-150 hover:bg-surface-2 hover:text-fg"
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
