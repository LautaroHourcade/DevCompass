import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import SavedFilters from './SavedFilters'
import { EMPTY_SAVED_FILTERS } from '../../constants/repoStatus'

const TAGS = [
  { id: 'tag-react', name: 'React' },
  { id: 'tag-devops', name: 'DevOps' },
]

function renderFilters(props = {}) {
  const handlers = { onChange: vi.fn(), onReset: vi.fn() }
  render(
    <SavedFilters
      filters={EMPTY_SAVED_FILTERS}
      tags={TAGS}
      resultCount={3}
      totalCount={3}
      {...handlers}
      {...props}
    />,
  )
  return handlers
}

describe('SavedFilters', () => {
  it('filtra por estado', async () => {
    const user = userEvent.setup()
    const { onChange } = renderFilters()

    await user.click(screen.getByRole('button', { name: /Estado/ }))
    await user.click(screen.getByRole('option', { name: 'En progreso' }))

    expect(onChange).toHaveBeenCalledWith('status', 'in_progress')
  })

  it('filtra por etiqueta', async () => {
    const user = userEvent.setup()
    const { onChange } = renderFilters()

    await user.click(screen.getByRole('button', { name: /Etiqueta/ }))
    await user.click(screen.getByRole('option', { name: 'DevOps' }))

    expect(onChange).toHaveBeenCalledWith('tagId', 'tag-devops')
  })

  it('solo ofrece restablecer cuando hay filtros aplicados', async () => {
    const user = userEvent.setup()
    const { onReset } = renderFilters({ filters: { status: 'completed', tagId: '' }, resultCount: 1 })

    await user.click(screen.getByRole('button', { name: /Restablecer filtros/ }))
    expect(onReset).toHaveBeenCalledTimes(1)
  })

  it('sin filtros no muestra el botón de restablecer y muestra el recuento', () => {
    renderFilters()
    expect(screen.queryByRole('button', { name: /Restablecer filtros/ })).not.toBeInTheDocument()
    expect(screen.getByText('/ 3', { exact: false })).toBeInTheDocument()
  })
})
