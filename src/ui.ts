import type { RoleId } from './data/roles'
import type { Lang, TechId } from './data/techs'

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

/** Ícono y color de cada lenguaje: en el explorador, el tablón, las pestañas y las tecnologías */
export const LANG_ICON: Record<Lang, { icon: string; className: string }> = {
  html: { icon: '<>', className: 'text-orange' },
  css: { icon: '#', className: 'text-purple' },
  js: { icon: 'JS', className: 'text-yellow' },
  ts: { icon: 'TS', className: 'text-blue' },
  jsx: { icon: '⚛', className: 'text-cyan' },
  node: { icon: '⬢', className: 'text-green' },
  sql: { icon: '⛁', className: 'text-cyan' },
  ng: { icon: '▲', className: 'text-red' },
  nest: { icon: 'NS', className: 'text-red' },
  py: { icon: 'Py', className: 'text-yellow' },
  java: { icon: '☕', className: 'text-orange' },
  mongo: { icon: '🍃', className: 'text-green' },
}

/** Ícono y color de cada tecnología (las que escriben archivos usan el de su lenguaje) */
export const TECH_ICON: Record<TechId, { icon: string; className: string }> = {
  html: LANG_ICON.html,
  css: LANG_ICON.css,
  javascript: LANG_ICON.js,
  typescript: LANG_ICON.ts,
  react: LANG_ICON.jsx,
  node: LANG_ICON.node,
  sql: LANG_ICON.sql,
  angular: LANG_ICON.ng,
  nest: LANG_ICON.nest,
  python: LANG_ICON.py,
  java: LANG_ICON.java,
  mongo: LANG_ICON.mongo,
  git: { icon: '⎇', className: 'text-orange' },
  ai: { icon: '✨', className: 'text-purple' },
}
