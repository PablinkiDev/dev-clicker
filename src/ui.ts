// Tipos de la interfaz (no son parte de la partida ni se guardan)

/** Pantalla que se ve en el área del editor */
export type View = 'work' | 'board' | 'team' | 'skills' | 'settings'

export const VIEW_LABEL: Record<View, string> = {
  work: 'Código',
  board: 'Ofertas',
  team: 'Equipo',
  skills: 'Mejoras',
  settings: 'Ajustes',
}

/** Orden en que aparecen las vistas en todas las barras de navegación */
export const VIEWS: View[] = ['work', 'board', 'team', 'skills', 'settings']
