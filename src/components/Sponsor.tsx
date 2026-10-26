// 🤝 Con el apoyo de WEARESRV (H5.9): siempre visible pero chiquito (barra de título, HUD en el celular, Ajustes)
export const SPONSOR_URL = 'https://wearesrv.com/'
const TEXT = 'Con el apoyo de WEARESRV'

type SponsorProps = {
  /** bar: texto chico en la barra de título · icon: solo el logo (celular) · card: botón en Ajustes */
  variant: 'bar' | 'icon' | 'card'
  className?: string
}

function Sponsor({ variant, className = '' }: SponsorProps) {
  const link = { href: SPONSOR_URL, target: '_blank', rel: 'noopener noreferrer' } as const

  if (variant === 'icon')
    return (
      <a
        {...link}
        aria-label={TEXT}
        title={TEXT}
        className={`grid size-6 place-items-center rounded-full ${className}`}
      >
        <img src="/wearesrv.png" alt="" width={20} height={20} className="size-5" />
      </a>
    )

  if (variant === 'bar')
    return (
      <a
        {...link}
        title={TEXT}
        className={`flex shrink-0 items-center gap-1 text-[10px] whitespace-nowrap opacity-70 transition-opacity hover:opacity-100 ${className}`}
      >
        Con el apoyo de
        <img src="/wearesrv.png" alt="" width={14} height={14} className="size-3.5" />
        <b className="tracking-wider">WEARESRV</b>
      </a>
    )

  return (
    <a
      {...link}
      className={`flex w-fit items-center gap-2.5 rounded-xl border border-line-2 bg-panel-2 px-4 py-2 font-mono text-xs text-muted transition-colors hover:border-muted hover:text-text ${className}`}
    >
      Con el apoyo de
      <img src="/wearesrv.png" alt="" width={24} height={24} className="size-6" />
      <b className="tracking-wider text-text">WEARESRV</b>
    </a>
  )
}

export default Sponsor
