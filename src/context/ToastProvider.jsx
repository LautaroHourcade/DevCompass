import { useCallback, useMemo, useState } from 'react'
import { ToastContext } from './ToastContext'
import ToastList from '../components/ui/ToastList'

const TOAST_DURATION_MS = 3500
// Duración de la salida (debe coincidir con la transición de ToastList).
const TOAST_EXIT_MS = 160

let nextToastId = 1

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  // Primero se marca como "saliendo" (se anima) y después se quita de la lista.
  const dismissToast = useCallback((id) => {
    setToasts((current) => current.map((toast) => (toast.id === id ? { ...toast, isLeaving: true } : toast)))
    setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, TOAST_EXIT_MS)
  }, [])

  /** type: 'success' | 'info' | 'error' */
  const showToast = useCallback(
    (message, type = 'success') => {
      const id = nextToastId++
      setToasts((current) => [...current, { id, message, type, isLeaving: false }])
      setTimeout(() => dismissToast(id), TOAST_DURATION_MS)
    },
    [dismissToast],
  )

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastList toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  )
}
