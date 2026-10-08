/**
 * Cabecera de página con el estilo de terminal de la web.
 * command: texto tras el "$" (p. ej. "ls ~/guardados"). titleId: para aria-labelledby de la sección.
 */
export default function PageHeader({ command, title, titleId, description, children }) {
  return (
    <header className="flex flex-col gap-2 animate-fade-up">
      <p className="font-mono text-sm text-accent">
        <span aria-hidden="true">$ </span>
        {command}
      </p>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 id={titleId} className="text-3xl font-bold tracking-tight sm:text-4xl">
            {title}
          </h1>
          {description && <p className="text-base text-muted">{description}</p>}
        </div>
        {children}
      </div>
    </header>
  )
}
