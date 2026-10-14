import { Link } from 'react-router-dom'
import TagChip from '../tags/TagChip'
import { EditIcon, ListIcon, TagIcon, TrashIcon } from '../ui/Icons'
import { buttonClasses } from '../ui/buttonStyles'
import { formatRelativeDate } from '../../utils/formatters'

/** tags: etiquetas de la lista ya resueltas ({ id, name }). onEditTags abre el selector de etiquetas. */
export default function ListCard({ list, tags, index, onEdit, onEditTags, onDelete }) {
  const repoCount = list.savedIds.length

  function handleEdit(event) {
    event.preventDefault()
    onEdit(list)
  }

  function handleEditTags(event) {
    event.preventDefault()
    onEditTags(list)
  }

  function handleDelete(event) {
    event.preventDefault()
    onDelete(list)
  }

  return (
    <article
      style={{ animationDelay: `${(index % 8) * 40}ms` }}
      className="group relative flex h-full flex-col gap-4 rounded-xl border border-line bg-surface p-5 shadow-card transition-[border-color,background-color] duration-150 ease-out animate-fade-up hover:border-line-strong hover:bg-[color-mix(in_oklab,var(--color-surface),var(--color-fg)_2%)]"
    >
      <header className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-line-strong bg-surface-2 text-accent">
          <ListIcon className="size-[1.8rem]" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-semibold tracking-[-0.02em]">
            {/* El enlace del nombre cubre toda la tarjeta; los botones del pie quedan por encima */}
            <Link
              to={`/listas/${list.id}`}
              className="transition-colors duration-150 group-hover:text-accent focus-visible:outline-none after:absolute after:inset-0 after:rounded-xl after:content-[''] focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-accent"
            >
              {list.name}
            </Link>
          </h2>
          <p className="font-mono text-xs text-muted tabular-nums">
            {repoCount === 1 ? '1 repositorio' : `${repoCount} repositorios`} · actualizada{' '}
            <time dateTime={list.updatedAt}>{formatRelativeDate(list.updatedAt)}</time>
          </p>
        </div>
      </header>

      <div className="flex-1">
        <p className="line-clamp-3 text-sm text-muted">{list.description || 'Sin descripción.'}</p>
      </div>

      {tags.length > 0 && (
        <ul aria-label="Etiquetas de la lista" className="relative z-10 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <li key={tag.id}>
              <TagChip name={tag.name} />
            </li>
          ))}
        </ul>
      )}

      <footer className="relative z-10 flex gap-1 border-t border-line pt-3">
        <Link to={`/listas/${list.id}`} className={buttonClasses({ size: 'sm', className: 'mr-auto' })}>
          Abrir lista
        </Link>
        <button
          type="button"
          onClick={handleEditTags}
          aria-label={`Etiquetas de la lista ${list.name}`}
          title="Etiquetas"
          className={buttonClasses({ variant: 'ghost', size: 'sm' })}
        >
          <TagIcon className="size-4" />
        </button>
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
