// Escalas compartidas por los gráficos de líneas (LineChart y MultiLineChart).

export const CHART_HEIGHT = 200
export const CHART_MARGIN = { top: 16, right: 12, bottom: 28, left: 64 }
const GRID_LINES = 3

/**
 * Calcula las escalas de un gráfico a partir de todos sus puntos ([{ date, value }]).
 * - xOfDate(date) / yOf(value): posición en píxeles dentro del SVG.
 * - gridValues: valores del eje Y donde se dibuja la rejilla.
 * - minDate / maxDate: primera y última fecha (para las etiquetas del eje X).
 */
export function createChartScale(points, width) {
  const plotWidth = Math.max(width - CHART_MARGIN.left - CHART_MARGIN.right, 1)
  const plotHeight = CHART_HEIGHT - CHART_MARGIN.top - CHART_MARGIN.bottom

  // Escala X: tiempo. Escala Y: del mínimo al máximo con un poco de aire.
  const times = points.map((point) => new Date(point.date).getTime())
  const minTime = Math.min(...times)
  const maxTime = Math.max(...times)
  const timeRange = maxTime - minTime || 1

  const values = points.map((point) => point.value)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const padding = (maxValue - minValue) * 0.15 || Math.max(1, maxValue * 0.01)
  const yMin = Math.max(0, minValue - padding)
  const yMax = maxValue + padding

  const xOfDate = (date) => CHART_MARGIN.left + ((new Date(date).getTime() - minTime) / timeRange) * plotWidth
  const yOf = (value) => CHART_MARGIN.top + (1 - (value - yMin) / (yMax - yMin)) * plotHeight

  const gridValues = Array.from({ length: GRID_LINES }, (_, index) => yMin + ((yMax - yMin) * index) / (GRID_LINES - 1))

  return {
    plotWidth,
    plotHeight,
    baselineY: CHART_MARGIN.top + plotHeight,
    minDate: new Date(minTime).toISOString(),
    maxDate: new Date(maxTime).toISOString(),
    xOfDate,
    yOf,
    gridValues,
  }
}

/** Trazo SVG de una serie ya ordenada por fecha. */
export function buildLinePath(points, scale) {
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${scale.xOfDate(point.date)},${scale.yOf(point.value)}`)
    .join(' ')
}
