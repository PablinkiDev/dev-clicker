import { ROLES } from '../../data/roles'
import type { CompanyIdentity } from '../../data/personalization'
import CompanyLogo from '../CompanyLogo'
import { employeePrice, type Employee } from '../../game/team'
import { LANG_ICON, ROLE_STYLE } from '../../ui'
import type { Lang } from '../../data/techs'
import { fileName, formatMoney } from '../../game/format'
import type { Contract, Difficulty } from '../../game/types'
import type { View } from '../../ui'

type SidebarProps = {
  contract: Contract | null
  offers: Contract[]
  team: Employee[]
  /** Puestos de la oficina (con Home office) */
  capacity: number
  /** El equipo todavía no se desbloqueó: no se muestra su carpeta */
  showTeam: boolean
  money: number
  /** 🏢 Nombre y logo de la empresa: es la carpeta del proyecto (G4) */
  company: CompanyIdentity
  onNavigate: (view: View) => void
  /** 🟧 Sublime (H5.8): arriba van las pantallas como "OPEN FILES" y el árbol pasa a llamarse FOLDERS */
  openFiles?: { views: View[]; view: View; fresh: View[]; names: Record<View, string> }
}

const DIFFICULTY_MARK: Record<Difficulty, { letter: string; className: string }> = {
  easy: { letter: 'F', className: 'text-green' },
  mid: { letter: 'M', className: 'text-orange' },
  hard: { letter: 'D', className: 'text-red' },
}

function LangIcon({ lang = 'html' }: { lang?: Lang }) {
  return (
    <span className={`w-4 shrink-0 text-center font-mono text-[10px] font-extrabold ${LANG_ICON[lang].className}`}>
      {LANG_ICON[lang].icon}
    </span>
  )
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
function Sidebar({ contract, offers, team, capacity, showTeam, money, company, onNavigate, openFiles }: SidebarProps) {
  const firstHire = employeePrice('dev', 1)
  const goal = Math.min(100, (money / firstHire) * 100)

  return (
    <aside className="hidden w-64 shrink-0 flex-col overflow-y-auto border-r border-line bg-panel md:flex">
      {openFiles && (
        <>
          <p className="px-4 pt-3 pb-1.5 text-[11px] font-semibold tracking-widest text-muted uppercase">Open files</p>
          <div className="px-1.5 pb-1">
            {openFiles.views
              .filter((v) => v !== 'work' || contract)
              .map((v) => {
                const isActive = v === openFiles.view
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => onNavigate(v)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`${FILE_ROW} pl-3 ${isActive ? 'bg-panel-3 text-text' : 'text-muted hover:bg-panel-2 hover:text-text'}`}
                  >
                    <span className="truncate">{openFiles.names[v]}</span>
                    {openFiles.fresh.includes(v) ? (
                      <span className="ml-auto text-[9px] text-text" title="Hay algo nuevo">
                        ●
                      </span>
                    ) : (
                      isActive && <span className="ml-auto text-xs text-faint">×</span>
                    )}
                  </button>
                )
              })}
          </div>
        </>
      )}
      <p className="px-4 pt-3 pb-2 text-[11px] font-semibold tracking-widest text-muted uppercase">
        {openFiles ? 'Folders' : 'Explorador'}
      </p>
      <p
        className="mx-1.5 flex items-center gap-2 rounded-md px-2 py-1 text-[13px] font-extrabold"
        title={company.name}
      >
        <CompanyLogo company={company} className="size-5 rounded text-[11px]" />
        <span className="truncate">{company.name}</span>
      </p>

      <div className="px-1.5 pb-2.5">
        <Folder>en curso</Folder>
        {contract ? (
          <button type="button" onClick={() => onNavigate('work')} className={`${FILE_ROW} bg-panel-3 text-text`}>
            <LangIcon lang={contract.lang} />
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
            <LangIcon lang={o.lang} />
            <span className="truncate">{fileName(o.id, o.lang)}</span>
            {o.special && <span title="Contrato especial">⭐</span>}
            <span className={`ml-auto font-mono text-[11px] font-extrabold ${DIFFICULTY_MARK[o.difficulty].className}`}>
              {DIFFICULTY_MARK[o.difficulty].letter}
            </span>
          </button>
        ))}

        {showTeam && (
          <>
            <Folder extra={`${1 + team.length}/${1 + capacity}`}>equipo</Folder>
            <button
              type="button"
              onClick={() => onNavigate('team')}
              className={`${FILE_ROW} text-[#b3bcd8] hover:bg-panel-2`}
            >
              <span className="w-4 text-center text-green">●</span>vos.exe
            </button>
            {team.map((e) => (
              <button
                key={e.uid}
                type="button"
                onClick={() => onNavigate('team')}
                className={`${FILE_ROW} text-[#b3bcd8] hover:bg-panel-2`}
              >
                <span className={`w-4 text-center ${ROLE_STYLE[e.role].text}`} title={ROLES[e.role].name}>
                  ●
                </span>
                <span className="truncate">
                  {e.role}-{e.name.toLowerCase()}.exe
                </span>
                <span className="ml-auto font-mono text-[11px] text-yellow">{'★'.repeat(e.stars)}</span>
              </button>
            ))}
          </>
        )}
      </div>

      {team.length === 0 && (
        <>
          <p className="px-4 pt-1 pb-2 text-[11px] font-semibold tracking-widest text-muted uppercase">Objetivos</p>
          <div className="mx-3 mb-4 rounded-xl border border-yellow/20 bg-linear-to-b from-yellow/8 to-yellow/2 p-3">
            <p className="font-mono text-[11px] font-bold text-yellow">// TODO:</p>
            <p className="mt-1 mb-2 text-[13px] font-semibold">Contratá tu primer dev</p>
            <div className="h-1.5 overflow-hidden rounded-full bg-panel-3">
              <div className="h-full bg-yellow transition-[width] duration-500" style={{ width: `${goal}%` }} />
            </div>
            <p className="mt-1.5 font-mono text-[11px] text-muted">
              {formatMoney(money)} / {formatMoney(firstHire)}
            </p>
          </div>
        </>
      )}
    </aside>
  )
}

export default Sidebar
