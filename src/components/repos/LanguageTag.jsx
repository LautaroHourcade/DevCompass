import { getLanguageColor } from '../../constants/languageColors'

/** Punto de color + nombre del lenguaje. */
export default function LanguageTag({ language }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="size-2.5 rounded-full"
        style={{ backgroundColor: getLanguageColor(language) }}
        aria-hidden="true"
      />
      {language}
    </span>
  )
}
