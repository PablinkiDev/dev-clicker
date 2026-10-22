// 🧑‍💻 Tu perfil (G4): avatar, título y mascota. Algunas cosas se desbloquean con logros.
import type { ReactNode } from 'react'
import { ACHIEVEMENTS } from '../data/achievements'
import {
  FACE_ITEMS,
  HEAD_ITEMS,
  HOODIES,
  MASCOTS,
  SKINS,
  TITLES,
  isUnlocked,
  type Choice,
  type Profile,
} from '../data/personalization'
import Avatar from './Avatar'
import NewBadge from './NewBadge'

type ProfileEditorProps = {
  profile: Profile
  /** Logros conseguidos (desbloquean accesorios, colores y títulos) */
  unlocked: string[]
  onChange: (patch: Partial<Profile>) => void
  /** 🆕 Lo recién ganado (H4): "look:head:crown", "title:legend"… */
  news?: string[]
}

/** Qué hace falta para desbloquearlo (los logros secretos no se cuentan) */
function lockHint(choice: Choice): string {
  const achievement = ACHIEVEMENTS.find((a) => a.id === choice.unlock)
  if (!achievement) return ''
  return achievement.secret ? '🔒 Se desbloquea con un logro secreto' : `🔒 Logro: ${achievement.name}`
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-1 font-mono text-[11px] text-muted">{label}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  )
}

function Chip({
  selected,
  locked,
  title,
  onClick,
  children,
  isNew = false,
}: {
  selected: boolean
  isNew?: boolean
  locked?: boolean
  title?: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={locked}
      title={title}
      aria-pressed={selected}
      className={`cursor-pointer rounded-lg border px-2.5 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-40 ${
        selected ? 'border-cyan bg-cyan/15 font-bold text-text' : 'border-line-2 bg-panel text-muted hover:text-text'
      }`}
    >
      {locked ? '🔒 ' : ''}
      {children}
      {isNew && <NewBadge className="ml-1.5" />}
    </button>
  )
}

function ProfileEditor({ profile, unlocked, onChange, news = [] }: ProfileEditorProps) {
  const titles = TITLES.filter((t) => isUnlocked(t, unlocked))
  const lockedTitles = TITLES.length - titles.length

  return (
    <div className="mb-5 flex max-w-3xl flex-col gap-4 rounded-2xl border border-line-2 bg-panel-2 p-4 sm:flex-row">
      <div className="flex shrink-0 flex-col items-center gap-1.5 sm:w-36">
        <Avatar profile={profile} size={112} />
        <p className="font-extrabold">Vos</p>
        <p className="text-center text-xs text-purple">
          {TITLES.find((t) => t.id === profile.title)?.name ?? 'Sin título'}
        </p>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <Row label="Piel">
          {SKINS.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-label={s.name}
              aria-pressed={profile.skin === s.id}
              onClick={() => onChange({ skin: s.id })}
              style={{ background: s.hex }}
              className={`size-7 cursor-pointer rounded-full ${profile.skin === s.id ? 'ring-2 ring-text ring-offset-2 ring-offset-panel-2' : ''}`}
            />
          ))}
        </Row>
        <Row label="Buzo">
          {HOODIES.map((h) => {
            const locked = !isUnlocked(h, unlocked)
            return (
              <button
                key={h.id}
                type="button"
                aria-label={h.name}
                aria-pressed={profile.hoodie === h.id}
                title={locked ? lockHint(h) : h.name}
                disabled={locked}
                onClick={() => onChange({ hoodie: h.id })}
                style={{ background: h.hex }}
                className={`relative grid size-7 cursor-pointer place-items-center rounded-full text-[11px] disabled:cursor-not-allowed disabled:opacity-40 ${
                  profile.hoodie === h.id ? 'ring-2 ring-text ring-offset-2 ring-offset-panel-2' : ''
                }`}
              >
                {locked ? '🔒' : ''}
                {news.includes(`look:hoodie:${h.id}`) && (
                  <i className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-yellow" aria-label="nuevo" />
                )}
              </button>
            )
          })}
        </Row>
        <Row label="Cabeza">
          {HEAD_ITEMS.map((item) => (
            <Chip
              key={item.id}
              selected={profile.head === item.id}
              locked={!isUnlocked(item, unlocked)}
              title={isUnlocked(item, unlocked) ? undefined : lockHint(item)}
              onClick={() => onChange({ head: item.id })}
              isNew={news.includes(`look:head:${item.id}`)}
            >
              {item.name}
            </Chip>
          ))}
        </Row>
        <Row label="Cara">
          {FACE_ITEMS.map((item) => (
            <Chip
              key={item.id}
              selected={profile.face === item.id}
              locked={!isUnlocked(item, unlocked)}
              title={isUnlocked(item, unlocked) ? undefined : lockHint(item)}
              onClick={() => onChange({ face: item.id })}
              isNew={news.includes(`look:face:${item.id}`)}
            >
              {item.name}
            </Chip>
          ))}
        </Row>
        <Row label="Título (se ganan con logros)">
          <Chip selected={profile.title === null} onClick={() => onChange({ title: null })}>
            Ninguno
          </Chip>
          {titles.map((t) => (
            <Chip
              key={t.id}
              selected={profile.title === t.id}
              onClick={() => onChange({ title: t.id })}
              isNew={news.includes(`title:${t.id}`)}
            >
              {t.name}
            </Chip>
          ))}
          {lockedTitles > 0 && (
            <span className="self-center font-mono text-[11px] text-faint">+{lockedTitles} por desbloquear</span>
          )}
        </Row>
        <Row label="Mascota de la oficina">
          <Chip selected={profile.mascot === null} onClick={() => onChange({ mascot: null })}>
            Ninguna
          </Chip>
          {MASCOTS.map((m) => (
            <Chip key={m.id} selected={profile.mascot === m.id} onClick={() => onChange({ mascot: m.id })}>
              {m.icon} {m.name}
            </Chip>
          ))}
        </Row>
      </div>
    </div>
  )
}

export default ProfileEditor
