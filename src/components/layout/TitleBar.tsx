import type { EditorId } from '../../data/editors'

type TitleBarProps = {
  editor: EditorId
  title: string
  /** Hay un contrato con código sin entregar */
  modified: boolean
}

/** Barra de título de la "ventana" (solo escritorio). Cada editor tiene la suya */
function TitleBar({ editor, title, modified }: TitleBarProps) {
  if (editor === 'nano') {
    return (
      <header className="hidden h-6.5 shrink-0 items-center justify-between bg-text px-3 font-mono text-xs text-bg md:flex">
        <span>nano 7.2</span>
        <span>{title}</span>
        <span>{modified ? 'Modificado' : ''}</span>
      </header>
    )
  }

  if (editor === 'bloc') {
    return (
      <header className="hidden h-8 shrink-0 items-center gap-2 bg-linear-to-r from-[#0a246a] via-[#3a6ea5] to-[#a6caf0] px-2.5 text-xs font-bold text-white md:flex">
        <span>📝</span>
        <span className="flex-1">
          {modified ? '*' : ''}
          {title} - Bloc de notas
        </span>
        {['—', '▢', '✕'].map((symbol) => (
          <span
            key={symbol}
            className="grid h-4 w-4.5 place-items-center border border-t-white border-r-[#404040] border-b-[#404040] border-l-white bg-[#d4d0c8] text-[10px] text-black"
          >
            {symbol}
          </span>
        ))}
      </header>
    )
  }

  if (editor === 'notepad') {
    return (
      <header className="hidden h-8 shrink-0 items-center gap-2 bg-linear-to-b from-[#3d8ff5] via-[#0a5fd8] to-[#0653c9] px-2.5 text-xs font-bold text-white md:flex">
        <span>📒</span>
        <span className="flex-1">
          {modified ? '*' : ''}C:\\clientes\\{title} - Notepad
        </span>
        {['—', '▢', '✕'].map((symbol) => (
          <span
            key={symbol}
            className={`grid h-4.5 w-5 place-items-center rounded-[3px] border border-white text-[10px] ${
              symbol === '✕' ? 'bg-linear-to-b from-[#f08a6a] to-[#d2401c]' : 'bg-linear-to-b from-[#5aa0ff] to-[#1a62d8]'
            }`}
          >
            {symbol}
          </span>
        ))}
      </header>
    )
  }

  if (editor === 'cladex') {
    return (
      <header className="hidden h-7.5 shrink-0 items-center justify-between border-b border-line bg-panel px-3.5 font-mono text-xs text-muted md:flex">
        <span>
          <span className="text-orange">✻</span> cladex — ~/dev-clicker · {title}
        </span>
        <span className="rounded-full border border-orange/35 bg-orange/10 px-2.5 py-0.5 text-[11px] text-orange">
          Etapa 1 · Freelancer
        </span>
      </header>
    )
  }

  // IDE completo (VS Code en adelante)
  return (
    <header className="hidden h-9 shrink-0 items-center gap-3.5 border-b border-line bg-panel px-3.5 text-xs text-muted md:flex">
      <div className="flex gap-1.75">
        <i className="size-2.75 rounded-full bg-[#ff5f57]" />
        <i className="size-2.75 rounded-full bg-[#febc2e]" />
        <i className="size-2.75 rounded-full bg-[#28c840]" />
      </div>
      <p className="flex-1 text-center font-mono">
        <b className="font-medium text-text">dev-clicker</b> — {title}
        {editor === 'sublime' && <span className="opacity-55"> (UNREGISTERED)</span>}
      </p>
      <span className="rounded-full border border-green/25 bg-green/10 px-2.5 py-0.5 font-mono text-[11px] text-green">
        Etapa 1 · Freelancer
      </span>
    </header>
  )
}

export default TitleBar
