/**
 * Estado vacío: el icono va dentro de un anillo de rumbo, como una brújula esperando dirección.
 * icon: elemento SVG. action (opcional): botón o enlace para salir del estado vacío.
 */
export default function EmptyState({ icon, title, message, action }) {
  return (
    <section className="relative isolate flex flex-col items-center gap-3 overflow-hidden rounded-2xl border border-dashed border-line-strong px-6 py-16 text-center animate-fade-up">
      <div aria-hidden="true" className="dot-grid absolute inset-0 -z-10 opacity-70" />
      <span className="relative mb-2 flex size-16 items-center justify-center rounded-full border border-line-strong bg-surface text-accent shadow-card">
        {/* Marcas de rumbo alrededor del icono */}
        <svg viewBox="0 0 64 64" aria-hidden="true" className="absolute inset-0 size-full text-subtle">
          {[0, 90, 180, 270].map((angle) => (
            <line
              key={angle}
              x1="32"
              y1="3"
              x2="32"
              y2="8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              transform={`rotate(${angle} 32 32)`}
            />
          ))}
        </svg>
        {icon}
      </span>
      <h2 className="text-xl font-semibold tracking-[-0.02em]">{title}</h2>
      <p className="max-w-[46rem] text-sm text-muted">{message}</p>
      {action && <div className="mt-3">{action}</div>}
    </section>
  )
}
