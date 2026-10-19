import type { ReactNode } from 'react'

type ScreenHeaderProps = {
  icon: string
  title: string
  /** Lo que va adentro de las etiquetas del componente: <ScreenHeader>esto</ScreenHeader> */
  children: ReactNode
}

/** Encabezado común de las pantallas Ofertas, Equipo y Mejoras */
function ScreenHeader({ icon, title, children }: ScreenHeaderProps) {
  return (
    <div className="mb-4 flex items-center gap-3 border-b border-line px-1 pt-2 pb-4 md:gap-4.5 md:pt-3.5 md:pb-5">
      <div className="grid size-11 shrink-0 place-items-center rounded-2xl border border-green/25 bg-[radial-gradient(circle_at_30%_20%,rgba(90,247,142,.25),rgba(90,247,142,.04))] font-mono text-base font-extrabold text-green md:size-14.5 md:text-xl">
        {icon}
      </div>
      <div className="min-w-0">
        <h2 className="text-[17px] font-extrabold tracking-tight md:text-xl">{title}</h2>
        <p className="mt-1 text-xs text-muted md:text-[13px]">{children}</p>
      </div>
    </div>
  )
}

export default ScreenHeader
