import { translate } from './store'

/**
 * Error con una clave de traducción en lugar de un texto fijo. error.message se traduce cada vez
 * que se lee, así un error que sigue en pantalla cambia de idioma junto con el resto de la interfaz.
 * Uso: throw new TranslatableError('errors.lists.load')
 */
export class TranslatableError extends Error {
  constructor(key, vars = {}) {
    super()
    this.name = 'TranslatableError'
    this.key = key
    this.vars = vars
  }

  get message() {
    return translate(this.key, this.vars)
  }
}
