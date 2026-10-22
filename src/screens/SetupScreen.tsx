import { useEffect, useState } from 'react'
import { playSfx } from '../audio/audio'
import ScreenHeader from '../components/ScreenHeader'
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
}

/** Lo que se está abriendo: la caja tiembla y después muestra el artefacto */
type Opening = { id: string; level: number; phase: 'shake' | 'reveal' }

/** 🖥 Tu setup (F3): el escritorio con los artefactos, las cajas para abrir y la colección */
function SetupScreen({ artifacts, boxes, tokens, boxesBought, onOpen, onBuy }: SetupScreenProps) {
  const [opening, setOpening] = useState<Opening | null>(null)
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

  return (
    <section className="min-h-0 flex-1 overflow-y-auto px-3 pt-2.5 pb-6 md:px-4.5">
      <ScreenHeader icon="▣" title="Tu setup">
        Los artefactos de tu escritorio dan mejoras <b className="text-text">para siempre</b>: no se pierden al vender
        la empresa. Salen de las cajas de suministros y los repetidos suben de nivel (hasta Nv.{MAX_ARTIFACT_LEVEL}).
      </ScreenHeader>

      {/* El escritorio: cada artefacto tiene su lugar; los que no tenés todavía son una silueta */}
      <div className="mb-5 max-w-xl overflow-hidden rounded-2xl border border-line-2">
        <div className="bg-linear-to-b from-[#1b2135] to-[#232b45] px-4 pt-4 pb-2">
          <p className="mb-3 font-mono text-[11px] text-muted">
            🏺 {owned}/{ARTIFACTS.length} artefactos
          </p>
          <div className="grid grid-cols-5 gap-2 sm:gap-3">
            {ARTIFACTS.map((a) => {
              const level = artifacts[a.id] ?? 0
              const rarity = RARITIES[a.rarity]
              return (
                <div
                  key={a.id}
                  title={level ? `${a.name} · Nv.${level}: ${a.text(level)}` : '??? · todavía no lo encontraste'}
                  className={`relative grid aspect-square place-items-center rounded-xl border-2 text-2xl sm:text-4xl ${
                    level
                      ? `${rarity.border} ${rarity.glow} bg-panel-2`
                      : 'border-dashed border-line bg-panel/40 grayscale'
                  }`}
                >
                  <span className={level ? '' : 'opacity-15'}>{level ? a.icon : '❔'}</span>
                  {level > 0 && (
                    <span className={`absolute right-1 bottom-0.5 font-mono text-[10px] font-bold ${rarity.text}`}>
                      {level >= MAX_ARTIFACT_LEVEL ? 'MAX' : `Nv.${level}`}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
        {/* La madera del escritorio */}
        <div className="h-4 bg-linear-to-b from-[#6b4a2b] to-[#4a3220]" />
      </div>

      {/* Cajas */}
      <div className="mb-5 flex max-w-3xl flex-wrap items-center gap-3 rounded-xl border border-yellow/40 bg-yellow/5 p-4">
        <span className="text-4xl">📦</span>
        <div className="min-w-0 flex-1">
          <p className="font-extrabold">
            {boxes} caja{boxes === 1 ? '' : 's'} de suministros
          </p>
          <p className="text-xs text-muted">
            Se ganan venciendo clientes jefe y con cada venta de la empresa. También se compran con tokens.
          </p>
          <p className="mt-1 font-mono text-xs">
            🪙 Tenés <b className="text-purple">{tokens}</b> token{tokens === 1 ? '' : 's'}
            {tokens < price && <span className="text-faint"> · te faltan {price - tokens} para la próxima caja</span>}
          </p>
        </div>
        <button
          type="button"
          onClick={open}
          disabled={boxes < 1 || opening !== null}
          className="cursor-pointer rounded-xl bg-yellow px-5 py-2.5 text-sm font-extrabold text-[#2b1a00] disabled:cursor-default disabled:bg-panel-3 disabled:text-faint"
        >
          Abrir caja
        </button>
        <button
          type="button"
          onClick={onBuy}
          disabled={tokens < price}
          className="cursor-pointer rounded-xl border border-purple/50 px-4 py-2.5 font-mono text-xs font-bold text-purple hover:bg-purple/10 disabled:cursor-default disabled:border-line disabled:text-faint"
        >
          Comprar · {price} tokens
        </button>
      </div>

      {/* Colección por rareza */}
      {(Object.keys(RARITIES) as Rarity[]).map((r) => {
        const items = ARTIFACTS.filter((a) => a.rarity === r)
        return (
          <div key={r} className="mb-4 max-w-3xl">
            <p className={`mb-2 font-mono text-xs ${RARITIES[r].text}`}>
              {RARITIES[r].name.toLowerCase()}/ · {items.filter((a) => artifacts[a.id]).length}/{items.length}
            </p>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {items.map((a) => {
                const level = artifacts[a.id] ?? 0
                return (
                  <li
                    key={a.id}
                    className={`flex items-center gap-3 rounded-xl border p-3 ${level ? `${RARITIES[r].border} bg-panel-2` : 'border-line bg-panel/50'}`}
                  >
                    <span className={`text-2xl ${level ? '' : 'opacity-20 grayscale'}`}>{level ? a.icon : '❔'}</span>
                    <span className="min-w-0">
                      <span className="block text-sm font-extrabold">
                        {level ? a.name : '???'}
                        {level > 0 && <span className={`ml-2 font-mono text-xs ${RARITIES[r].text}`}>Nv.{level}</span>}
                      </span>
                      <span className="block text-xs text-muted">
                        {level
                          ? `${a.text(level)}${level < MAX_ARTIFACT_LEVEL ? ` · Nv.${level + 1}: ${a.text(level + 1)}` : ''}`
                          : 'Todavía no lo encontraste'}
                      </span>
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}

      {opening && <BoxOpening opening={opening} onClose={() => setOpening(null)} />}
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
