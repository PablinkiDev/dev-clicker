// 🔌 Conectá los servidores: cada servidor va al enchufe de su mismo color. 3 racks, cada uno con más cables.
import { useRef, useState } from 'react'
import { CABLE_COLORS, CABLE_ROUNDS, CABLE_SECONDS, pickSome } from '../../data/minigames'
import { TimeBar, type GameProps } from './shared'
import { useCountdown } from './useCountdown'

type Cable = (typeof CABLE_COLORS)[number]
type Rack = { servers: Cable[]; plugs: Cable[] }

/** Un rack: los servidores en un orden y los enchufes mezclados (nunca en el mismo orden) */
function createRack(size: number): Rack {
  const servers = pickSome(CABLE_COLORS, size)
  let plugs = pickSome(servers, size)
  while (plugs.every((p, i) => p.id === servers[i].id)) plugs = pickSome(servers, size)
  return { servers, plugs }
}

function CablesGame({ onDone }: GameProps) {
  const [racks] = useState(() => CABLE_ROUNDS.map(createRack))
  const [round, setRound] = useState(0)
  const [hits, setHits] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [connected, setConnected] = useState<string[]>([])
  const [wrong, setWrong] = useState<number | null>(null)
  const finished = useRef(false)
  const finish = (total: number) => {
    if (finished.current) return
    finished.current = true
    onDone(total)
  }
  const left = useCountdown(CABLE_SECONDS, 0, () => finish(hits))
  const { servers, plugs } = racks[round]

  function plug(index: number) {
    if (selected === null || connected.includes(plugs[index].id)) return
    if (plugs[index].id !== servers[selected].id) {
      setWrong(index)
      setSelected(null)
      setTimeout(() => setWrong(null), 350)
      return
    }
    const now = [...connected, plugs[index].id]
    setConnected(now)
    setSelected(null)
    if (now.length < servers.length) return
    // Rack completo: un acierto y al siguiente
    const total = hits + 1
    setHits(total)
    setTimeout(() => {
      if (round === racks.length - 1) finish(total)
      else {
        setRound(round + 1)
        setConnected([])
      }
    }, 500)
  }

  // Centro vertical de cada fila (las columnas reparten el alto en partes iguales)
  const y = (i: number) => ((i + 0.5) / servers.length) * 100

  return (
    <>
      <p className="mb-1 font-mono text-xs text-muted">
        Rack {round + 1}/3 · listos {hits}
      </p>
      <TimeBar left={left} total={CABLE_SECONDS} />
      <div className="grid h-60 grid-cols-[1fr_1.4fr_1fr] gap-1">
        <div className="flex flex-col justify-around">
          {servers.map((c, i) => {
            const done = connected.includes(c.id)
            return (
              <button
                key={c.id}
                type="button"
                disabled={done}
                onClick={() => setSelected(i)}
                className={`flex h-9 cursor-pointer items-center gap-2 rounded-lg border px-2 text-sm disabled:cursor-default ${
                  selected === i ? 'border-text bg-panel-3' : 'border-line-2 bg-panel hover:bg-panel-3'
                }`}
              >
                🖥️ <i className={`ml-auto size-3.5 rounded-full ${c.bg}`} />
              </button>
            )
          })}
        </div>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full" aria-hidden>
          {servers.map((c, i) => {
            if (!connected.includes(c.id)) return null
            const j = plugs.findIndex((p) => p.id === c.id)
            return (
              <line
                key={c.id}
                x1="0"
                y1={y(i)}
                x2="100"
                y2={y(j)}
                stroke={c.stroke}
                strokeWidth="3"
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
              />
            )
          })}
        </svg>
        <div className="flex flex-col justify-around">
          {plugs.map((c, i) => (
            <button
              key={c.id}
              type="button"
              onClick={() => plug(i)}
              className={`flex h-9 cursor-pointer items-center gap-2 rounded-lg border px-2 text-sm ${
                wrong === i ? 'animate-shake border-red bg-red/15' : 'border-line-2 bg-panel hover:bg-panel-3'
              }`}
            >
              <i className={`size-3.5 rounded-full ${c.bg}`} /> <span className="ml-auto">🔌</span>
            </button>
          ))}
        </div>
      </div>
      <p className="mt-2 text-center text-xs text-muted">
        {selected === null ? 'Tocá un servidor…' : '…y ahora el enchufe del mismo color'}
      </p>
    </>
  )
}

export default CablesGame
