import type { ReactNode } from 'react'
import { ROLES } from '../data/roles'
import { employeeEffect, type Employee } from '../game/team'
import { ROLE_STYLE } from '../ui'

export function Stars({ stars }: { stars: number }) {
  return (
    <span className="tracking-wider text-yellow" aria-label={`${stars} de 5 estrellas`}>
      {'★'.repeat(stars)}
      <span className="text-panel-3">{'★'.repeat(5 - stars)}</span>
    </span>
  )
}

type EmployeeCardProps = {
  employee: Employee
  /** Lo de abajo de la tarjeta: botón de contratar o estado de trabajo */
  children: ReactNode
}

/** Tarjeta de una persona: sirve para el equipo y para los candidatos */
function EmployeeCard({ employee, children }: EmployeeCardProps) {
  const role = ROLES[employee.role]
  const style = ROLE_STYLE[employee.role]

  return (
    <li className="flex flex-col rounded-xl border border-line bg-panel-2 p-3.5">
      <div className="flex items-start gap-2.5">
        <span
          className={`grid size-9 shrink-0 place-items-center rounded-lg bg-linear-to-br font-mono text-xs font-extrabold text-white ${style.avatar}`}
        >
          {employee.name.slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="font-extrabold">{employee.name}</p>
          <p className={`text-xs ${style.text}`}>
            {role.icon} {role.name}
          </p>
        </div>
        <span className="ml-auto text-xs">
          <Stars stars={employee.stars} />
        </span>
      </div>
      <p className="mt-2 font-mono text-xs">{employeeEffect(employee.role, employee.stars)}</p>
      <p className="mt-1 mb-3 text-xs text-muted italic">“{employee.quirk}”</p>
      <div className="mt-auto">{children}</div>
    </li>
  )
}

export default EmployeeCard
