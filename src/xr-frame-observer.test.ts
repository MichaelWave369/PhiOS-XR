import { describe, expect, it } from 'vitest'
import { createXRFrameObserver } from './xr-frame-observer'

describe('opt-in bounded XR render cadence observation', () => {
  it('never invents results before opt-in or outside immersive mode', () => {
    const observer = createXRFrameObserver()
    observer.sample(10, true)
    observer.sample(20, true)
    expect(observer.report().status).toBe('unavailable')
    observer.setEnabled(true)
    observer.sample(10, false)
    observer.sample(20, false)
    expect(observer.report().sample_count).toBe(0)
  })

  it('reports callback cadence and does not label it GPU timing', () => {
    const observer = createXRFrameObserver()
    observer.setEnabled(true)
    for (const frame of [0, 10, 20, 31, 41]) observer.sample(frame, true)
    const report = observer.report()
    expect(report.status).toBe('observed')
    expect(report.sample_count).toBe(4)
    expect(report.median_interval_ms).toBe(10)
    expect(report.p95_interval_ms).toBeGreaterThan(10)
    expect(report.authority).toBe('observe-only')
    expect(report.limitations.join(' ')).toContain('not GPU time')
  })

  it('resets between capture sessions, rejects invalid deltas and caps samples', () => {
    const observer = createXRFrameObserver(2)
    observer.setEnabled(true)
    ;[0, 10, 20, 30, 40].forEach(t => observer.sample(t, true))
    expect(observer.report().sample_count).toBe(2)
    observer.setEnabled(false)
    observer.setEnabled(true)
    observer.sample(0, true)
    observer.sample(0, true)
    observer.sample(500, true)
    observer.sample(510, true)
    expect(observer.report().sample_count).toBe(1)
    observer.setEnabled(false)
    observer.sample(520, true)
    expect(observer.report().sample_count).toBe(1)
  })
})
