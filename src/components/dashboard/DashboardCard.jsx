import { useId } from 'react'

/**
 * Bloque del Panel con título. action (opcional): enlace o botón a la derecha del título.
 * className permite ocupar más columnas en la rejilla.
 */
export default function DashboardCard({ title, action, className = '', style, children }) {
  const titleId = useId()

  return (
    <section
      aria-labelledby={titleId}
      style={style}
      className={`flex flex-col gap-4 rounded-xl border border-line bg-surface p-5 shadow-card animate-fade-up ${className}`}
    >
      <header className="flex items-center justify-between gap-3">
        <h2 id={titleId} className="font-mono text-2xs tracking-[0.14em] text-muted uppercase">
          {title}
        </h2>
        {action}
      </header>
      {children}
    </section>
  )
}
