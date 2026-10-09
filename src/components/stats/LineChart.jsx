import { useId, useState } from 'react'
import { useElementWidth } from '../../hooks/useElementWidth'
import { formatDate, formatFullNumber, formatNumber } from '../../utils/formatters'

const HEIGHT = 200
const MARGIN = { top: 16, right: 16, bottom: 28, left: 52 }
const GRID_LINES = 3

/**
 * Gráfico de líneas de una sola serie a lo largo del tiempo (SVG propio, sin librerías).
 * - points: [{ date, value }] ordenados del más antiguo al más reciente (al menos 2).
 * - colorClass: clase de color de texto (p. ej. "text-star"); la línea usa currentColor.
 * Al pasar el ratón (o con las flechas del teclado) muestra el valor de cada captura.
 * Debajo, una tabla con todos los datos para quien no pueda ver el gráfico.
 */
export default function LineChart({ title, label, points, colorClass }) {
  const [containerRef, width] = useElementWidth()
  const [activeIndex, setActiveIndex] = useState(null)
  const descriptionId = useId()

  const first = points[0]
  const last = points[points.length - 1]

  return (
    <figure className="flex flex-col gap-3 rounded-lg border border-line bg-canvas p-4">
      <figcaption className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold">{title}</span>
        <span className="font-mono text-sm">
          <span className="sr-only">Último valor: </span>
          {formatFullNumber(last.value)}
        </span>
      </figcaption>

      <p id={descriptionId} className="sr-only">
        {`${label}: de ${formatFullNumber(first.value)} el ${formatDate(first.date)} a ${formatFullNumber(
          last.value,
        )} el ${formatDate(last.date)}. Usa las flechas para recorrer las capturas.`}
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
        <summary className="w-fit cursor-pointer rounded hover:text-fg">Ver los datos</summary>
        <div className="mt-2 max-h-[20rem] overflow-y-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-line">
                <th scope="col" className="py-1 font-medium">
                  Fecha
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
  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1)
  const plotHeight = HEIGHT - MARGIN.top - MARGIN.bottom

  // Escala X: tiempo. Escala Y: del mínimo al máximo con un poco de aire.
  const times = points.map((point) => new Date(point.date).getTime())
  const minTime = times[0]
  const timeRange = times[times.length - 1] - minTime || 1

  const values = points.map((point) => point.value)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const padding = (maxValue - minValue) * 0.15 || Math.max(1, maxValue * 0.01)
  const yMin = Math.max(0, minValue - padding)
  const yMax = maxValue + padding

  const xOf = (index) => MARGIN.left + ((times[index] - minTime) / timeRange) * plotWidth
  const yOf = (value) => MARGIN.top + (1 - (value - yMin) / (yMax - yMin)) * plotHeight

  const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'}${xOf(index)},${yOf(point.value)}`).join(' ')
  const baselineY = MARGIN.top + plotHeight
  const areaPath = `${linePath} L${xOf(points.length - 1)},${baselineY} L${xOf(0)},${baselineY} Z`

  const gridValues = Array.from({ length: GRID_LINES }, (_, index) => yMin + ((yMax - yMin) * index) / (GRID_LINES - 1))

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
        height={HEIGHT}
        role="group"
        aria-label={`Gráfico de ${label.toLowerCase()}`}
        aria-describedby={descriptionId}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onFocus={() => onActiveChange(activeIndex ?? lastIndex)}
        onBlur={() => onActiveChange(null)}
        className="block overflow-visible rounded focus-visible:outline-2 focus-visible:outline-offset-4 animate-fade-in"
      >
        {/* Rejilla y eje Y */}
        {gridValues.map((value) => (
          <g key={value}>
            <line
              x1={MARGIN.left}
              x2={MARGIN.left + plotWidth}
              y1={yOf(value)}
              y2={yOf(value)}
              stroke="var(--color-line)"
              strokeWidth="1"
            />
            <text
              x={MARGIN.left - 8}
              y={yOf(value)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-muted font-mono text-[1.1rem]"
            >
              {formatNumber(Math.round(value))}
            </text>
          </g>
        ))}

        {/* Eje X: primera y última fecha */}
        <text x={xOf(0)} y={HEIGHT - 6} textAnchor="start" className="fill-muted text-[1.1rem]">
          {formatDate(points[0].date)}
        </text>
        <text x={xOf(lastIndex)} y={HEIGHT - 6} textAnchor="end" className="fill-muted text-[1.1rem]">
          {formatDate(points[lastIndex].date)}
        </text>

        {/* Serie */}
        <path d={areaPath} fill="currentColor" fillOpacity="0.1" />
        <path d={linePath} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {/* Línea vertical que sigue al puntero */}
        {activeIndex !== null && (
          <line
            x1={tooltipX}
            x2={tooltipX}
            y1={MARGIN.top}
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
          height={HEIGHT}
          fill="transparent"
          onPointerMove={handlePointerMove}
          onPointerLeave={() => onActiveChange(null)}
        />
      </svg>

      {activeIndex !== null && (
        <div
          role="status"
          style={{
            top: `${MARGIN.top}px`,
            left: tooltipOnLeft ? 'auto' : `${tooltipX + 12}px`,
            right: tooltipOnLeft ? `${width - tooltipX + 12}px` : 'auto',
          }}
          className="pointer-events-none absolute flex flex-col gap-0.5 rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-lg animate-fade-in"
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
