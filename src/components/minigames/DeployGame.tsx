// 📦 Ordená el deploy: tocar los pasos en el orden correcto. Un error y se cae ese deploy.
import { useRef, useState } from 'react'
import { DEPLOY_PIPELINES, DEPLOY_SECONDS, pickSome } from '../../data/minigames'
import { TimeBar, type GameProps } from './shared'
import { useCountdown } from './useCountdown'

type Round = { steps: string[]; shuffled: string[] }

/** Los pasos mezclados (nunca en el orden correcto) */
function createRound(steps: string[]): Round {
  let shuffled = pickSome(steps, steps.length)
  while (shuffled.every((s, i) => s === steps[i])) shuffled = pickSome(steps, steps.length)
  return { steps, shuffled }
}

function DeployGame({ onDone }: GameProps) {
  const [rounds] = useState(() => pickSome(DEPLOY_PIPELINES, 3).map(createRound))
  const [round, setRound] = useState(0)
  const [hits, setHits] = useState(0)
  /** Cuántos pasos van bien en este deploy */
  const [done, setDone] = useState(0)
  const [failed, setFailed] = useState(false)
  const finished = useRef(false)
  const finish = (total: number) => {
    if (finished.current) return
    finished.current = true
    onDone(total)
  }
  const left = useCountdown(DEPLOY_SECONDS, 0, () => finish(hits))
  const { steps, shuffled } = rounds[round]
  const over = failed || done === steps.length

  function next(total: number, wait: number) {
    setTimeout(() => {
      if (round === rounds.length - 1) finish(total)
      else {
        setRound(round + 1)
        setDone(0)
        setFailed(false)
      }
    }, wait)
  }

  function tap(step: string) {
    if (over || steps.indexOf(step) < done) return
    if (step !== steps[done]) {
      setFailed(true)
      next(hits, 1600)
      return
    }
    setDone(done + 1)
    if (done + 1 === steps.length) {
      setHits(hits + 1)
      next(hits + 1, 700)
    }
  }

  return (
    <>
      <p className="mb-1 font-mono text-xs text-muted">
        Deploy {round + 1}/3 · exitosos {hits}
      </p>
      <TimeBar left={left} total={DEPLOY_SECONDS} />
      <ul className="flex flex-col gap-1.5">
        {shuffled.map((step) => {
          const position = steps.indexOf(step)
          const ok = position < done
          return (
            <li key={step}>
              <button
                type="button"
                onClick={() => tap(step)}
                disabled={over || ok}
                className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm disabled:cursor-default ${
                  ok
                    ? 'border-green/60 bg-green/10'
                    : failed
                      ? 'border-line opacity-70'
                      : 'border-line-2 bg-panel hover:border-cyan/60 hover:bg-cyan/5'
                }`}
              >
                <span
                  className={`grid size-6 shrink-0 place-items-center rounded-full font-mono text-xs font-bold ${
                    ok ? 'bg-green text-[#062312]' : 'bg-panel-3 text-faint'
                  }`}
                >
                  {ok || failed ? position + 1 : '?'}
                </span>
                {step}
              </button>
            </li>
          )
        })}
      </ul>
      <p className="mt-2 min-h-5 text-xs">
        {failed ? (
          <span className="text-red">✗ Se cayó el deploy. El orden era el de los números.</span>
        ) : done === steps.length ? (
          <span className="text-green">✓ ¡Deploy exitoso!</span>
        ) : (
          <span className="text-muted">¿Qué va primero?</span>
        )}
      </p>
    </>
  )
}

export default DeployGame
