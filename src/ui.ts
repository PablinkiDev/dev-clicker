// Tipos de la interfaz (no son parte de la partida ni se guardan)

/** Pantalla que se ve en el área del editor */
export type View = 'work' | 'board' | 'team' | 'skills'

export const VIEW_LABEL: Record<View, string> = {
  work: 'Código',
  board: 'Ofertas',
  team: 'Equipo',
  skills: 'Mejoras',
}
