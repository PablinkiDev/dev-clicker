import ScreenHeader from '../components/ScreenHeader'
import { DEVELOPER_PRICE, DEVELOPER_RATE, ROOM_CAPACITY } from '../game/formulas'
import { formatMoney } from '../game/format'

type TeamScreenProps = {
  developers: number
  money: number
  /** Si hay un contrato en curso, el equipo está "trabajando" */
  isWorking: boolean
  onHire: () => void
}

function TeamScreen({ developers, money, isWorking, onHire }: TeamScreenProps) {
  const isFull = developers >= ROOM_CAPACITY
  const canHire = !isFull && money >= DEVELOPER_PRICE
  const seats = 1 + ROOM_CAPACITY

  return (
    <section className="min-h-0 flex-1 overflow-y-auto px-3 pt-2.5 pb-6 md:px-4.5">
      <ScreenHeader icon="👥" title="Equipo · Habitación">
        Se paga <b className="text-text">una sola vez</b>, sin sueldos. Producen solo mientras haya un contrato activo.
      </ScreenHeader>

      <div className="mb-5 rounded-xl border border-line bg-panel-2 p-3.5">
        <p className="font-extrabold">🏠 Habitación</p>
        <p className="text-xs text-muted">Tu cuarto. El escritorio es la cama.</p>
        <div className="mt-2.5 mb-1.5 flex gap-1.5">
          {Array.from({ length: seats }, (_, i) => (
            <span
              key={i}
              className={`grid size-8.5 place-items-center rounded-lg text-base ${
                i <= developers ? 'bg-green/15 ring-1 ring-green/45' : 'bg-panel-3 opacity-45'
              }`}
            >
              {i === 0 ? '🧑‍💻' : i <= developers ? '👤' : '🪑'}
            </span>
          ))}
        </div>
        <p className="font-mono text-xs text-muted">
          {1 + developers}/{seats} puestos ocupados
        </p>
      </div>

      <p className="mb-2.5 font-mono text-xs text-muted">en tu equipo/</p>
      <ul className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(230px,1fr))]">
        <li className="rounded-xl border border-purple/45 bg-panel-2 p-3.5">
          <p className="font-extrabold">Vos</p>
          <p className="text-xs text-muted">Fundador · programa a mano</p>
          <p className="mt-2 text-xs text-muted italic">“Café ilimitado, sueño limitado.”</p>
        </li>
        {Array.from({ length: developers }, (_, i) => (
          <li key={i} className="rounded-xl border border-line bg-panel-2 p-3.5">
            <p className="font-extrabold">
              Dev {i + 1} <span className="text-yellow">★</span>
            </p>
            <p className="text-xs text-green">{'{}'} Desarrollador</p>
            <p className="mt-2 font-mono text-xs">+{DEVELOPER_RATE} líneas/seg automáticas</p>
            <p className="mt-2 flex items-center gap-2 border-t border-dashed border-line pt-2 font-mono text-[11px] text-muted">
              <i className={`size-2 rounded-full ${isWorking ? 'animate-pulse bg-green' : 'bg-faint'}`} />
              {isWorking ? 'trabajando' : 'esperando un contrato'}
            </p>
          </li>
        ))}
      </ul>

      <p className="mb-2.5 font-mono text-xs text-muted">candidatos/</p>
      <div className="max-w-sm rounded-xl border border-line bg-panel-2 p-3.5">
        <p className="font-extrabold">
          Desarrollador <span className="text-yellow">★</span>
        </p>
        <p className="mt-1 font-mono text-xs">+{DEVELOPER_RATE} líneas/seg automáticas</p>
        <p className="mt-1 text-xs text-muted italic">“En mi máquina anda.”</p>
        <button
          type="button"
          onClick={onHire}
          disabled={!canHire}
          className="mt-3 w-full cursor-pointer rounded-lg bg-green py-2 text-sm font-extrabold text-[#062312] disabled:cursor-default disabled:border disabled:border-line-2 disabled:bg-panel-3 disabled:text-faint"
        >
          {isFull ? '🪑 Habitación llena' : `Contratar · ${formatMoney(DEVELOPER_PRICE)}`}
        </button>
      </div>
    </section>
  )
}

export default TeamScreen
