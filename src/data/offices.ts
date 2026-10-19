// Oficinas (GDD §6): se compran con dinero y definen cuántos empleados entran.
// El equipo se conserva al mudarse. La tercera oficina llega más adelante.

export type Office = {
  name: string
  icon: string
  /** Empleados que entran (sin contarte a vos) */
  capacity: number
  price: number
  description: string
}

export const OFFICES: Office[] = [
  { name: 'Habitación', icon: '🏠', capacity: 2, price: 0, description: 'Tu cuarto. El escritorio es la cama.' },
  { name: 'Oficina pequeña', icon: '🏢', capacity: 6, price: 12000, description: 'Tiene cafetera. Y ventana.' },
]
