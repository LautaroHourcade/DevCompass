import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useShortestRotation } from './useShortestRotation'

describe('useShortestRotation', () => {
  it('gira por el camino más corto (de 300° a 0° avanza 60°)', () => {
    const { result, rerender } = renderHook(({ bearing }) => useShortestRotation(bearing), {
      initialProps: { bearing: 300 },
    })
    expect(result.current).toBe(300)

    rerender({ bearing: 0 })
    expect(result.current).toBe(360)

    rerender({ bearing: 60 })
    expect(result.current).toBe(420)

    rerender({ bearing: 240 })
    expect(result.current).toBe(240)
  })
})
