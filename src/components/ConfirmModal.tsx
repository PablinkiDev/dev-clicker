// ⚠️ Confirmaciones y avisos del juego (v1.0): reemplazan a window.confirm/alert, que se ven feos y frenan todo
import { useEffect, useRef } from 'react'

export type Dialog = {
  icon: string
  title: string
  text: string
  /** Texto del botón principal */
  confirm: string
  /** Rojo: para lo que no se puede deshacer */
  danger?: boolean
  /** Sin onConfirm es solo un aviso: un único botón que cierra */
  onConfirm?: () => void
}

type ConfirmModalProps = { dialog: Dialog; onClose: () => void }

function ConfirmModal({ dialog, onClose }: ConfirmModalProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)
  const confirmRef = useRef<HTMLButtonElement>(null)
  const isAlert = !dialog.onConfirm

  // Esc cierra; el foco arranca en "Cancelar" si es peligroso (así un Enter apurado no borra nada)
  useEffect(() => {
    ;(dialog.danger && !isAlert ? cancelRef : confirmRef).current?.focus()
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [dialog, isAlert, onClose])

  return (
    <div className="fixed inset-0 z-70 grid place-items-center bg-black/60 p-3 backdrop-blur-sm" onClick={onClose}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-text"
        onClick={(event) => event.stopPropagation()}
        className={`w-full max-w-md animate-pop rounded-2xl border bg-panel-2 p-5 shadow-2xl ${
          dialog.danger ? 'border-red/50' : 'border-line-2'
        }`}
      >
        <div className="flex gap-3.5">
          <span
            className={`grid size-11 shrink-0 place-items-center rounded-xl text-2xl ${
              dialog.danger ? 'bg-red/15' : 'bg-panel-3'
            }`}
          >
            {dialog.icon}
          </span>
          <div className="min-w-0">
            <h2 id="confirm-title" className="text-lg font-extrabold">
              {dialog.title}
            </h2>
            <p id="confirm-text" className="mt-1 text-sm text-muted">
              {dialog.text}
            </p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          {!isAlert && (
            <button
              ref={cancelRef}
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-xl border border-line-2 px-4 py-2 text-sm font-bold text-muted hover:bg-panel-3 hover:text-text"
            >
              Cancelar
            </button>
          )}
          <button
            ref={confirmRef}
            type="button"
            onClick={() => {
              onClose()
              dialog.onConfirm?.()
            }}
            className={`cursor-pointer rounded-xl px-4 py-2 text-sm font-extrabold ${
              dialog.danger ? 'bg-red text-[#2a0a0f]' : 'bg-green text-[#062312]'
            }`}
          >
            {dialog.confirm}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
