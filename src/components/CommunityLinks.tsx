// 💬☕ Feedback y donaciones (v1.0): botones que abren el formulario y Mercado Pago en otra pestaña
import { DONATE_URL, FEEDBACK_URL } from '../data/links'

const LINKS = [
  {
    url: FEEDBACK_URL,
    icon: '💬',
    label: 'Dejanos tu opinión',
    hint: 'Un formulario cortito: qué te gustó y qué agregarías',
  },
  {
    url: DONATE_URL,
    icon: '☕',
    label: 'Invitame un café',
    hint: 'Una donación por Mercado Pago, si el juego te gustó',
  },
]

type CommunityLinksProps = {
  /** card: botones grandes con explicación (Ajustes) · inline: chiquitos (ayuda) */
  variant: 'card' | 'inline'
  className?: string
}

function CommunityLinks({ variant, className = '' }: CommunityLinksProps) {
  // En producción, sin link no hay botón; en desarrollo se ve apagado para acordarse de completarlo
  const links = LINKS.filter((l) => l.url || import.meta.env.DEV)
  if (!links.length) return null

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {links.map((l) =>
        l.url ? (
          <a
            key={l.label}
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            title={l.hint}
            className={
              variant === 'card'
                ? 'flex min-w-56 flex-1 items-center gap-3 rounded-xl border border-line-2 bg-panel px-3.5 py-2.5 transition-colors hover:border-green/60 hover:bg-green/5'
                : 'rounded-lg border border-line-2 px-2.5 py-1 text-xs font-bold text-muted transition-colors hover:border-green/60 hover:text-text'
            }
          >
            <span className={variant === 'card' ? 'text-2xl' : ''}>{l.icon}</span>
            {variant === 'card' ? (
              <span className="min-w-0">
                <b className="block text-sm">{l.label} ↗</b>
                <span className="text-xs text-muted">{l.hint}</span>
              </span>
            ) : (
              ` ${l.label}`
            )}
          </a>
        ) : (
          <span
            key={l.label}
            title="Falta completar el link en src/data/links.ts (en producción este botón no aparece)"
            className="rounded-lg border border-dashed border-red/50 px-2.5 py-1 font-mono text-[11px] text-red"
          >
            {l.icon} {l.label}: falta el link
          </span>
        ),
      )}
    </div>
  )
}

export default CommunityLinks
