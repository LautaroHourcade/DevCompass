// Validaciones de formularios en el cliente. La validación definitiva la hace Supabase.

export const MIN_PASSWORD_LENGTH = 8

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function getEmailError(email) {
  if (!email.trim()) return 'Escribe tu email.'
  if (!EMAIL_PATTERN.test(email.trim())) return 'Escribe un email válido, por ejemplo nombre@correo.com.'
  return ''
}

export function getPasswordError(password) {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`
  }
  return ''
}

export function getPasswordConfirmError(password, confirmation) {
  if (password !== confirmation) return 'Las contraseñas no coinciden.'
  return ''
}

/** Devuelve true si el objeto de errores no tiene ningún mensaje. */
export function hasNoErrors(errors) {
  return Object.values(errors).every((message) => !message)
}
