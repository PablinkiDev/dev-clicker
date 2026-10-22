// 👹 Clientes jefe (F4): cada tanto llega un contrato enorme con reloj estricto y una condición.
// Si le ganás: mucha plata y una 📦 caja de suministros. Si perdés: solo se pierde la oportunidad.
import type { SpecialRule } from '../game/types'

export type Boss = {
  id: string
  icon: string
  /** Nombre del cliente (aparece en vez del de la plantilla) */
  name: string
  /** Lo que pide (G3: título propio, en vez del de la plantilla) */
  title: string
  quote: string
  /** Etapa desde la que puede aparecer (índice en STAGES) */
  minStage: number
  /** Condición extra (las mismas reglas que los contratos especiales) */
  rule?: SpecialRule
}

export const BOSSES: Boss[] = [
  {
    id: 'facebookAunt',
    icon: '🧓',
    name: 'La Tía Que Quiere Que Sea Como Facebook',
    title: 'Una red social para la familia',
    quote: '“Algo simple, como Facebook. Pero con mi receta de pastafrola.”',
    minStage: 1,
  },
  {
    id: 'menuRestaurant',
    icon: '🍝',
    name: 'El Restaurante Que Cambia El Menú Cada Hora',
    title: 'Menú digital que cambia solo',
    quote: '“¿Ya está? Porque sacamos los ñoquis. Y volvimos a poner los ñoquis.”',
    minStage: 1,
    rule: 'rush',
  },
  {
    id: 'pivotStartup',
    icon: '🌀',
    name: 'La Startup Que Pivotea Cada Hora',
    title: 'La app definitiva (versión 14)',
    quote: '“Ahora somos una app de delivery. Para perros. En la blockchain.”',
    minStage: 2,
    rule: 'rush',
  },
  {
    id: 'influencer',
    icon: '📸',
    name: 'El Influencer Con Tres Millones De Seguidores',
    title: 'Tienda de merch hecha a mano',
    quote: '“Lo quiero hecho por vos. A mano. Se nota cuando lo hace un equipo.”',
    minStage: 2,
    rule: 'clicksOnly',
  },
  {
    id: 'cobolBank',
    icon: '🏦',
    name: 'El Banco Que Usa COBOL',
    title: 'Modernizar el homebanking de 1987',
    quote: '“El sistema anda desde 1987. No lo toques. Bueno, tocalo, pero no lo rompas.”',
    minStage: 3,
    rule: 'giant',
  },
  {
    id: 'ministry',
    icon: '🏛️',
    name: 'El Ministerio De Trámites Digitales',
    title: 'Trámite 100 % online (con turno presencial)',
    quote: '“Necesitamos el formulario 27-B. Y el 27-B bis. Y una fotocopia del 27-B.”',
    minStage: 3,
  },
  {
    id: 'aiCeo',
    icon: '🤖',
    name: 'El CEO Que Leyó Un Artículo Sobre IA',
    title: 'Ponerle IA a todo',
    quote: '“Ponele IA. No sé a qué, pero ponele. Los inversores lo piden.”',
    minStage: 4,
    rule: 'rush',
  },
  {
    id: 'approvals',
    icon: '🏢',
    name: 'La Multinacional Con Catorce Capas De Aprobación',
    title: 'Un botón (aprobado por 14 áreas)',
    quote: '“Antes de empezar, ¿podés mandar el plan a legales, compras, seguridad y a Carlos?”',
    minStage: 4,
    rule: 'giant',
  },
]

/** Cada cuántos contratos entregados aparece un jefe (desde Estudio) */
export const BOSS_EVERY = 10

/** Cómo se agranda una oferta para volverla jefe: más código, algo más de plazo y premios grandes */
export const BOSS_SCALE = { code: 2, time: 1.5, money: 10, xp: 4, rep: 3 }

export const getBoss = (id: string) => BOSSES.find((b) => b.id === id)

/** Jefes que pueden aparecer en esta etapa: los de la etapa y la anterior */
export function bossesFor(stage: number): Boss[] {
  const pool = BOSSES.filter((b) => b.minStage <= stage && b.minStage >= stage - 1)
  return pool.length ? pool : BOSSES.filter((b) => b.minStage <= stage)
}
