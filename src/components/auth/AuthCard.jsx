import { CompassMark } from '../ui/Icons'
import { useTranslation } from '../../hooks/useTranslation'

// Lo que ofrece DevCompass, con su rumbo como en la navegación.
const VALUE_POINTS = [
  { bearing: '000°', textKey: 'auth.card.discover' },
  { bearing: '120°', textKey: 'auth.card.organize' },
  { bearing: '300°', textKey: 'auth.card.track' },
]

/**
 * Pantallas de entrar y registrarse. En escritorio, dos columnas: la marca (con la aguja que se
 * asienta al cargar, una sola vez) y el formulario. En móvil solo el formulario.
 */
export default function AuthCard({ title, titleId, description, children, footer }) {
  const { t } = useTranslation()

  return (
    <div className="mx-auto grid w-full max-w-[100rem] items-center gap-12 lg:grid-cols-[1fr_44rem] lg:gap-16">
      <aside aria-hidden="true" className="relative isolate hidden flex-col gap-8 lg:flex">
        <div className="dot-grid absolute -inset-10 -z-10" />
        <CompassMark className="size-20 text-fg" needleClassName="animate-needle-settle motion-reduce:animate-none" />
        <p className="max-w-[48rem] text-4xl leading-[1.05] font-semibold tracking-[-0.04em]">
          {t('auth.card.headline')} <span className="text-muted">{t('auth.card.headlineMuted')}</span>
        </p>
        <ul className="flex max-w-[46rem] flex-col gap-4">
          {VALUE_POINTS.map(({ bearing, textKey }, index) => (
            <li
              key={bearing}
              style={{ animationDelay: `${200 + index * 60}ms` }}
              className="flex gap-4 border-t border-line pt-4 text-sm text-muted animate-fade-up"
            >
              <span className="font-mono text-xs text-accent tabular-nums">{bearing}</span>
              {t(textKey)}
            </li>
          ))}
        </ul>
      </aside>

      <section
        aria-labelledby={titleId}
        className="mx-auto flex w-full max-w-[44rem] flex-col gap-6 rounded-2xl border border-line-strong bg-surface p-6 shadow-pop animate-pop-in sm:p-8"
      >
        <header className="flex flex-col gap-2">
          <CompassMark className="mb-2 size-9 text-fg lg:hidden" />
          <h1 id={titleId} className="text-2xl font-semibold tracking-[-0.03em]">
            {title}
          </h1>
          {description && <p className="text-sm text-muted">{description}</p>}
        </header>

        {children}

        {footer && <footer className="border-t border-line pt-4 text-sm text-muted">{footer}</footer>}
      </section>
    </div>
  )
}
