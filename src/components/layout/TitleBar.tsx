type TitleBarProps = {
  title: string
}

/** Barra de título de la "ventana" del IDE (solo escritorio) */
function TitleBar({ title }: TitleBarProps) {
  return (
    <header className="hidden h-9 shrink-0 items-center gap-3.5 border-b border-line bg-panel px-3.5 text-xs text-muted md:flex">
      <div className="flex gap-1.75">
        <i className="size-2.75 rounded-full bg-[#ff5f57]" />
        <i className="size-2.75 rounded-full bg-[#febc2e]" />
        <i className="size-2.75 rounded-full bg-[#28c840]" />
      </div>
      <p className="flex-1 text-center font-mono">
        <b className="font-medium text-text">dev-clicker</b> — {title}
      </p>
      <span className="rounded-full border border-green/25 bg-green/10 px-2.5 py-0.5 font-mono text-[11px] text-green">
        Etapa 1 · Freelancer
      </span>
    </header>
  )
}

export default TitleBar
