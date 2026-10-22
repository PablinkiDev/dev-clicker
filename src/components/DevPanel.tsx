// 🛠 Panel de desarrollo: atajos para probar funcionalidades sin jugar horas.
// Solo existe con `npm run dev` (import.meta.env.DEV): en el build publicado no aparece.
import { useState } from 'react'
import { MINIGAMES, type MinigameId } from '../data/minigames'
import { OFFICES } from '../data/offices'
import { STAGES } from '../data/stages'
import { formatNumber } from '../game/format'
import type { GameState } from '../game/reducer'

type DevPanelProps = {
  state: GameState
  /** Cambia campos del estado tal cual (acción 'dev' del reducer) */
  onPatch: (patch: Partial<GameState>) => void
  onStage: (stage: number) => void
  onMaxTrees: () => void
  onEvent: () => void
  /** Abre un minijuego para jugarlo ya */
  onMinigame: (game: MinigameId) => void
  onBug: () => void
  speed: number
  onSpeed: (speed: number) => void
}

const SPEEDS = [1, 5, 20, 100]

/** Fila con un número para fijar y botones para sumar rápido */
function NumberRow({
  label,
  value,
  onSet,
  steps,
}: {
  label: string
  value: number
  onSet: (value: number) => void
  steps: number[]
}) {
  const [draft, setDraft] = useState('')
  return (
    <div className="flex flex-col gap-1">
      <span className="flex justify-between text-[11px] text-muted">
        {label} <b className="text-text">{formatNumber(value)}</b>
      </span>
      <div className="flex gap-1">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="valor exacto (1e9)"
          className="min-w-0 flex-1 rounded-md border border-line-2 bg-panel px-2 py-1 font-mono text-xs"
        />
        <button
          type="button"
          onClick={() => {
            const n = Number(draft)
            if (Number.isFinite(n) && n >= 0) onSet(n)
            setDraft('')
          }}
          className="cursor-pointer rounded-md border border-line-2 px-2 text-xs hover:bg-panel-3"
        >
          Fijar
        </button>
        {steps.map((step) => (
          <button
            key={step}
            type="button"
            onClick={() => onSet(value + step)}
            className="cursor-pointer rounded-md border border-line-2 px-1.5 font-mono text-[11px] hover:bg-panel-3"
          >
            +{formatNumber(step)}
          </button>
        ))}
      </div>
    </div>
  )
}

const Btn = ({ children, onClick }: { children: string; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="cursor-pointer rounded-md border border-line-2 bg-panel px-2 py-1.5 text-left text-xs hover:bg-panel-3"
  >
    {children}
  </button>
)

function DevPanel(props: DevPanelProps) {
  const { state, onPatch } = props
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        title="Panel de desarrollo (solo en npm run dev)"
        className="fixed bottom-3 left-3 z-70 grid size-9 cursor-pointer place-items-center rounded-full border border-orange/60 bg-panel-2 text-base shadow-lg hover:bg-orange/20"
      >
        🛠
      </button>
      {open && (
        <div className="fixed bottom-14 left-3 z-70 flex max-h-[calc(100dvh-5rem)] w-80 flex-col gap-3 overflow-y-auto rounded-xl border border-orange/50 bg-panel-2 p-3 shadow-2xl">
          <p className="flex items-center justify-between font-mono text-xs font-bold text-orange">
            🛠 DEV · no aparece en producción
            <button type="button" onClick={() => setOpen(false)} className="cursor-pointer text-faint hover:text-text">
              ✕
            </button>
          </p>

          <div>
            <p className="mb-1 text-[11px] text-muted">Etapa (rearma ofertas y candidatos)</p>
            <div className="grid grid-cols-5 gap-1">
              {STAGES.map((s, i) => (
                <button
                  key={s.name}
                  type="button"
                  title={s.name}
                  onClick={() => props.onStage(i)}
                  className={`cursor-pointer rounded-md border py-1 text-sm ${
                    state.stage === i ? 'border-orange bg-orange/20' : 'border-line-2 hover:bg-panel-3'
                  }`}
                >
                  {s.icon}
                </button>
              ))}
            </div>
          </div>

          <NumberRow label="💵 Dinero" value={state.money} steps={[1e6, 1e9]} onSet={(money) => onPatch({ money })} />
          <NumberRow label="🟣 XP" value={state.xp} steps={[1e5, 1e8]} onSet={(xp) => onPatch({ xp })} />
          <NumberRow label="★ Reputación" value={state.rep} steps={[100]} onSet={(rep) => onPatch({ rep })} />
          <NumberRow
            label="🪙 Tokens"
            value={state.prestige.tokens}
            steps={[5, 50]}
            onSet={(tokens) => onPatch({ prestige: { ...state.prestige, tokens } })}
          />
          <NumberRow
            label="💰 Dinero ganado (para ascender)"
            value={state.stats.moneyEarned}
            steps={[1e8, 1e10]}
            onSet={(moneyEarned) => onPatch({ stats: { ...state.stats, moneyEarned } })}
          />
          <NumberRow
            label="📄 Contratos entregados (para ascender)"
            value={state.stats.contractsDone}
            steps={[10, 100]}
            onSet={(contractsDone) => onPatch({ stats: { ...state.stats, contractsDone } })}
          />

          <div>
            <p className="mb-1 text-[11px] text-muted">Velocidad del reloj (contratos y equipo)</p>
            <div className="grid grid-cols-4 gap-1">
              {SPEEDS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => props.onSpeed(s)}
                  className={`cursor-pointer rounded-md border py-1 font-mono text-xs ${
                    props.speed === s ? 'border-orange bg-orange/20' : 'border-line-2 hover:bg-panel-3'
                  }`}
                >
                  ×{s}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1">
            <Btn onClick={props.onMaxTrees}>🧠 Árboles al máximo</Btn>
            <Btn
              onClick={() => {
                // Justo lo que pide la próxima etapa (si ya alcanza, no cambia nada)
                const needed = STAGES[state.stage + 1]?.requires?.contractsDone ?? 0
                onPatch({ stats: { ...state.stats, contractsDone: Math.max(state.stats.contractsDone, needed) } })
              }}
            >
              📄 Contratos para ascender
            </Btn>
            <Btn onClick={() => state.contract && onPatch({ code: state.contract.code })}>✅ Completar contrato</Btn>
            <Btn onClick={() => onPatch({ focus: { endsAt: 0, readyAt: 0 } })}>🎯 Recargar Foco</Btn>
            <Btn onClick={() => onPatch({ office: Math.min(OFFICES.length - 1, state.office + 1) })}>
              📦 Oficina siguiente
            </Btn>
            <Btn onClick={props.onEvent}>🎲 Evento ahora</Btn>
            <Btn onClick={props.onBug}>🐛 Bug dorado ahora</Btn>
            <Btn onClick={() => onPatch({ rerolls: 0 })}>🔄 Reroll a precio base</Btn>
            <Btn onClick={() => onPatch({ records: { ...state.records, boxes: state.records.boxes + 5 } })}>
              📦 +5 cajas
            </Btn>
            <Btn onClick={() => onPatch({ bossCountdown: 0 })}>👹 Jefe ahora</Btn>
          </div>

          <div>
            <p className="mb-1 text-[11px] text-muted">🎮 Jugar un minijuego</p>
            <div className="grid grid-cols-2 gap-1">
              {MINIGAMES.map((m) => (
                <Btn key={m.id} onClick={() => props.onMinigame(m.id)}>
                  {`${m.icon} ${m.title}${m.forDevs ? ' 🧑‍💻' : ''}`}
                </Btn>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default DevPanel
