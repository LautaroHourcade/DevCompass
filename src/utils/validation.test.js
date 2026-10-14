import { describe, expect, it } from 'vitest'
import { getEmailError, getPasswordConfirmError, getPasswordError, hasNoErrors } from './validation'

describe('validación de formularios', () => {
  it('exige un email con formato válido', () => {
    expect(getEmailError('')).not.toBe('')
    expect(getEmailError('   ')).not.toBe('')
    expect(getEmailError('sin-arroba.com')).not.toBe('')
    expect(getEmailError('nombre@correo')).not.toBe('')
    expect(getEmailError(' nombre@correo.com ')).toBe('')
  })

  it('exige contraseñas de al menos 8 caracteres', () => {
    expect(getPasswordError('1234567')).not.toBe('')
    expect(getPasswordError('12345678')).toBe('')
  })

  it('comprueba que la confirmación coincide', () => {
    expect(getPasswordConfirmError('secreto123', 'secreto124')).not.toBe('')
    expect(getPasswordConfirmError('secreto123', 'secreto123')).toBe('')
  })

  it('hasNoErrors solo es true si no hay ningún mensaje', () => {
    expect(hasNoErrors({ email: '', password: '' })).toBe(true)
    expect(hasNoErrors({ email: 'Escribe tu email.', password: '' })).toBe(false)
  })
})
