// 🔓 Qué trae cada etapa: lo que aparece al ascender (para mostrarlo en Empresa antes de llegar).
import { BOSSES } from '../data/bosses'
import { EDITORS } from '../data/editors'
import { MACRO_LEVELS } from '../data/macro'
import { OFFICES } from '../data/offices'
import { ROLES, ROLE_IDS } from '../data/roles'
import { SKILLS } from '../data/skills'
import { STAGES } from '../data/stages'
import { TECHS } from '../data/techs'

export type Unlock = { icon: string; text: string }

/** Lo que se desbloquea al llegar a esta etapa (índice en STAGES) */
export function stageUnlocks(stage: number): Unlock[] {
  const at = <T extends { minStage?: number }>(list: T[]) => list.filter((x) => (x.minStage ?? 0) === stage)
  const names = (list: { name: string }[]) => list.map((x) => x.name).join(', ')
  const result: Unlock[] = []

  const roles = ROLE_IDS.filter((id) => ROLES[id].minStage === stage).map((id) => ROLES[id])
  if (roles.length)
    result.push({ icon: '👥', text: `Profesiones: ${roles.map((r) => `${r.icon} ${r.name}`).join(', ')}` })
  const techs = at(TECHS)
  if (techs.length) result.push({ icon: '💻', text: `Tecnologías: ${names(techs)}` })
  const offices = at(OFFICES).filter((o) => o.price > 0)
  if (offices.length)
    result.push({
      icon: '🏢',
      text: `Oficina: ${offices.map((o) => `${o.icon} ${o.name} (${o.capacity} puestos)`).join(', ')}`,
    })
  const editors = at(EDITORS)
  if (editors.length) result.push({ icon: '🛠', text: `Editor: ${names(editors)}` })
  const macro = at(MACRO_LEVELS)
  if (macro.length) result.push({ icon: '🤖', text: `Macro de teclado: ${names(macro)}` })
  const skills = at(SKILLS)
  if (skills.length) result.push({ icon: '🧠', text: `${skills.length} mejoras nuevas en los árboles` })
  const bosses = BOSSES.filter((b) => b.minStage === stage)
  if (bosses.length) result.push({ icon: '👹', text: `Clientes jefe: ${bosses.map((b) => b.icon).join(' ')}` })
  if (stage === 1) result.push({ icon: '🎮', text: 'Minijuegos y el árbol de Empresa' })
  if (stage === STAGES.length - 1) result.push({ icon: '♾️', text: 'Modo infinito y la venta de la empresa' })
  return result
}
