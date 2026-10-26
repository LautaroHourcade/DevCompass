// Preparación común de los tests (Vitest + Testing Library).
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach } from 'vitest'
import { setLanguage } from '../i18n/store'

// jsdom simula un navegador en inglés: los tests usan el español, el idioma por defecto de la app.
beforeEach(() => {
  setLanguage('es')
})

afterEach(() => {
  cleanup()
})

// jsdom no implementa por completo <dialog>: lo justo para abrir y cerrar modales en los tests.
if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute('open', '')
  }
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute('open')
  }
}

// scrollIntoView no existe en jsdom (lo usa el desplegable para mostrar la opción activa).
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = function scrollIntoView() {}
}
