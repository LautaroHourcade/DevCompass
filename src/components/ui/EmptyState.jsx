export default function EmptyState({ icon, title, message, action }) {
  return (
    <section className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line px-6 py-16 text-center animate-fade-up">
      <span className="flex size-14 items-center justify-center rounded-full bg-accent-soft text-accent">
        {icon}
      </span>
      <h2 className="font-mono text-xl font-semibold">{title}</h2>
      <p className="max-w-[48rem] text-sm text-muted">{message}</p>
      {action && <div className="mt-2">{action}</div>}
    </section>
  )
}
