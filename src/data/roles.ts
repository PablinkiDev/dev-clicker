// Profesiones del equipo (GDD §5). Los números son experimentales, no balance final.

export type RoleId = 'dev' | 'qa' | 'ops'

export type Role = {
  id: RoleId
  name: string
  icon: string
  /** Precio de una persona de 1 estrella */
  basePrice: number
  /** Frases para las tarjetas: un poco de personalidad */
  quirks: string[]
}

export const ROLES: Record<RoleId, Role> = {
  dev: {
    id: 'dev',
    name: 'Desarrollador',
    icon: '{}',
    basePrice: 2600,
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
    name: 'QA',
    icon: '✓',
    basePrice: 3500,
    quirks: [
      'Encuentra bugs hasta en el café.',
      'Abre 47 tickets por día.',
      'Prueba todo en un navegador de 2009.',
      '¿Y si el usuario pone un emoji?',
    ],
  },
  ops: {
    id: 'ops',
    name: 'DevOps',
    icon: '⚙',
    basePrice: 4500,
    quirks: [
      'Reinicia el servidor por las dudas.',
      'Tiene 12 terminales abiertas.',
      'Todo lo resuelve con contenedores.',
      'Dice que el problema es el DNS. Siempre.',
    ],
  },
}

export const ROLE_IDS: RoleId[] = ['dev', 'qa', 'ops']

export const NAMES: string[] = [
  'Lucas', 'Martina', 'Fede', 'Sofi', 'Nico', 'Juli', 'Caro', 'Tomi',
  'Valen', 'Lola', 'Mati', 'Romi', 'Santi', 'Pili', 'Bruno', 'Mica',
]
