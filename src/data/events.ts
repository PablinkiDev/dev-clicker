// Eventos al azar (D6): cada 3–6 minutos pasa algo. Buenos, malos y con elección.
// Los efectos son datos: el reducer los aplica (applyEffects) y la interfaz solo los muestra.
import type { FeatureId } from './features'
import type { RoleId } from './roles'
import type { MascotId } from './personalization'
import type { GameState } from '../game/reducer'

export type Effect =
  /** Suma o resta reputación */
  | { kind: 'rep'; amount: number }
  /** XP equivalente a esta fracción de un contrato (el actual, o el promedio del tablón) */
  | { kind: 'xp'; contracts: number }
  /** Pagar este porcentaje de tu dinero (0,1 = 10 %) */
  | { kind: 'pay'; pct: number }
  /** Multiplicador temporal de la producción automática o de los clics */
  | { kind: 'mod'; target: 'auto' | 'click'; mult: number; seconds: number }
  /** Cambia el tiempo que le queda al contrato actual (−0,3 = 30 % menos) */
  | { kind: 'time'; pct: number }
  /** Cambia el código que pide el contrato actual (+0,2 = 20 % más) */
  | { kind: 'code'; pct: number }
  /** Avanza el contrato actual esta fracción del total */
  | { kind: 'progress'; pct: number }
  /** Multiplica la paga del contrato actual */
  | { kind: 'reward'; mult: number }
  /** La Concentración se recarga al instante */
  | { kind: 'focusReset' }
  /** Llegan candidatos nuevos y mejores (los arma la interfaz, porque usan azar) */
  | { kind: 'candidates' }
  /** 📦 Una caja de suministros (G3) */
  | { kind: 'box' }

/** Un resultado posible de una opción con azar */
export type Outcome = { chance: number; text: string; effects: Effect[] }

export type EventOption = {
  label: string
  /** Lo que hace, en texto corto para el botón */
  detail: string
  effects?: Effect[]
  /** Si tiene azar: resultados posibles (las chances suman 1) */
  outcomes?: Outcome[]
}

export type GameEvent = {
  id: string
  tone: 'good' | 'bad' | 'choice'
  icon: string
  title: string
  quote: string
  /** Solo puede salir si hay un contrato en curso (afecta al contrato) */
  needsContract?: boolean
  /** 👥 Solo si tenés a alguien de esta profesión (G3) */
  needsRole?: RoleId
  /** 🏺 Solo si tenés este artefacto (G3) */
  needsArtifact?: string
  /** 🔓 Solo si ya se desbloqueó esta parte del juego (G3) */
  needsFeature?: FeatureId
  /** 🐈 Solo si tenés esta mascota (G4) */
  needsMascot?: MascotId
  /** Eventos sin elección: su efecto y cómo se explica */
  effects?: Effect[]
  detail?: string
  /** Eventos con elección: siempre 2 opciones; si no elegís, se aplica la "segura" */
  options?: [EventOption, EventOption]
  safe?: 0 | 1
}

export const EVENTS: GameEvent[] = [
  // --- Buenos 🟢 ---
  {
    id: 'linkedin',
    tone: 'good',
    icon: '💼',
    title: 'Te recomendaron en LinkedIn',
    quote: '“Excelente profesional, muy proactivo” (no te conoce).',
    detail: '+10 ★ de reputación',
    effects: [{ kind: 'rep', amount: 10 }],
  },
  {
    id: 'pizza',
    tone: 'good',
    icon: '🍕',
    title: 'Viernes de pizza',
    quote: 'Nadie habla en las reuniones con la boca llena.',
    detail: 'Producción del equipo ×1,5 por 60 s',
    effects: [{ kind: 'mod', target: 'auto', mult: 1.5, seconds: 60 }],
  },
  {
    id: 'stackoverflow',
    tone: 'good',
    icon: '📚',
    title: 'Encontraste la respuesta en Stack Overflow',
    quote: 'Pregunta de 2011, 3 votos, respuesta aceptada. Funciona.',
    detail: '+XP equivalente a un contrato',
    effects: [{ kind: 'xp', contracts: 1 }],
  },
  {
    id: 'cliente-agradecido',
    tone: 'good',
    icon: '🙏',
    title: 'Cliente agradecido',
    quote: '“Nunca nadie entregó a tiempo. Tomá, de propina.”',
    needsContract: true,
    detail: 'El contrato actual paga ×2',
    effects: [{ kind: 'reward', mult: 2 }],
  },
  {
    id: 'feria-empleo',
    tone: 'good',
    icon: '🎪',
    title: 'Feria de empleo',
    quote: 'Fuiste por las medialunas, volviste con CVs.',
    detail: 'Candidatos nuevos gratis, y mejores que lo normal',
    effects: [{ kind: 'candidates' }],
  },
  {
    id: 'cafe-especialidad',
    tone: 'good',
    icon: '☕',
    title: 'Café de especialidad',
    quote: 'Notas a frutos rojos. Y a cafeína, mucha cafeína.',
    detail: 'La Concentración se recarga al instante',
    effects: [{ kind: 'focusReset' }],
  },
  {
    id: 'patito',
    tone: 'good',
    icon: '🦆',
    title: 'El patito de goma',
    quote: 'Le explicaste el problema a un pato de plástico. Y funcionó.',
    detail: 'Tus clics ×2 por 45 s',
    effects: [{ kind: 'mod', target: 'click', mult: 2, seconds: 45 }],
  },
  {
    id: 'copilot',
    tone: 'good',
    icon: '🤖',
    title: 'La IA tuvo razón',
    quote: 'Por primera vez, entendió exactamente lo que querías.',
    needsContract: true,
    detail: 'El contrato actual avanza un 15 %',
    effects: [{ kind: 'progress', pct: 0.15 }],
  },
  {
    id: 'presupuesto-infinito',
    tone: 'good',
    icon: '💸',
    title: 'Cliente con presupuesto infinito',
    quote: '“No importa cuánto cueste.” Sospechoso.',
    needsContract: true,
    detail: 'El contrato actual paga +40 %',
    effects: [{ kind: 'reward', mult: 1.4 }],
  },
  {
    id: 'flow',
    tone: 'good',
    icon: '🧠',
    title: 'Entraste en estado de flow',
    quote: 'Son las 3 AM y de repente todo tiene sentido.',
    detail: 'Producción del equipo ×1,75 por 60 s',
    effects: [{ kind: 'mod', target: 'auto', mult: 1.75, seconds: 60 }],
  },
  {
    id: 'viral',
    tone: 'good',
    icon: '🏆',
    title: 'Tu proyecto se hizo viral',
    quote: 'Alguien lo compartió en Reddit. Los comentarios son… variados.',
    detail: '+20 ★ de reputación',
    effects: [{ kind: 'rep', amount: 20 }],
  },
  {
    id: 'refactor',
    tone: 'good',
    icon: '🧹',
    title: 'Refactorización milagrosa',
    quote: 'Borraste 300 líneas y todo sigue funcionando.',
    needsContract: true,
    detail: 'El contrato actual pide 20 % menos de código',
    effects: [{ kind: 'code', pct: -0.2 }],
  },

  // --- Malos 🔴 (leves: nunca te hacen perder un contrato por sí solos) ---
  {
    id: 'caida-produccion',
    tone: 'bad',
    icon: '🚨',
    title: 'Se cayó producción',
    quote: 'Todos los ojos en vos. Y en el Slack.',
    needsContract: true,
    detail: 'El contrato actual pierde 30 % del tiempo que le queda',
    effects: [{ kind: 'time', pct: -0.3 }],
  },
  {
    id: 'reunion-mail',
    tone: 'bad',
    icon: '📅',
    title: 'Reunión que podría haber sido un mail',
    quote: 'Una hora para decidir cuándo hacer la próxima reunión.',
    detail: 'Producción del equipo ×0,5 por 45 s',
    effects: [{ kind: 'mod', target: 'auto', mult: 0.5, seconds: 45 }],
  },
  {
    id: 'windows-update',
    tone: 'bad',
    icon: '🪟',
    title: 'Actualizaron Windows sin avisar',
    quote: '“Configurando actualizaciones: 3 %. No apague el equipo.”',
    detail: 'Tus clics valen la mitad por 30 s',
    effects: [{ kind: 'mod', target: 'click', mult: 0.5, seconds: 30 }],
  },
  {
    id: 'cambio-chiquito',
    tone: 'bad',
    icon: '🤏',
    title: 'El cliente pidió “un cambio chiquito”',
    quote: 'Spoiler: no era chiquito.',
    needsContract: true,
    detail: 'El contrato actual pide 20 % más de código',
    effects: [{ kind: 'code', pct: 0.2 }],
  },
  {
    id: 'mi-maquina',
    tone: 'bad',
    icon: '🖥️',
    title: 'Funciona en mi máquina',
    quote: 'En producción explota. En tu PC, perfecto.',
    detail: 'Producción del equipo ×0,7 por 45 s',
    effects: [{ kind: 'mod', target: 'auto', mult: 0.7, seconds: 45 }],
  },
  {
    id: 'deprecada',
    tone: 'bad',
    icon: '📦',
    title: 'Dependencia deprecada',
    quote: 'La librería que usabas desde 2019 dejó de existir.',
    needsContract: true,
    detail: 'El contrato actual pide 15 % más de código',
    effects: [{ kind: 'code', pct: 0.15 }],
  },
  {
    id: 'responsive',
    tone: 'bad',
    icon: '📱',
    title: 'El cliente quiere responsive',
    quote: '“¿Cómo que no anda en mi iPhone 6?”',
    needsContract: true,
    detail: 'El contrato actual pide 10 % más de código',
    effects: [{ kind: 'code', pct: 0.1 }],
  },
  {
    id: 'conflicto-git',
    tone: 'bad',
    icon: '🔥',
    title: 'Conflicto en Git',
    quote: 'Dos devs editaron exactamente la misma línea. Otra vez.',
    detail: 'Producción del equipo ×0,6 por 30 s',
    effects: [{ kind: 'mod', target: 'auto', mult: 0.6, seconds: 30 }],
  },
  {
    id: 'daily',
    tone: 'bad',
    icon: '🧑‍💼',
    title: 'Daily de 45 minutos',
    quote: 'Era para contar qué hiciste ayer. Duró una eternidad.',
    detail: 'Producción del equipo ×0,75 por 60 s',
    effects: [{ kind: 'mod', target: 'auto', mult: 0.75, seconds: 60 }],
  },

  // --- Con elección 🟡 ---
  {
    id: 'hackathon',
    tone: 'choice',
    icon: '🏁',
    title: 'Hackathon de fin de semana',
    quote: 'Pizza, Red Bull y cero horas de sueño.',
    safe: 1,
    options: [
      {
        label: 'Organizarlo',
        detail: 'Pagás 10 % de tu dinero · equipo ×2 por 2 min',
        effects: [
          { kind: 'pay', pct: 0.1 },
          { kind: 'mod', target: 'auto', mult: 2, seconds: 120 },
        ],
      },
      { label: 'Mejor descansar', detail: 'No pasa nada', effects: [] },
    ],
  },
  {
    id: 'startup-quebrada',
    tone: 'choice',
    icon: '🏚️',
    title: 'Te ofrecen comprar una startup quebrada',
    quote: 'Tiene un logo lindo y 400 tickets abiertos.',
    safe: 1,
    options: [
      {
        label: 'Comprarla',
        detail: 'Pagás 15 % de tu dinero · +XP de un contrato y +10 ★',
        effects: [
          { kind: 'pay', pct: 0.15 },
          { kind: 'xp', contracts: 1 },
          { kind: 'rep', amount: 10 },
        ],
      },
      { label: 'No, gracias', detail: 'No pasa nada', effects: [] },
    ],
  },
  {
    id: 'aumento',
    tone: 'choice',
    icon: '💰',
    title: 'Un dev te pide aumento',
    quote: '“Vi en LinkedIn cuánto cobran en Europa.”',
    safe: 0,
    options: [
      {
        label: 'Dárselo',
        detail: 'Pagás 5 % de tu dinero · equipo ×1,5 por 3 min',
        effects: [
          { kind: 'pay', pct: 0.05 },
          { kind: 'mod', target: 'auto', mult: 1.5, seconds: 180 },
        ],
      },
      {
        label: 'Decirle que no',
        detail: 'Se ofende: equipo ×0,8 por 1 min',
        effects: [{ kind: 'mod', target: 'auto', mult: 0.8, seconds: 60 }],
      },
    ],
  },
  {
    id: 'deploy-viernes',
    tone: 'choice',
    icon: '🎲',
    title: 'Deploy un viernes a las 18:00',
    quote: '“¿Qué podría salir mal?”',
    needsContract: true,
    safe: 1,
    options: [
      {
        label: 'Arriesgarse',
        detail: '50 %: el contrato paga ×3 · 50 %: equipo ×0,5 por 1 min',
        outcomes: [
          { chance: 0.5, text: '¡Salió perfecto! El contrato paga ×3', effects: [{ kind: 'reward', mult: 3 }] },
          {
            chance: 0.5,
            text: 'Se rompió todo. Equipo ×0,5 por 1 min',
            effects: [{ kind: 'mod', target: 'auto', mult: 0.5, seconds: 60 }],
          },
        ],
      },
      { label: 'Esperar al lunes', detail: 'No pasa nada', effects: [] },
    ],
  },
  {
    id: 'pr-gigante',
    tone: 'choice',
    icon: '🔀',
    title: 'Un junior hizo un PR de 2.000 líneas',
    quote: '“Dice que solo cambió un botón.”',
    needsContract: true,
    safe: 1,
    options: [
      {
        label: 'Aprobar sin mirar',
        detail: '60 %: el contrato avanza 25 % · 40 %: +20 % de código',
        outcomes: [
          { chance: 0.6, text: 'Funcionó. El contrato avanzó 25 %', effects: [{ kind: 'progress', pct: 0.25 }] },
          { chance: 0.4, text: 'Rompió todo: +20 % de código', effects: [{ kind: 'code', pct: 0.2 }] },
        ],
      },
      {
        label: 'Revisar el código',
        detail: 'Tus clics ×0,7 por 30 s · +XP de medio contrato',
        effects: [
          { kind: 'mod', target: 'click', mult: 0.7, seconds: 30 },
          { kind: 'xp', contracts: 0.5 },
        ],
      },
    ],
  },
  {
    id: 'agregar-ia',
    tone: 'choice',
    icon: '✨',
    title: 'El cliente quiere agregar IA',
    quote: '“¿Y si le ponemos inteligencia artificial?”',
    needsContract: true,
    safe: 1,
    options: [
      {
        label: 'Aceptar',
        detail: 'El contrato paga ×1,8 pero pide 40 % más de código',
        effects: [
          { kind: 'reward', mult: 1.8 },
          { kind: 'code', pct: 0.4 },
        ],
      },
      { label: 'Explicar que no hace falta', detail: '+5 ★ de reputación', effects: [{ kind: 'rep', amount: 5 }] },
    ],
  },
  {
    id: 'sin-cafe',
    tone: 'choice',
    icon: '☕',
    title: 'Se terminó el café de la oficina',
    quote: 'La productividad está en peligro.',
    safe: 1,
    options: [
      {
        label: 'Comprar una cafetera',
        detail: 'Pagás 5 % de tu dinero · equipo ×1,5 por 90 s',
        effects: [
          { kind: 'pay', pct: 0.05 },
          { kind: 'mod', target: 'auto', mult: 1.5, seconds: 90 },
        ],
      },
      {
        label: 'Sobrevivir con agua',
        detail: 'Equipo ×0,9 por 45 s',
        effects: [{ kind: 'mod', target: 'auto', mult: 0.9, seconds: 45 }],
      },
    ],
  },
  {
    id: 'servidor-fuego',
    tone: 'choice',
    icon: '🧯',
    title: 'El servidor está prendido fuego',
    quote: '“¿Quién hizo el último deploy?”',
    safe: 0,
    options: [
      {
        label: 'Arreglarlo vos',
        detail: 'Tus clics ×0,5 por 40 s · +XP de medio contrato',
        effects: [
          { kind: 'mod', target: 'click', mult: 0.5, seconds: 40 },
          { kind: 'xp', contracts: 0.5 },
        ],
      },
      { label: 'Contratar soporte', detail: 'Pagás 8 % de tu dinero y listo', effects: [{ kind: 'pay', pct: 0.08 }] },
    ],
  },
  {
    id: 'conferencia',
    tone: 'choice',
    icon: '🎤',
    title: 'Te invitan a una conferencia',
    quote: 'Vas a hablar de un proyecto que hiciste con tres tutoriales.',
    safe: 1,
    options: [
      {
        label: 'Dar la charla',
        detail: '+25 ★ · equipo ×0,7 por 60 s',
        effects: [
          { kind: 'rep', amount: 25 },
          { kind: 'mod', target: 'auto', mult: 0.7, seconds: 60 },
        ],
      },
      {
        label: 'Quedarte programando',
        detail: '+XP de medio contrato',
        effects: [{ kind: 'xp', contracts: 0.5 }],
      },
    ],
  },
  // --- 👥 Ligados a profesiones (G3) ---
  {
    id: 'pasante-medialunas',
    tone: 'good',
    icon: '🥐',
    title: 'El pasante trajo medialunas',
    quote: 'Una docena. De manteca. Ya nadie se acuerda del push a main.',
    needsRole: 'intern',
    detail: 'Producción del equipo ×1,3 por 90 s',
    effects: [{ kind: 'mod', target: 'auto', mult: 1.3, seconds: 90 }],
  },
  {
    id: 'pasante-produccion',
    tone: 'bad',
    icon: '💣',
    title: 'El pasante probó en producción',
    quote: '“Pensé que era la base de pruebas.” No era la base de pruebas.',
    needsRole: 'intern',
    needsContract: true,
    detail: 'El contrato actual pide 15 % más de código',
    effects: [{ kind: 'code', pct: 0.15 }],
  },
  {
    id: 'ux-rediseno',
    tone: 'choice',
    icon: '🎨',
    title: 'El diseñador quiere rediseñar todo',
    quote: '“No es un cambio de color: es un cambio de paradigma.”',
    needsRole: 'ux',
    needsContract: true,
    safe: 1,
    options: [
      {
        label: 'Dale, rediseñá',
        detail: 'El contrato paga ×1,5 pero pide 25 % más de código',
        effects: [
          { kind: 'reward', mult: 1.5 },
          { kind: 'code', pct: 0.25 },
        ],
      },
      { label: 'Así está bien', detail: '+3 ★ de reputación', effects: [{ kind: 'rep', amount: 3 }] },
    ],
  },
  {
    id: 'pm-plazo',
    tone: 'good',
    icon: '📋',
    title: 'El PM negoció el plazo',
    quote: '“Les dije que era un tema de sinergia.” Funcionó.',
    needsRole: 'pm',
    needsContract: true,
    detail: 'El contrato actual tiene 30 % más de tiempo',
    effects: [{ kind: 'time', pct: 0.3 }],
  },
  {
    id: 'pm-reunion',
    tone: 'bad',
    icon: '📅',
    title: 'Reunión para planificar la reunión',
    quote: 'Duró dos horas. Se agendó otra para revisar las conclusiones.',
    needsRole: 'pm',
    detail: 'Tus clics ×0,7 por 45 s',
    effects: [{ kind: 'mod', target: 'click', mult: 0.7, seconds: 45 }],
  },
  {
    id: 'data-prediccion',
    tone: 'good',
    icon: '📈',
    title: 'El modelo predijo un buen cliente',
    quote: '“97 % de confianza.” El 3 % restante es el cliente pidiendo descuento.',
    needsRole: 'data',
    needsContract: true,
    detail: 'El contrato actual paga +50 %',
    effects: [{ kind: 'reward', mult: 1.5 }],
  },
  {
    id: 'data-dashboard',
    tone: 'choice',
    icon: '📊',
    title: 'El data scientist quiere un dashboard',
    quote: '“Con gráficos de torta. Muchos gráficos de torta.”',
    needsRole: 'data',
    safe: 1,
    options: [
      {
        label: 'Pagar las licencias',
        detail: 'Pagás 3 % de tu dinero · +XP de un contrato',
        effects: [
          { kind: 'pay', pct: 0.03 },
          { kind: 'xp', contracts: 1 },
        ],
      },
      { label: 'Usar Excel', detail: 'No pasa nada', effects: [] },
    ],
  },
  {
    id: 'lead-mentoria',
    tone: 'good',
    icon: '🧑‍🏫',
    title: 'Mentoría del Tech Lead',
    quote: 'Te explicó algo con una servilleta y de repente lo entendiste todo.',
    needsRole: 'lead',
    detail: 'Producción del equipo ×1,5 por 60 s · +XP de medio contrato',
    effects: [
      { kind: 'mod', target: 'auto', mult: 1.5, seconds: 60 },
      { kind: 'xp', contracts: 0.5 },
    ],
  },
  {
    id: 'lead-refactor',
    tone: 'choice',
    icon: '🏗️',
    title: 'El Tech Lead quiere refactorizar',
    quote: '“Si lo hacemos bien ahora, después vamos a volar.”',
    needsRole: 'lead',
    needsContract: true,
    safe: 1,
    options: [
      {
        label: 'Refactorizar',
        detail: '+30 % de código · equipo ×1,8 por 2 min',
        effects: [
          { kind: 'code', pct: 0.3 },
          { kind: 'mod', target: 'auto', mult: 1.8, seconds: 120 },
        ],
      },
      { label: 'Después lo vemos', detail: 'No pasa nada (spoiler: nunca lo ven)', effects: [] },
    ],
  },
  {
    id: 'qa-salvada',
    tone: 'good',
    icon: '🕵️',
    title: 'QA encontró el bug antes que el cliente',
    quote: 'Un milagro. Que no se entere el cliente de que casi pasa.',
    needsRole: 'qa',
    needsContract: true,
    detail: '+8 ★ de reputación · el contrato actual paga +20 %',
    effects: [
      { kind: 'rep', amount: 8 },
      { kind: 'reward', mult: 1.2 },
    ],
  },
  {
    id: 'ops-viernes',
    tone: 'bad',
    icon: '☸️',
    title: 'DevOps migró todo a Kubernetes… un viernes',
    quote: '“Va a ser más fácil de mantener.” Son las 23 h.',
    needsRole: 'ops',
    detail: 'Producción del equipo ×0,6 por 45 s',
    effects: [{ kind: 'mod', target: 'auto', mult: 0.6, seconds: 45 }],
  },

  // --- 🏺 Ligados a artefactos (G3) ---
  {
    id: 'patito-habla',
    tone: 'good',
    icon: '🦆',
    title: 'El patito de goma te habló',
    quote: '“Cuac.” Era exactamente lo que necesitabas escuchar.',
    needsArtifact: 'rubberDuck',
    needsContract: true,
    detail: 'El contrato actual avanza un 20 %',
    effects: [{ kind: 'progress', pct: 0.2 }],
  },
  {
    id: 'plantita-flor',
    tone: 'good',
    icon: '🌸',
    title: 'Tu plantita floreció',
    quote: 'Sobrevivió a tres deploys y a la falta de ventana.',
    needsArtifact: 'plant',
    detail: '+XP equivalente a un contrato',
    effects: [{ kind: 'xp', contracts: 1 }],
  },
  {
    id: 'taza-rebalso',
    tone: 'bad',
    icon: '☕',
    title: 'La taza infinita rebalsó',
    quote: 'Infinita para llenarse. No tanto para no derramarse sobre el teclado.',
    needsArtifact: 'mug',
    detail: 'Tus clics ×0,5 por 30 s',
    effects: [{ kind: 'mod', target: 'click', mult: 0.5, seconds: 30 }],
  },
  {
    id: 'regalo-proveedor',
    tone: 'good',
    icon: '🎁',
    title: 'Un proveedor te mandó un regalo',
    quote: '“Para que nos tengas en cuenta.” Te tienen en cuenta.',
    needsFeature: 'artifacts',
    detail: '+1 📦 caja de suministros',
    effects: [{ kind: 'box' }],
  },
  {
    id: 'hackaton-externa',
    tone: 'choice',
    icon: '🏆',
    title: 'Te invitan a una hackatón',
    quote: 'Premio: una caja misteriosa. Costo: tu fin de semana.',
    needsFeature: 'artifacts',
    safe: 1,
    options: [
      {
        label: 'Ir a competir',
        detail: 'Pagás 5 % de tu dinero · 50 %: +1 📦 · 50 %: +XP de un contrato',
        outcomes: [
          {
            chance: 0.5,
            text: '¡Ganaste! +1 📦',
            effects: [{ kind: 'pay', pct: 0.05 }, { kind: 'box' }],
          },
          {
            chance: 0.5,
            text: 'Perdiste, pero aprendiste: +XP de un contrato',
            effects: [
              { kind: 'pay', pct: 0.05 },
              { kind: 'xp', contracts: 1 },
            ],
          },
        ],
      },
      { label: 'Descansar', detail: 'No pasa nada', effects: [] },
    ],
  },

  // --- 🐈 Mascotas (G4) ---
  {
    id: 'gato-teclado',
    tone: 'bad',
    icon: '🐈',
    title: 'El gato se acostó en el teclado',
    quote: 'Escribió "jjjjjjjjjjjjjjjj" y se durmió. No lo podés mover: es ley.',
    needsMascot: 'cat',
    detail: 'Tus clics ×0,5 por 30 s',
    effects: [{ kind: 'mod', target: 'click', mult: 0.5, seconds: 30 }],
  },
  {
    id: 'gato-ronroneo',
    tone: 'good',
    icon: '😺',
    title: 'El gato ronronea al lado tuyo',
    quote: 'Terapia gratuita. Tu ritmo cardíaco bajó y tus clics subieron.',
    needsMascot: 'cat',
    detail: 'Tus clics ×1,5 por 45 s',
    effects: [{ kind: 'mod', target: 'click', mult: 1.5, seconds: 45 }],
  },
  {
    id: 'perro-saludo',
    tone: 'good',
    icon: '🐕',
    title: 'El perro saludó a todo el equipo',
    quote: 'Uno por uno. Con la cola a mil. La moral está por las nubes.',
    needsMascot: 'dog',
    detail: 'Producción del equipo ×1,4 por 60 s',
    effects: [{ kind: 'mod', target: 'auto', mult: 1.4, seconds: 60 }],
  },
  {
    id: 'perro-cable',
    tone: 'bad',
    icon: '🦴',
    title: 'El perro mordió el cable del router',
    quote: 'Te mira con cara de "yo no fui". Tiene el cable en la boca.',
    needsMascot: 'dog',
    detail: 'Producción del equipo ×0,6 por 30 s',
    effects: [{ kind: 'mod', target: 'auto', mult: 0.6, seconds: 30 }],
  },
  {
    id: 'pato-cuac',
    tone: 'good',
    icon: '🦆',
    title: 'El pato hizo cuac en el momento justo',
    quote: 'Justo cuando ibas a borrar todo. Lo entendiste: era un punto y coma.',
    needsMascot: 'duck',
    needsContract: true,
    detail: 'El contrato actual avanza un 12 %',
    effects: [{ kind: 'progress', pct: 0.12 }],
  },
  {
    id: 'pato-pan',
    tone: 'choice',
    icon: '🍞',
    title: 'El pato quiere pan',
    quote: 'Ahora. Te mira fijo. No parpadea.',
    needsMascot: 'duck',
    safe: 0,
    options: [
      {
        label: 'Comprarle pan',
        detail: 'Pagás 1 % de tu dinero · +5 ★',
        effects: [
          { kind: 'pay', pct: 0.01 },
          { kind: 'rep', amount: 5 },
        ],
      },
      {
        label: 'Ignorarlo',
        detail: 'Tus clics ×0,8 por 30 s (te sigue mirando)',
        effects: [{ kind: 'mod', target: 'click', mult: 0.8, seconds: 30 }],
      },
    ],
  },

  // --- Generales (G3) ---
  {
    id: 'commit-viral',
    tone: 'good',
    icon: '🔥',
    title: 'Tu mensaje de commit se hizo viral',
    quote: '"arreglé lo que rompí arreglando lo que rompí". 40.000 likes.',
    detail: '+15 ★ de reputación',
    effects: [{ kind: 'rep', amount: 15 }],
  },
  {
    id: 'corte-luz',
    tone: 'bad',
    icon: '🔌',
    title: 'Se cortó la luz',
    quote: 'Guardaste hace 40 minutos. Hace 40 minutos.',
    needsContract: true,
    detail: 'El contrato actual tiene 20 % menos de tiempo',
    effects: [{ kind: 'time', pct: -0.2 }],
  },
]

/** Lo que hay que saber de la partida para ver qué eventos pueden salir */
export type EventContext = {
  hasContract: boolean
  roles: RoleId[]
  artifacts: string[]
  features: string[]
  mascot?: MascotId | null
}

export const eventContextOf = (s: GameState): EventContext => ({
  hasContract: s.contract !== null,
  roles: s.team.map((e) => e.role),
  artifacts: Object.keys(s.records.artifacts),
  features: s.records.features,
  mascot: s.profile.mascot,
})

/** ¿Puede salir este evento ahora? */
export function canHappen(e: GameEvent, ctx: EventContext): boolean {
  return (
    (ctx.hasContract || !e.needsContract) &&
    (!e.needsRole || ctx.roles.includes(e.needsRole)) &&
    (!e.needsArtifact || ctx.artifacts.includes(e.needsArtifact)) &&
    (!e.needsFeature || ctx.features.includes(e.needsFeature)) &&
    (!e.needsMascot || ctx.mascot === e.needsMascot)
  )
}

/** Probabilidad de cada tipo de evento */
const TONE_WEIGHT: Record<GameEvent['tone'], number> = { good: 0.6, bad: 0.25, choice: 0.15 }

/** Elige un evento al azar entre los que pueden salir ahora */
/** luck: nivel de Suerte de programador (más peso a los eventos buenos) */
export function pickEvent(ctx: EventContext, lastId: string | null, luck = 0): GameEvent {
  const pool = EVENTS.filter((e) => canHappen(e, ctx) && e.id !== lastId)
  const weight = (e: GameEvent) =>
    (TONE_WEIGHT[e.tone] + (e.tone === 'good' ? 0.1 * luck : 0)) / EVENTS.filter((x) => x.tone === e.tone).length
  const total = pool.reduce((sum, e) => sum + weight(e), 0)
  let r = Math.random() * total
  for (const e of pool) {
    r -= weight(e)
    if (r <= 0) return e
  }
  return pool[pool.length - 1]
}

/** Espera hasta el próximo evento: de 3 a 6 minutos */
export function nextEventDelay(): number {
  return (180 + Math.random() * 180) * 1000
}

/** Elige el resultado de una opción con azar. luck: +10 % por nivel al primero (siempre el bueno) */
export function rollOutcome(outcomes: Outcome[], luck = 0): Outcome {
  let r = Math.random() + 0.1 * luck
  // Al restar desde el final, la suerte "empuja" hacia el primer resultado
  for (const o of [...outcomes].reverse()) {
    r -= o.chance
    if (r <= 0) return o
  }
  return outcomes[0]
}
