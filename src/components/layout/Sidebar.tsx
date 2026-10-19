import { DEVELOPER_PRICE, ROOM_CAPACITY } from '../../game/formulas'
import { fileName, formatMoney } from '../../game/format'
import type { Contract, Difficulty } from '../../game/types'
import type { View } from '../../ui'

type SidebarProps = {
  contract: Contract | null
  offers: Contract[]
  developers: number
  money: number
  onNavigate: (view: View) => void
}

const DIFFICULTY_MARK: Record<Difficulty, { letter: string; className: string }> = {
  easy: { letter: 'F', className: 'text-green' },
  mid: { letter: 'M', className: 'text-orange' },
  hard: { letter: 'D', className: 'text-red' },
}

function Folder({ children, extra }: { children: string; extra?: string }) {
  return (
    <p className="mt-2 flex h-6.5 items-center gap-1.5 px-2 text-[11px] font-semibold tracking-wider text-muted uppercase">
      <span className="text-[9px] opacity-70">▼</span> {children}
      {extra && <span className="ml-auto font-mono tracking-normal normal-case">{extra}</span>}
    </p>
  )
}

const FILE_ROW = 'flex h-6.5 w-full cursor-pointer items-center gap-1.5 rounded-md pr-2 pl-5.5 text-left text-[13px]'

/** Explorador de archivos: el estado del juego visto como un proyecto */
function Sidebar({ contract, offers, developers, money, onNavigate }: SidebarProps) {
  const goal = Math.min(100, (money / DEVELOPER_PRICE) * 100)

  return (
    <aside className="hidden w-64 shrink-0 flex-col overflow-y-auto border-r border-line bg-panel md:flex">
      <p className="px-4 pt-3 pb-2 text-[11px] font-semibold tracking-widest text-muted uppercase">Explorador</p>

      <div className="px-1.5 pb-2.5">
        <Folder>en curso</Folder>
        {contract ? (
          <button type="button" onClick={() => onNavigate('work')} className={`${FILE_ROW} bg-panel-3 text-text`}>
            <span className="w-4 text-center font-mono text-[10px] font-extrabold text-orange">&lt;&gt;</span>
            <span className="truncate">{fileName(contract.id, contract.lang)}</span>
            <span className="ml-auto font-mono text-[11px] font-extrabold text-yellow">M</span>
          </button>
        ) : (
          <p className={`${FILE_ROW} cursor-default text-faint italic`}>— ninguno —</p>
        )}

        <Folder extra={String(offers.length)}>ofertas</Folder>
        {offers.map((o) => (
          <button
            key={o.uid}
            type="button"
            onClick={() => onNavigate('board')}
            className={`${FILE_ROW} text-[#b3bcd8] hover:bg-panel-2`}
          >
            <span className="w-4 text-center font-mono text-[10px] font-extrabold text-orange">&lt;&gt;</span>
            <span className="truncate">{fileName(o.id, o.lang)}</span>
            <span className={`ml-auto font-mono text-[11px] font-extrabold ${DIFFICULTY_MARK[o.difficulty].className}`}>
              {DIFFICULTY_MARK[o.difficulty].letter}
            </span>
          </button>
        ))}

        <Folder extra={`${1 + developers}/${1 + ROOM_CAPACITY}`}>equipo</Folder>
        <button type="button" onClick={() => onNavigate('team')} className={`${FILE_ROW} text-[#b3bcd8] hover:bg-panel-2`}>
          <span className="w-4 text-center text-green">●</span>vos.exe
        </button>
        {Array.from({ length: developers }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onNavigate('team')}
            className={`${FILE_ROW} text-[#b3bcd8] hover:bg-panel-2`}
          >
            <span className="w-4 text-center text-green">●</span>dev-{i + 1}.exe
            <span className="ml-auto font-mono text-[11px] text-faint">★</span>
          </button>
        ))}
      </div>

      {developers === 0 && (
        <>
          <p className="px-4 pt-1 pb-2 text-[11px] font-semibold tracking-widest text-muted uppercase">Objetivos</p>
          <div className="mx-3 mb-4 rounded-xl border border-yellow/20 bg-linear-to-b from-yellow/8 to-yellow/2 p-3">
            <p className="font-mono text-[11px] font-bold text-yellow">// TODO:</p>
            <p className="mt-1 mb-2 text-[13px] font-semibold">Contratá tu primer dev</p>
            <div className="h-1.5 overflow-hidden rounded-full bg-panel-3">
              <div className="h-full bg-yellow transition-[width] duration-500" style={{ width: `${goal}%` }} />
            </div>
            <p className="mt-1.5 font-mono text-[11px] text-muted">
              {formatMoney(money)} / {formatMoney(DEVELOPER_PRICE)}
            </p>
          </div>
        </>
      )}
    </aside>
  )
}

export default Sidebar
