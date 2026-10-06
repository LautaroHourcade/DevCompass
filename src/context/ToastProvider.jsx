import { useCallback, useMemo, useState } from 'react'
import { ToastContext } from './ToastContext'
import ToastList from '../components/ui/ToastList'

const TOAST_DURATION_MS = 3500

let nextToastId = 1

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  /** type: 'success' | 'info' | 'error' */
  const showToast = useCallback(
    (message, type = 'success') => {
      const id = nextToastId++
      setToasts((current) => [...current, { id, message, type }])
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
