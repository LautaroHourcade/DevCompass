// Validaciones de formularios en el cliente. La validación definitiva la hace Supabase.
// Devuelven el mensaje ya traducido al idioma actual ('' si no hay error).
import { translate } from '../i18n/store'

// Debe coincidir con Supabase → Authentication → Email: mínimo 8 y "Letters and digits".
export const MIN_PASSWORD_LENGTH = 8

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const LETTER_PATTERN = /\p{L}/u
const DIGIT_PATTERN = /\d/

export function getEmailError(email) {
  if (!email.trim()) return translate('validation.emailRequired')
  if (!EMAIL_PATTERN.test(email.trim())) return translate('validation.emailInvalid')
  return ''
}

export function getPasswordError(password) {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return translate('validation.passwordTooShort', { min: MIN_PASSWORD_LENGTH })
  }
  if (!LETTER_PATTERN.test(password) || !DIGIT_PATTERN.test(password)) {
    return translate('validation.passwordNeedsLettersAndDigits')
  }
  return ''
}

export function getPasswordConfirmError(password, confirmation) {
  if (password !== confirmation) return translate('validation.passwordsDontMatch')
  return ''
}

/** Devuelve true si el objeto de errores no tiene ningún mensaje. */
export function hasNoErrors(errors) {
  return Object.values(errors).every((message) => !message)
}
