import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ConfirmDialog from './ConfirmDialog'

function renderDialog(props = {}) {
  const handlers = { onConfirm: vi.fn(async () => {}), onClose: vi.fn() }
  render(
    <ConfirmDialog
      isOpen
      title="¿Eliminar tu cuenta?"
      message="Esta acción no se puede deshacer."
      confirmLabel="Eliminar cuenta"
      {...handlers}
      {...props}
    />,
  )
  return handlers
}

describe('ConfirmDialog', () => {
  it('confirma y se cierra', async () => {
    const user = userEvent.setup()
    const { onConfirm, onClose } = renderDialog()

    await user.click(screen.getByRole('button', { name: 'Eliminar cuenta' }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('con texto de confirmación, no deja confirmar hasta escribirlo exactamente', async () => {
    const user = userEvent.setup()
    const { onConfirm } = renderDialog({ confirmText: 'ELIMINAR' })
    const confirmButton = screen.getByRole('button', { name: 'Eliminar cuenta' })

    expect(confirmButton).toBeDisabled()
    await user.type(screen.getByLabelText(/Escribe "ELIMINAR"/), 'eliminar')
    expect(confirmButton).toBeDisabled()

    await user.clear(screen.getByLabelText(/Escribe "ELIMINAR"/))
    await user.type(screen.getByLabelText(/Escribe "ELIMINAR"/), 'ELIMINAR')
    expect(confirmButton).toBeEnabled()

    await user.click(confirmButton)
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('si la acción falla, muestra el error y no se cierra', async () => {
    const user = userEvent.setup()
    const { onClose } = renderDialog({
      onConfirm: vi.fn(async () => {
        throw new Error('No se pudo eliminar la cuenta.')
      }),
    })

    await user.click(screen.getByRole('button', { name: 'Eliminar cuenta' }))

    expect(await screen.findByText('No se pudo eliminar la cuenta.')).toBeInTheDocument()
    expect(onClose).not.toHaveBeenCalled()
  })
})
