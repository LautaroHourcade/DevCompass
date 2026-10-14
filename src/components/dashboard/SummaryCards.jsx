import { formatFullNumber } from '../../utils/formatters'

/**
 * Resumen de la colección como una tira de lecturas: el total, una barra apilada con el reparto
 * por estado y la cifra de cada estado. Una sola pieza se lee más rápido que cuatro tarjetas sueltas.
 * statusCounts: resultado de countByStatus.
 */
export default function SummaryCards({ total, statusCounts }) {
  return (
    <section
      aria-labelledby="summary-title"
      className="flex flex-col gap-5 rounded-xl border border-line bg-surface p-5 shadow-card animate-fade-up sm:p-6"
    >
      <h2 id="summary-title" className="sr-only">
        Resumen de la colección
      </h2>

      <div className="flex flex-col gap-5 md:flex-row md:items-end md:gap-10">
        <p className="flex shrink-0 flex-col">
          <span className="font-mono text-2xs tracking-[0.14em] text-muted uppercase">Guardados</span>
          <span className="font-mono text-5xl leading-none font-medium tracking-[-0.04em] tabular-nums">
            {formatFullNumber(total)}
          </span>
        </p>

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          {/* Barra apilada: cada tramo ocupa la proporción de su estado */}
          <div aria-hidden="true" className="flex h-3 gap-0.5 overflow-hidden rounded-full bg-surface-2">
            {statusCounts
              .filter(({ count }) => count > 0)
              .map(({ value, dotClass, count }, index) => (
                <span
                  key={value}
                  style={{ width: `${(count / total) * 100}%`, animationDelay: `${index * 80}ms` }}
                  className={`h-full origin-left first:rounded-l-full last:rounded-r-full animate-grow-x motion-reduce:animate-none ${dotClass}`}
                />
              ))}
          </div>

          <dl className="grid grid-cols-3 gap-3">
            {statusCounts.map(({ value, label, dotClass, count }) => (
              <div key={value} className="flex min-w-0 flex-col gap-0.5">
                <dt className="flex items-center gap-1.5 truncate text-xs text-muted">
                  <span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${dotClass}`} />
                  {label}
                </dt>
                <dd className="flex items-baseline gap-1.5 font-mono tabular-nums">
                  <span className="text-xl font-medium">{formatFullNumber(count)}</span>
                  {total > 0 && <span className="text-xs text-subtle">{Math.round((count / total) * 100)}%</span>}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
