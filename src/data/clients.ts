// 🧑‍💼 Avatar de cada cliente en el tablón (H5): sale de palabras de su nombre; si no hay ninguna, uno fijo al azar.

const BY_WORD: [RegExp, string][] = [
  [/verduler|tomate/i, '🍅'],
  [/pizz|muzza/i, '🍕'],
  [/gimnasio|fit|músculo/i, '🏋️'],
  [/banco|financ|bank/i, '🏦'],
  [/perro|pet|patitas|mascota|veterinar/i, '🐶'],
  [/tía|mamá|abuel|primo|sobrin/i, '🧓'],
  [/startup|blockchain|cripto/i, '🚀'],
  [/estudio|pérez|abogad/i, '⚖️'],
  [/kiosco|almacén|tienda|shop/i, '🏪'],
  [/club|fútbol|cancha|torneo/i, '⚽'],
  [/vino|vinoteca|malbec/i, '🍷'],
  [/yoga|namasté/i, '🧘'],
  [/café|cafetería/i, '☕'],
  [/academia|escuela|aprend/i, '🎓'],
  [/delivery|llega/i, '🛵'],
  [/rr\. hh|recursos|comunicación/i, '👔'],
  [/municip|ministerio|gobierno/i, '🏛️'],
  [/seguro|aseguradora/i, '🛡️'],
  [/camion|logíst|transporte/i, '🚚'],
  [/influencer|marca|brand/i, '📸'],
  [/omnicorp|megasoft|globaltech|conglomerado|corp|directorio|inversor/i, '🏢'],
  [/salud|clínica|hospital/i, '🏥'],
  [/peluquer/i, '💇'],
  [/restaurant|menú/i, '🍝'],
]

const FALLBACK = ['💼', '🧑‍💼', '🏬', '🛍️', '📦', '🧾', '🏭', '🎪']

/** El emoji que representa a un cliente (siempre el mismo para el mismo nombre) */
export function clientIcon(client: string): string {
  const match = BY_WORD.find(([re]) => re.test(client))
  if (match) return match[1]
  let hash = 0
  for (const ch of client) hash = (hash * 31 + ch.charCodeAt(0)) | 0
  return FALLBACK[Math.abs(hash) % FALLBACK.length]
}
