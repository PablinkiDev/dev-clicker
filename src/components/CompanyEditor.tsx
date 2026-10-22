// 🏢 Nombre y logo de la empresa (G4). Se usa al fundar una empresa nueva y para renombrarla.
import {
  COMPANY_NAMES,
  COMPANY_NAME_MAX,
  LOGO_COLORS,
  LOGO_EMOJIS,
  type CompanyIdentity,
} from '../data/personalization'
import CompanyLogo from './CompanyLogo'

type CompanyEditorProps = {
  value: CompanyIdentity
  onChange: (company: CompanyIdentity) => void
}

function CompanyEditor({ value, onChange }: CompanyEditorProps) {
  function suggest() {
    const others = COMPANY_NAMES.filter((n) => n !== value.name)
    onChange({ ...value, name: others[Math.floor(Math.random() * others.length)] })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2.5">
        <CompanyLogo company={value} className="size-11 text-2xl rounded-xl" />
        <input
          value={value.name}
          maxLength={COMPANY_NAME_MAX}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
          aria-label="Nombre de la empresa"
          placeholder="Nombre de la empresa"
          className="min-w-0 flex-1 rounded-xl border border-line-2 bg-panel px-3 py-2.5 font-bold outline-none focus:border-cyan/60"
        />
        <button
          type="button"
          onClick={suggest}
          title="Otro nombre al azar"
          className="cursor-pointer rounded-xl border border-line-2 bg-panel px-3 py-2.5 hover:bg-panel-3"
        >
          🎲
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Ícono del logo">
        {LOGO_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            role="radio"
            aria-checked={value.emoji === emoji}
            onClick={() => onChange({ ...value, emoji })}
            className={`grid size-9 cursor-pointer place-items-center rounded-lg border text-lg ${
              value.emoji === emoji ? 'border-cyan bg-cyan/15' : 'border-line-2 bg-panel hover:bg-panel-3'
            }`}
          >
            {emoji}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Color del logo">
        {LOGO_COLORS.map((c) => (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={value.color === c.id}
            aria-label={c.id}
            onClick={() => onChange({ ...value, color: c.id })}
            className={`size-7 cursor-pointer rounded-full ${c.bg} ${
              value.color === c.id
                ? 'ring-2 ring-text ring-offset-2 ring-offset-panel-2'
                : 'opacity-70 hover:opacity-100'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export default CompanyEditor
