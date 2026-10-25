import { describe, expect, it } from 'vitest'
import {
  QUEST_CHECKS, buildQuestExport, createQuestReport, decodeQuestReport,
  questCounts, recordQuestEvent,
} from './questlab'

describe('Quest Device Lab evidence', () => {
  it('starts with all physical tests not tested', () => {
    const report = createQuestReport()
    expect(QUEST_CHECKS).toHaveLength(15)
    expect(questCounts(report)).toEqual({ NOT_TESTED: 15, PASS: 0, FAIL: 0, BLOCKED: 0 })
  })
  it('does not turn browser capability flags into a physical pass', () => {
    const report = createQuestReport()
    const data = buildQuestExport(report, {
      secureContext: true, webXRExposed: true, support: { vr: true, ar: true }, appRevision: 'edition-05',
    }, '2026-10-25T20:00:00Z')
    expect(data.report.checks.Q03).toBe('NOT_TESTED')
    expect(data.context.support?.ar).toBe(true)
  })
  it('validates untrusted stored results and bounds free-text', () => {
    const input = createQuestReport()
    const decoded = decodeQuestReport({
      ...input, checks: { Q01: 'PASS', Q02: 'SUPER_PASS' },
      notes: 'x'.repeat(3000), deviceModel: 'Q'.repeat(1000),
      events: [{ type: 'error', at: 'now', mode: 'immersive-vr', detail: 'no headset' },
        { type: 'start', at: 'now', mode: 'unknown' }],
    })
    expect(decoded?.checks.Q01).toBe('PASS')
    expect(decoded?.checks.Q02).toBe('NOT_TESTED')
    expect(decoded?.notes).toHaveLength(1600)
    expect(decoded?.deviceModel).toHaveLength(80)
    expect(decoded?.events).toHaveLength(1)
    expect(decodeQuestReport({ version: 2, checks: {} })).toBeNull()
    expect(decodeQuestReport({ version: 1, checks: [] })).toBeNull()
  })
  it('records bounded session events without changing manually entered results', () => {
    let report = createQuestReport()
    report.checks.Q03 = 'FAIL'
    for (let i = 0; i < 55; i++) {
      report = recordQuestEvent(report, 'start', 'immersive-vr', '2026-10-25T20:00:00Z')
    }
    expect(report.events).toHaveLength(40)
    expect(report.checks.Q03).toBe('FAIL')
    expect(questCounts(report).FAIL).toBe(1)
  })
})
