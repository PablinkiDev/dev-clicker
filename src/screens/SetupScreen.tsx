import { useEffect, useState } from 'react'
import { playSfx } from '../audio/audio'
import ScreenHeader from '../components/ScreenHeader'
import ProfileEditor from '../components/ProfileEditor'
import SeenOnLeave from '../components/SeenOnLeave'
import type { Profile } from '../data/personalization'
import {
  ARTIFACTS,
  MAX_ARTIFACT_LEVEL,
  RARITIES,
  boxPrice,
  getArtifact,
  type ArtifactLevels,
  type Rarity,
} from '../data/artifacts'

type SetupScreenProps = {
  artifacts: ArtifactLevels
  boxes: number
  tokens: number
  boxesBought: number
  /** Abre una caja: devuelve qué artefacto salió (o null si ya tenés todo al máximo) */
  onOpen: () => string | null
  onBuy: () => void
  /** 🧑‍💻 Tu perfil (G4) */
  profile: Profile
  unlocked: string[]
  onProfile: (patch: Partial<Profile>) => void
  /** Los artefactos se ven recién cuando se desbloquean (la primera caja) */
  showArtifacts: boolean
  /** 🆕 Accesorios y títulos recién ganados (H4) */
  news: string[]
  onSeen: (keys: string[]) => void
}

/** Lo que se está abriendo: la caja tiembla y después muestra el artefacto */
type Opening = { id: string; level: number; phase: 'shake' | 'reveal' }

/** 🖥 Tu setup (F3): el escritorio con los artefactos, las cajas para abrir y la colección */
function SetupScreen({
  artifacts,
  boxes,
  tokens,
  boxesBought,
  onOpen,
  onBuy,
  profile,
  unlocked,
  onProfile,
  showArtifacts,
  news,
  onSeen,
}: SetupScreenProps) {
  const [opening, setOpening] = useState<Opening | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const owned = ARTIFACTS.filter((a) => artifacts[a.id]).length
  const price = boxPrice(boxesBought)

  function open() {
    if (boxes < 1 || opening) return
    const id = onOpen()
    if (!id) return
    playSfx('notify')
    setOpening({ id, level: (artifacts[id] ?? 0) + 1, phase: 'shake' })
  }

  // La caja tiembla un momento antes de mostrar lo que salió
  useEffect(() => {
    if (opening?.phase !== 'shake') return
    const t = setTimeout(() => {
      const rarity = getArtifact(opening.id)?.rarity
      playSfx(rarity === 'epic' || rarity === 'legendary' ? 'levelUp' : 'achievement')
      setOpening((o) => (o ? { ...o, phase: 'reveal' } : o))
    }, 1100)
    return () => clearTimeout(t)
  }, [opening])

  const rarities = Object.keys(RARITIES) as Rarity[]
  const picked = getArtifact(selected ?? '') ?? null
  const pickedLevel = picked ? (artifacts[picked.id] ?? 0) : 0

  return (
    <section className="min-h-0 flex-1 overflow-y-auto px-3 pt-2.5 pb-6 md:px-4.5">
      <ScreenHeader icon="▣" title="Tu setup">
        Vos y tu escritorio: no se pierden al vender la empresa.
        {showArtifacts && (
          <>
            {' '}
            Los artefactos dan mejoras <b className="text-text">para siempre</b> y los repetidos suben de nivel (hasta
            Nv.
            {MAX_ARTIFACT_LEVEL}).
          </>
        )}
      </ScreenHeader>

      <SeenOnLeave keys={news} onSeen={onSeen} />
      <div
        className={`grid grid-cols-1 items-start gap-3 ${showArtifacts ? 'lg:grid-cols-[280px_1fr_280px]' : 'max-w-md'}`}
      >
        <ProfileEditor profile={profile} unlocked={unlocked} onChange={onProfile} news={news} />

        {showArtifacts && (
          <>
            {/* El escritorio: cada artefacto tiene su lugar; tocalo para ver qué da */}
            <div className="flex min-w-0 flex-col gap-3 rounded-2xl border border-line-2 bg-panel-2 p-3 sm:p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 font-mono text-[11px] text-muted">
                <span>
                  🏺 Escritorio · {owned}/{ARTIFACTS.length}
                </span>
                <span className="flex gap-2.5">
                  {rarities.map((r) => {
                    const items = ARTIFACTS.filter((x) => x.rarity === r)
                    return (
                      <span key={r} className={RARITIES[r].text} title={RARITIES[r].name}>
                        {RARITIES[r].name.slice(0, 3)}. {items.filter((x) => artifacts[x.id]).length}/{items.length}
                      </span>
                    )
                  })}
                </span>
              </div>
              <div className="overflow-hidden rounded-xl border border-line">
                <div className="grid grid-cols-4 justify-center gap-2 bg-linear-to-b from-panel to-panel-3 p-3 sm:grid-cols-[repeat(8,minmax(0,84px))]">
                  {ARTIFACTS.map((x) => {
                    const level = artifacts[x.id] ?? 0
                    const rarity = RARITIES[x.rarity]
                    return (
                      <button
                        key={x.id}
                        type="button"
                        onClick={() => setSelected(x.id)}
                        aria-pressed={selected === x.id}
                        aria-label={level ? `${x.name} Nv.${level}` : 'Artefacto sin encontrar'}
                        className={`relative grid aspect-square cursor-pointer place-items-center rounded-xl border-2 text-2xl sm:text-3xl ${
                          level ? `${rarity.border} ${rarity.glow} bg-panel-2` : 'border-dashed border-line bg-panel/40'
                        } ${selected === x.id ? 'ring-2 ring-green ring-offset-2 ring-offset-panel' : ''}`}
                      >
                        <span className={level ? '' : 'text-lg opacity-25 grayscale'}>{level ? x.icon : '❔'}</span>
                        {level > 0 && (
                          <span className={`absolute right-1 bottom-0.5 font-mono text-[9px] font-bold ${rarity.text}`}>
                            {level >= MAX_ARTIFACT_LEVEL ? 'MAX' : `Nv.${level}`}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
                {/* La madera del escritorio */}
                <div className="h-3.5 bg-linear-to-b from-[#6b4a2b] to-[#4a3220]" />
              </div>

              {/* Detalle del artefacto tocado */}
              <div className="flex min-h-18 items-center gap-3 rounded-xl border border-line bg-panel p-3">
                {picked ? (
                  <>
                    <span className={`text-4xl ${pickedLevel ? '' : 'opacity-25 grayscale'}`}>
                      {pickedLevel ? picked.icon : '❔'}
                    </span>
                    <span className="min-w-0">
                      <span
                        className={`block font-mono text-[10px] font-bold tracking-widest uppercase ${RARITIES[picked.rarity].text}`}
                      >
                        {RARITIES[picked.rarity].name}
                        {pickedLevel > 0 && ` · Nv.${pickedLevel}`}
                      </span>
                      <span className="block font-extrabold">{pickedLevel ? picked.name : '???'}</span>
                      <span className="block text-xs text-muted">
                        {pickedLevel ? picked.text(pickedLevel) : 'Todavía no lo encontraste: sale de las cajas'}
                        {pickedLevel > 0 && pickedLevel < MAX_ARTIFACT_LEVEL && (
                          <span className="text-faint">
                            {' '}
                            · Nv.{pickedLevel + 1}: {picked.text(pickedLevel + 1)}
                          </span>
                        )}
                      </span>
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-muted">👆 Tocá un artefacto para ver qué mejora da.</span>
                )}
              </div>
            </div>

            {/* Cajas */}
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-yellow/40 bg-yellow/5 p-4 text-center">
              <span className="text-5xl">📦</span>
              <p className="text-base font-extrabold">
                {boxes} caja{boxes === 1 ? '' : 's'} de suministros
              </p>
              <button
                type="button"
                onClick={open}
                disabled={boxes < 1 || opening !== null}
                className="w-full cursor-pointer rounded-xl bg-yellow py-2.5 text-sm font-extrabold text-[#2b1a00] disabled:cursor-default disabled:bg-panel-3 disabled:text-faint"
              >
                Abrir caja
              </button>
              <div className="mt-1 w-full">
                <div className="flex justify-between font-mono text-[11px] text-muted">
                  <span>
                    🪙 <b className="text-purple">{tokens}</b> token{tokens === 1 ? '' : 's'}
                  </span>
                  <span>caja: {price}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-panel-3">
                  <i
                    className="block h-full bg-purple"
                    style={{ width: `${Math.min(100, (tokens / price) * 100)}%` }}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={onBuy}
                disabled={tokens < price}
                className="w-full cursor-pointer rounded-xl border border-purple/50 py-2 font-mono text-xs font-bold text-purple hover:bg-purple/10 disabled:cursor-default disabled:border-line disabled:text-faint"
              >
                Comprar · {price} tokens
              </button>
              <p className="text-[11px] text-faint">Se ganan venciendo clientes jefe y con cada venta de la empresa.</p>
            </div>
          </>
        )}
      </div>

      {opening && (
        <BoxOpening
          opening={opening}
          onClose={() => {
            setSelected(opening.id)
            setOpening(null)
          }}
        />
      )}
    </section>
  )
}

/** La caja que tiembla y después el artefacto, con el brillo de su rareza */
function BoxOpening({ opening, onClose }: { opening: Opening; onClose: () => void }) {
  const artifact = getArtifact(opening.id)
  if (!artifact) return null
  const rarity = RARITIES[artifact.rarity]
  return (
    <div className="fixed inset-0 z-60 grid place-items-center bg-black/70 p-3 backdrop-blur-sm">
      {opening.phase === 'shake' ? (
        <span className="animate-shake text-8xl">📦</span>
      ) : (
        <div
          role="dialog"
          aria-label={`Salió: ${artifact.name}`}
          className={`w-full max-w-sm animate-pop rounded-2xl border-2 bg-panel-2 p-6 text-center ${rarity.border} ${rarity.glow}`}
        >
          <p className={`font-mono text-xs font-bold tracking-widest uppercase ${rarity.text}`}>{rarity.name}</p>
          <p className="my-3 text-7xl">{artifact.icon}</p>
          <p className="text-xl font-extrabold">{artifact.name}</p>
          <p className="mt-1 font-mono text-sm text-green">
            {opening.level === 1 ? '¡Nuevo artefacto!' : `Sube a Nv.${opening.level}`}
          </p>
          <p className="mt-2 text-sm text-muted">{artifact.text(opening.level)}</p>
          <button
            type="button"
            onClick={onClose}
            className="mt-5 w-full cursor-pointer rounded-xl bg-green py-2.5 text-sm font-extrabold text-[#062312]"
          >
            ¡Genial!
          </button>
        </div>
      )}
    </div>
  )
}

export default SetupScreen
