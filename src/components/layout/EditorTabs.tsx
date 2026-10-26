import { fileName } from '../../game/format'
import type { Contract } from '../../game/types'
import { LANG_ICON, type View } from '../../ui'

type EditorTabsProps = {
  view: View
  contract: Contract | null
  onChange: (view: View) => void
  /** Pantallas visibles (las demás todavía no se desbloquearon) */
  views: View[]
}

type Tab = { view: View; icon: string; iconClass: string; name: string; modified?: boolean }

/** Pestañas del editor: el contrato en curso es un archivo abierto, el resto son "carpetas" */
function EditorTabs({ view, contract, onChange, views }: EditorTabsProps) {
  const allTabs: Tab[] = [
    ...(contract
      ? [
          {
            view: 'work' as const,
            icon: LANG_ICON[contract.lang ?? 'html'].icon,
            iconClass: LANG_ICON[contract.lang ?? 'html'].className,
            name: fileName(contract.id, contract.lang),
            modified: true,
          },
        ]
      : []),
    { view: 'board', icon: '▤', iconClass: 'text-muted', name: 'ofertas/' },
    { view: 'team', icon: '●', iconClass: 'text-cyan', name: 'equipo/' },
    { view: 'company', icon: '▲', iconClass: 'text-yellow', name: 'empresa.json' },
    { view: 'setup', icon: '▣', iconClass: 'text-purple', name: 'setup.desk' },
    { view: 'skills', icon: '⑂', iconClass: 'text-green', name: 'mejoras.tree' },
  ]
  const tabs = allTabs.filter((tab) => views.includes(tab.view))

  return (
    <div className="editor-tabs hidden h-9 shrink-0 overflow-x-auto border-b border-line bg-panel [scrollbar-width:none] md:flex">
      {tabs.map((tab) => {
        const isActive = tab.view === view
        return (
          <button
            key={tab.view}
            type="button"
            onClick={() => onChange(tab.view)}
            data-active={isActive || undefined}
            className={`editor-tab relative flex cursor-pointer items-center gap-2 border-r border-line px-4 font-mono text-xs whitespace-nowrap ${
              isActive ? 'bg-bg text-text' : 'text-muted hover:text-text'
            }`}
          >
            {isActive && <span className="tab-accent absolute inset-x-0 top-0 h-0.5 bg-green" />}
            <span className={tab.iconClass}>{tab.icon}</span>
            {tab.name}
            {tab.modified && <span className="size-2 rounded-full bg-text/80" />}
          </button>
        )
      })}
    </div>
  )
}

export default EditorTabs
