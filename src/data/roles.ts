// Profesiones del equipo (GDD §5). Los números son experimentales, no balance final.

export type RoleId = 'dev' | 'qa' | 'ops' | 'intern' | 'ux' | 'pm' | 'data' | 'lead'

export type Role = {
  id: RoleId
  name: string
  icon: string
  /** Precio de una persona de 1 estrella */
  basePrice: number
  /** Etapa desde la que aparecen candidatos de esta profesión (G1) */
  minStage: number
  /** Frases para las tarjetas: un poco de personalidad */
  quirks: string[]
}

export const ROLES: Record<RoleId, Role> = {
  dev: {
    id: 'dev',
    minStage: 0,
    name: 'Desarrollador',
    icon: '{}',
    basePrice: 7500,
    quirks: [
      'En mi máquina anda.',
      'Commitea a las 4 AM.',
      'Usa tabs y espacios a la vez.',
      'Nombra variables x, xx y xxx.',
      'Copia de Stack Overflow con fe.',
    ],
  },
  qa: {
    id: 'qa',
    minStage: 0,
    name: 'QA',
    icon: '✓',
    basePrice: 10000,
    quirks: [
      'Encuentra bugs hasta en el café.',
      'Abre 47 tickets por día.',
      'Prueba todo en un navegador de 2009.',
      '¿Y si el usuario pone un emoji?',
    ],
  },
  ops: {
    id: 'ops',
    minStage: 0,
    name: 'DevOps',
    icon: '⚙',
    basePrice: 13000,
    quirks: [
      'Reinicia el servidor por las dudas.',
      'Tiene 12 terminales abiertas.',
      'Todo lo resuelve con contenedores.',
      'Dice que el problema es el DNS. Siempre.',
    ],
  },
  // 👥 Profesiones nuevas (G1): cada una cambia una mecánica
  intern: {
    id: 'intern',
    minStage: 0,
    name: 'Pasante',
    icon: '🎓',
    basePrice: 2500,
    quirks: [
      '¿Qué es un merge?',
      'Hizo push a main un viernes.',
      'Aprendió a programar ayer con un video.',
      'Trae medialunas: se le perdona todo.',
    ],
  },
  ux: {
    id: 'ux',
    minStage: 1,
    name: 'Diseñador UX',
    icon: '🎨',
    basePrice: 12000,
    quirks: [
      'Mueve el botón 2 píxeles y cobra el doble.',
      'Ese gris no es gris, es "niebla".',
      'Todo lo resuelve con más espacio en blanco.',
      'Pregunta "¿y el usuario qué siente?"',
    ],
  },
  pm: {
    id: 'pm',
    minStage: 2,
    name: 'Project Manager',
    icon: '📋',
    basePrice: 14000,
    quirks: [
      'Esta reunión podría haber sido un mail.',
      'Tiene un Gantt de su almuerzo.',
      'Negocia plazos como si fuera un rehén.',
      'Dice "sinergia" sin ironía.',
    ],
  },
  data: {
    id: 'data',
    minStage: 2,
    name: 'Data Scientist',
    icon: '📊',
    basePrice: 16000,
    quirks: [
      'Correlación no es causalidad. Salvo hoy.',
      'Tiene un modelo que predice el almuerzo.',
      'Su Excel tiene 400 pestañas.',
      'Los datos dicen que hoy es tu día.',
    ],
  },
  lead: {
    id: 'lead',
    minStage: 3,
    name: 'Tech Lead',
    icon: '🧑‍🏫',
    basePrice: 25000,
    quirks: [
      'Ya no programa: hace code review con suspiros.',
      'Dibuja arquitecturas en servilletas.',
      'Dice "depende" y tiene razón.',
      'Te explica algo y de repente lo entendés.',
    ],
  },
}

export const ROLE_IDS: RoleId[] = ['dev', 'qa', 'ops', 'intern', 'ux', 'pm', 'data', 'lead']

/** Profesiones que aparecen como candidatos en una etapa */
export const rolesFor = (stage: number) => ROLE_IDS.filter((id) => ROLES[id].minStage <= stage)

export const NAMES: string[] = [
  'Lucas',
  'Martina',
  'Fede',
  'Sofi',
  'Nico',
  'Juli',
  'Caro',
  'Tomi',
  'Valen',
  'Lola',
  'Mati',
  'Romi',
  'Santi',
  'Pili',
  'Bruno',
  'Mica',
  'Agus',
  'Belu',
  'Joaco',
  'Flor',
  'Gonza',
  'Cami',
  'Facu',
  'Ale',
  'Rodri',
  'Meli',
  'Seba',
  'Euge',
  'Pato',
  'Vicky',
  'Leo',
  'Ana',
  'Maxi',
  'Jaz',
  'Franco',
  'Luli',
  'Dani',
  'Rocío',
  'Ezequiel',
  'Abril',
]
