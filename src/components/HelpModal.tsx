// ❓ Ayuda: cómo jugar y una wiki de todo el juego.
// Las listas (editores, tecnologías, mejoras, etapas…) se arman con los datos del juego,
// así la ayuda no queda vieja cuando se cambia un número.
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { ABILITIES } from '../data/abilities'
import { CHALLENGES, CHALLENGE_FIRST_BOXES } from '../data/challenges'
import { ARTIFACTS, MAX_ARTIFACT_LEVEL, RARITIES } from '../data/artifacts'
import { BOSSES, BOSS_EVERY, BOSS_SCALE } from '../data/bosses'
import { CARDS, RARE_CHANCE, STYLES } from '../data/cards'
import { ACHIEVEMENTS, CATEGORIES } from '../data/achievements'
import { EDITORS } from '../data/editors'
import { FACE_ITEMS, HEAD_ITEMS, HOODIES, MASCOTS, TITLES, type Choice } from '../data/personalization'
import CommunityLinks from './CommunityLinks'
import { EVENTS } from '../data/events'
import { INVESTMENTS } from '../data/investments'
import { MACRO_LEVELS } from '../data/macro'
import { MINIGAMES, MINIGAME_REWARD_SECONDS } from '../data/minigames'
import { OFFICES } from '../data/offices'
import { ROLES, ROLE_IDS } from '../data/roles'
import { SKILLS } from '../data/skills'
import { STAGES } from '../data/stages'
import { TECHS } from '../data/techs'
import { BUG_DURATION, BUG_MULTIPLIER } from '../game/bug'
import { FOCUS_COOLDOWN, FOCUS_MULTIPLIER, focusDuration } from '../game/focus'
import { FAILURE_REP_LOSS } from '../game/formulas'
import { formatMoney } from '../game/format'
import { SPECIAL_RULES } from '../game/offers'
import { BASE_TOKENS, FOUNDER_BONUS, IPO_SALES, milestoneValue } from '../game/prestige'
import { ACHIEVEMENT_BONUS } from '../game/records'
import { REP_LEVELS, boardSize } from '../game/reputation'
import { ENDLESS_GROWTH } from '../game/stages'
import { REROLL_GROWTH, employeeEffect, maxStars } from '../game/team'

// --- Piezas -----------------------------------------------------------------------------

const H = ({ children }: { children: ReactNode }) => (
  <h3 className="mt-5 mb-2 font-extrabold text-text first:mt-0">{children}</h3>
)
const P = ({ children }: { children: ReactNode }) => (
  <p className="mb-2 text-sm leading-relaxed text-muted">{children}</p>
)
const B = ({ children }: { children: ReactNode }) => <b className="text-text">{children}</b>

function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="mb-3 overflow-x-auto rounded-xl border border-line">
      <table className="w-full text-left text-xs">
        <thead className="bg-panel-3 font-mono text-[10px] tracking-wider text-faint uppercase">
          <tr>
            {head.map((h) => (
              <th key={h} className="px-3 py-2 font-bold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-line align-top">
              {row.map((cell, j) => (
                <td key={j} className={`px-3 py-2 ${j === 0 ? 'font-bold whitespace-nowrap text-text' : 'text-muted'}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const stageName = (i = 0) => (i > 0 ? `${STAGES[i].icon} ${STAGES[i].name}` : 'Desde el inicio')
const stars = (n: number) => '★'.repeat(n)

// --- Secciones ------------------------------------------------------------------------------

function HowToPlay() {
  return (
    <>
      <H>La idea</H>
      <P>
        Sos un programador freelance. Tomás contratos, escribís código, cobrás y vas armando una empresa: contratás
        gente, cambiás de oficina, aprendés tecnologías y ascendés de <B>Freelancer</B> a <B>Corporación</B>. Al final
        vendés la empresa y arrancás otra, más fuerte.
      </P>
      <H>El ciclo básico</H>
      <ol className="mb-3 flex list-decimal flex-col gap-1.5 pl-5 text-sm text-muted">
        <li>
          En <B>Ofertas</B>, elegí un contrato. El reloj arranca.
        </li>
        <li>
          Tocá <B>Programar</B> (o la barra espaciadora) para escribir líneas. Tu equipo escribe solo.
        </li>
        <li>
          Con el código completo, tocá <B>git push</B> para entregar. Cobrás 💵 dinero, 🟣 XP y ★ reputación.
        </li>
        <li>
          Gastá el <B>dinero</B> en editores, empleados y oficinas, y la <B>XP</B> en Mejoras (tecnologías y
          habilidades).
        </li>
        <li>
          Cumplí los requisitos y <B>ascendé</B> de etapa desde la pantalla Empresa.
        </li>
        <li>
          En Corporación, <B>vendé la empresa</B>: ganás tokens para mejoras permanentes y empezás de nuevo.
        </li>
      </ol>
      <H>Consejos para arrancar</H>
      <ul className="mb-3 flex list-disc flex-col gap-1.5 pl-5 text-sm text-muted">
        <li>
          El panel de arriba siempre muestra tu <B>Objetivo</B> y la <B>próxima compra</B>. Tocalo para ir a esa
          pantalla.
        </li>
        <li>Tu primer empleado tiene que ser un Desarrollador: es el único que escribe código solo.</li>
        <li>Si una oferta parece imposible, elegí otra: siempre hay al menos una que llegás a hacer.</li>
        <li>Los números con un globito violeta son mejoras que ya podés comprar.</li>
      </ul>
    </>
  )
}

function Contracts() {
  return (
    <>
      <H>Plazo, tamaño y paga</H>
      <P>
        Cada contrato tiene un <B>plazo fijo</B>. Lo que cambia es el código que pide: crece con la etapa, la reputación
        y tu producción, así un contrato nunca dura un suspiro. Las ofertas fáciles ocupan cerca de un tercio del plazo
        y las difíciles, más de la mitad, pero pagan más.
      </P>
      <P>
        Si se vence el plazo, el cliente "contrata a un primo": perdés el 5 % de tu dinero y {FAILURE_REP_LOSS} ★, pero
        te llevás un 20 % de la XP por la experiencia.
      </P>
      <P>
        <B>🏳 Renunciar:</B> con el botón debajo del reloj podés abandonar un contrato en cualquier momento. Cuenta como
        contrato perdido (las mismas pérdidas) pero <B>sin</B> la XP de consuelo. Contra un jefe, se va y no deja la
        caja.
      </P>
      <H>Lenguajes y tecnologías</H>
      <P>
        Cada contrato es de un lenguaje (.html, .js, .py…). Para que aparezcan tenés que aprender esa tecnología en
        Mejoras. Las tecnologías más avanzadas pagan más, y subir su nivel hace sus contratos más rápidos y mejor pagos.
        Los contratos <B>fullstack</B> combinan varias tecnologías y pagan extra por cada una.
      </P>
      <H>Reputación</H>
      <P>Cada entrega suma ★. Con más reputación aparecen más ofertas, más grandes y mejor pagas:</P>
      <Table
        head={['Nivel de ofertas', 'Reputación', 'Ofertas en el tablón']}
        rows={REP_LEVELS.map((rep, i) => [`Nv.${i + 1}`, `${rep} ★`, boardSize(i)])}
      />
      <H>⭐ Contratos especiales</H>
      <P>
        A veces aparece una oferta dorada con una condición rara. Paga mucho más, da ×3 de XP y ×2 de reputación. La
        Captación automática nunca las toma: son tu decisión.
      </P>
      <Table
        head={['Especial', 'Condición', 'Paga']}
        rows={Object.values(SPECIAL_RULES).map((r) => [r.name, r.detail, `×${r.pay}`])}
      />
    </>
  )
}

function Team() {
  return (
    <>
      <H>Profesiones</H>
      <Table
        head={['Rol', 'Qué hace', 'Precio base', 'Desde']}
        rows={ROLE_IDS.map((id) => [
          `${ROLES[id].icon} ${ROLES[id].name}`,
          `1★: ${employeeEffect(id, 1)} · 5★: ${employeeEffect(id, 5)}`,
          formatMoney(ROLES[id].basePrice),
          stageName(ROLES[id].minStage),
        ])}
      />
      <P>
        Los empleados tienen de 1 a 5 ★: más estrellas, mucho mejores y mucho más caros. Los sueldos también crecen con
        la etapa. Las estrellas posibles dependen de la etapa:
      </P>
      <Table head={['Etapa', 'Hasta']} rows={STAGES.map((s, i) => [`${s.icon} ${s.name}`, stars(maxStars(i))])} />
      <H>Candidatos</H>
      <P>
        Hay un candidato por cada profesión de tu etapa (y un dev de más mientras son pocas). <B>🔄 Buscar otros</B>{' '}
        trae una lista nueva; cada búsqueda seguida sale ×{REROLL_GROWTH.toLocaleString('es-AR')} más cara, hasta que
        contratás a alguien. Con la oficina llena podés contratar reemplazando a alguien: elegís al candidato y tocás el
        escritorio de quien se va (no devuelve lo que costó). Tocá a cualquiera del plano para ver qué aporta.
      </P>
      <H>Oficinas</H>
      <Table
        head={['Oficina', 'Puestos', 'Precio', 'Desde']}
        rows={OFFICES.map((o) => [
          `${o.icon} ${o.name}`,
          o.capacity,
          o.price ? formatMoney(o.price) : '—',
          stageName(o.minStage),
        ])}
      />
    </>
  )
}

function Upgrades() {
  const skillRows = (group: 'personal' | 'company') =>
    SKILLS.filter((s) => s.group === group).map((s) => [
      `${s.icon} ${s.name}`,
      s.effect,
      `${s.maxLevel}`,
      stageName(s.minStage),
    ])
  return (
    <>
      <P>
        La pantalla <B>Mejoras</B> tiene cinco pestañas. Las herramientas se pagan con dinero; tecnologías y
        habilidades, con XP (cada nivel cuesta ×1,5 el anterior); el prestigio, con tokens.
      </P>
      <H>🧰 Herramientas: editores</H>
      <P>Cada editor cambia el aspecto del juego y te da un bonus. El aspecto lo podés volver a elegir en Ajustes.</P>
      <Table
        head={['Editor', 'Bonus', 'Precio', 'Desde']}
        rows={EDITORS.map((e) => [
          e.name,
          e.bonusText,
          e.price ? formatMoney(e.price) : 'Gratis',
          stageName(e.minStage),
        ])}
      />
      <H>🤖 Herramientas: Macro de teclado</H>
      <P>
        Hace clic sola mientras haya un contrato en curso (se puede apagar). Sus clics no son críticos ni cuentan para
        tus logros.
      </P>
      <Table
        head={['Versión', 'Clics por segundo', 'Precio', 'Desde']}
        rows={MACRO_LEVELS.map((m) => [m.name, m.cps, formatMoney(m.price), stageName(m.minStage)])}
      />
      <H>💻 Tecnologías</H>
      <Table
        head={['Tecnología', 'Efecto', 'Desde']}
        rows={TECHS.map((t) => [t.name, t.effect, stageName(t.minStage)])}
      />
      <H>🧠 Árbol personal</H>
      <Table head={['Mejora', 'Efecto', 'Niveles', 'Desde']} rows={skillRows('personal')} />
      <H>🏢 Árbol empresa</H>
      <Table head={['Mejora', 'Efecto', 'Niveles', 'Desde']} rows={skillRows('company')} />
    </>
  )
}

function Stages() {
  return (
    <>
      <P>
        Se asciende <B>a mano</B> desde la pantalla Empresa, cuando cumplís todos los requisitos. Cada etapa hace los
        contratos más grandes y mejor pagos, y desbloquea cosas nuevas.
      </P>
      <Table
        head={['Etapa', 'Requisitos', 'Desbloquea']}
        rows={STAGES.map((s) => [
          `${s.icon} ${s.name}`,
          s.requires
            ? `${formatMoney(s.requires.moneyEarned)} ganados · ${OFFICES[s.requires.office].name} · ${s.requires.team} empleados · ${s.requires.contractsDone} contratos`
            : '—',
          s.unlocks,
        ])}
      />
      <H>🃏 Especializaciones</H>
      <P>
        Cada vez que ascendés aparecen 3 cartas, una de cada estilo, y elegís una. Se suman entre sí y arman tu{' '}
        <B>build</B>:{' '}
        {Object.values(STYLES)
          .map((st) => `${st.icon} ${st.name} (${st.text})`)
          .join(', ')}
        . Hay un {Math.round(RARE_CHANCE * 100)} % de chance de que una salga <B>✨ rara</B>, mucho más fuerte. Se
        pierden al vender la empresa. Las ves en Empresa → build/.
      </P>
      <Table
        head={['Carta', 'Estilo', 'Efecto (normal · rara)']}
        rows={CARDS.map((c) => [
          `${c.icon} ${c.name}`,
          `${STYLES[c.style].icon} ${STYLES[c.style].name}`,
          `${c.text(false)} · ${c.text(true)}`,
        ])}
      />
      <H>♾️ Modo infinito</H>
      <P>
        En Corporación ya no hay más etapas: cada contrato entregado agranda los próximos un{' '}
        {Math.round((ENDLESS_GROWTH - 1) * 100)} %. Es el momento de juntar valor y vender la empresa.
      </P>
    </>
  )
}

function Prestige() {
  return (
    <>
      <H>Vender la empresa</H>
      <P>
        En Corporación aparece la opción de <B>vender</B>. Perdés todo lo de esa partida (dinero, equipo, mejoras,
        editores) y arrancás otra empresa desde cero, pero ganás <B>tokens de inversión</B>.
      </P>
      <P>
        Vender da {BASE_TOKENS} tokens, y uno más cada vez que el valor de la empresa duplica un hito (el primero es{' '}
        {formatMoney(milestoneValue(0))}). El valor es todo lo que ganaste más lo que vale tu equipo.
      </P>
      <H>🏛 Experiencia de fundador</H>
      <P>
        Cada token que ganaste en tu carrera da <B>+{Math.round(FOUNDER_BONUS * 100)} % de producción</B> para siempre,
        aunque lo gastes.
      </P>
      <H>🏺 Artefactos y 📦 cajas</H>
      <P>
        Los artefactos son objetos de tu escritorio (pantalla <B>Setup</B>) con mejoras <B>para siempre</B>. Salen de
        las cajas de suministros: una por cada cliente jefe que vencés, una por cada venta, y se pueden comprar con
        tokens. Los repetidos suben de nivel, hasta Nv.{MAX_ARTIFACT_LEVEL}. Rarezas:{' '}
        {Object.values(RARITIES)
          .map((r) => `${r.name} (${r.weight} %)`)
          .join(', ')}
        .
      </P>
      <Table
        head={['Artefacto', 'Rareza', 'Efecto (Nv.1)']}
        rows={ARTIFACTS.map((a) => [`${a.icon} ${a.name}`, RARITIES[a.rarity].name, a.text(1)])}
      />
      <H>🏁 Desafíos de run</H>
      <P>
        Desde la segunda empresa, al arrancar podés elegir un desafío opcional. Si vendés la empresa con él, ganás más
        tokens; la primera vez que completás cada uno, también {CHALLENGE_FIRST_BOXES} 📦 cajas extra.
      </P>
      <Table
        head={['Desafío', 'Regla', 'Premio']}
        rows={CHALLENGES.map((c) => [`${c.icon} ${c.name}`, c.rule, `+${Math.round(c.tokenBonus * 100)} % tokens`])}
      />
      <H>🦄 Salida a la bolsa (el final)</H>
      <P>
        Cuando vendés {IPO_SALES} empresas, en Empresa aparece el botón <B>Salir a la bolsa</B>: es el final del juego,
        con las estadísticas de toda tu carrera y un logro legendario. Después podés seguir jugando como leyenda, con
        todo lo que juntaste.
      </P>
      <H>Árbol de prestigio</H>
      <P>Se paga con tokens; cada nivel cuesta el doble que el anterior. Nada de esto se pierde al vender.</P>
      <Table
        head={['Mejora', 'Rama', 'Efecto', 'Niveles']}
        rows={INVESTMENTS.map((inv) => [`${inv.icon} ${inv.name}`, inv.branch, inv.effect, inv.maxLevel])}
      />
      <P>
        En Empresa → historial ves cada empresa vendida y cuánto más rápida fue que la anterior. Los logros también
        sobreviven a la venta.
      </P>
    </>
  )
}

function Extras() {
  return (
    <>
      <H>🎯 Concentración</H>
      <P>
        Una habilidad del árbol personal. Tocá el botón Foco para escribir ×{FOCUS_MULTIPLIER} por clic durante{' '}
        {focusDuration(1)} s (más con cada nivel). Se recarga en {FOCUS_COOLDOWN / 60} minutos.
      </P>
      <H>⚡ Habilidades activas</H>
      <P>
        Se aprenden en el árbol personal y aparecen en la barra al lado de Programar. Se usan con su botón o con las
        teclas 1 a 5 (el 1 es el Foco). Subirles el nivel las mejora.
      </P>
      <Table
        head={['Habilidad', 'Tecla', 'Efecto (Nv.1)', 'Recarga']}
        rows={ABILITIES.map((a) => [
          `${a.icon} ${a.name}`,
          a.key,
          a.describe(1),
          `${Math.round(a.cooldown(1) / 60)} min`,
        ])}
      />
      <H>👹 Clientes jefe</H>
      <P>
        Desde Estudio, cada {BOSS_EVERY} contratos llega al tablón un cliente jefe: un contrato enorme (
        {BOSS_SCALE.code}× el código) con reloj estricto y, a veces, una condición. Si le ganás, paga ×
        {BOSS_SCALE.money} y te da una <B>📦 caja de suministros</B>. Si se vence, solo perdés la oportunidad. La
        Captación automática nunca los toma.
      </P>
      <Table
        head={['Jefe', 'Desde', 'Condición']}
        rows={BOSSES.map((b) => [
          `${b.icon} ${b.name}`,
          stageName(b.minStage),
          b.rule ? SPECIAL_RULES[b.rule].name : '—',
        ])}
      />
      <H>🐛 Bug dorado</H>
      <P>
        Cada pocos minutos un bug dorado camina por la pantalla. Si lo atrapás, tu equipo produce ×{BUG_MULTIPLIER}{' '}
        durante {BUG_DURATION} s. Se escapa rápido.
      </P>
      <H>🎲 Eventos</H>
      <P>
        Cada 3–6 minutos pasa algo: buenas noticias, malas noticias o una decisión con dos opciones (algunas con azar).
        Hay {EVENTS.length} eventos distintos. Si no elegís a tiempo, se toma la opción segura.
      </P>
      <H>🎮 Minijuegos</H>
      <P>
        Cada tanto llega una invitación opcional. Según cómo te vaya, tu equipo produce hasta ×3 durante{' '}
        {MINIGAME_REWARD_SECONDS} s y ganás XP. Si te va mal, no pasa nada. Los marcados con 🧑‍💻 piden saber algo de
        programación; el resto se juega sin saber nada.
      </P>
      <Table
        head={['Minijuego', 'Cómo se juega']}
        rows={MINIGAMES.map((m) => [`${m.icon} ${m.title}${m.forDevs ? ' 🧑‍💻' : ''}`, m.rules])}
      />
      <H>🏆 Logros</H>
      <P>
        Hay {ACHIEVEMENTS.length} logros en {CATEGORIES.length} categorías (
        {CATEGORIES.map((c) => `${c.icon} ${c.name}`).join(', ')}). Cada uno da{' '}
        <B>+{Math.round(ACHIEVEMENT_BONUS * 100)} % de producción</B> para siempre. Algunos son secretos: no se ve qué
        piden hasta conseguirlos. Están en Empresa → Logros.
      </P>
    </>
  )
}

function Screens() {
  return (
    <>
      <P>Todo el juego pasa en estas pantallas. Las que todavía no se desbloquearon no aparecen en la barra.</P>
      <Table
        head={['Pantalla', 'Para qué sirve']}
        rows={[
          ['⌨️ Código', 'El contrato en curso: el reloj, el código que se va escribiendo, Programar y git push.'],
          ['📋 Ofertas', 'El tablón de contratos, tu ritmo, tu reputación y la Captación automática.'],
          ['👥 Equipo', 'El plano de la oficina, los candidatos para contratar y la próxima oficina.'],
          ['▲ Empresa', 'La etapa, los requisitos para ascender, logros, estadísticas, historial y la venta.'],
          ['▣ Setup', 'Tu avatar, título y mascota; el escritorio con los artefactos y las cajas.'],
          ['⑂ Mejoras', 'Herramientas, tecnologías, árboles de habilidades y el árbol de prestigio.'],
          ['⚙ Ajustes', 'Aspecto del editor, sonido, brillo, exportar o importar la partida y empezar de cero.'],
        ]}
      />
      <H>🔔 Notificaciones</H>
      <P>
        La campanita junta todo lo que pasó mientras no mirabas: logros, eventos, jefes, cajas. El número rojo dice
        cuántas no leíste. Los puntitos en la barra y la etiqueta <B>¡NUEVO!</B> marcan cosas recién desbloqueadas.
      </P>
      <H>📱 En el celular</H>
      <P>
        Se juega igual: la barra de pantallas va abajo, el teclado de Programar muestra una sola fila y la terminal se
        esconde (lo importante llega a la campanita).
      </P>
    </>
  )
}

/** Cómo se consigue algo de tu perfil (los logros secretos no se cuentan) */
const unlockText = (c: Choice) => {
  if (!c.unlock) return 'Desde el inicio'
  const a = ACHIEVEMENTS.find((x) => x.id === c.unlock)
  return a?.secret ? 'Logro secreto' : `Logro: ${a?.name ?? '?'}`
}

function Personalization() {
  const locked = [...HOODIES, ...HEAD_ITEMS, ...FACE_ITEMS].filter((c) => c.unlock)
  return (
    <>
      <P>
        Nada de esto da bonus: es para que el juego sea tuyo. El perfil (avatar, título y mascota) <B>no se pierde</B>{' '}
        al vender la empresa.
      </P>
      <H>🏢 Tu empresa</H>
      <P>
        En Empresa tocá ✏️ para cambiarle el nombre, el emoji del logo y el color. Cada empresa nueva arranca con un
        nombre al azar.
      </P>
      <H>🧑‍💻 Tu avatar</H>
      <P>
        En Setup elegís piel, buzo, algo en la cabeza y algo en la cara. Algunas cosas se ganan con logros:{' '}
        {locked.length} en total.
      </P>
      <Table head={['Accesorio', 'Cómo se consigue']} rows={locked.map((c) => [c.name, unlockText(c)])} />
      <H>🏷 Títulos</H>
      <Table head={['Título', 'Cómo se consigue']} rows={TITLES.map((t) => [t.name, unlockText(t)])} />
      <H>🐈 Mascota de la oficina</H>
      <P>
        {MASCOTS.map((m) => `${m.icon} ${m.name}`).join(', ')}. Cada tanto cruza la pantalla: tocala para acariciarla
        (hay un logro escondido ahí).
      </P>
      <H>🎨 Aspecto del editor</H>
      <P>
        Cada editor que comprás cambia todo el juego: Nano (terminal), Bloc de notas y Notepad (ventanas claras),
        Sublimado Text (pestañas inclinadas y navegación por archivos abiertos), Visual Estudio Code (IDE completo) y
        Cladex Code (un agente que programa por vos). En Ajustes podés volver a cualquiera que ya compraste; los bonus
        son siempre los del mejor.
      </P>
    </>
  )
}

function Shortcuts() {
  return (
    <>
      <H>Teclado</H>
      <Table
        head={['Tecla', 'Qué hace']}
        rows={[
          ['Espacio', 'Programar (o entregar, si el código está completo) en la pantalla de código'],
          ['1 a 5', 'Usar una habilidad: 1 Foco, 2 Hackatón, 3 Crunch, 4 Pair programming, 5 Café doble'],
          ['F1', 'Abrir esta ayuda'],
          ['Esc', 'Cerrar esta ayuda'],
        ]}
      />
      <H>Partida</H>
      <ul className="mb-3 flex list-disc flex-col gap-1.5 pl-5 text-sm text-muted">
        <li>La partida se guarda sola en este navegador.</li>
        <li>
          Con la pestaña oculta el juego <B>sigue</B>. Con el juego cerrado, <B>no avanza</B>: no hay progreso offline.
        </li>
        <li>
          En <B>Ajustes</B> podés exportar la partida (backup o para mandarla), importarla, cambiar el aspecto del
          editor, reducir el brillo, ajustar el sonido y empezar de cero.
        </li>
      </ul>
    </>
  )
}

/** Secciones de la wiki. keywords: palabras extra para el buscador (además del título) */
const SECTIONS = [
  { id: 'play', label: '🚀 Cómo jugar', body: HowToPlay, keywords: 'empezar ciclo consejos objetivo primer' },
  {
    id: 'screens',
    label: '🗂 Pantallas',
    body: Screens,
    keywords: 'código ofertas equipo empresa setup mejoras ajustes campanita notificaciones celular',
  },
  {
    id: 'contracts',
    label: '📄 Contratos',
    body: Contracts,
    keywords: 'plazo deadline paga reputación especiales lenguajes fullstack renunciar fallar vencer',
  },
  {
    id: 'team',
    label: '👥 Equipo',
    body: Team,
    keywords: 'profesiones empleados candidatos oficina estrellas reemplazar contratar',
  },
  {
    id: 'upgrades',
    label: '🧠 Mejoras',
    body: Upgrades,
    keywords: 'editores macro tecnologías árbol habilidades xp herramientas',
  },
  {
    id: 'stages',
    label: '▲ Etapas',
    body: Stages,
    keywords: 'ascender requisitos cartas especialización build infinito',
  },
  {
    id: 'prestige',
    label: '🪙 Prestigio',
    body: Prestige,
    keywords: 'vender tokens fundador artefactos cajas desafíos bolsa ipo final',
  },
  {
    id: 'extras',
    label: '✨ Extras',
    body: Extras,
    keywords: 'foco habilidades jefes bug dorado eventos minijuegos logros',
  },
  {
    id: 'profile',
    label: '🧑‍💻 Personalización',
    body: Personalization,
    keywords: 'avatar título mascota logo nombre empresa accesorios aspecto editor gato perro pato',
  },
  {
    id: 'keys',
    label: '⌨️ Atajos',
    body: Shortcuts,
    keywords: 'teclado espacio teclas guardar partida exportar offline',
  },
] as const

type SectionId = (typeof SECTIONS)[number]['id']

/** Saca tildes y mayúsculas para buscar "tecnologias" y encontrar "Tecnologías" */
const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

// --- Modal ----------------------------------------------------------------------------------

export function HelpModal({ onClose }: { onClose: () => void }) {
  const [section, setSection] = useState<SectionId>('play')
  const [query, setQuery] = useState('')
  const current = SECTIONS.find((s) => s.id === section) ?? SECTIONS[0]
  // 🔎 Buscador (v1.0): con algo escrito se ven todas las secciones que lo mencionan, una abajo de la otra
  const found = useMemo(() => {
    const q = normalize(query.trim())
    if (!q) return null
    return SECTIONS.filter((s) => normalize(`${s.label} ${s.keywords}`).includes(q))
  }, [query])
  const shown = found ?? [current]

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-60 grid place-items-center bg-black/60 p-3 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Ayuda"
        onClick={(event) => event.stopPropagation()}
        className="flex h-[min(44rem,calc(100dvh-1.5rem))] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-line-2 bg-panel-2 shadow-2xl"
      >
        <header className="flex items-center gap-3 border-b border-line px-4 py-3">
          <span className="grid size-8 place-items-center rounded-lg bg-cyan/15 font-extrabold text-cyan">?</span>
          <div className="min-w-0 flex-1">
            <p className="font-extrabold">Ayuda · Dev Clicker</p>
            <p className="text-xs text-muted">Cómo jugar y todo lo que hay en el juego</p>
          </div>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="🔎 Buscar…"
            aria-label="Buscar en la ayuda"
            className="hidden w-48 rounded-lg border border-line-2 bg-panel px-2.5 py-1.5 text-sm outline-none focus:border-cyan sm:block"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ayuda"
            className="cursor-pointer rounded-lg px-2 py-1 text-faint hover:bg-panel-3 hover:text-text"
          >
            ✕
          </button>
        </header>
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <nav className="flex shrink-0 gap-1 overflow-x-auto border-b border-line p-2 md:w-52 md:flex-col md:border-r md:border-b-0">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="🔎 Buscar…"
              aria-label="Buscar en la ayuda"
              className="w-32 shrink-0 rounded-lg border border-line-2 bg-panel px-2.5 py-1.5 text-sm outline-none focus:border-cyan sm:hidden"
            />
            {SECTIONS.map((s) => {
              const active = found ? found.includes(s) : s.id === section
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setQuery('')
                    setSection(s.id)
                  }}
                  aria-current={active ? 'page' : undefined}
                  className={`cursor-pointer rounded-lg px-3 py-2 text-left text-sm font-bold whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-text text-bg'
                      : found
                        ? 'text-faint hover:text-text'
                        : 'text-muted hover:bg-panel-3 hover:text-text'
                  }`}
                >
                  {s.label}
                </button>
              )
            })}
            <CommunityLinks variant="inline" className="mt-auto hidden pt-3 md:flex md:flex-col" />
          </nav>
          <article className="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-6">
            {found && !found.length && (
              <p className="text-sm text-muted">
                No encontramos nada con “{query}”. Probá con otra palabra, como <B>jefe</B>, <B>tokens</B> o{' '}
                <B>mascota</B>.
              </p>
            )}
            {shown.map((s) => (
              <section key={s.id} className="mb-6">
                <h2 className="mb-3 text-lg font-extrabold">{s.label}</h2>
                <s.body />
              </section>
            ))}
          </article>
        </div>
      </div>
    </div>
  )
}

/** Botón ❓ para abrir la ayuda */
export function HelpButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Ayuda (F1)"
      title="Ayuda (F1)"
      className="absolute right-1.5 bottom-2.5 z-10 grid size-6 md:top-1.5 md:bottom-auto cursor-pointer place-items-center rounded-full border border-cyan/50 bg-panel-2 font-mono text-xs font-extrabold text-cyan transition-colors hover:bg-cyan hover:text-bg"
    >
      ?
    </button>
  )
}
