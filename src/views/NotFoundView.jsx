import { Link } from 'react-router-dom'
import EmptyState from '../components/ui/EmptyState'
import { CompassMark } from '../components/ui/Icons'
import { buttonClasses } from '../components/ui/buttonStyles'

export default function NotFoundView() {
  return (
    <EmptyState
      icon={<CompassMark className="size-8 text-fg" bearing={225} />}
      title="Rumbo perdido: esta página no existe"
      message="La página que buscas no está aquí. Vuelve a Explorar para seguir descubriendo repositorios."
      action={
        <Link to="/" className={buttonClasses({ variant: 'primary' })}>
          Ir a Explorar
        </Link>
      }
    />
  )
}
