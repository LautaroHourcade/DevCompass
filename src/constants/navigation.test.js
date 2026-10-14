import { describe, expect, it } from 'vitest'
import { formatBearing, getSectionForPath } from './navigation'

describe('getSectionForPath', () => {
  it('reconoce cada sección, también en sus subrutas', () => {
    expect(getSectionForPath('/').label).toBe('Explorar')
    expect(getSectionForPath('/panel').label).toBe('Panel')
    expect(getSectionForPath('/listas/123').label).toBe('Listas')
    expect(getSectionForPath('/perfil').label).toBe('Perfil')
  })

  it('devuelve null en rutas que no son una sección', () => {
    expect(getSectionForPath('/entrar')).toBeNull()
    expect(getSectionForPath('/no-existe')).toBeNull()
  })
})

describe('formatBearing', () => {
  it('muestra el rumbo con tres cifras', () => {
    expect(formatBearing(0)).toBe('000°')
    expect(formatBearing(60)).toBe('060°')
    expect(formatBearing(300)).toBe('300°')
  })
})
