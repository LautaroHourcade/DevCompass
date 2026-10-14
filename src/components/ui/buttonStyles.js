// Clases compartidas para que botones y enlaces con aspecto de botón sean iguales.
// Al pulsar, el botón se encoge un 3 %: la interfaz confirma que ha recibido el clic.
// Las transiciones nombran sus propiedades (nunca "all") y el hover de Tailwind 4 solo
// se aplica en dispositivos con puntero, así en móvil no se quedan estados pegados.

const BASE_CLASSES =
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap cursor-pointer select-none ' +
  'transition-[background-color,border-color,color,box-shadow,scale] duration-150 ease-out ' +
  'active:scale-[0.97] active:duration-100 disabled:pointer-events-none disabled:opacity-50'

const VARIANT_CLASSES = {
  // Acción principal: relleno lima con texto oscuro y canto superior iluminado.
  primary:
    'bg-lime text-on-lime shadow-[inset_0_1px_0_rgb(255_255_255/0.45),0_0_0_1px_rgb(0_0_0/0.08)] ' +
    'hover:bg-[color-mix(in_oklab,var(--color-lime),white_14%)]',
  secondary:
    'border border-line-strong bg-surface text-fg shadow-card hover:border-[color-mix(in_oklab,var(--color-fg),transparent_70%)] hover:bg-surface-2',
  ghost: 'text-muted hover:bg-surface-2 hover:text-fg',
  danger: 'bg-danger text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.2)] hover:brightness-110',
  'danger-outline': 'border border-danger/40 bg-surface text-danger hover:border-danger hover:bg-danger/5',
}

const SIZE_CLASSES = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  icon: 'size-9',
}

export function buttonClasses({ variant = 'secondary', size = 'md', className = '' } = {}) {
  return `${BASE_CLASSES} ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`
}
