import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'devcompass-theme'

// index.html ya aplica la clase .dark antes de pintar; aquí solo la leemos.
function getInitialTheme() {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')

    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // Sin almacenamiento disponible el tema funciona igual durante la sesión.
    }
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }, [])

  return { theme, toggleTheme }
}
