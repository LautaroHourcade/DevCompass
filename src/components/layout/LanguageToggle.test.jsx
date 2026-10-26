import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import LanguageToggle from './LanguageToggle'
import { useTranslation } from '../../hooks/useTranslation'

function Greeting() {
  const { t } = useTranslation()
  return <p>{t('nav.saved')}</p>
}

describe('LanguageToggle', () => {
  it('cambia el texto visible entre español e inglés', async () => {
    const user = userEvent.setup()
    render(
      <>
        <LanguageToggle />
        <Greeting />
      </>,
    )

    expect(screen.getByText('Guardados')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Switch to English' }))
    expect(screen.getByText('Saved')).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('en')

    await user.click(screen.getByRole('button', { name: 'Cambiar a español' }))
    expect(screen.getByText('Guardados')).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('es')
  })
})
