import {
  BookmarkIcon,
  CompareIcon,
  DashboardIcon,
  ListIcon,
  SearchIcon,
  TagIcon,
  UserIcon,
} from '../components/ui/Icons'

// Secciones de la app. bearing: rumbo (en grados) al que apunta la aguja de la brújula en cada una.
// requiresAuth: solo se muestra con sesión iniciada.
export const NAV_ITEMS = [
  { to: '/', label: 'Explorar', Icon: SearchIcon, bearing: 0, requiresAuth: false },
  { to: '/panel', label: 'Panel', Icon: DashboardIcon, bearing: 60, requiresAuth: true },
  { to: '/guardados', label: 'Guardados', Icon: BookmarkIcon, bearing: 120, requiresAuth: true },
  { to: '/listas', label: 'Listas', Icon: ListIcon, bearing: 180, requiresAuth: true },
  { to: '/etiquetas', label: 'Etiquetas', Icon: TagIcon, bearing: 240, requiresAuth: true },
  { to: '/comparar', label: 'Comparar', Icon: CompareIcon, bearing: 300, requiresAuth: true },
]

const PROFILE_ITEM = { to: '/perfil', label: 'Perfil', Icon: UserIcon, bearing: 330 }

/** La sección a la que pertenece una ruta (/listas/123 -> Listas). Devuelve null si no es ninguna. */
export function getSectionForPath(pathname) {
  if (pathname === '/') return NAV_ITEMS[0]
  if (pathname.startsWith(PROFILE_ITEM.to)) return PROFILE_ITEM
  return NAV_ITEMS.find((item) => item.to !== '/' && pathname.startsWith(item.to)) ?? null
}

/** Rumbo en formato de instrumento: 60 -> "060°". */
export function formatBearing(bearing) {
  return `${String(bearing).padStart(3, '0')}°`
}
