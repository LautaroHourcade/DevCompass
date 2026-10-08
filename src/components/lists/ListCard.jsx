import { Link } from 'react-router-dom'
import { EditIcon, ListIcon, TrashIcon } from '../ui/Icons'
import { buttonClasses } from '../ui/buttonStyles'
import { formatRelativeDate } from '../../utils/formatters'

export default function ListCard({ list, index, onEdit, onDelete }) {
  const repoCount = list.savedIds.length

  function handleEdit(event) {
    event.preventDefault()
    onEdit(list)
  }

  function handleDelete(event) {
    event.preventDefault()
    onDelete(list)
  }

  return (
    <article
      style={{ animationDelay: `${Math.min(index, 12) * 30}ms` }}
      className="flex h-full flex-col gap-4 rounded-xl border border-line bg-surface p-5 shadow-sm transition-[border-color,box-shadow,transform] duration-200 animate-fade-up hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-lg"
    >
      <header className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
          <ListIcon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-mono text-lg font-semibold">
            <Link to={`/listas/${list.id}`} className="transition-colors hover:text-accent">
              {list.name}
            </Link>
          </h2>
          <p className="text-xs text-muted">
            {repoCount === 1 ? '1 repositorio' : `${repoCount} repositorios`} · actualizada{' '}
            <time dateTime={list.updatedAt}>{formatRelativeDate(list.updatedAt)}</time>
          </p>
        </div>
      </header>

      <p className="line-clamp-3 flex-1 text-sm text-muted">{list.description || 'Sin descripción.'}</p>

      <footer className="flex gap-2 border-t border-line pt-4">
        <Link to={`/listas/${list.id}`} className={buttonClasses({ size: 'sm', className: 'flex-1' })}>
          Abrir
        </Link>
        <button
          type="button"
          onClick={handleEdit}
          aria-label={`Editar la lista ${list.name}`}
          title="Editar"
          className={buttonClasses({ variant: 'ghost', size: 'sm' })}
        >
          <EditIcon className="size-4" />
        </button>
        <button
          type="button"
          onClick={handleDelete}
          aria-label={`Eliminar la lista ${list.name}`}
          title="Eliminar"
          className={buttonClasses({ variant: 'ghost', size: 'sm', className: 'hover:text-danger' })}
        >
          <TrashIcon className="size-4" />
        </button>
      </footer>
    </article>
  )
}
