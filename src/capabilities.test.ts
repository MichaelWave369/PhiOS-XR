import { describe, expect, it } from 'vitest'
import { detectXRSupport } from './capabilities'
import { getPortal, portals } from './catalog'

describe('WebXR capability detection', () => {
  it('degrades gracefully on desktop without WebXR', async () => {
    expect(await detectXRSupport()).toMatchObject({ vr: false, ar: false })
  })
  it('checks VR and AR separately', async () => {
    const xr = { isSessionSupported: async (mode: string) => mode === 'immersive-vr' } as XRSystem
    expect(await detectXRSupport(xr)).toMatchObject({ vr: true, ar: false })
  })
  it('treats permission or runtime errors as unsupported', async () => {
    const xr = { isSessionSupported: async () => { throw new Error('unavailable') } } as unknown as XRSystem
    expect(await detectXRSupport(xr)).toMatchObject({ vr: false, ar: false })
  })
})

describe('read-only portal catalog', () => {
  it('uses unique ids and secure external links', () => {
    expect(new Set(portals.map((portal) => portal.id)).size).toBe(portals.length)
    expect(portals.every((portal) => new URL(portal.href).protocol === 'https:')).toBe(true)
    expect(getPortal('atlas')?.name).toBe('FIELD ATLAS')
  })
})
