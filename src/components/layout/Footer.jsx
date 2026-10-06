export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-page flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-muted sm:flex-row sm:px-6">
        <p className="font-mono">
          <span className="text-accent">$</span> devcompass --version 0.1.0
        </p>
        <p>Datos obtenidos de la API pública de GitHub.</p>
      </div>
    </footer>
  )
}
