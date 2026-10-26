import { supabase } from '../lib/supabase'
import { TranslatableError } from '../i18n/TranslatableError'

// Errores de Supabase Auth (texto en inglés que devuelve Supabase) -> clave del mensaje para el usuario.
const KNOWN_ERRORS = [
  ['Invalid login credentials', 'errors.auth.invalidCredentials'],
  ['User already registered', 'errors.auth.alreadyRegistered'],
  ['Password should be at least', 'errors.auth.passwordTooShort'],
  ['Password should contain', 'errors.auth.passwordNeedsLettersAndDigits'],
  ['Email not confirmed', 'errors.auth.emailNotConfirmed'],
  ['New password should be different', 'errors.auth.samePassword'],
  ['Invalid otp', 'errors.auth.invalidCode'],
  ['Token has expired or is invalid', 'errors.auth.invalidCode'],
  ['Unable to validate email address', 'errors.auth.invalidEmail'],
  ['Email rate limit exceeded', 'errors.auth.emailRateLimit'],
  ['For security purposes', 'errors.auth.waitBeforeRetry'],
]

export class AuthServiceError extends TranslatableError {
  constructor(key) {
    super(key)
    this.name = 'AuthServiceError'
  }
}

function toAuthError(error) {
  const known = KNOWN_ERRORS.find(([text]) => error.message?.includes(text))
  return new AuthServiceError(known ? known[1] : 'errors.generic')
}

export async function signUp({ email, password, fullName }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      // El enlace del email de confirmación vuelve a la aplicación.
      emailRedirectTo: window.location.origin,
    },
  })

  if (error) throw toAuthError(error)
  return data.user
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) throw toAuthError(error)
  return data.user
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()

  if (error) throw toAuthError(error)
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getSession()
  return data.session?.user ?? null
}

/** Llama a callback(user | null) en cada cambio de sesión. Devuelve la función para dejar de escuchar. */
export function onAuthChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null)
  })

  return () => data.subscription.unsubscribe()
}

/**
 * Cambia el nombre y/o el email. El email solo se envía si ha cambiado, porque
 * cada cambio de email manda un correo de confirmación a la dirección nueva.
 * Devuelve { user, emailChangePending }.
 */
export async function updateProfile({ fullName, email, currentEmail }) {
  const emailChanged = email.trim().toLowerCase() !== currentEmail.toLowerCase()
  const changes = { data: { full_name: fullName.trim() } }
  if (emailChanged) changes.email = email.trim()

  const { data, error } = await supabase.auth.updateUser(changes)

  if (error) throw toAuthError(error)
  return { user: data.user, emailChangePending: emailChanged }
}

/** Nombre a mostrar del usuario: el que eligió o, si no hay, la parte del email antes de la @. */
export function getDisplayName(user) {
  return user?.user_metadata?.full_name || user?.email?.split('@')[0] || ''
}

/** Iniciales para el avatar: "Ada Lovelace" -> "AL", "ada.lovelace" -> "AL", "ada" -> "A". */
export function getInitials(name) {
  const words = name.split(/[\s@._-]+/).filter(Boolean)
  return words
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')
}

/** Envía un código de un solo uso al email del usuario para confirmar que es él. */
export async function sendPasswordChangeCode() {
  const { error } = await supabase.auth.reauthenticate()

  if (error) throw toAuthError(error)
}

/** Cambia la contraseña. Exige el código recibido por email (reautenticación). */
export async function changePassword({ newPassword, code }) {
  const { error } = await supabase.auth.updateUser({ password: newPassword, nonce: code })

  if (error) throw toAuthError(error)
}

/** Borra la cuenta y todos sus datos. La ejecuta una Edge Function en el servidor. */
export async function deleteAccount() {
  const { error } = await supabase.functions.invoke('delete-account', { method: 'POST' })

  if (error) throw new AuthServiceError('errors.auth.deleteAccount')
}
