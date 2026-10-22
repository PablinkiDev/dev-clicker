// Oficinas (GDD §6): se compran con dinero y definen cuántos empleados entran.
// El equipo se conserva al mudarse.

export type Office = {
  name: string
  icon: string
  /** Empleados que entran (sin contarte a vos) */
  capacity: number
  price: number
  /** Etapa mínima para poder mudarse (índice en STAGES) */
  minStage: number
  description: string
}

export const OFFICES: Office[] = [
  {
    name: 'Habitación',
    icon: '🏠',
    capacity: 2,
    price: 0,
    minStage: 0,
    description: 'Tu cuarto. El escritorio es la cama.',
  },
  {
    name: 'Oficina pequeña',
    icon: '🏢',
    capacity: 6,
    price: 40000,
    minStage: 0,
    description: 'Tiene cafetera. Y ventana.',
  },
  {
    name: 'Oficina corporativa',
    icon: '🏙️',
    capacity: 12,
    price: 5_000_000,
    minStage: 2,
    description: 'Mesa de ping-pong que nadie usa.',
  },
]
