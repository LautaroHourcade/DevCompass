import { AlertIcon, CheckIcon, InfoIcon } from './Icons'

const STYLES = {
  error: { Icon: AlertIcon, classes: 'border-danger/35 bg-danger/5 [&>svg]:text-danger', role: 'alert' },
  success: { Icon: CheckIcon, classes: 'border-accent/35 bg-accent-soft [&>svg]:text-accent', role: 'status' },
  info: { Icon: InfoIcon, classes: 'border-line-strong bg-surface-2/60 text-muted [&>svg]:text-info', role: 'status' },
}

/** Mensaje dentro de un formulario (error, éxito o información). type: 'error' | 'success' | 'info' */
export default function FormAlert({ type = 'error', children }) {
  const { Icon, classes, role } = STYLES[type]

  return (
    <p role={role} className={`flex items-start gap-2 rounded-lg border p-3 text-sm animate-fade-up ${classes}`}>
      <Icon className="mt-0.5 size-4" />
      <span>{children}</span>
    </p>
  )
}
