import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import SelectMenu from './SelectMenu'

const OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
]

// Envuelve el desplegable con su estado, como lo usa la app.
function Field({ onChange = () => {} }) {
  const [value, setValue] = useState('')
  return (
    <div className="relative">
      <span id="lang-label">Lenguaje</span>
      <SelectMenu
        id="lang"
        value={value}
        options={OPTIONS}
        labelledBy="lang-label"
        onChange={(next) => {
          setValue(next)
          onChange(next)
        }}
      />
      <button type="button">Fuera</button>
    </div>
  )
}

function getTrigger() {
  return screen.getByRole('button', { name: /Lenguaje/ })
}

describe('SelectMenu', () => {
  it('muestra el valor actual y tiene nombre accesible', () => {
    render(<Field />)
    expect(getTrigger()).toHaveAccessibleName('Lenguaje Todos')
    expect(getTrigger()).toHaveAttribute('aria-expanded', 'false')
  })

  it('se abre con un clic, marca la opción seleccionada y elige con otro clic', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Field onChange={onChange} />)

    await user.click(getTrigger())
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Todos' })).toHaveAttribute('aria-selected', 'true')

    await user.click(screen.getByRole('option', { name: 'Python' }))
    expect(onChange).toHaveBeenCalledWith('python')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(getTrigger()).toHaveTextContent('Python')
    // El foco vuelve al botón al elegir.
    expect(getTrigger()).toHaveFocus()
  })

  it('se maneja con el teclado: flechas, escribir para saltar y Enter', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Field onChange={onChange} />)

    getTrigger().focus()
    await user.keyboard('{ArrowDown}')
    const listbox = screen.getByRole('listbox')
    expect(listbox).toHaveFocus()

    await user.keyboard('{ArrowDown}')
    expect(listbox).toHaveAttribute('aria-activedescendant', screen.getByRole('option', { name: 'JavaScript' }).id)

    // Escribir "ty" salta a TypeScript.
    await user.keyboard('ty')
    expect(listbox).toHaveAttribute('aria-activedescendant', screen.getByRole('option', { name: 'TypeScript' }).id)

    await user.keyboard('{Enter}')
    expect(onChange).toHaveBeenCalledWith('typescript')
  })

  it('Esc cierra sin cambiar el valor y devuelve el foco al botón', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Field onChange={onChange} />)

    await user.click(getTrigger())
    await user.keyboard('{ArrowDown}{Escape}')

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(onChange).not.toHaveBeenCalled()
    expect(getTrigger()).toHaveFocus()
  })

  it('un clic fuera lo cierra', async () => {
    const user = userEvent.setup()
    render(<Field />)

    await user.click(getTrigger())
    await user.click(screen.getByRole('button', { name: 'Fuera' }))
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })
})
