// Iconos SVG propios (sin librerías externas). Heredan el color del texto.

function Icon({ children, className = 'size-4', filled = false, strokeWidth = 2 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  )
}

export function CompassIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" />
    </Icon>
  )
}

export function SearchIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </Icon>
  )
}

export function StarIcon(props) {
  return (
    <Icon {...props}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </Icon>
  )
}

export function ForkIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="6" cy="5" r="2.5" />
      <circle cx="18" cy="5" r="2.5" />
      <circle cx="12" cy="19" r="2.5" />
      <path d="M6 7.5v1.5a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V7.5" />
      <line x1="12" y1="12" x2="12" y2="16.5" />
    </Icon>
  )
}

export function IssueIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </Icon>
  )
}

export function ClockIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 14" />
    </Icon>
  )
}

export function CalendarIcon(props) {
  return (
    <Icon {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="3" x2="8" y2="7" />
      <line x1="16" y1="3" x2="16" y2="7" />
    </Icon>
  )
}

export function LicenseIcon(props) {
  return (
    <Icon {...props}>
      <line x1="12" y1="3" x2="12" y2="21" />
      <line x1="5" y1="7" x2="19" y2="7" />
      <path d="M5 7l-3 7a3 3 0 0 0 6 0z" />
      <path d="M19 7l-3 7a3 3 0 0 0 6 0z" />
      <line x1="8" y1="21" x2="16" y2="21" />
    </Icon>
  )
}

export function CodeIcon(props) {
  return (
    <Icon {...props}>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </Icon>
  )
}

export function ExternalLinkIcon(props) {
  return (
    <Icon {...props}>
      <path d="M15 3h6v6" />
      <line x1="10" y1="14" x2="21" y2="3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </Icon>
  )
}

export function LinkIcon(props) {
  return (
    <Icon {...props}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </Icon>
  )
}

export function BookmarkIcon(props) {
  return (
    <Icon {...props}>
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </Icon>
  )
}

export function SunIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </Icon>
  )
}

export function MoonIcon(props) {
  return (
    <Icon {...props}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </Icon>
  )
}

export function CloseIcon(props) {
  return (
    <Icon {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </Icon>
  )
}

export function FilterIcon(props) {
  return (
    <Icon {...props}>
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="7" y1="12" x2="17" y2="12" />
      <line x1="10" y1="18" x2="14" y2="18" />
    </Icon>
  )
}

export function ChevronDownIcon(props) {
  return (
    <Icon {...props}>
      <polyline points="6 9 12 15 18 9" />
    </Icon>
  )
}

export function CheckIcon(props) {
  return (
    <Icon {...props}>
      <polyline points="20 6 9 17 4 12" />
    </Icon>
  )
}

export function AlertIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </Icon>
  )
}

export function InfoIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </Icon>
  )
}
