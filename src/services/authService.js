import { supabase } from '../lib/supabase'

// Traduce los errores de Supabase Auth a mensajes para el usuario.
const KNOWN_ERRORS = [
  ['Invalid login credentials', 'El email o la contraseña no son correctos.'],
  ['User already registered', 'Ya existe una cuenta con ese email.'],
  ['Password should be at least', 'La contraseña debe tener al menos 6 caracteres.'],
  ['Email not confirmed', 'Confirma tu email antes de iniciar sesión.'],
  ['New password should be different', 'La nueva contraseña debe ser distinta a la actual.'],
  ['Invalid otp', 'El código no es válido o ha caducado.'],
  ['Token has expired or is invalid', 'El código no es válido o ha caducado.'],
  ['Unable to validate email address', 'El email no es válido.'],
  ['Email rate limit exceeded', 'Has pedido demasiados emails. Espera unos minutos.'],
  ['For security purposes', 'Espera unos segundos antes de volver a intentarlo.'],
]

export class AuthServiceError extends Error {
  constructor(message) {
    super(message)
    this.name = 'AuthServiceError'
  }
}

function toAuthError(error) {
  const known = KNOWN_ERRORS.find(([text]) => error.message?.includes(text))
  return new AuthServiceError(known ? known[1] : 'Ha ocurrido un error. Inténtalo de nuevo.')
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

  if (error) throw new AuthServiceError('No se pudo eliminar la cuenta. Inténtalo de nuevo.')
}
