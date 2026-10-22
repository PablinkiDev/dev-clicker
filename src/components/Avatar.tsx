// 🧑‍💻 Tu avatar (G4): un dibujo simple con buzo, tono de piel y accesorios.
import { HOODIES, SKINS, type Profile } from '../data/personalization'

type AvatarProps = {
  profile: Pick<Profile, 'skin' | 'hoodie' | 'head' | 'face'>
  /** Tamaño en px */
  size?: number
  className?: string
}

const INK = '#1b2135'

function Head({ item }: { item: string }) {
  switch (item) {
    case 'beanie':
      return (
        <g>
          <path d="M19 26 C19 11 45 11 45 26 Z" fill="#c0392b" />
          <rect x="18" y="22.5" width="28" height="5" rx="2.5" fill="#922b21" />
          <circle cx="32" cy="11" r="3.2" fill="#e8e8e8" />
        </g>
      )
    case 'cap':
      return (
        <g>
          <path d="M20 25 C20 12.5 44 12.5 44 25 Z" fill="#2c5bd1" />
          <path d="M33 23.5 L53 23.5 Q52 27.5 41 27 L33 26.5 Z" fill="#1d3f99" />
          <circle cx="32" cy="14" r="1.6" fill="#1d3f99" />
        </g>
      )
    case 'headphones':
      return (
        <g>
          <path d="M17.5 30 C17.5 10 46.5 10 46.5 30" stroke="#2b2b2b" strokeWidth="3.2" fill="none" />
          <rect x="14" y="25" width="7" height="11" rx="3" fill="#2b2b2b" />
          <rect x="43" y="25" width="7" height="11" rx="3" fill="#2b2b2b" />
          <rect x="15.5" y="27" width="4" height="7" rx="2" fill="#5af78e" />
          <rect x="44.5" y="27" width="4" height="7" rx="2" fill="#5af78e" />
        </g>
      )
    case 'antennae':
      return (
        <g stroke={INK} strokeWidth="1.8" fill="none">
          <path d="M27 18 Q24 9 19 6" />
          <path d="M37 18 Q40 9 45 6" />
          <circle cx="19" cy="6" r="2.4" fill="#5af78e" stroke="none" />
          <circle cx="45" cy="6" r="2.4" fill="#5af78e" stroke="none" />
        </g>
      )
    case 'crown':
      return (
        <g>
          <path
            d="M21 19 L24 8 L29 14.5 L32 6 L35 14.5 L40 8 L43 19 Z"
            fill="#ffcb6b"
            stroke="#b8860b"
            strokeWidth="1"
          />
          <circle cx="32" cy="15" r="1.5" fill="#ff6e7f" />
        </g>
      )
    default:
      return null
  }
}

function Face({ item }: { item: string }) {
  switch (item) {
    case 'glasses':
      return (
        <g stroke={INK} strokeWidth="1.5" fill="rgba(255,255,255,.25)">
          <circle cx="27.5" cy="28" r="3.8" />
          <circle cx="36.5" cy="28" r="3.8" />
          <path d="M31.3 28 L32.7 28" />
        </g>
      )
    case 'sunglasses':
      return (
        <g fill="#111">
          <rect x="22.5" y="25.5" width="8.5" height="5.5" rx="2" />
          <rect x="33" y="25.5" width="8.5" height="5.5" rx="2" />
          <rect x="30.5" y="26.5" width="3" height="1.4" />
        </g>
      )
    case 'mustache':
      return (
        <path d="M25.5 33.2 Q29 30.5 32 32.6 Q35 30.5 38.5 33.2 Q35 34.6 32 33.6 Q29 34.6 25.5 33.2 Z" fill="#3b2a20" />
      )
    default:
      return null
  }
}

function Avatar({ profile, size = 64, className = '' }: AvatarProps) {
  const skin = SKINS.find((s) => s.id === profile.skin)?.hex ?? SKINS[1].hex
  const hoodie = HOODIES.find((h) => h.id === profile.hoodie)?.hex ?? HOODIES[0].hex
  const covered = profile.head !== 'none' && profile.head !== 'antennae'
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={className} role="img" aria-label="Tu avatar">
      <circle cx="32" cy="32" r="32" fill="#1b2135" />
      {/* Buzo con capucha y cordones */}
      <path d="M9 64 C9 46 19 39.5 32 39.5 C45 39.5 55 46 55 64 Z" fill={hoodie} />
      <path d="M22 42 Q32 50 42 42" stroke="rgba(0,0,0,.25)" strokeWidth="2.5" fill="none" />
      <path d="M29 46 L28 54 M35 46 L36 54" stroke="#f0f0f0" strokeWidth="1.3" />
      {/* Cabeza, pelo y cara */}
      <circle cx="32" cy="28" r="12.5" fill={skin} />
      {!covered && <path d="M19.5 27 C19 14 45 14 44.5 27 C41 20.5 25 20 19.5 27 Z" fill="#3b2a20" />}
      <circle cx="27.5" cy="28" r="1.6" fill={INK} />
      <circle cx="36.5" cy="28" r="1.6" fill={INK} />
      <path d="M28.5 33.5 Q32 36.5 35.5 33.5" stroke={INK} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <Face item={profile.face} />
      <Head item={profile.head} />
    </svg>
  )
}

export default Avatar
