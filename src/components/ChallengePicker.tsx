import { useState } from 'react'
import { CHALLENGES, CHALLENGE_FIRST_BOXES } from '../data/challenges'
import type { CompanyIdentity } from '../data/personalization'
import CompanyEditor from './CompanyEditor'

type ChallengePickerProps = {
  /** Desafíos que ya completaste (los que no, dan cajas extra la primera vez) */
  done: string[]
  /** 🏢 Nombre y logo propuestos para la empresa nueva (G4) */
  company: CompanyIdentity
  onPick: (id: string | null, company: CompanyIdentity) => void
}

/** 🏁 Al empezar una empresa nueva: ponerle nombre y logo, y elegir un desafío opcional (o jugar sin desafío) */
function ChallengePicker({ done, company: proposed, onPick }: ChallengePickerProps) {
  const [company, setCompany] = useState(proposed)
  return (
    <div className="fixed inset-0 z-60 grid place-items-center overflow-y-auto bg-black/70 p-3 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-label="Elegí un desafío" className="w-full max-w-3xl">
        <p className="text-center font-mono text-[11px] font-bold tracking-widest text-orange uppercase">
          🏁 Empresa nueva
        </p>
        <h2 className="mb-3 text-center text-2xl font-extrabold">¿Cómo se llama tu nueva empresa?</h2>
        <div className="mx-auto mb-6 max-w-md rounded-2xl border border-line-2 bg-panel-2 p-4">
          <CompanyEditor value={company} onChange={setCompany} />
        </div>
        <h2 className="mb-1 text-center text-2xl font-extrabold">¿Le sumás un desafío?</h2>
        <p className="mx-auto mb-5 max-w-xl text-center text-sm text-muted">
          Es opcional: una regla que complica esta empresa. Si la vendés con el desafío, ganás más tokens. La primera
          vez que completás cada uno, también te llevás {CHALLENGE_FIRST_BOXES} 📦 cajas extra.
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {CHALLENGES.map((c) => {
            const completed = done.includes(c.id)
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onPick(c.id, company)}
                className="flex cursor-pointer flex-col rounded-2xl border-2 border-line-2 bg-panel-2 p-4 text-left transition-transform hover:-translate-y-1 hover:border-orange/70"
              >
                <span className="flex items-center justify-between">
                  <span className="text-3xl">{c.icon}</span>
                  <span className="rounded-md bg-purple/15 px-2 py-0.5 font-mono text-xs font-bold text-purple">
                    +{Math.round(c.tokenBonus * 100)} % tokens
                  </span>
                </span>
                <span className="mt-2 font-extrabold">{c.name}</span>
                <span className="text-sm text-muted">{c.rule}</span>
                <span className={`mt-2 font-mono text-[11px] ${completed ? 'text-green' : 'text-yellow'}`}>
                  {completed ? '✓ ya lo completaste' : `📦 +${CHALLENGE_FIRST_BOXES} cajas la primera vez`}
                </span>
              </button>
            )
          })}
        </div>

        <button
          type="button"
          onClick={() => onPick(null, company)}
          className="mx-auto mt-5 block cursor-pointer rounded-xl border border-line-2 bg-panel-2 px-6 py-2.5 text-sm font-bold text-muted hover:text-text"
        >
          Jugar sin desafío
        </button>
      </div>
    </div>
  )
}

export default ChallengePicker
