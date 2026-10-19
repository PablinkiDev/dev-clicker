import ScreenHeader from '../components/ScreenHeader'
import { OFFICES } from '../data/offices'
import { DEVELOPER_PRICE, DEVELOPER_RATE } from '../game/formulas'
import { formatMoney } from '../game/format'

type TeamScreenProps = {
  developers: number
  /** Índice de la oficina actual */
  office: number
  money: number
  /** Si hay un contrato en curso, el equipo está "trabajando" */
  isWorking: boolean
  onHire: () => void
  onMove: () => void
}

function TeamScreen({ developers, office, money, isWorking, onHire, onMove }: TeamScreenProps) {
  const current = OFFICES[office]
  const next = OFFICES[office + 1]
  const isFull = developers >= current.capacity
  const canHire = !isFull && money >= DEVELOPER_PRICE
  const seats = 1 + current.capacity

  return (
    <section className="min-h-0 flex-1 overflow-y-auto px-3 pt-2.5 pb-6 md:px-4.5">
      <ScreenHeader icon="👥" title={`Equipo · ${current.name}`}>
        Se paga <b className="text-text">una sola vez</b>, sin sueldos. Producen solo mientras haya un contrato activo.
      </ScreenHeader>

      <div className="mb-5 rounded-xl border border-line bg-panel-2 p-3.5">
        <p className="font-extrabold">
          {current.icon} {current.name}
        </p>
        <p className="text-xs text-muted">{current.description}</p>
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

      {next && (
        <div className="mb-5 max-w-sm rounded-xl border border-dashed border-line-2 bg-panel-2 p-3.5">
          <p className="font-mono text-[10px] font-bold tracking-wider text-muted uppercase">Próxima oficina</p>
          <p className="font-extrabold">
            {next.icon} {next.name}
          </p>
          <p className="text-xs text-muted">
            {next.capacity} empleados · {next.description} El equipo se muda con vos.
          </p>
          <button
            type="button"
            onClick={onMove}
            disabled={money < next.price}
            className="mt-3 w-full cursor-pointer rounded-lg border border-yellow/50 bg-yellow/15 py-2 font-mono text-sm font-bold text-yellow transition-colors hover:bg-yellow/25 disabled:cursor-default disabled:border-line disabled:bg-panel disabled:text-faint"
          >
            Mudarse · {formatMoney(next.price)}
          </button>
        </div>
      )}

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
          {isFull ? `🪑 ${current.name}: no entra nadie más` : `Contratar · ${formatMoney(DEVELOPER_PRICE)}`}
        </button>
      </div>
    </section>
  )
}

export default TeamScreen
