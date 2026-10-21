import { ACHIEVEMENTS, CATEGORIES } from '../data/achievements'
import { formatNumber } from '../game/format'
import type { GameState } from '../game/reducer'
import { ACHIEVEMENT_BONUS } from '../game/records'

/** Pestaña Logros de la pantalla Empresa: todos los logros por categoría, con su progreso */
function AchievementList({ state }: { state: GameState }) {
  const unlocked = new Set(state.records.unlocked)
  const bonus = Math.round(ACHIEVEMENT_BONUS * unlocked.size * 100)

  return (
    <div>
      <div className="mb-4 max-w-xl rounded-xl border border-yellow/40 bg-yellow/10 p-3.5">
        <p className="font-extrabold">
          🏆 {unlocked.size} de {ACHIEVEMENTS.length} logros
        </p>
        <p className="text-xs text-muted">
          Cada logro suma <b className="text-text">+1 % de producción</b> (clics y equipo) para siempre: no se pierden
          al vender la empresa. Bonus actual: <b className="text-yellow">+{bonus} %</b>
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-panel-3">
          <div className="h-full bg-yellow" style={{ width: `${(unlocked.size / ACHIEVEMENTS.length) * 100}%` }} />
        </div>
      </div>

      {CATEGORIES.map((cat) => {
        const items = ACHIEVEMENTS.filter((a) => a.category === cat.id)
        const done = items.filter((a) => unlocked.has(a.id)).length
        return (
          <section key={cat.id} className="mb-5">
            <p className="mb-2 font-mono text-xs text-muted">
              {cat.icon} {cat.name.toLowerCase()}/ · {done}/{items.length}
            </p>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((a) => {
                const has = unlocked.has(a.id)
                const hidden = a.secret && !has
                const progress = !has && !hidden ? a.progress?.(state) : undefined
                return (
                  <li
                    key={a.id}
                    className={`flex items-center gap-3 rounded-xl border p-3 ${
                      has ? 'border-yellow/40 bg-yellow/8' : 'border-line bg-panel-2'
                    }`}
                  >
                    <span
                      className={`grid size-10 shrink-0 place-items-center rounded-lg text-xl ${
                        has ? 'bg-yellow/15' : 'bg-panel-3 grayscale opacity-50'
                      }`}
                    >
                      {hidden ? '❓' : a.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block text-sm font-extrabold ${has ? 'text-yellow' : ''}`}>
                        {hidden ? '???' : a.name}
                      </span>
                      <span className="block text-xs text-muted">{hidden ? 'Logro secreto' : a.description}</span>
                      {progress && progress[1] > 1 && (
                        <span className="mt-1 flex items-center gap-2">
                          <span className="h-1 flex-1 overflow-hidden rounded-full bg-panel-3">
                            <span
                              className="block h-full bg-yellow/70"
                              style={{ width: `${(progress[0] / progress[1]) * 100}%` }}
                            />
                          </span>
                          <span className="font-mono text-[10px] text-faint">
                            {formatNumber(progress[0])}/{formatNumber(progress[1])}
                          </span>
                        </span>
                      )}
                    </span>
                    {has && <span className="text-green">✓</span>}
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </div>
  )
}

export default AchievementList
