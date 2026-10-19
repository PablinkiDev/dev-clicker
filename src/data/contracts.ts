import type { Contract } from '../game/types'

// Contrato guiado del GDD (§4): 25 líneas, $100, +10 XP y +2 de reputación
export const FIRST_CONTRACT: Contract = {
  id: 'mi-sobrino',
  client: 'Tía Norma',
  title: 'Mi sobrino sabe HTML',
  quote: 'Mi sobrino dijo que era fácil, pero se fue a jugar a la Play. ¿Me lo terminás?',
  code: 25,
  reward: { money: 100, xp: 10, rep: 2 },
}
