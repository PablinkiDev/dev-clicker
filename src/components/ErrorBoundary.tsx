import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { error: Error | null }

/** Descarga lo que haya guardado en localStorage, tal cual, para no perder la partida */
function downloadRawSave() {
  const raw = localStorage.getItem('dev-clicker:save')
  if (!raw) return
  const url = URL.createObjectURL(new Blob([raw], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'dev-clicker-rescate.json'
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * Si algo se rompe al dibujar, en vez de la pantalla vacía se muestra este mensaje.
 * Tiene que ser una clase: React solo permite atrapar errores de render con
 * getDerivedStateFromError/componentDidCatch, que no existen como hooks.
 */
class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Dev Clicker se rompió:', error, info.componentStack)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <main className="grid h-dvh place-items-center bg-bg p-4 font-ui text-text">
        <div className="w-full max-w-lg rounded-2xl border border-red/40 bg-panel-2 p-6">
          <p className="font-mono text-xs text-red">Uncaught Exception · 500</p>
          <h1 className="mt-1 text-xl font-extrabold">Algo se rompió. No fue tu culpa (creemos).</h1>
          <p className="mt-2 text-sm text-muted">
            Tu partida sigue guardada. Probá recargar; si vuelve a pasar, descargá la partida y mandásela al
            desarrollador junto con el mensaje de abajo.
          </p>
          <pre className="mt-4 max-h-32 overflow-auto rounded-lg bg-panel p-3 font-mono text-xs whitespace-pre-wrap text-red">
            {error.message}
          </pre>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => location.reload()}
              className="cursor-pointer rounded-lg bg-green px-4 py-2 text-sm font-extrabold text-[#062312]"
            >
              ↻ Recargar
            </button>
            <button
              type="button"
              onClick={downloadRawSave}
              className="cursor-pointer rounded-lg border border-line-2 bg-panel px-4 py-2 font-mono text-sm font-bold"
            >
              ⬇ Descargar partida
            </button>
          </div>
        </div>
      </main>
    )
  }
}

export default ErrorBoundary
