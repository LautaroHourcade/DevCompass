// Clases compartidas para que botones y enlaces con aspecto de botón sean iguales.

const BASE_CLASSES =
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap cursor-pointer ' +
  'transition-[background-color,border-color,color,transform,filter] duration-150 ' +
  'active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50'

const VARIANT_CLASSES = {
  primary: 'bg-accent text-on-accent hover:brightness-110',
  secondary: 'border border-line bg-surface text-fg hover:border-accent hover:text-accent',
  ghost: 'text-muted hover:bg-surface-2 hover:text-fg',
}

const SIZE_CLASSES = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  icon: 'size-10',
}

export function buttonClasses({ variant = 'secondary', size = 'md', className = '' } = {}) {
  return `${BASE_CLASSES} ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`
}
