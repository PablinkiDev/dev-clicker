import MacroCursor from '../MacroCursor'
import TutorialBubble from '../TutorialBubble'
import { formatRate } from '../../game/format'
type ActionDockProps = {
  hasContract: boolean
  isComplete: boolean
  isWorkView: boolean
  perClick: number
  onProgram: () => void
  onDeliver: () => void
  /** Último crítico, para el "+N" flotante: el id cambia en cada crítico y reinicia la animación */
  critPop: { id: number; lines: number } | null
  /** ⚡ Habilidades aprendidas (el Foco y las de F2), en el orden de sus teclas */
  abilities: AbilitySlot[]
  onAbility: (id: string) => void
  /** 🧭 Tutorial (C2): qué botón señalar */
  tutorial?: 'click' | 'deliver' | null
  /** 🤖 Clics por segundo del Macro mientras trabaja (0 = apagado o sin contrato) */
  macroRate?: number
  /** Tus clics en total: cada clic nuevo prende teclas del teclado */
  clicks?: number
}

/** Lo que "tipeás": las teclas que se prenden son las letras de esto */
const SNIPPET = 'constappexpressifbugfixreturnressendholadeployawaitfetchusestatemap'
const KEY_ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm']
/** Cuántas filas se ven: en el celular 1, en la compu 2 y en pantallas grandes y altas 3 */
const ROW_CLASS = ['flex', 'hidden md:flex', 'hidden xl:[@media(min-height:880px)]:flex']

/** Una habilidad en la barra: lista, activa (con sus segundos) o recargándose */
export type AbilitySlot = {
  id: string
  icon: string
  name: string
  key: string
  /** Texto corto para el botón cuando está lista ("Foco") */
  label: string
  description: string
  status: 'ready' | 'active' | 'cooldown'
  seconds: number
}

const SLOT_STYLE: Record<AbilitySlot['status'], string> = {
  ready: 'border border-purple/50 bg-purple/10 text-purple hover:bg-purple/20',
  active: 'border border-yellow/60 bg-yellow/15 text-yellow',
  cooldown: 'cursor-default border border-line-2 bg-panel-2 text-faint',
}

/** Botones principales: Programar y git push */
function ActionDock({
  hasContract,
  isComplete,
  isWorkView,
  perClick,
  onProgram,
  onDeliver,
  critPop,
  abilities,
  onAbility,
  tutorial = null,
  macroRate = 0,
  clicks = 0,
}: ActionDockProps) {
  const canProgram = hasContract && !isComplete && isWorkView

  let hint = `+${formatRate(perClick)} ${perClick === 1 ? 'línea' : 'líneas'}`
  if (!hasContract) hint = 'elegí un contrato primero'
  else if (isComplete) hint = 'objetivo alcanzado'
  else if (!isWorkView) hint = 'volvé al código'

  // Las 3 letras de este clic (salen de clicks, así no hace falta estado)
  const lit = new Set(Array.from({ length: 3 }, (_, i) => SNIPPET[(clicks * 3 + i) % SNIPPET.length]))

  return (
    <div
      className={`relative grid shrink-0 grid-cols-[1fr_auto] ${abilities.length ? 'md:grid-cols-[1fr_auto_auto]' : ''} gap-2.5 border-t border-line bg-panel px-2.5 pt-2.5 pb-3 md:gap-3 md:px-4.5 md:pt-3 md:pb-3.5`}
    >
      {/* ⌨️ Programar (H5.5): un teclado entero es el botón y la barra espaciadora dice qué hace */}
      <button
        type="button"
        onClick={onProgram}
        disabled={!canProgram}
        aria-label={`Programar: ${hint}`}
        className="group relative flex cursor-pointer flex-col items-center gap-1 overflow-hidden rounded-2xl border border-line-2 bg-panel-2 px-2 pt-2 pb-2.5 disabled:cursor-default"
      >
        {KEY_ROWS.map((row, r) => (
          <span key={row} className={`${ROW_CLASS[r]} w-full justify-center gap-1`} aria-hidden>
            {[...row].map((c) => (
              <span
                key={canProgram && lit.has(c) ? `${c}-${clicks}` : c}
                className={`grid h-4.5 max-w-8 min-w-0 flex-1 place-items-center rounded-[5px] bg-panel-3 font-mono text-[9px] font-bold text-faint uppercase shadow-[0_2px_0_rgba(0,0,0,.35)] md:h-5 lg:max-w-9 ${
                  canProgram && lit.has(c) && clicks > 0 ? 'animate-keyhit' : ''
                } group-disabled:opacity-50`}
              >
                {c}
              </span>
            ))}
          </span>
        ))}
        <span
          key={canProgram ? clicks : 'off'}
          className={`mt-0.5 flex h-9 w-full max-w-130 items-center justify-center gap-3 rounded-lg font-extrabold md:h-10 ${
            canProgram
              ? 'bg-linear-to-b from-[#6dffa0] to-[#2fd36b] text-[#062312] shadow-[0_4px_0_#17803f] group-active:translate-y-1 group-active:shadow-[0_1px_0_#17803f]'
              : 'bg-panel-3 text-faint shadow-[0_4px_0_rgba(0,0,0,.35)]'
          } ${canProgram && clicks > 0 ? 'animate-keypress' : ''}`}
        >
          <span className="text-base md:text-lg">Programar</span>
          <span className="font-mono text-[11px] font-semibold opacity-75">{hint}</span>
          <kbd className="hidden rounded-md border border-black/10 bg-black/15 px-1.5 py-0.5 font-mono text-[10px] font-bold md:inline">
            ESPACIO
          </kbd>
        </span>
        <MacroCursor rate={macroRate} />
      </button>

      {tutorial === 'click' && canProgram && (
        <TutorialBubble
          text="👇 Hacé clic acá (o apretá ESPACIO) para escribir código"
          className="-top-12 left-[30%] -translate-x-1/2"
        />
      )}
      {tutorial === 'deliver' && (
        <TutorialBubble text="¡Listo! 👇 Entregalo con git push" className="-top-12 right-3 md:right-8" />
      )}

      {critPop && (
        <span
          key={critPop.id}
          className="pointer-events-none absolute -top-3 left-1/3 -translate-x-1/2 animate-float-up font-mono text-xl font-extrabold text-yellow [text-shadow:0_0_16px_rgba(255,203,107,.8)]"
        >
          ⚡ ¡Crítico! +{formatRate(critPop.lines)}
        </span>
      )}

      {abilities.length > 0 && (
        // En el celular va en su propia fila, arriba; en la compu, entre Programar y git push
        <div className="order-first col-span-2 flex justify-center gap-1.5 md:order-none md:col-span-1">
          {abilities.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => onAbility(a.id)}
              disabled={a.status !== 'ready'}
              title={`${a.name} (tecla ${a.key}): ${a.description}`}
              className={`relative flex h-11 w-14 cursor-pointer flex-col items-center justify-center rounded-xl font-mono text-[10px] font-bold md:h-18 md:w-16 md:rounded-2xl ${SLOT_STYLE[a.status]}`}
            >
              <span className="text-base md:text-xl">{a.icon}</span>
              {a.status === 'ready' ? a.label : `${a.seconds}s`}
              <kbd className="absolute top-0.5 right-1 hidden text-[9px] opacity-60 md:block">{a.key}</kbd>
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onDeliver}
        disabled={!isComplete}
        className={`flex min-h-16 min-w-0 cursor-pointer items-center gap-3 rounded-2xl px-4 text-left font-mono text-[13px] font-bold transition-[transform,box-shadow] duration-75 md:min-w-42 md:px-5 ${
          isComplete
            ? 'animate-pulse bg-linear-to-b from-[#ffd98a] to-[#ffb938] text-[#2b1a00] shadow-[0_5px_0_#a8700f] active:translate-y-1 active:shadow-[0_1px_0_#a8700f]'
            : 'cursor-default border border-line-2 bg-panel-2 text-faint'
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          className="size-5.5 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
        <span>
          git push
          <small className="hidden font-ui text-[11px] font-semibold opacity-80 md:block">Entregar al cliente</small>
        </span>
      </button>
    </div>
  )
}

export default ActionDock
