import { describe, expect, it } from 'vitest'
import * as THREE from 'three'
import { createCozyRoom } from './cozy-room'

describe('Phi Hearth local room', () => {
  it('builds a comfortable static room with no remote assets or XR input hooks', () => {
    const room = new THREE.Group()
    createCozyRoom(room)
    expect(room.name).toBe('The Phi Hearth')
    for (const name of ['wood-floor', 'sofa-base', 'coffee-table-top', 'rug-center', 'window-sky', 'fireplace-opening', 'reading-lamp-shade', 'plant-pot']) {
      expect(room.getObjectByName(name)).toBeDefined()
    }
    const meshes: THREE.Mesh[] = []
    room.traverse((object) => {
      if (object instanceof THREE.Mesh) meshes.push(object)
    })
    expect(meshes.length).toBeLessThan(120)
    expect(room.children.some((object) => object instanceof THREE.Light)).toBe(true)
    for (const mesh of meshes) {
      expect(mesh.geometry).toBeDefined()
      expect(mesh.position.toArray().every(Number.isFinite)).toBe(true)
    }
  })
})
