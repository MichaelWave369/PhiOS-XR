/**
 * Bounded, opt-in WebXR render callback cadence sampling.
 * Frame intervals are NOT GPU execution durations and do NOT certify headset Hz.
 */
export type XRFrameReport = {
  schema: 'phios.gpu-observation.v1'
  source: 'webxr-render-callback'
  authority: 'observe-only'
  status: 'observed' | 'unavailable'
  sample_count: number
  median_interval_ms: number | null
  p95_interval_ms: number | null
  limitations: string[]
}

const LIMITATIONS = [
  'Callback intervals are not GPU time, compositor frame times, or guaranteed display refresh.',
  'CPU, GPU, reprojection, browser throttling and headset runtime may all affect cadence.',
]

export function createXRFrameObserver(capacity = 240) {
  const cap = Number.isSafeInteger(capacity) && capacity > 0 ? Math.min(capacity, 240) : 240
  const samples: number[] = []
  let enabled = false
  let previous: number | null = null

  function setEnabled(value: boolean) {
    if (value && !enabled) samples.length = 0
    enabled = value
    previous = null
  }

  function sample(timestamp: number, immersive: boolean) {
    if (!enabled || !immersive || !Number.isFinite(timestamp)) {
      previous = null
      return
    }
    if (previous !== null && samples.length < cap) {
      const interval = timestamp - previous
      if (Number.isFinite(interval) && interval > 0 && interval < 250) samples.push(interval)
    }
    previous = timestamp
  }

  function report(): XRFrameReport {
    if (!samples.length) {
      return { schema: 'phios.gpu-observation.v1', source: 'webxr-render-callback',
        authority: 'observe-only', status: 'unavailable', sample_count: 0,
        median_interval_ms: null, p95_interval_ms: null, limitations: LIMITATIONS }
    }
    const sorted = [...samples].sort((a, b) => a - b)
    const percentile = (p: number) => {
      const position = (sorted.length - 1) * p
      const low = Math.floor(position)
      const high = Math.ceil(position)
      return sorted[low] + (sorted[high] - sorted[low]) * (position - low)
    }
    return { schema: 'phios.gpu-observation.v1', source: 'webxr-render-callback',
      authority: 'observe-only', status: 'observed', sample_count: samples.length,
      median_interval_ms: Number(percentile(0.5).toFixed(2)),
      p95_interval_ms: Number(percentile(0.95).toFixed(2)), limitations: LIMITATIONS }
  }

  return { setEnabled, sample, report }
}
