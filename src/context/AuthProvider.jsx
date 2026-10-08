import { useEffect, useMemo, useState } from 'react'
import { AuthContext } from './AuthContext'
import { onAuthChange } from '../services/authService'

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // Hasta que Supabase confirma la sesión guardada no sabemos si hay usuario.
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Se llama al suscribirse con la sesión actual y en cada cambio (login, logout, token renovado).
    const stopListening = onAuthChange((nextUser) => {
      setUser(nextUser)
      setIsLoading(false)
    })

    return stopListening
  }, [])

  const value = useMemo(() => ({ user, isLoading }), [user, isLoading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
