import { useState } from 'react'
import { Link } from 'react-router-dom'
import Modal from '../ui/Modal'
import FormAlert from '../ui/FormAlert'
import { CheckIcon, ListIcon } from '../ui/Icons'
import { buttonClasses } from '../ui/buttonStyles'
import { useTranslation } from '../../hooks/useTranslation'

/**
 * Marca o desmarca en qué listas está un repositorio guardado.
 * Cada casilla guarda el cambio al momento.
 */
export default function AddToListDialog({ repo, lists, onAdd, onRemove, onClose }) {
  const { t } = useTranslation()
  const [pendingListId, setPendingListId] = useState(null)
  const [error, setError] = useState('')

  async function handleToggle(list, isInList) {
    setPendingListId(list.id)
    setError('')

    try {
      if (isInList) {
        await onRemove(list.id, repo.savedId)
      } else {
        await onAdd(list.id, repo.savedId)
      }
    } catch (caughtError) {
      setError(caughtError.message)
    } finally {
      setPendingListId(null)
    }
  }

  function handleClose(event) {
    event.preventDefault()
    onClose()
  }

  return (
    <Modal isOpen={Boolean(repo)} onClose={onClose} labelledBy="add-to-list-title">
      {repo && (
        <div className="flex flex-col gap-5">
          <header className="flex flex-col gap-1">
            <h2 id="add-to-list-title" className="text-xl font-semibold">
              {t('saved.addToList')}
            </h2>
            <p className="font-mono text-sm text-muted">{repo.fullName}</p>
          </header>

          {error && <FormAlert type="error">{error}</FormAlert>}

          {lists.length === 0 ? (
            <FormAlert type="info">
              {t('lists.addDialog.noLists')}{' '}
              <Link to="/listas" onClick={onClose} className="font-medium text-accent hover:underline">
                {t('lists.addDialog.createFirst')}
              </Link>
              .
            </FormAlert>
          ) : (
            <fieldset className="flex flex-col gap-2">
              <legend className="sr-only">{t('nav.lists')}</legend>
              {lists.map((list) => {
                const isInList = list.savedIds.includes(repo.savedId)
                const isPending = pendingListId === list.id

                return (
                  <label
                    key={list.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                      isInList ? 'border-accent/60 bg-accent-soft/40' : 'border-line hover:border-accent/40'
                    } ${isPending ? 'opacity-60' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={isInList}
                      disabled={isPending}
                      onChange={() => handleToggle(list, isInList)}
                      className="peer sr-only"
                    />
                    <span
                      aria-hidden="true"
                      className={`flex size-5 items-center justify-center rounded border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-accent ${
                        isInList ? 'border-accent bg-accent text-on-accent' : 'border-line'
                      }`}
                    >
                      {isInList && <CheckIcon className="size-3.5" strokeWidth={3} />}
                    </span>
                    <ListIcon className="size-4 text-muted" />
                    <span className="flex-1 truncate text-sm font-medium">{list.name}</span>
                    <span className="font-mono text-xs text-muted">{list.savedIds.length}</span>
                  </label>
                )
              })}
            </fieldset>
          )}

          <footer className="flex justify-end">
            <button type="button" onClick={handleClose} className={buttonClasses()}>
              {t('lists.addDialog.done')}
            </button>
          </footer>
        </div>
      )}
    </Modal>
  )
}
