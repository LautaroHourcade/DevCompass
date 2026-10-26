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
// labelKey: clave de traducción del nombre. requiresAuth: solo se muestra con sesión iniciada.
export const NAV_ITEMS = [
  { to: '/', labelKey: 'nav.explore', Icon: SearchIcon, bearing: 0, requiresAuth: false },
  { to: '/panel', labelKey: 'nav.dashboard', Icon: DashboardIcon, bearing: 60, requiresAuth: true },
  { to: '/guardados', labelKey: 'nav.saved', Icon: BookmarkIcon, bearing: 120, requiresAuth: true },
  { to: '/listas', labelKey: 'nav.lists', Icon: ListIcon, bearing: 180, requiresAuth: true },
  { to: '/etiquetas', labelKey: 'nav.tags', Icon: TagIcon, bearing: 240, requiresAuth: true },
  { to: '/comparar', labelKey: 'nav.compare', Icon: CompareIcon, bearing: 300, requiresAuth: true },
]

const PROFILE_ITEM = { to: '/perfil', labelKey: 'nav.profile', Icon: UserIcon, bearing: 330 }

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
