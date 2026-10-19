import type { Lang } from '../data/techs'

// Tipos del juego: describen la forma de los datos, no su comportamiento.

export type Reward = {
  money: number
  xp: number
  rep: number
}

export type Difficulty = 'easy' | 'mid' | 'hard'

/** Plantilla de un contrato: a partir de ella se generan las ofertas */
export type ContractTemplate = {
  id: string
  difficulty: Difficulty
  client: string
  title: string
  /** Lo que dice el cliente al hacer el pedido */
  quote: string
  /** Líneas de código que hay que escribir para completarlo */
  code: number
  /** Segundos de plazo desde que se acepta */
  time: number
  reward: Reward
  /** Lenguaje del archivo que se escribe; si falta, es HTML */
  lang?: Lang
  /** Contrato que aparece una sola vez (el guiado) */
  once?: boolean
}

/** Una oferta concreta del tablón: una plantilla con valores propios y un id único */
export type Contract = ContractTemplate & {
  uid: string
}
