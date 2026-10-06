import { useEffect, useRef } from 'react'

/**
 * Ventana modal basada en <dialog>: accesible (foco atrapado, Esc para cerrar)
 * y con el mismo estilo que el resto de la web.
 */
export default function Modal({ isOpen, onClose, labelledBy, children }) {
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
      className="m-auto max-h-[calc(100dvh-3.2rem)] w-[calc(100%-3.2rem)] max-w-modal overflow-y-auto rounded-2xl border border-line bg-surface p-0 text-fg shadow-2xl animate-pop-in"
    >
      <div className="p-6 sm:p-8">{children}</div>
    </dialog>
  )
}
