import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useLoadedData } from './useLoadedData'

const EMPTY = []

describe('useLoadedData', () => {
  it('sin clave no carga nada ni queda "cargando"', () => {
    const load = vi.fn()
    const { result } = renderHook(() => useLoadedData(null, load, EMPTY))

    expect(result.current).toMatchObject({ data: EMPTY, isLoading: false, error: null })
    expect(load).not.toHaveBeenCalled()
  })

  it('carga los datos de la clave y deja de estar cargando', async () => {
    const { result } = renderHook(() => useLoadedData('user-1', async () => ['a', 'b'], EMPTY))

    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data).toEqual(['a', 'b'])
  })

  it('al cambiar de clave nunca muestra los datos de la anterior', async () => {
    const { result, rerender } = renderHook(({ userId }) => useLoadedData(userId, async () => [userId], EMPTY), {
      initialProps: { userId: 'user-1' },
    })
    await waitFor(() => expect(result.current.data).toEqual(['user-1']))

    rerender({ userId: 'user-2' })
    // Justo tras el cambio: cargando y sin los datos del usuario anterior.
    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBe(EMPTY)

    await waitFor(() => expect(result.current.data).toEqual(['user-2']))
  })

  it('guarda el error si la carga falla y reload vuelve a intentarlo', async () => {
    const load = vi.fn().mockRejectedValueOnce(new Error('sin red')).mockResolvedValueOnce(['ok'])
    const { result } = renderHook(() => useLoadedData('user-1', load, EMPTY))

    await waitFor(() => expect(result.current.error?.message).toBe('sin red'))
    expect(result.current.data).toBe(EMPTY)

    act(() => result.current.reload())
    await waitFor(() => expect(result.current.data).toEqual(['ok']))
    expect(result.current.error).toBeNull()
    expect(load).toHaveBeenCalledTimes(2)
  })

  it('setData actualiza los datos en local', async () => {
    const { result } = renderHook(() => useLoadedData('user-1', async () => [1], EMPTY))
    await waitFor(() => expect(result.current.data).toEqual([1]))

    act(() => result.current.setData((current) => [...current, 2]))
    expect(result.current.data).toEqual([1, 2])
  })
})
