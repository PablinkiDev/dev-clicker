// Música y efectos de sonido (D10), generados con la Web Audio API: sin archivos de audio.
// Los navegadores no dejan sonar nada hasta que el jugador toca la página: por eso el audio
// arranca recién con el primer clic o tecla (unlockAudio).

export type AudioSettings = {
  /** Volumen de la música, de 0 a 1 */
  music: number
  /** Volumen de los efectos, de 0 a 1 */
  sfx: number
  muted: boolean
}

export const DEFAULT_AUDIO: AudioSettings = { music: 0.4, sfx: 0.6, muted: false }

const AUDIO_KEY = 'dev-clicker:audio'

/** Los ajustes de audio se guardan aparte de la partida: son del jugador, no de la empresa */
export function loadAudioSettings(): AudioSettings {
  try {
    const raw = JSON.parse(localStorage.getItem(AUDIO_KEY) ?? 'null')
    if (!raw || typeof raw !== 'object') return DEFAULT_AUDIO
    const num = (v: unknown, d: number) => (typeof v === 'number' && v >= 0 && v <= 1 ? v : d)
    return {
      music: num(raw.music, DEFAULT_AUDIO.music),
      sfx: num(raw.sfx, DEFAULT_AUDIO.sfx),
      muted: raw.muted === true,
    }
  } catch {
    return DEFAULT_AUDIO
  }
}

export function saveAudioSettings(settings: AudioSettings): void {
  try {
    localStorage.setItem(AUDIO_KEY, JSON.stringify(settings))
  } catch {
    // sin almacenamiento: se usan los de esta sesión
  }
}

// --- Motor -----------------------------------------------------------------------------

let ctx: AudioContext | null = null
let musicBus: GainNode | null = null
let sfxBus: GainNode | null = null
let noise: AudioBuffer | null = null
let settings: AudioSettings = loadAudioSettings()

/** Curva de volumen: el oído es logarítmico, así el slider se siente parejo */
const curve = (v: number) => v * v

/** Crea el contexto de audio (la primera vez) y arranca la música. Llamar desde un clic o tecla */
export function unlockAudio(): void {
  if (!ctx) {
    const Ctx =
      window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!Ctx) return
    ctx = new Ctx()
    const master = ctx.createDynamicsCompressor() // evita que muchos sonidos juntos saturen
    master.connect(ctx.destination)
    musicBus = ctx.createGain()
    sfxBus = ctx.createGain()
    musicBus.connect(master)
    sfxBus.connect(master)
    noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
    const data = noise.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  }
  if (ctx.state === 'suspended') void ctx.resume()
  applyAudioSettings(settings)
}

export function applyAudioSettings(next: AudioSettings): void {
  settings = next
  if (!ctx || !musicBus || !sfxBus) return
  const t = ctx.currentTime
  musicBus.gain.setTargetAtTime(next.muted ? 0 : curve(next.music) * 0.5, t, 0.1)
  sfxBus.gain.setTargetAtTime(next.muted ? 0 : curve(next.sfx), t, 0.05)
  // Sin música (muteado o en 0) el secuenciador se apaga para no gastar CPU
  if (next.muted || next.music === 0) stopMusic()
  else startMusic()
}

const midiToHz = (m: number) => 440 * Math.pow(2, (m - 69) / 12)

/** Una nota con envolvente: sube rápido y cae hasta `end` */
function tone(
  bus: GainNode,
  {
    type = 'sine',
    freq,
    to,
    at = 0,
    attack = 0.005,
    dur,
    vol,
    filter,
  }: {
    type?: OscillatorType
    freq: number
    /** Frecuencia final (glissando) */
    to?: number
    at?: number
    attack?: number
    dur: number
    vol: number
    filter?: number
  },
) {
  if (!ctx) return
  const t = Math.max(ctx.currentTime, at)
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur)
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(vol, t + attack)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  let out: AudioNode = gain
  if (filter) {
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = filter
    gain.connect(lp)
    out = lp
  }
  osc.connect(gain)
  out.connect(bus)
  osc.start(t)
  osc.stop(t + dur + 0.05)
}

/** Ruido filtrado: teclas, hi-hats */
function hiss(
  bus: GainNode,
  {
    at = 0,
    dur,
    vol,
    freq,
    type = 'highpass',
  }: { at?: number; dur: number; vol: number; freq: number; type?: BiquadFilterType },
) {
  if (!ctx || !noise) return
  const t = Math.max(ctx.currentTime, at)
  const src = ctx.createBufferSource()
  src.buffer = noise
  src.playbackRate.value = 0.8 + Math.random() * 0.4
  const filter = ctx.createBiquadFilter()
  filter.type = type
  filter.frequency.value = freq
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(vol, t)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  src.connect(filter).connect(gain).connect(bus)
  src.start(t, Math.random() * 0.5)
  src.stop(t + dur + 0.02)
}

// --- Efectos -----------------------------------------------------------------------------

export type Sfx =
  'click' | 'crit' | 'deliver' | 'fail' | 'buy' | 'achievement' | 'levelUp' | 'bug' | 'notify' | 'win' | 'lose'

let lastClick = 0

export function playSfx(name: Sfx): void {
  if (!ctx || !sfxBus || settings.muted || settings.sfx === 0) return
  const bus = sfxBus
  const t = ctx.currentTime
  switch (name) {
    case 'click': {
      // Una tecla mecánica. Con muchos clics por segundo no se amontonan
      if (t - lastClick < 0.03) return
      lastClick = t
      hiss(bus, { dur: 0.035, vol: 0.25, freq: 2500 + Math.random() * 1500, type: 'bandpass' })
      tone(bus, { type: 'triangle', freq: 180 + Math.random() * 40, dur: 0.03, vol: 0.08 })
      return
    }
    case 'deliver':
      // ¡Ka-ching!
      tone(bus, { type: 'square', freq: midiToHz(83), dur: 0.09, vol: 0.12, filter: 5000 })
      tone(bus, { type: 'square', freq: midiToHz(88), at: t + 0.08, dur: 0.35, vol: 0.12, filter: 5000 })
      hiss(bus, { at: t + 0.08, dur: 0.25, vol: 0.06, freq: 7000 })
      return
    case 'fail':
      tone(bus, { type: 'sawtooth', freq: 300, to: 140, dur: 0.45, vol: 0.12, filter: 1200 })
      tone(bus, { type: 'sawtooth', freq: 225, to: 105, at: t + 0.12, dur: 0.5, vol: 0.1, filter: 1000 })
      return
    case 'buy':
      ;[72, 76, 79].forEach((m, i) =>
        tone(bus, { type: 'triangle', freq: midiToHz(m), at: t + i * 0.05, dur: 0.18, vol: 0.12 }),
      )
      return
    case 'achievement':
      ;[72, 76, 79, 84].forEach((m, i) =>
        tone(bus, { type: 'triangle', freq: midiToHz(m), at: t + i * 0.08, dur: 0.4, vol: 0.14 }),
      )
      tone(bus, { type: 'sine', freq: midiToHz(96), at: t + 0.32, dur: 0.6, vol: 0.06 })
      hiss(bus, { at: t + 0.32, dur: 0.5, vol: 0.04, freq: 9000 })
      return
    case 'levelUp':
      ;[60, 64, 67, 72, 76, 79].forEach((m, i) =>
        tone(bus, { type: 'square', freq: midiToHz(m), at: t + i * 0.07, dur: 0.3, vol: 0.08, filter: 3000 }),
      )
      tone(bus, { type: 'triangle', freq: midiToHz(84), at: t + 0.45, dur: 0.9, vol: 0.14 })
      return
    case 'bug':
      for (let i = 0; i < 4; i++)
        tone(bus, {
          type: 'square',
          freq: 900 + i * 200,
          to: 1400 + i * 200,
          at: t + i * 0.04,
          dur: 0.05,
          vol: 0.06,
          filter: 5000,
        })
      return
    case 'notify':
      tone(bus, { type: 'sine', freq: midiToHz(81), dur: 0.15, vol: 0.14 })
      tone(bus, { type: 'sine', freq: midiToHz(88), at: t + 0.1, dur: 0.3, vol: 0.12 })
      return
    case 'win':
      ;[67, 72, 76, 79].forEach((m, i) =>
        tone(bus, { type: 'triangle', freq: midiToHz(m), at: t + i * 0.06, dur: 0.3, vol: 0.13 }),
      )
      return
    case 'lose':
      ;[67, 63, 60].forEach((m, i) =>
        tone(bus, { type: 'triangle', freq: midiToHz(m), at: t + i * 0.12, dur: 0.3, vol: 0.12 }),
      )
      return
  }
}

// --- Música -------------------------------------------------------------------------------
// Un loop lo-fi tranquilo para programar: acordes suaves, bajo, arpegio y hi-hats.
// 80 BPM, 4 acordes de 2 compases cada uno (24 s), y el arpegio varía en cada vuelta.

const BPM = 80
const STEP = 60 / BPM / 2 // corchea
const STEPS_PER_CHORD = 16 // 2 compases
/** Am9 · Fmaj7 · Cmaj7 · G6 (notas MIDI) */
const CHORDS = [
  { bass: 45, notes: [57, 60, 64, 67, 71] },
  { bass: 41, notes: [57, 60, 64, 65, 69] },
  { bass: 48, notes: [55, 60, 64, 67, 71] },
  { bass: 43, notes: [55, 59, 62, 64, 67] },
]
/** Cuánto se programa por adelantado: con la pestaña oculta, el navegador frena los intervalos a ~1 s */
const LOOKAHEAD = 1.5

let musicTimer: ReturnType<typeof setInterval> | null = null
let nextTime = 0
let step = 0

function scheduleStep(at: number, n: number) {
  if (!musicBus) return
  const bus = musicBus
  const chord = CHORDS[Math.floor(n / STEPS_PER_CHORD) % CHORDS.length]
  const inChord = n % STEPS_PER_CHORD

  // Acorde: un colchón suave al empezar cada uno
  if (inChord === 0) {
    for (const m of chord.notes.slice(0, 4)) {
      tone(bus, {
        type: 'triangle',
        freq: midiToHz(m),
        at,
        attack: 0.6,
        dur: STEP * STEPS_PER_CHORD,
        vol: 0.05,
        filter: 1200,
      })
      tone(bus, { type: 'sine', freq: midiToHz(m) * 1.003, at, attack: 0.8, dur: STEP * STEPS_PER_CHORD, vol: 0.03 })
    }
  }
  // Bajo: en el 1 y el 3 de cada compás, y un golpecito en el "y" del 2
  const inBar = inChord % 8
  if (inBar === 0 || inBar === 4)
    tone(bus, { freq: midiToHz(chord.bass), at, attack: 0.02, dur: STEP * 3, vol: 0.16, filter: 400 })
  if (inBar === 3) tone(bus, { freq: midiToHz(chord.bass + 7), at, attack: 0.02, dur: STEP, vol: 0.08, filter: 400 })
  // Bombo suave y hi-hats
  if (inBar === 0) tone(bus, { freq: 110, to: 45, at, dur: 0.25, vol: 0.2 })
  if (inBar === 4) hiss(bus, { at, dur: 0.12, vol: 0.06, freq: 1800, type: 'bandpass' }) // "clap" apagado
  if (inBar % 2 === 1) hiss(bus, { at, dur: 0.05, vol: 0.035, freq: 8000 })
  // Arpegio: notas del acorde una octava arriba, con silencios al azar
  if (Math.random() < 0.55) {
    const m = chord.notes[Math.floor(Math.random() * chord.notes.length)] + 12
    tone(bus, { type: 'sine', freq: midiToHz(m), at, attack: 0.01, dur: STEP * 1.8, vol: 0.045 })
  }
}

function startMusic() {
  if (musicTimer || !ctx) return
  nextTime = ctx.currentTime + 0.1
  const schedule = () => {
    if (!ctx) return
    // Si el reloj quedó atrás (pestaña dormida), se retoma desde ahora en vez de tocar todo de golpe
    if (nextTime < ctx.currentTime) nextTime = ctx.currentTime + 0.05
    while (nextTime < ctx.currentTime + LOOKAHEAD) {
      scheduleStep(nextTime, step)
      nextTime += STEP
      step = (step + 1) % (STEPS_PER_CHORD * CHORDS.length)
    }
  }
  schedule()
  musicTimer = setInterval(schedule, 250)
}

function stopMusic() {
  if (musicTimer) clearInterval(musicTimer)
  musicTimer = null
}
