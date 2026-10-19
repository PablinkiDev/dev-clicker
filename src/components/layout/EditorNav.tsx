import type { EditorId } from '../../data/editors'
import { VIEW_LABEL, type View } from '../../ui'

type EditorNavProps = {
  editor: EditorId
  view: View
  onChange: (view: View) => void
}

const VIEWS: View[] = ['work', 'board', 'team', 'skills']
const NANO_KEYS: Record<View, string> = { work: '^E', board: '^T', team: '^P', skills: '^W' }

/** Barra de atajos de Nano: va abajo de todo, como en la terminal */
export function NanoBar({ view, onChange }: Omit<EditorNavProps, 'editor'>) {
  return (
    <nav className="flex shrink-0 flex-wrap gap-x-6 gap-y-1 border-t border-line bg-panel px-3.5 pt-1.5 pb-[calc(8px+env(safe-area-inset-bottom))] font-mono text-xs">
      {VIEWS.map((v) => (
        <button key={v} type="button" onClick={() => onChange(v)} className="flex cursor-pointer items-center gap-1.5">
          <b className={`px-1 ${v === view ? 'bg-green text-bg' : 'bg-text text-bg'}`}>{NANO_KEYS[v]}</b>
          {VIEW_LABEL[v]}
        </button>
      ))}
    </nav>
  )
}

/**
 * Menú de Bloc de notas: las opciones que funcionan van en negrita y primero;
 * después vienen los menús de época, que son solo decorado.
 */
export function MenuBar({ view, onChange }: Omit<EditorNavProps, 'editor'>) {
  return (
    <nav className="flex shrink-0 items-center gap-px overflow-x-auto border-b border-line bg-panel px-1.5 py-0.5 text-[13px] [scrollbar-width:none]">
      {VIEWS.map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={`cursor-pointer px-2.5 py-1 font-bold whitespace-nowrap hover:bg-[#0a246a] hover:text-white ${
            v === view ? 'underline decoration-2 underline-offset-4' : ''
          }`}
        >
          {VIEW_LABEL[v]}
        </button>
      ))}
      <i className="mx-1.5 my-1 w-px self-stretch bg-line-2" />
      {['Archivo', 'Editar', 'Formato', 'Ver', 'Ayuda'].map((item) => (
        <span key={item} className="px-2.5 py-1 whitespace-nowrap text-muted">
          {item}
        </span>
      ))}
    </nav>
  )
}
