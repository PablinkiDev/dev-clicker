import type { ReactNode } from 'react'
import ScreenHeader from '../components/ScreenHeader'
import { EDITORS, type EditorId } from '../data/editors'
import { formatDuration, formatMoney } from '../game/format'
import type { Stats } from '../game/reducer'
import type { AudioSettings } from '../audio/audio'

type SettingsScreenProps = {
  /** Mejor editor comprado */
  editor: EditorId
  /** Editor que se ve */
  look: EditorId
  onLookChange: (look: EditorId) => void
  dim: boolean
  onDimChange: (dim: boolean) => void
  stats: Stats
  onReset: () => void
  onExport: () => void
  /** Recibe el texto del archivo elegido */
  onImport: (text: string) => void
  audio: AudioSettings
  onAudioChange: (audio: AudioSettings) => void
}

function SettingsScreen({
  editor,
  look,
  onLookChange,
  dim,
  onDimChange,
  stats,
  onReset,
  onExport,
  onImport,
  audio,
  onAudioChange,
}: SettingsScreenProps) {
  const ownedIndex = EDITORS.findIndex((e) => e.id === editor)

  return (
    <section className="min-h-0 flex-1 overflow-y-auto px-3 pt-2.5 pb-6 md:px-4.5">
      <ScreenHeader icon="⚙" title="Ajustes">
        El editor, el sonido y tu partida.
      </ScreenHeader>

      {/* 🎨 Apariencia: cada editor en miniatura, con sus propios colores */}
      <Card
        title="🎨 Apariencia"
        note="solo estético: los bonus son siempre los del mejor que compraste"
        className="mb-3"
      >
        <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-6">
          {EDITORS.map((e, i) => {
            const isOwned = i <= ownedIndex
            const isSelected = e.id === look
            return (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => onLookChange(e.id)}
                  disabled={!isOwned}
                  aria-pressed={isSelected}
                  title={e.bonusText}
                  className={`block w-full cursor-pointer overflow-hidden rounded-xl border-2 text-left disabled:cursor-default ${
                    isSelected ? 'border-green ring-2 ring-green/20' : 'border-line-2 enabled:hover:border-muted'
                  }`}
                >
                  <EditorThumb id={e.id} dim={dim} locked={!isOwned} />
                  <span className="flex items-center justify-between gap-2 border-t border-line bg-panel px-2.5 py-1.5 text-xs">
                    <b className="truncate">{e.name}</b>
                    <span
                      className={`shrink-0 font-mono text-[10px] ${isSelected ? 'font-bold text-green' : 'text-muted'}`}
                    >
                      {isSelected ? '✓ en uso' : isOwned ? 'usar' : `🔒 ${formatMoney(e.price)}`}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </Card>

      <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-3">
        <Card title="🔊 Sonido">
          <div className="flex flex-col gap-2.5">
            {(
              [
                ['music', '🎵 Música'],
                ['sfx', '🔔 Efectos'],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex items-center gap-3">
                <span className="w-22 shrink-0 text-sm font-bold">{label}</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(audio[key] * 100)}
                  disabled={audio.muted}
                  onChange={(event) => onAudioChange({ ...audio, [key]: Number(event.target.value) / 100 })}
                  className="min-w-0 flex-1 cursor-pointer accent-green disabled:opacity-40"
                />
                <span className="w-10 text-right font-mono text-xs text-muted">{Math.round(audio[key] * 100)}%</span>
              </label>
            ))}
            <Toggle
              label="🔇 Silenciar todo"
              checked={audio.muted}
              onChange={(muted) => onAudioChange({ ...audio, muted })}
              className="border-t border-line pt-2.5"
            >
              Se genera en el navegador: no se descarga nada.
            </Toggle>
          </div>
        </Card>

        <Card title="♿ Accesibilidad">
          <Toggle label="Reducir brillo" checked={dim} onChange={onDimChange}>
            Usa colores oscuros en Bloc de notas y Notepad. Siempre gratis: el modo oscuro de $60 es un chiste del
            juego, la accesibilidad no se cobra.
          </Toggle>
        </Card>

        <Card title="💾 Partida">
          <dl className="grid grid-cols-2 gap-2 font-mono text-xs">
            <Stat label="Dinero ganado" value={formatMoney(stats.moneyEarned)} className="text-yellow" />
            <Stat label="Tiempo jugado" value={formatDuration(stats.playTime)} />
            <Stat label="Entregados" value={stats.contractsDone} className="text-green" />
            <Stat label="Vencidos" value={stats.contractsFailed} className="text-red" />
          </dl>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={onExport}
              className="flex-1 cursor-pointer rounded-lg border border-line-2 bg-panel px-3 py-2 font-mono text-xs font-bold hover:bg-panel-3"
            >
              ⬇ Exportar
            </button>
            <label className="flex-1 cursor-pointer rounded-lg border border-line-2 bg-panel px-3 py-2 text-center font-mono text-xs font-bold hover:bg-panel-3">
              ⬆ Importar
              <input
                type="file"
                accept=".devclicker,.json,.txt"
                className="sr-only"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  e.target.value = '' // para poder elegir el mismo archivo otra vez
                  if (file) onImport(await file.text())
                }}
              />
            </label>
          </div>
          <p className="mt-1.5 text-[11px] text-faint">
            Sirve de backup o para pasarle tu partida a alguien (por ejemplo, si encontrás un bug).
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-dashed border-red/40 bg-red/5 px-3 py-2.5">
            <span className="text-xs text-muted">⚠ Zona de peligro</span>
            <button
              type="button"
              onClick={onReset}
              className="cursor-pointer rounded-lg border border-red/50 px-3 py-1.5 font-mono text-xs font-bold text-red hover:bg-red/10"
            >
              rm -rf partida/
            </button>
          </div>
        </Card>
      </div>
    </section>
  )
}

function Card({
  title,
  note,
  className = '',
  children,
}: {
  title: string
  note?: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className={`rounded-2xl border border-line-2 bg-panel-2 p-3 sm:p-4 ${className}`}>
      <p className="mb-2.5 font-mono text-[11px] font-bold tracking-wider text-muted uppercase">
        {title}
        {note && <span className="font-normal tracking-normal normal-case"> · {note}</span>}
      </p>
      {children}
    </div>
  )
}

/** Un interruptor con título y explicación (es un checkbox: se puede usar con teclado) */
function Toggle({
  label,
  checked,
  onChange,
  className = '',
  children,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  className?: string
  children: ReactNode
}) {
  return (
    <label className={`flex cursor-pointer items-center justify-between gap-4 ${className}`}>
      <span>
        <b className="block text-sm">{label}</b>
        <span className="text-xs text-muted">{children}</span>
      </span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span
        aria-hidden
        className="relative h-5 w-9 shrink-0 rounded-full bg-panel-3 ring-1 ring-line-2 transition-colors peer-checked:bg-green peer-focus-visible:ring-2 peer-focus-visible:ring-green after:absolute after:top-0.75 after:left-0.75 after:size-3.5 after:rounded-full after:bg-muted after:transition-all peer-checked:after:left-4.75 peer-checked:after:bg-[#062312]"
      />
    </label>
  )
}

function Stat({ label, value, className = '' }: { label: string; value: ReactNode; className?: string }) {
  return (
    <div className="rounded-lg border border-line bg-panel px-2.5 py-2">
      <dt className="text-muted">{label}</dt>
      <dd className={`text-base font-bold ${className}`}>{value}</dd>
    </div>
  )
}

/** Miniatura de un editor: una ventanita pintada con la paleta de ese editor (data-editor) */
function EditorThumb({ id, dim, locked }: { id: EditorId; dim: boolean; locked: boolean }) {
  const lines = [
    ['w-3/5', 'bg-purple'],
    ['w-2/5', 'bg-cyan'],
    ['w-1/2', 'bg-yellow'],
    ['w-1/3', 'bg-green'],
  ]
  return (
    <span
      data-editor={id}
      data-dark={dim || undefined}
      className={`relative block h-20 bg-bg ${locked ? 'opacity-45 grayscale-[.4]' : ''}`}
      aria-hidden
    >
      <span className="flex h-3.5 items-center gap-1 bg-panel-3 px-1.5">
        <i className="size-1.5 rounded-full bg-red" />
        <i className="size-1.5 rounded-full bg-yellow" />
        <i className="size-1.5 rounded-full bg-green" />
      </span>
      <span className="flex flex-col gap-1.5 p-2.5">
        {lines.map(([w, c], i) => (
          <span key={i} className="flex items-center gap-1.5">
            <i className="h-1.5 w-2 rounded-sm bg-faint" />
            <i className={`h-1.5 rounded-sm ${w} ${c}`} />
          </span>
        ))}
      </span>
    </span>
  )
}

export default SettingsScreen
