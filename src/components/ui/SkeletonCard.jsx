// Tarjeta "fantasma" con la misma forma que RepoCard, mientras cargan los resultados.
export default function SkeletonCard() {
  return (
    <article aria-hidden="true" className="flex h-full flex-col rounded-xl border border-line bg-surface p-5 shadow-card">
      <div className="flex items-start gap-3 animate-shimmer">
        <span className="size-9 rounded-lg bg-surface-2" />
        <div className="flex flex-1 flex-col gap-2 pt-0.5">
          <span className="h-2.5 w-1/4 rounded bg-surface-2" />
          <span className="h-3.5 w-1/2 rounded bg-surface-2" />
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2 animate-shimmer">
        <span className="h-3 w-full rounded bg-surface-2" />
        <span className="h-3 w-4/5 rounded bg-surface-2" />
      </div>
      <div className="mt-5 grid grid-cols-3 border-t border-line pt-4 animate-shimmer">
        {[0, 1, 2].map((item) => (
          <span key={item} className="flex flex-col gap-2">
            <span className="h-2 w-10 rounded bg-surface-2" />
            <span className="h-3.5 w-12 rounded bg-surface-2" />
          </span>
        ))}
      </div>
    </article>
  )
}
