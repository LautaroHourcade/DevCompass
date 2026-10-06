// Tarjeta "fantasma" que se muestra mientras cargan los resultados.
export default function SkeletonCard() {
  return (
    <article
      aria-hidden="true"
      className="flex h-full flex-col gap-4 rounded-xl border border-line bg-surface p-5 animate-shimmer"
    >
      <div className="flex items-center gap-3">
        <span className="size-8 rounded-full bg-surface-2" />
        <div className="flex flex-1 flex-col gap-2">
          <span className="h-3 w-1/3 rounded bg-surface-2" />
          <span className="h-4 w-2/3 rounded bg-surface-2" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="h-3 w-full rounded bg-surface-2" />
        <span className="h-3 w-5/6 rounded bg-surface-2" />
      </div>
      <div className="mt-auto flex gap-4">
        <span className="h-3 w-12 rounded bg-surface-2" />
        <span className="h-3 w-12 rounded bg-surface-2" />
        <span className="h-3 w-12 rounded bg-surface-2" />
      </div>
    </article>
  )
}
