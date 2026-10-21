import type { Lang, TechId } from '../data/techs'

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
  /** Otras tecnologías que pide (contratos fullstack), además de la del lenguaje */
  stack?: TechId[]
  /** Etapa mínima para que aparezca (índice en STAGES); si falta, desde el principio */
  minStage?: number
  /** Última etapa en la que aparece; si falta, la siguiente a minStage */
  maxStage?: number
  /** Contrato que aparece una sola vez (el guiado) */
  once?: boolean
}

/** Reglas de los contratos especiales (dorados) */
export type SpecialRule = 'clicksOnly' | 'rush' | 'giant'

/** Una oferta concreta del tablón: una plantilla con valores propios y un id único */
export type Contract = ContractTemplate & {
  uid: string
  /** Contrato especial (D7): paga mucho más, con una condición rara */
  special?: SpecialRule
}
