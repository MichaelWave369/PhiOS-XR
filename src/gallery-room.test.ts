import { describe, expect, it } from 'vitest'
import * as THREE from 'three'
import { createGalleryRoom, GALLERY_EXHIBIT_COUNT } from './gallery-room'
import { resolveGalleryRoomExhibits } from './gallery-room-model'

describe('Phi Hearth gallery-room world', () => {
  it('builds six stable, correctly oriented picture meshes with no navigation inputs', () => {
    const room = new THREE.Group()
    createGalleryRoom(room)
    expect(room.name).toBe('Phi Hearth private gallery')
    expect(room.getObjectByName('gallery-floor')).toBeDefined()
    expect(room.getObjectByName('gallery-back-wall')).toBeDefined()
    const allFrames = Array.from({ length: GALLERY_EXHIBIT_COUNT }, (_, i) =>
      room.getObjectByName('gallery-exhibit-painting-' + i))
    expect(allFrames.every((object) => object instanceof THREE.Mesh)).toBe(true)
    expect(room.getObjectByName('gallery-exhibit-group-2')?.rotation.y).toBeCloseTo(Math.PI / 2)
    expect(room.getObjectByName('gallery-exhibit-group-4')?.rotation.y).toBeCloseTo(-Math.PI / 2)
    const meshes: THREE.Mesh[] = []
    room.traverse((object) => { if (object instanceof THREE.Mesh) meshes.push(object) })
    expect(meshes.length).toBeLessThan(45)
    expect(meshes.every((mesh) => !mesh.userData.action && !mesh.userData.portalId)).toBe(true)
  })
  it('shows all six personal imports, moving the selected one to the first exhibit', () => {
    const ids = ['a', 'b', 'c', 'd', 'e', 'f']
    expect(resolveGalleryRoomExhibits('golden-spiral', 'c', ids)).toEqual(
      ['c', 'a', 'b', 'd', 'e', 'f'].map((id) => ({ kind: 'personal', id })),
    )
  })
  it('supports zero imports, a legacy import, and stale selections', () => {
    const empty = resolveGalleryRoomExhibits('living-bloom', null, [])
    expect(empty).toHaveLength(GALLERY_EXHIBIT_COUNT)
    expect(empty[0]).toEqual({ kind: 'curated', artwork: 'living-bloom' })
    const legacy = resolveGalleryRoomExhibits('golden-spiral', 'legacy', ['legacy'])
    expect(legacy[0]).toEqual({ kind: 'personal', id: 'legacy' })
    expect(legacy.some((item) => item.kind === 'curated')).toBe(true)
    const stale = resolveGalleryRoomExhibits('field-stars', 'missing', ['legacy'])
    expect(stale[0]).toEqual({ kind: 'curated', artwork: 'field-stars' })
    expect(stale[1]).toEqual({ kind: 'personal', id: 'legacy' })
  })
})
