// Tipos del juego: describen la forma de los datos, no su comportamiento.

export type Reward = {
  money: number
  xp: number
  rep: number
}

export type Contract = {
  id: string
  client: string
  title: string
  /** Lo que dice el cliente al hacer el pedido */
  quote: string
  /** Líneas de código que hay que escribir para completarlo */
  code: number
  /** Segundos de plazo desde que se acepta */
  time: number
  reward: Reward
}
