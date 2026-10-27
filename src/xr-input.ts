/**
 * Physical headset input diagnostics and deliberately limited gaze assistance.
 * Browser-reported input sources/events are observations, NOT device certification.
 * Gaze may select local portals and harmless layout/mode controls only.
 */
export type XRInputDiagnostics = {
  sourceCount: number
  connectedRays: number
  selectStarts: number
  selects: number
  lastEvent: string
  gazeAssist: boolean
}
export type GazeState = { target: string | null; since: number; fired: boolean }
export const GAZE_DWELL_MS = 2300

const SAFE_ACTIONS = ['portals', 'worlds', 'tools', 'arc', 'wall'] as const
export type GazeAction = (typeof SAFE_ACTIONS)[number]

export function safeGazeTarget(portalId?: string, action?: string): string | null {
  if (portalId) return 'portal:' + portalId
  if (action && SAFE_ACTIONS.some((candidate) => candidate === action)) return 'action:' + action
  return null
}

export function nextGaze(
  state: GazeState, target: string | null, now: number, dwellMs = GAZE_DWELL_MS,
): { state: GazeState; progress: number; activate: string | null } {
  if (!target || !Number.isFinite(now)) {
    return { state: { target: null, since: 0, fired: false }, progress: 0, activate: null }
  }
  if (state.target !== target || now < state.since) {
    return { state: { target, since: now, fired: false }, progress: 0, activate: null }
  }
  const progress = Math.min(1, Math.max(0, (now - state.since) / Math.max(1, dwellMs)))
  const activate = !state.fired && progress >= 1 ? target : null
  return { state: { target, since: state.since, fired: state.fired || activate !== null }, progress, activate }
}

export function emptyDiagnostics(gazeAssist = true): XRInputDiagnostics {
  return { sourceCount: 0, connectedRays: 0, selectStarts: 0, selects: 0, lastEvent: 'WAITING', gazeAssist }
}
