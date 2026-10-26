import { useId, useState } from 'react'
import ChartAxes from './ChartAxes'
import { CHART_HEIGHT, CHART_MARGIN, buildLinePath, createChartScale } from './chartScale'
import { useElementWidth } from '../../hooks/useElementWidth'
import { formatDate, formatFullNumber } from '../../utils/formatters'
import { useTranslation } from '../../hooks/useTranslation'

// Las capturas son diarias: comparamos las series por día (YYYY-MM-DD).
const toDay = (isoDate) => isoDate.slice(0, 10)
// "2026-10-13" se leería como medianoche UTC (el día anterior en América); al mediodía local no cambia de día.
const formatDay = (day) => formatDate(`${day}T12:00:00`)

/**
 * Gráfico de líneas con varias series en el mismo eje (SVG propio, sin librerías).
 * - series: [{ id, label, color, points: [{ date, value }] }], cada serie con al menos 2 puntos.
 * - color: un color CSS (p. ej. "var(--color-accent)").
 * Al pasar el ratón (o con las flechas del teclado) muestra el valor de cada serie ese día.
 */
export default function MultiLineChart({ title, label, series }) {
  const { t } = useTranslation()
  const [containerRef, width] = useElementWidth()
  const [activeIndex, setActiveIndex] = useState(null)
  const descriptionId = useId()

  // Todos los días con alguna captura, ordenados: son las posiciones que recorre el puntero.
  // Para cada día guardamos la fecha de una de sus capturas, que marca su posición en el eje X.
  const dayDates = new Map()
  series.forEach((serie) =>
    serie.points.forEach((point) => {
      if (!dayDates.has(toDay(point.date))) dayDates.set(toDay(point.date), point.date)
    }),
  )
  const days = [...dayDates.keys()].sort()
  const valueOn = (serie, day) => serie.points.find((point) => toDay(point.date) === day)?.value

  return (
    <figure className="flex min-w-0 flex-col gap-3 rounded-xl border border-line bg-canvas p-4">
      <figcaption className="font-mono text-2xs tracking-[0.14em] text-muted uppercase">{title}</figcaption>

      <ul aria-label={t('chart.legend')} className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
        {series.map((serie) => (
          <li key={serie.id} className="flex min-w-0 items-center gap-2">
            <span aria-hidden="true" className="h-1 w-4 shrink-0 rounded-full" style={{ backgroundColor: serie.color }} />
            <span className="truncate font-mono">{serie.label}</span>
          </li>
        ))}
      </ul>

      <p id={descriptionId} className="sr-only">
        {t('chart.multiDescription', {
          label,
          count: series.length,
          from: formatDay(days[0]),
          to: formatDay(days[days.length - 1]),
        })}
      </p>

      <div ref={containerRef} className="relative">
        {width > 0 && (
          <ChartSvg
            width={width}
            series={series}
            days={days}
            dayDates={dayDates}
            label={label}
            descriptionId={descriptionId}
            activeIndex={activeIndex}
            onActiveChange={setActiveIndex}
            valueOn={valueOn}
          />
        )}
      </div>

      <details className="text-xs text-muted">
        <summary className="w-fit cursor-pointer rounded hover:text-fg">{t('chart.showData')}</summary>
        <div className="mt-2 max-h-[20rem] overflow-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-line">
                <th scope="col" className="py-1 pr-3 font-medium">
                  {t('chart.date')}
                </th>
                {series.map((serie) => (
                  <th key={serie.id} scope="col" className="py-1 pl-3 text-right font-medium">
                    {serie.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map((day) => (
                <tr key={day} className="border-b border-line/60 text-fg">
                  <td className="py-1 pr-3 whitespace-nowrap">{formatDay(day)}</td>
                  {series.map((serie) => {
                    const value = valueOn(serie, day)
                    return (
                      <td key={serie.id} className="py-1 pl-3 text-right font-mono">
                        {value === undefined ? '—' : formatFullNumber(value)}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  )
}

function ChartSvg({ width, series, days, dayDates, label, descriptionId, activeIndex, onActiveChange, valueOn }) {
  const { t } = useTranslation()
  const scale = createChartScale(
    series.flatMap((serie) => serie.points),
    width,
  )
  const xOfDay = (day) => scale.xOfDate(dayDates.get(day))
  const lastIndex = days.length - 1

  // El día más cercano a la posición X del puntero.
  function handlePointerMove(event) {
    const bounds = event.currentTarget.getBoundingClientRect()
    const pointerX = event.clientX - bounds.left
    let nearest = 0
    days.forEach((day, index) => {
      if (Math.abs(xOfDay(day) - pointerX) < Math.abs(xOfDay(days[nearest]) - pointerX)) nearest = index
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

  const activeDay = activeIndex === null ? null : days[activeIndex]
  const activeX = activeDay ? xOfDay(activeDay) : 0
  // El tooltip se coloca al lado contrario del borde más cercano para no salirse.
  const tooltipOnLeft = activeX > width / 2

  return (
    <>
      <svg
        width={width}
        height={CHART_HEIGHT}
        role="group"
        aria-label={t('chart.compareAriaLabel', { label })}
        aria-describedby={descriptionId}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onFocus={() => onActiveChange(activeIndex ?? lastIndex)}
        onBlur={() => onActiveChange(null)}
        className="block overflow-visible rounded focus-visible:outline-2 focus-visible:outline-offset-4 animate-fade-in"
      >
        <ChartAxes scale={scale} />

        {series.map((serie) => {
          const lastPoint = serie.points[serie.points.length - 1]
          return (
            <g key={serie.id} style={{ color: serie.color }}>
              <path
                d={buildLinePath(serie.points, scale)}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
                pathLength="1"
                strokeDasharray="1"
                className="animate-draw motion-reduce:animate-none"
              />
              <circle
                cx={scale.xOfDate(lastPoint.date)}
                cy={scale.yOf(lastPoint.value)}
                r="3.5"
                fill="currentColor"
                stroke="var(--color-canvas)"
                strokeWidth="2"
              />
            </g>
          )
        })}

        {/* Línea vertical y puntos del día activo */}
        {activeDay && (
          <g>
            <line
              x1={activeX}
              x2={activeX}
              y1={CHART_MARGIN.top}
              y2={scale.baselineY}
              stroke="var(--color-muted)"
              strokeWidth="1"
            />
            {series.map((serie) => {
              const value = valueOn(serie, activeDay)
              if (value === undefined) return null
              return (
                <circle
                  key={serie.id}
                  cx={activeX}
                  cy={scale.yOf(value)}
                  r="4"
                  fill={serie.color}
                  stroke="var(--color-canvas)"
                  strokeWidth="2"
                />
              )
            })}
          </g>
        )}

        {/* Zona de captura del puntero: todo el área del gráfico, no solo las líneas */}
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

      {activeDay && (
        <div
          role="status"
          style={{
            top: `${CHART_MARGIN.top}px`,
            left: tooltipOnLeft ? 'auto' : `${activeX + 12}px`,
            right: tooltipOnLeft ? `${width - activeX + 12}px` : 'auto',
          }}
          className="pointer-events-none absolute z-10 flex max-w-[24rem] flex-col gap-1 rounded-lg border border-line-strong bg-raised px-3 py-2 text-xs shadow-pop"
        >
          <span className="text-muted">
            {label} · {formatDay(activeDay)}
          </span>
          {series.map((serie) => {
            const value = valueOn(serie, activeDay)
            return (
              <span key={serie.id} className="flex items-center gap-2 text-fg">
                <span aria-hidden="true" className="h-0.5 w-3 shrink-0 rounded-full" style={{ backgroundColor: serie.color }} />
                <span className="truncate">{serie.label}</span>
                <span className="ml-auto pl-2 font-mono font-semibold">
                  {value === undefined ? t('chart.noSnapshot') : formatFullNumber(value)}
                </span>
              </span>
            )
          })}
        </div>
      )}
    </>
  )
}
