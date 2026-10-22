import { portals } from './catalog'

export type LayoutPreset = 'arc' | 'wall'
export type Point3 = { x: number; y: number; z: number }
export type PanelState = { id: string; position: Point3; scale: number }
export type WorkspaceSnapshot = { version: 1; preset: LayoutPreset; panels: PanelState[] }
const KEY = 'phios-xr:workspace:v1'
export const MIN_SCALE = 0.75
export const MAX_SCALE = 1.8

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value))

export function clampPanelSize(size: number): number {
  return Number.isFinite(size) ? clamp(size, MIN_SCALE, MAX_SCALE) : 1
}

/** Stay within a recoverable volume ahead of the viewer. */
export function clampPosition(position: Point3): Point3 {
  return {
    x: clamp(position.x, -3.2, 3.2),
    y: clamp(position.y, 0.6, 3.1),
    z: clamp(position.z, -4.8, -0.85),
  }
}

export function presetPanels(preset: LayoutPreset): PanelState[] {
  return portals.map((portal, index) => {
    const column = index % 3
    const row = Math.floor(index / 3)
    const theta = (column - 1) * 0.52
    const distance = 2.54
    return {
      id: portal.id,
      position: preset === 'arc'
        ? { x: Math.sin(theta) * distance, y: row === 0 ? 1.96 : 1.02, z: -Math.cos(theta) * distance }
        : { x: (column - 1) * 1.39, y: row === 0 ? 1.99 : 1.02, z: -2.65 },
      scale: 1,
    }
  })
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
function validPosition(position: unknown): position is Point3 {
  return isRecord(position) && ['x', 'y', 'z'].every((axis) =>
    typeof position[axis] === 'number' && Number.isFinite(position[axis]))
}
export function decodeWorkspace(value: unknown): WorkspaceSnapshot | null {
  if (!isRecord(value) || value.version !== 1 || (value.preset !== 'arc' && value.preset !== 'wall')) return null
  if (!Array.isArray(value.panels) || value.panels.length !== portals.length) return null
  const map = new Map<string, PanelState>()
  for (const raw of value.panels) {
    if (!isRecord(raw) || typeof raw.id !== 'string' ||
      !portals.some((portal) => portal.id === raw.id) || map.has(raw.id) ||
      !validPosition(raw.position) || typeof raw.scale !== 'number' || !Number.isFinite(raw.scale)) return null
    map.set(raw.id, {
      id: raw.id,
      position: clampPosition(raw.position),
      scale: clampPanelSize(raw.scale),
    })
  }
  return { version: 1, preset: value.preset, panels: portals.map((portal) => map.get(portal.id)!) }
}
export function loadWorkspace(): WorkspaceSnapshot | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? decodeWorkspace(JSON.parse(raw) as unknown) : null
  } catch {
    return null
  }
}
export function saveWorkspace(snapshot: WorkspaceSnapshot): void {
  try {
    const clean = decodeWorkspace(snapshot)
    if (clean) localStorage.setItem(KEY, JSON.stringify(clean))
  } catch {
    // Browser storage may be blocked or full. Layout still works in memory.
  }
}
export function clearWorkspace(): void {
  try { localStorage.removeItem(KEY) } catch { /* safe fallback */ }
}
