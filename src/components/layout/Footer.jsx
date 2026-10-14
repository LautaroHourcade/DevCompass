import { CompassMark } from '../ui/Icons'

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-page flex-col items-center justify-between gap-3 px-4 py-8 text-xs text-muted sm:flex-row sm:px-6">
        <p className="flex items-center gap-2">
          <CompassMark className="size-5 text-muted" />
          <span className="font-medium text-fg">DevCompass</span>
          <span className="font-mono text-subtle">v0.2</span>
        </p>
        <p className="font-mono text-2xs tracking-[0.08em] text-subtle uppercase">
          Datos de la API pública de GitHub · Capturas diarias
        </p>
      </div>
    </footer>
  )
}
