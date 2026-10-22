// 🔔 H2: el centro de notificaciones. Lo más nuevo arriba; lo que no viste, resaltado.
import { useState } from 'react'
import type { Inbox, InboxKind } from '../game/inbox'

const KIND_STYLE: Record<InboxKind, string> = {
  gold: 'border-yellow/40 bg-yellow/5',
  good: 'border-green/30',
  bad: 'border-red/35',
  info: 'border-line-2',
}

type InboxButtonProps = { unread: number; onClick: () => void }

/** La campanita (va al lado de la ayuda): muestra cuántas nuevas hay */
export function InboxButton({ unread, onClick }: InboxButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={unread ? `Notificaciones: ${unread} nuevas` : 'Notificaciones'}
      title="Notificaciones"
      className="absolute right-9 bottom-2.5 z-10 md:top-1.5 md:bottom-auto grid size-6 cursor-pointer place-items-center rounded-full border border-line-2 bg-panel-2 text-xs transition-colors hover:bg-panel-3"
    >
      🔔
      {unread > 0 && (
        <span className="absolute -top-1.5 -right-1.5 grid h-4 min-w-4 animate-pop place-items-center rounded-full bg-red px-1 font-mono text-[9px] font-extrabold text-white">
          {unread > 99 ? '99+' : unread}
        </span>
      )}
    </button>
  )
}

type InboxPanelProps = {
  inbox: Inbox
  onClose: () => void
}

function InboxPanel({ inbox, onClose }: InboxPanelProps) {
  // Lo que era nuevo al abrir (al abrir se marca todo como visto, pero se sigue resaltando)
  const [seenBefore] = useState(inbox.seen)
  const items = [...inbox.items].reverse()

  return (
    <div className="fixed inset-0 z-60 flex justify-end bg-black/40" onClick={onClose}>
      <aside
        role="dialog"
        aria-label="Notificaciones"
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-sm animate-slide-in flex-col border-l border-line-2 bg-panel shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-line px-4 py-3">
          <p className="font-extrabold">🔔 Notificaciones</p>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer text-faint hover:text-text"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </header>
        {items.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted">Todavía no pasó nada. Ya va a pasar.</p>
        ) : (
          <ol className="flex flex-col gap-1.5 overflow-y-auto p-3">
            {items.map((n) => (
              <li
                key={n.id}
                className={`flex items-start gap-2.5 rounded-lg border px-3 py-2 text-[13px] ${KIND_STYLE[n.kind]} ${
                  n.id > seenBefore ? '' : 'opacity-60'
                }`}
              >
                <span className="text-base leading-5">{n.icon}</span>
                <span className="min-w-0 flex-1 leading-5">{n.text}</span>
                {n.id > seenBefore && <i className="mt-1.5 size-2 shrink-0 rounded-full bg-red" aria-label="nueva" />}
              </li>
            ))}
          </ol>
        )}
      </aside>
    </div>
  )
}

export default InboxPanel
