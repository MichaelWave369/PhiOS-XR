import * as THREE from 'three'

/**
 * Three original, procedural gallery studies. No remote images, uploads,
 * arbitrary URLs, render loops or PhiOS authority are involved.
 */
export const HEARTH_ARTWORKS = ['golden-spiral', 'field-stars', 'living-bloom'] as const
export type HearthArtwork = (typeof HEARTH_ARTWORKS)[number]
export const HEARTH_ART_KEY = 'phios-xr-hearth-artwork-v1'
export const HEARTH_DEFAULT_ARTWORK: HearthArtwork = 'golden-spiral'
export const HEARTH_ART_DETAILS: Record<HearthArtwork, { label: string; subtitle: string }> = {
  'golden-spiral': { label: 'Golden Spiral', subtitle: 'Proportion and possibility' },
  'field-stars': { label: 'Field Stars', subtitle: 'A sky of connected ideas' },
  'living-bloom': { label: 'Living Bloom', subtitle: 'Geometry and growth' },
}

export function isHearthArtwork(input: unknown): input is HearthArtwork {
  return typeof input === 'string' && HEARTH_ARTWORKS.some((id) => id === input)
}
export function readHearthArtwork(store: Pick<Storage, 'getItem'> | null): HearthArtwork {
  if (!store) return HEARTH_DEFAULT_ARTWORK
  try {
    const value: unknown = store.getItem(HEARTH_ART_KEY)
    return isHearthArtwork(value) ? value : HEARTH_DEFAULT_ARTWORK
  } catch {
    return HEARTH_DEFAULT_ARTWORK
  }
}
export function writeHearthArtwork(store: Pick<Storage, 'setItem'> | null, artwork: HearthArtwork): boolean {
  if (!store) return false
  try {
    store.setItem(HEARTH_ART_KEY, artwork)
    return true
  } catch {
    return false
  }
}
export function nextHearthArtwork(current: HearthArtwork): HearthArtwork {
  const currentIndex = HEARTH_ARTWORKS.indexOf(current)
  return HEARTH_ARTWORKS[(currentIndex + 1) % HEARTH_ARTWORKS.length]
}

/** Browser-only texture generation; safe to call on selection, never per frame. */
export function makeHearthArtTexture(art: HearthArtwork): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 768
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Gallery canvas unavailable')
  const background = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
  background.addColorStop(0, '#172a31')
  background.addColorStop(0.5, '#2c3c40')
  background.addColorStop(1, '#141f2a')
  ctx.fillStyle = background
  ctx.fillRect(0, 0, 768, 512)
  ctx.save()
  ctx.translate(384, 234)
  ctx.lineJoin = 'round'

  if (art === 'golden-spiral') {
    ctx.strokeStyle = '#dcaf75'
    ctx.lineWidth = 3
    for (let ring = 0; ring < 3; ring++) {
      const radius = 80 + ring * 55
      for (let j = 0; j < 6; j++) {
        const angle = j * Math.PI / 3
        ctx.beginPath()
        ctx.arc(Math.cos(angle) * radius * 0.52, Math.sin(angle) * radius * 0.52, radius * 0.53, 0, Math.PI * 2)
        ctx.stroke()
      }
    }
    ctx.strokeStyle = '#f8db99'
    ctx.lineWidth = 6
    ctx.beginPath()
    for (let i = 0; i < 600; i++) {
      const t = i / 599 * Math.PI * 4.7
      const r = Math.min(230, 7.3 * Math.exp(0.235 * t))
      const x = Math.cos(t) * r
      const y = Math.sin(t) * r
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
  } else if (art === 'field-stars') {
    const nodes = Array.from({ length: 18 }, (_, i) => {
      const angle = i * 2.399963
      const radius = 55 + (i % 6) * 30
      return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius }
    })
    ctx.lineWidth = 2.5
    ctx.strokeStyle = '#7fd4d4'
    for (let i = 0; i < nodes.length; i++) {
      for (const step of [3, 5]) {
        const a = nodes[i], b = nodes[(i + step) % nodes.length]
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.stroke()
      }
    }
    for (const [i, node] of nodes.entries()) {
      ctx.beginPath()
      ctx.arc(node.x, node.y, i % 4 === 0 ? 7 : 4, 0, Math.PI * 2)
      ctx.fillStyle = i % 3 === 0 ? '#f4d39b' : '#a8f2ec'
      ctx.fill()
    }
    ctx.strokeStyle = '#d6b980'
    ctx.lineWidth = 3
    for (const r of [58, 139, 225]) {
      ctx.beginPath()
      ctx.arc(0, 0, r, 0, 2 * Math.PI)
      ctx.stroke()
    }
  } else {
    ctx.strokeStyle = '#c9d6a0'
    ctx.lineWidth = 4
    const branch = (x: number, y: number, angle: number, length: number, depth: number): void => {
      if (depth <= 0) return
      const nx = x + Math.cos(angle) * length
      const ny = y + Math.sin(angle) * length
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(nx, ny)
      ctx.stroke()
      const previousWidth = ctx.lineWidth
      ctx.lineWidth = Math.max(1.3, depth * 0.8)
      branch(nx, ny, angle - 0.49, length * 0.72, depth - 1)
      branch(nx, ny, angle + 0.49, length * 0.72, depth - 1)
      ctx.lineWidth = previousWidth
    }
    branch(0, 175, -Math.PI / 2, 83, 6)
    ctx.strokeStyle = '#bc996e'
    ctx.lineWidth = 2
    for (let i = 0; i < 9; i++) {
      ctx.beginPath()
      ctx.arc(0, 0, 45 + i * 19, i * 0.17, Math.PI * 2 - i * 0.12)
      ctx.stroke()
    }
  }
  ctx.restore()
  ctx.strokeStyle = '#b59364'
  ctx.lineWidth = 14
  ctx.strokeRect(19, 19, 730, 474)
  ctx.strokeStyle = '#ecd4ac'
  ctx.lineWidth = 2
  ctx.strokeRect(29, 29, 710, 454)
  ctx.fillStyle = '#f4dfb9'
  ctx.font = '600 26px Georgia,serif'
  ctx.textAlign = 'center'
  ctx.fillText(HEARTH_ART_DETAILS[art].label.toUpperCase(), 384, 472)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

/** Swaps only the painting's texture; does not rebuild the room or change input. */
export function setHearthGalleryTexture(room: THREE.Group, next: THREE.Texture): void {
  const painting = room.getObjectByName('hearth-gallery-painting')
  if (!(painting instanceof THREE.Mesh) || !(painting.material instanceof THREE.MeshBasicMaterial)) {
    next.dispose()
    return
  }
  const previous = painting.material.map
  painting.material.map = next
  painting.material.needsUpdate = true
  previous?.dispose()
}
export function setHearthGalleryPersonalArt(room: THREE.Group, canvas: HTMLCanvasElement): void {
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  setHearthGalleryTexture(room, texture)
}
export function setHearthGalleryArt(room: THREE.Group, art: HearthArtwork): void {
  setHearthGalleryTexture(room, makeHearthArtTexture(art))
}
