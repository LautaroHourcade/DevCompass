import { describe, expect, it } from 'vitest'
import { CHART_HEIGHT, CHART_MARGIN, buildLinePath, createChartScale } from './chartScale'

const points = [
  { date: '2026-10-01T03:00:00Z', value: 100 },
  { date: '2026-10-02T03:00:00Z', value: 150 },
  { date: '2026-10-03T03:00:00Z', value: 200 },
]

describe('createChartScale', () => {
  const scale = createChartScale(points, 400)

  it('coloca la primera fecha en el margen izquierdo y la última en el derecho', () => {
    expect(scale.xOfDate(points[0].date)).toBe(CHART_MARGIN.left)
    expect(scale.xOfDate(points[2].date)).toBe(400 - CHART_MARGIN.right)
  })

  it('los valores mayores quedan más arriba y todo dentro del área del gráfico', () => {
    expect(scale.yOf(200)).toBeLessThan(scale.yOf(100))
    for (const point of points) {
      expect(scale.yOf(point.value)).toBeGreaterThanOrEqual(CHART_MARGIN.top)
      expect(scale.yOf(point.value)).toBeLessThanOrEqual(CHART_HEIGHT - CHART_MARGIN.bottom)
    }
  })

  it('no divide entre cero si todos los valores o fechas son iguales', () => {
    const flat = createChartScale(
      [
        { date: '2026-10-01T03:00:00Z', value: 5 },
        { date: '2026-10-01T03:00:00Z', value: 5 },
      ],
      300,
    )
    expect(Number.isFinite(flat.yOf(5))).toBe(true)
    expect(Number.isFinite(flat.xOfDate('2026-10-01T03:00:00Z'))).toBe(true)
  })
})

describe('buildLinePath', () => {
  it('empieza con M y une cada punto con L', () => {
    const path = buildLinePath(points, createChartScale(points, 400))
    expect(path.startsWith('M')).toBe(true)
    expect(path.match(/L/g)).toHaveLength(points.length - 1)
  })
})
