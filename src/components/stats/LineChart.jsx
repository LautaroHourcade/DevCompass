import { useId, useState } from 'react'
import ChartAxes from './ChartAxes'
import { CHART_HEIGHT, CHART_MARGIN, buildLinePath, createChartScale } from './chartScale'
import { useElementWidth } from '../../hooks/useElementWidth'
import { formatDate, formatFullNumber } from '../../utils/formatters'
import { useTranslation } from '../../hooks/useTranslation'

/**
 * Gráfico de líneas de una sola serie a lo largo del tiempo (SVG propio, sin librerías).
 * - points: [{ date, value }] ordenados del más antiguo al más reciente (al menos 2).
 * - colorClass: clase de color de texto (p. ej. "text-star"); la línea usa currentColor.
 * Al pasar el ratón (o con las flechas del teclado) muestra el valor de cada captura.
 * Debajo, una tabla con todos los datos para quien no pueda ver el gráfico.
 */
export default function LineChart({ title, label, points, colorClass }) {
  const { t } = useTranslation()
  const [containerRef, width] = useElementWidth()
  const [activeIndex, setActiveIndex] = useState(null)
  const descriptionId = useId()

  const first = points[0]
  const last = points[points.length - 1]

  return (
    <figure className="flex min-w-0 flex-col gap-3 rounded-xl border border-line bg-canvas p-4">
      <figcaption className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-2xs tracking-[0.14em] text-muted uppercase">{title}</span>
        <span className="font-mono text-lg font-medium tabular-nums">
          <span className="sr-only">{t('chart.lastValue')} </span>
          {formatFullNumber(last.value)}
        </span>
      </figcaption>

      <p id={descriptionId} className="sr-only">
        {t('chart.description', {
          label,
          from: formatFullNumber(first.value),
          fromDate: formatDate(first.date),
          to: formatFullNumber(last.value),
          toDate: formatDate(last.date),
        })}
      </p>

      <div ref={containerRef} className={`relative ${colorClass}`}>
        {width > 0 && (
          <ChartSvg
            width={width}
            points={points}
            label={label}
            descriptionId={descriptionId}
            activeIndex={activeIndex}
            onActiveChange={setActiveIndex}
          />
        )}
      </div>

      <details className="text-xs text-muted">
        <summary className="w-fit cursor-pointer rounded hover:text-fg">{t('chart.showData')}</summary>
        <div className="mt-2 max-h-[20rem] overflow-y-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-line">
                <th scope="col" className="py-1 font-medium">
                  {t('chart.date')}
                </th>
                <th scope="col" className="py-1 text-right font-medium">
                  {label}
                </th>
              </tr>
            </thead>
            <tbody>
              {points.map((point) => (
                <tr key={point.date} className="border-b border-line/60 text-fg">
                  <td className="py-1">{formatDate(point.date)}</td>
                  <td className="py-1 text-right font-mono">{formatFullNumber(point.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  )
}

function ChartSvg({ width, points, label, descriptionId, activeIndex, onActiveChange }) {
  const { t } = useTranslation()
  const scale = createChartScale(points, width)
  const xOf = (index) => scale.xOfDate(points[index].date)
  const { yOf, baselineY } = scale

  const linePath = buildLinePath(points, scale)
  const areaPath = `${linePath} L${xOf(points.length - 1)},${baselineY} L${xOf(0)},${baselineY} Z`

  const lastIndex = points.length - 1
  const shownIndex = activeIndex ?? lastIndex

  // El punto más cercano a la posición X del puntero.
  function handlePointerMove(event) {
    const bounds = event.currentTarget.getBoundingClientRect()
    const pointerX = event.clientX - bounds.left
    let nearest = 0
    points.forEach((_, index) => {
      if (Math.abs(xOf(index) - pointerX) < Math.abs(xOf(nearest) - pointerX)) nearest = index
    })
    onActiveChange(nearest)
  }

  function handleKeyDown(event) {
    const current = activeIndex ?? lastIndex
    const moves = { ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: lastIndex }
    if (!(event.key in moves)) return

    event.preventDefault()
    onActiveChange(Math.min(lastIndex, Math.max(0, moves[event.key])))
  }

  const tooltipX = xOf(shownIndex)
  // El tooltip se coloca al lado contrario del borde más cercano para no salirse.
  const tooltipOnLeft = tooltipX > width / 2

  return (
    <>
      <svg
        width={width}
        height={CHART_HEIGHT}
        role="group"
        aria-label={t('chart.ariaLabel', { label })}
        aria-describedby={descriptionId}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onFocus={() => onActiveChange(activeIndex ?? lastIndex)}
        onBlur={() => onActiveChange(null)}
        className="block overflow-visible rounded focus-visible:outline-2 focus-visible:outline-offset-4 animate-fade-in"
      >
        <ChartAxes scale={scale} />

        {/* Serie */}
        <path d={areaPath} fill="currentColor" fillOpacity="0.08" className="animate-fade-in [animation-delay:200ms] [animation-duration:500ms]" />
        <path
          d={linePath}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          pathLength="1"
          strokeDasharray="1"
          className="animate-draw motion-reduce:animate-none"
        />

        {/* Línea vertical que sigue al puntero */}
        {activeIndex !== null && (
          <line
            x1={tooltipX}
            x2={tooltipX}
            y1={CHART_MARGIN.top}
            y2={baselineY}
            stroke="var(--color-muted)"
            strokeWidth="1"
          />
        )}

        {/* Punto activo (o el último) con anillo del color de fondo */}
        <circle
          cx={tooltipX}
          cy={yOf(points[shownIndex].value)}
          r="4"
          fill="currentColor"
          stroke="var(--color-canvas)"
          strokeWidth="2"
        />

        {/* Zona de captura del puntero: todo el área del gráfico, no solo la línea */}
        <rect
          x={0}
          y={0}
          width={width}
          height={CHART_HEIGHT}
          fill="transparent"
          onPointerMove={handlePointerMove}
          onPointerLeave={() => onActiveChange(null)}
        />
      </svg>

      {activeIndex !== null && (
        <div
          role="status"
          style={{
            top: `${CHART_MARGIN.top}px`,
            left: tooltipOnLeft ? 'auto' : `${tooltipX + 12}px`,
            right: tooltipOnLeft ? `${width - tooltipX + 12}px` : 'auto',
          }}
          className="pointer-events-none absolute z-10 flex flex-col gap-0.5 rounded-lg border border-line-strong bg-raised px-3 py-2 text-xs shadow-pop"
        >
          <span className="flex items-center gap-2 font-mono text-sm font-semibold text-fg">
            <span aria-hidden="true" className="h-0.5 w-3 rounded-full bg-current" />
            {formatFullNumber(points[activeIndex].value)}
          </span>
          <span className="text-muted">
            {label} · {formatDate(points[activeIndex].date)}
          </span>
        </div>
      )}
    </>
  )
}
