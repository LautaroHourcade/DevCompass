// Clases compartidas por todos los campos de formulario (filtros, login, perfil, listas...).

export const CONTROL_CLASSES =
  'h-10 w-full rounded-lg border border-line-strong bg-surface px-3 text-sm text-fg shadow-card ' +
  'transition-[border-color,box-shadow] duration-150 ease-out placeholder:text-subtle ' +
  'hover:border-[color-mix(in_oklab,var(--color-fg),transparent_70%)] ' +
  'focus:border-accent focus:ring-4 focus:ring-accent-soft focus:outline-none'

export const INVALID_CONTROL_CLASSES = 'border-danger hover:border-danger focus:border-danger focus:ring-danger/15'

export const LABEL_CLASSES = 'text-xs font-medium text-muted'
