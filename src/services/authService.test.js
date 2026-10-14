import { describe, expect, it } from 'vitest'
import { getDisplayName, getInitials } from './authService'

describe('nombre e iniciales del usuario', () => {
  it('usa el nombre completo y, si no hay, la parte local del email', () => {
    expect(getDisplayName({ user_metadata: { full_name: 'Ada Lovelace' }, email: 'ada@correo.com' })).toBe('Ada Lovelace')
    expect(getDisplayName({ user_metadata: {}, email: 'ada@correo.com' })).toBe('ada')
    expect(getDisplayName(null)).toBe('')
  })

  it('calcula hasta dos iniciales', () => {
    expect(getInitials('Ada Lovelace')).toBe('AL')
    expect(getInitials('ada.lovelace')).toBe('AL')
    expect(getInitials('ada')).toBe('A')
    expect(getInitials('')).toBe('')
  })
})
