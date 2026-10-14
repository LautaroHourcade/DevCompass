import { useEffect, useRef } from 'react'

const SIZE_CLASSES = {
  md: 'max-w-[52rem]',
  lg: 'max-w-[76rem]',
}

/**
 * Ventana modal basada en <dialog>: accesible (foco atrapado, Esc para cerrar)
 * y con el mismo estilo que el resto de la web. Entra centrada con un leve escalado
 * y sale más rápido de lo que entra (clases .dc-dialog en index.css).
 * size: 'md' (formularios y confirmaciones) o 'lg' (detalle de un repositorio).
 */
export default function Modal({ isOpen, onClose, labelledBy, size = 'md', children }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen && !dialog.open) dialog.showModal()
    if (!isOpen && dialog.open) dialog.close()
  }, [isOpen])

  // Esc: dejamos que React controle el cierre para mantener el estado sincronizado.
  function handleCancel(event) {
    event.preventDefault()
    onClose()
  }

  // Clic en el fondo oscuro (fuera del contenido) cierra el modal.
  function handleClick(event) {
    if (event.target === dialogRef.current) onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={labelledBy}
      onCancel={handleCancel}
      onClick={handleClick}
      className={`dc-dialog m-auto max-h-[calc(100dvh-3.2rem)] w-[calc(100%-2.4rem)] overflow-y-auto overscroll-contain rounded-2xl border border-line-strong bg-raised p-0 text-fg shadow-pop ${SIZE_CLASSES[size]}`}
    >
      <div className="p-5 sm:p-7">{children}</div>
    </dialog>
  )
}
