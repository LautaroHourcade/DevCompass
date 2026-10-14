import { useState } from 'react'

/**
 * Convierte un rumbo (0–359°) en una rotación acumulada que siempre gira por el camino más corto:
 * de 300° a 0° la aguja avanza 60°, no retrocede 300°.
 */
export function useShortestRotation(bearing) {
  const [state, setState] = useState({ bearing, rotation: bearing })

  // Ajuste de estado durante el render (patrón recomendado por React para derivar de props).
  if (state.bearing !== bearing) {
    const current = ((state.rotation % 360) + 360) % 360
    const delta = ((bearing - current + 540) % 360) - 180
    const next = { bearing, rotation: state.rotation + delta }
    setState(next)
    return next.rotation
  }

  return state.rotation
}
