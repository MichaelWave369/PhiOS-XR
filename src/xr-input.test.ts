import { describe, expect, it } from 'vitest'
import { emptyDiagnostics, GAZE_DWELL_MS, nextGaze, safeGazeTarget } from './xr-input'

describe('Quest WebXR input rescue', () => {
  it('never treats diagnostics as passed hardware acceptance', () => {
    expect(emptyDiagnostics()).toEqual({
      sourceCount: 0, connectedRays: 0, selectStarts: 0, selects: 0,
      lastEvent: 'WAITING', gazeAssist: true,
    })
  })
  it('requires continuous gaze and fires once until the target changes', () => {
    const first = nextGaze({ target: null, since: 0, fired: false }, 'portal:atlas', 100)
    expect(first.activate).toBeNull()
    expect(nextGaze(first.state, 'portal:atlas', 100 + GAZE_DWELL_MS - 1).activate).toBeNull()
    const fired = nextGaze(first.state, 'portal:atlas', 100 + GAZE_DWELL_MS)
    expect(fired.activate).toBe('portal:atlas')
    expect(nextGaze(fired.state, 'portal:atlas', 100 + GAZE_DWELL_MS * 2).activate).toBeNull()
    const moved = nextGaze(fired.state, 'portal:vessel', 100 + GAZE_DWELL_MS * 3)
    expect(moved.progress).toBe(0)
    expect(nextGaze(moved.state, null, 0).state.target).toBeNull()
  })
  it('resets on time reversal or invalid inputs', () => {
    const state = { target: 'portal:atlas', since: 100, fired: false }
    expect(nextGaze(state, 'portal:atlas', 99).activate).toBeNull()
    expect(nextGaze(state, 'portal:atlas', NaN).progress).toBe(0)
  })
  it('restricts gaze activation to read-only portals and safe controls', () => {
    expect(safeGazeTarget('atlas')).toBe('portal:atlas')
    expect(safeGazeTarget(undefined, 'tools')).toBe('action:tools')
    expect(safeGazeTarget(undefined, 'wall')).toBe('action:wall')
    expect(safeGazeTarget(undefined, 'exit')).toBeNull()
    expect(safeGazeTarget(undefined, 'reset')).toBeNull()
    expect(safeGazeTarget(undefined, 'recenter')).toBeNull()
    expect(safeGazeTarget(undefined, 'unknown')).toBeNull()
  })
})
