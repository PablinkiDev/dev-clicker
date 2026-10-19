import { useEffect } from 'react'
import type { Notice } from '../../game/reducer'

type ToastProps = {
  notice: Notice
  onDismiss: () => void
}

/** Aviso flotante: verde al cobrar, cartel rojo al fallar. Se va solo a los 4 segundos */
function Toast({ notice, onDismiss }: ToastProps) {
  useEffect(() => {
    const id = setTimeout(onDismiss, 4000)
    return () => clearTimeout(id)
  }, [notice, onDismiss])

  const isError = notice.kind === 'error'

  return (
    <div
      role={isError ? 'alert' : 'status'}
      onClick={onDismiss}
      className={`fixed top-3 left-1/2 z-50 flex w-max max-w-[calc(100vw-32px)] -translate-x-1/2 cursor-pointer items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold shadow-[0_14px_40px_rgba(0,0,0,.45)] md:top-12 ${
        isError ? 'border border-[#ff8a9a] bg-[#b4233a] text-white' : 'border border-green/40 bg-panel-2 text-green'
      }`}
    >
      <span className={`grid size-5.5 shrink-0 place-items-center rounded-full font-extrabold ${isError ? 'bg-white/20' : 'bg-green/15'}`}>
        {isError ? '✗' : '✓'}
      </span>
      {notice.text}
    </div>
  )
}

export default Toast
