import type { ImmersiveMode, XRAvailability } from './capabilities'

// All physical-device outcomes are explicitly entered by the tester. Capability
// detection is useful context, never proof that tracking/passthrough works.
export const QUEST_CHECKS = [
  { id: 'Q01', action: 'Open this HTTPS page', expected: '2D preview loads; portal controls respond' },
  { id: 'Q02', action: 'Inspect VR and MR buttons', expected: 'Unsupported modes are disabled without claiming qualification' },
  { id: 'Q03', action: 'Enter VR', expected: 'Stereo shell and spatial panels appear comfortably in front' },
  { id: 'Q04', action: 'Aim a controller at a portal', expected: 'Laser, reticle and hover feedback appear' },
  { id: 'Q05', action: 'Select a portal', expected: 'Inspector updates to the selected portal' },
  { id: 'Q06', action: 'Use in-headset RE-CENTER', expected: 'Workspace moves to current head position and remains stable' },
  { id: 'Q07', action: 'Use in-headset EXIT XR', expected: 'Session ends and 2D controls still work' },
  { id: 'Q08', action: 'Enter MR, if supported', expected: 'Browser passthrough compositor shows room behind panels' },
  { id: 'Q09', action: 'Use controller in MR', expected: 'Targeting and activation work as in VR' },
  { id: 'Q10', action: 'Test hand-select/pinch', expected: 'Actual tracked hand input activates controls' },
  { id: 'Q11', action: 'Deny a headset permission', expected: 'Clear failure and working desktop fallback, no crash' },
  { id: 'Q12', action: 'Repeat enter/exit ten times', expected: 'No stuck session, missing panels or accumulating errors' },
  { id: 'Q13', action: 'Recenter seated and standing', expected: 'Panels track head height and heading, inside safe boundary' },
  { id: 'Q14', action: 'Observe comfort and performance', expected: 'Record stutter, thermal issues or eye strain in notes' },
  { id: 'Q15', action: 'Open an external portal after exit', expected: 'Normal browser link opens; no privileged app execution' },
] as const

export type QuestCheckId = (typeof QUEST_CHECKS)[number]['id']
export type QuestStatus = 'NOT_TESTED' | 'PASS' | 'FAIL' | 'BLOCKED'
export type QuestEvent = {
  type: 'start' | 'end' | 'error'
  at: string
  mode: ImmersiveMode | null
  detail?: string
}
export type QuestReport = {
  version: 1
  deviceModel: string
  firmware: string
  browserVersion: string
  notes: string
  checks: Record<QuestCheckId, QuestStatus>
  events: QuestEvent[]
}
export type QuestContext = {
  secureContext: boolean
  webXRExposed: boolean
  support: XRAvailability | null
  appRevision: string
}
const STATUSES: readonly QuestStatus[] = ['NOT_TESTED', 'PASS', 'FAIL', 'BLOCKED']
const EVENT_TYPES: readonly QuestEvent['type'][] = ['start', 'end', 'error']
const MAX_EVENTS = 40
export const QUEST_STORAGE_KEY = 'phios-xr-quest-lab-v1'
const text = (value: unknown, max: number) => typeof value === 'string' ? value.slice(0, max) : ''

export function createQuestReport(): QuestReport {
  const checks = Object.fromEntries(QUEST_CHECKS.map((item) => [item.id, 'NOT_TESTED'])) as Record<QuestCheckId, QuestStatus>
  return { version: 1, deviceModel: '', firmware: '', browserVersion: '', notes: '', checks, events: [] }
}

export function decodeQuestReport(value: unknown): QuestReport | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const input = value as Record<string, unknown>
  if (input.version !== 1 || !input.checks || typeof input.checks !== 'object' || Array.isArray(input.checks)) return null
  const values = input.checks as Record<string, unknown>
  const report = createQuestReport()
  for (const check of QUEST_CHECKS) {
    const status = values[check.id]
    report.checks[check.id] = STATUSES.includes(status as QuestStatus) ? status as QuestStatus : 'NOT_TESTED'
  }
  report.deviceModel = text(input.deviceModel, 80)
  report.firmware = text(input.firmware, 80)
  report.browserVersion = text(input.browserVersion, 80)
  report.notes = text(input.notes, 1600)
  if (Array.isArray(input.events)) {
    report.events = input.events.filter((entry): entry is QuestEvent => {
      if (!entry || typeof entry !== 'object') return false
      const event = entry as Record<string, unknown>
      return EVENT_TYPES.includes(event.type as QuestEvent['type']) &&
        typeof event.at === 'string' && event.at.length <= 48 &&
        (event.mode === null || event.mode === 'immersive-vr' || event.mode === 'immersive-ar') &&
        (event.detail === undefined || (typeof event.detail === 'string' && event.detail.length <= 200))
    }).slice(-MAX_EVENTS)
  }
  return report
}

export function recordQuestEvent(
  report: QuestReport, type: QuestEvent['type'], mode: ImmersiveMode | null,
  at: string, detail?: string,
): QuestReport {
  const entry: QuestEvent = { type, mode, at: at.slice(0, 48) }
  if (detail) entry.detail = detail.slice(0, 200)
  return { ...report, events: [...report.events, entry].slice(-MAX_EVENTS) }
}

export function questCounts(report: QuestReport): Record<QuestStatus, number> {
  const counts: Record<QuestStatus, number> = { NOT_TESTED: 0, PASS: 0, FAIL: 0, BLOCKED: 0 }
  for (const check of QUEST_CHECKS) counts[report.checks[check.id]]++
  return counts
}

export function buildQuestExport(report: QuestReport, context: QuestContext, generatedAt: string) {
  return {
    schema: 'phios-xr.quest-acceptance.v1',
    generatedAt,
    scope: 'Self-reported hardware observations; browser feature flags do not certify device support.',
    context,
    report,
  }
}
