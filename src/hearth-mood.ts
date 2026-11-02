/** Local-only, bounded visual personalization for the Phi Hearth. */
export const HEARTH_MOODS = ['fireside', 'twilight', 'morning'] as const
export type HearthMood = typeof HEARTH_MOODS[number]
export const HEARTH_MOOD_KEY = 'phios-xr-hearth-mood-v1'
export const HEARTH_DEFAULT_MOOD: HearthMood = 'fireside'
export const HEARTH_MOOD_STYLES = {
  fireside: {
    label: 'Fireside',
    description: 'Soft amber light and a glowing hearth.',
    background: '#201d20',
    ambientSky: '#e4c49a',
    ambientGround: '#283844',
    ambientIntensity: 2.1,
    fireIntensity: 23,
    readingIntensity: 11,
    windowSky: '#111f34',
    moonVisible: true,
  },
  twilight: {
    label: 'Twilight',
    description: 'Cool evening shadows and moonlight.',
    background: '#141e2b',
    ambientSky: '#9fbbdd',
    ambientGround: '#202b3a',
    ambientIntensity: 1.55,
    fireIntensity: 12,
    readingIntensity: 7,
    windowSky: '#132749',
    moonVisible: true,
  },
  morning: {
    label: 'Morning',
    description: 'Bright, gentle daylight from the window.',
    background: '#53636a',
    ambientSky: '#fce8c6',
    ambientGround: '#647c76',
    ambientIntensity: 2.7,
    fireIntensity: 4,
    readingIntensity: 3,
    windowSky: '#a5c8d6',
    moonVisible: false,
  },
} as const satisfies Record<HearthMood, {
  label: string
  description: string
  background: string
  ambientSky: string
  ambientGround: string
  ambientIntensity: number
  fireIntensity: number
  readingIntensity: number
  windowSky: string
  moonVisible: boolean
}>

/** Untrusted saved strings never become arbitrary colors, URLs or shader code. */
export function isHearthMood(value: unknown): value is HearthMood {
  return typeof value === 'string' && HEARTH_MOODS.some((mood) => mood === value)
}

export type MoodStore = Pick<Storage, 'getItem' | 'setItem'>

/** Returns the default when storage is unavailable, invalid or denied. */
export function readHearthMood(store: Pick<MoodStore, 'getItem'> | null): HearthMood {
  if (!store) return HEARTH_DEFAULT_MOOD
  try {
    const stored: unknown = store.getItem(HEARTH_MOOD_KEY)
    return isHearthMood(stored) ? stored : HEARTH_DEFAULT_MOOD
  } catch {
    return HEARTH_DEFAULT_MOOD
  }
}

/** A blocked write never breaks XR input or room rendering. */
export function writeHearthMood(store: Pick<MoodStore, 'setItem'> | null, mood: HearthMood): boolean {
  if (!store) return false
  try {
    store.setItem(HEARTH_MOOD_KEY, mood)
    return true
  } catch {
    return false
  }
}

export function nextHearthMood(current: HearthMood): HearthMood {
  const index = HEARTH_MOODS.indexOf(current)
  return HEARTH_MOODS[(index + 1) % HEARTH_MOODS.length]
}
