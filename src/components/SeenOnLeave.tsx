// 🆕 H4: al salir de una pantalla (o pestaña), lo nuevo que había ahí queda visto.
import { useEffect, useRef } from 'react'

type SeenOnLeaveProps = {
  /** Lo nuevo que se está mostrando ahora */
  keys: string[]
  onSeen: (keys: string[]) => void
}

/** No dibuja nada: solo avisa al desmontarse (cambiar de pestaña o de pantalla) */
function SeenOnLeave({ keys, onSeen }: SeenOnLeaveProps) {
  const latest = useRef({ keys, onSeen })
  useEffect(() => {
    latest.current = { keys, onSeen }
  })
  useEffect(
    () => () => {
      const { keys: shown, onSeen: report } = latest.current
      if (shown.length > 0) report(shown)
    },
    [],
  )
  return null
}

export default SeenOnLeave
