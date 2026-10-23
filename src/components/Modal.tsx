import { useEffect, useRef } from 'react'
import type { MouseEvent, ReactNode } from 'react'

interface Props {
  title: string
  onClose: () => void
  children: ReactNode
}

/**
 * Обёртка над «родным» тегом <dialog>.
 * Браузер сам умеет то, что руками делать долго:
 * — затемняет фон,
 * — закрывает по Escape,
 * — удерживает фокус внутри окна.
 */
export function Modal({ title, onClose, children }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (!dialog.open) {
      dialog.showModal()
      // showModal сам ставит фокус на первую кнопку (крестик).
      // Для формы удобнее, чтобы курсор сразу был в первом поле.
      dialog.querySelector<HTMLElement>('input, select, textarea')?.focus()
    }
  }, [])

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    // Клик мимо содержимого приходит на сам <dialog>
    if (event.target === dialogRef.current) {
      onClose()
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      onClose={onClose}
      onClick={handleBackdropClick}
      aria-label={title}
    >
      <div className="modal-body">
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="icon-button" onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </div>
        {children}
      </div>
    </dialog>
  )
}
