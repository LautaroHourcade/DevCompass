import { describe, expect, it } from 'vitest'
import es from './translations/es'
import en from './translations/en'
import { getLanguage, setLanguage, translate } from './store'
import { TranslatableError } from './TranslatableError'

/** Todas las claves de un diccionario en formato "zona.clave". */
function collectKeys(node, prefix = '') {
  return Object.entries(node).flatMap(([key, value]) =>
    typeof value === 'string' ? [`${prefix}${key}`] : collectKeys(value, `${prefix}${key}.`),
  )
}

/** Variables ({nombre}) que usa un texto. */
function collectVariables(text) {
  return [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort()
}

describe('diccionarios', () => {
  it('español e inglés tienen exactamente las mismas claves', () => {
    expect(collectKeys(en).sort()).toEqual(collectKeys(es).sort())
  })

  it('cada traducción usa las mismas variables que el texto en español', () => {
    collectKeys(es).forEach((key) => {
      expect(collectVariables(translate(key, {}, 'en')), key).toEqual(collectVariables(translate(key, {}, 'es')))
    })
  })
})

describe('translate', () => {
  it('sustituye las variables', () => {
    expect(translate('profile.greeting', { name: 'Ada' }, 'es')).toBe('Hola, Ada')
    expect(translate('profile.greeting', { name: 'Ada' }, 'en')).toBe('Hi, Ada')
  })

  it('elige la forma plural según count', () => {
    expect(translate('lists.card.repoCount', { count: 1 }, 'en')).toBe('1 repository')
    expect(translate('lists.card.repoCount', { count: 3 }, 'en')).toBe('3 repositories')
    expect(translate('lists.card.repoCount', { count: 0 }, 'es')).toBe('0 repositorios')
  })

  it('devuelve la clave si no existe en ningún idioma', () => {
    expect(translate('no.existe', {}, 'en')).toBe('no.existe')
  })
})

describe('idioma actual', () => {
  it('setLanguage cambia el idioma y el atributo lang del documento', () => {
    setLanguage('en')
    expect(getLanguage()).toBe('en')
    expect(document.documentElement.lang).toBe('en')
    expect(translate('nav.saved')).toBe('Saved')
  })

  it('ignora idiomas que no existen', () => {
    setLanguage('fr')
    expect(getLanguage()).toBe('es')
  })

  it('TranslatableError traduce su mensaje al idioma actual cada vez que se lee', () => {
    const error = new TranslatableError('errors.lists.load')
    expect(error.message).toBe('No se pudieron cargar tus listas.')
    setLanguage('en')
    expect(error.message).toBe('Your lists could not be loaded.')
  })
})
