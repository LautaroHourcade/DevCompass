import { Navigate, Outlet, useLocation } from 'react-router-dom'
import PageLoader from '../ui/PageLoader'
import { useAuth } from '../../hooks/useAuth'

/**
 * Rutas que exigen sesión. Sin usuario redirige a /entrar recordando la ruta pedida,
 * para volver a ella después de iniciar sesión.
 */
export function ProtectedRoute() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <PageLoader label="Comprobando tu sesión…" />

  if (!user) {
    return <Navigate to="/entrar" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

/**
 * Rutas solo para visitantes (entrar, registro). Con sesión iniciada redirige a la
 * ruta que se pidió antes del login o, si no hay, a Explorar.
 */
export function PublicOnlyRoute() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <PageLoader label="Comprobando tu sesión…" />

  if (user) {
    return <Navigate to={location.state?.from ?? '/'} replace />
  }

  return <Outlet />
}
