/** Bloque del perfil con título y descripción. danger: estilo de "zona de peligro". */
export default function ProfileSection({ title, titleId, description, danger = false, children }) {
  return (
    <section
      aria-labelledby={titleId}
      className={`flex flex-col gap-5 rounded-xl border bg-surface p-5 shadow-card animate-fade-up sm:p-7 ${
        danger ? 'border-danger/35' : 'border-line'
      }`}
    >
      <header className="flex flex-col gap-1">
        <h2 id={titleId} className={`text-lg font-semibold tracking-[-0.02em] ${danger ? 'text-danger' : ''}`}>
          {title}
        </h2>
        {description && <p className="text-sm text-muted">{description}</p>}
      </header>
      {children}
    </section>
  )
}
