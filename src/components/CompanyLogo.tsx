// 🏢 El logo de tu empresa (G4): un emoji sobre un color
import { logoBg, type CompanyIdentity } from '../data/personalization'

type CompanyLogoProps = {
  company: Pick<CompanyIdentity, 'emoji' | 'color'>
  /** Clases de tamaño (por defecto, chico) */
  className?: string
}

function CompanyLogo({ company, className = 'size-6 text-sm rounded-md' }: CompanyLogoProps) {
  return (
    <span className={`grid shrink-0 place-items-center leading-none ${logoBg(company.color)} ${className}`} aria-hidden>
      {company.emoji}
    </span>
  )
}

export default CompanyLogo
