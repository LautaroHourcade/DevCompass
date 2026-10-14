import { CHART_HEIGHT, CHART_MARGIN } from './chartScale'
import { formatDate, formatNumber } from '../../utils/formatters'

/** Rejilla y ejes de un gráfico de líneas: valores en el eje Y, primera y última fecha en el X. */
export default function ChartAxes({ scale }) {
  return (
    <>
      {scale.gridValues.map((value) => (
        <g key={value}>
          <line
            x1={CHART_MARGIN.left}
            x2={CHART_MARGIN.left + scale.plotWidth}
            y1={scale.yOf(value)}
            y2={scale.yOf(value)}
            stroke="var(--color-line-strong)"
            strokeWidth="1"
            strokeDasharray="2 4"
          />
          <text
            x={CHART_MARGIN.left - 8}
            y={scale.yOf(value)}
            textAnchor="end"
            dominantBaseline="middle"
            className="fill-subtle font-mono text-[1.1rem] tabular-nums"
          >
            {formatNumber(Math.round(value))}
          </text>
        </g>
      ))}

      <text x={scale.xOfDate(scale.minDate)} y={CHART_HEIGHT - 6} textAnchor="start" className="fill-subtle font-mono text-[1.1rem]">
        {formatDate(scale.minDate)}
      </text>
      <text x={scale.xOfDate(scale.maxDate)} y={CHART_HEIGHT - 6} textAnchor="end" className="fill-subtle font-mono text-[1.1rem]">
        {formatDate(scale.maxDate)}
      </text>
    </>
  )
}
