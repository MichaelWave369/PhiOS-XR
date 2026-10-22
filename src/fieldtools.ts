/** Unprivileged in-browser spatial tools. Nothing here connects to PhiOS Core. */
export const MAX_NOTE_CHARS = 240
const STORAGE_KEY = 'phios-xr:field-pad:v1'

export type PadKey = string
export type ClockState = { accumulatedMs: number; startedAt: number | null }

export function sanitizeNote(value: string): string {
  return value.replace(/\r\n?/g, '\n').replace(/[\x00-\x08\x0b-\x1f\x7f]/g, '').slice(0, MAX_NOTE_CHARS)
}

export function applyPadKey(value: string, key: PadKey): string {
  const current = sanitizeNote(value)
  if (key === 'DELETE') return current.slice(0, -1)
  if (key === 'CLEAR') return ''
  if (key === 'SPACE') return sanitizeNote(current + ' ')
  if (key === 'ENTER') return sanitizeNote(current + '\n')
  if (/^[A-Z0-9.!?,-]$/.test(key)) return sanitizeNote(current + key)
  return current
}

export function decodePad(value: unknown): string | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const record = value as Record<string, unknown>
  if (record.version !== 1 || typeof record.note !== 'string' || record.note.length > MAX_NOTE_CHARS) return null
  return sanitizeNote(record.note)
}

export function loadPad(): string {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? decodePad(JSON.parse(raw) as unknown) ?? '' : ''
  } catch { return '' }
}
export function savePad(note: string): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, note: sanitizeNote(note) })) }
  catch { /* Private browsing / quota / blocked storage: in-memory fallback. */ }
}

export function newClock(): ClockState { return { accumulatedMs: 0, startedAt: null } }

export function elapsedClock(state: ClockState, now: number): number {
  return Math.max(0, state.accumulatedMs + (state.startedAt === null ? 0 : Math.max(0, now - state.startedAt)))
}
export function startClock(state: ClockState, now: number): ClockState {
  if (state.startedAt !== null) return state
  return { ...state, startedAt: now }
}
export function pauseClock(state: ClockState, now: number): ClockState {
  if (state.startedAt === null) return state
  return { accumulatedMs: elapsedClock(state, now), startedAt: null }
}
export function formatClock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  const pad = (x: number) => String(x).padStart(2, '0')
  return hours ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`
}
