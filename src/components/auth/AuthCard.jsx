import { CompassIcon } from '../ui/Icons'

/** Tarjeta centrada para las pantallas de entrar y registrarse. */
export default function AuthCard({ title, titleId, description, children, footer }) {
  return (
    <section
      aria-labelledby={titleId}
      className="mx-auto flex w-full max-w-[44rem] flex-col gap-6 rounded-2xl border border-line bg-surface p-6 shadow-sm animate-pop-in sm:p-8"
    >
      <header className="flex flex-col items-center gap-3 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-accent-soft text-accent">
          <CompassIcon className="size-6" />
        </span>
        <h1 id={titleId} className="text-2xl font-bold tracking-tight">
          {title}
        </h1>
        {description && <p className="text-sm text-muted">{description}</p>}
      </header>

      {children}

      {footer && <footer className="border-t border-line pt-4 text-center text-sm text-muted">{footer}</footer>}
    </section>
  )
}
