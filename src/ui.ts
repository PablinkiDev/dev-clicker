import type { RoleId } from './data/roles'

// Tipos de la interfaz (no son parte de la partida ni se guardan)

/** Pantalla que se ve en el área del editor */
export type View = 'work' | 'board' | 'team' | 'company' | 'skills' | 'settings'

export const VIEW_LABEL: Record<View, string> = {
  work: 'Código',
  board: 'Ofertas',
  team: 'Equipo',
  company: 'Empresa',
  skills: 'Mejoras',
  settings: 'Ajustes',
}

/** Orden en que aparecen las vistas en todas las barras de navegación */
export const VIEWS: View[] = ['work', 'board', 'team', 'company', 'skills', 'settings']

/** Colores de cada profesión (clases completas para que Tailwind las encuentre) */
export const ROLE_STYLE: Record<RoleId, { text: string; avatar: string }> = {
  dev: { text: 'text-green', avatar: 'from-[#1f9d55] to-[#5af78e]' },
  qa: { text: 'text-cyan', avatar: 'from-[#1f8fbf] to-[#89ddff]' },
  ops: { text: 'text-orange', avatar: 'from-[#c9620a] to-[#f7a26c]' },
}
