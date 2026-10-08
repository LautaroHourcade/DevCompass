/** Bloque del perfil con título y descripción. danger: estilo de "zona de peligro". */
export default function ProfileSection({ title, titleId, description, danger = false, children }) {
  return (
    <section
      aria-labelledby={titleId}
      className={`flex flex-col gap-5 rounded-2xl border bg-surface p-6 animate-fade-up sm:p-8 ${
        danger ? 'border-danger/40' : 'border-line'
      }`}
    >
      <header className="flex flex-col gap-1">
        <h2 id={titleId} className={`text-xl font-semibold ${danger ? 'text-danger' : ''}`}>
          {title}
        </h2>
        {description && <p className="text-sm text-muted">{description}</p>}
      </header>
      {children}
    </section>
  )
}
