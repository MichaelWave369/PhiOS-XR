export type ImmersiveMode = 'immersive-vr' | 'immersive-ar'
export type XRAvailability = { vr: boolean; ar: boolean; reason?: string }
export type XRProbe = Pick<XRSystem, 'isSessionSupported'>

export async function detectXRSupport(xr?: XRProbe): Promise<XRAvailability> {
  if (!xr || typeof xr.isSessionSupported !== 'function') {
    return { vr: false, ar: false, reason: 'WebXR unavailable. Desktop preview remains active.' }
  }
  const check = async (mode: ImmersiveMode) => {
    try { return await xr.isSessionSupported(mode) } catch { return false }
  }
  const [vr, ar] = await Promise.all([check('immersive-vr'), check('immersive-ar')])
  return { vr, ar, reason: !vr && !ar ? 'No immersive WebXR mode available in this browser.' : undefined }
}
