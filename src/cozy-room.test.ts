import { describe, expect, it } from 'vitest'
import * as THREE from 'three'
import { applyCozyRoomMood, createCozyRoom } from './cozy-room'

describe('Phi Hearth local room', () => {
  it('builds a comfortable static room with no remote assets or XR input hooks', () => {
    const room = new THREE.Group()
    createCozyRoom(room)
    expect(room.name).toBe('The Phi Hearth')
    for (const name of ['wood-floor', 'sofa-base', 'coffee-table-top', 'rug-center', 'window-sky', 'fireplace-opening', 'reading-lamp-shade', 'plant-pot', 'hearth-gallery-frame', 'hearth-gallery-painting', 'hearth-gallery-left-frame', 'hearth-gallery-painting-left', 'hearth-gallery-painting-right']) {
      expect(room.getObjectByName(name)).toBeDefined()
    }
    const meshes: THREE.Mesh[] = []
    room.traverse((object) => {
      if (object instanceof THREE.Mesh) meshes.push(object)
    })
    expect(meshes.length).toBeLessThan(125)
    expect(room.children.some((object) => object instanceof THREE.Light)).toBe(true)
    for (const mesh of meshes) {
      expect(mesh.geometry).toBeDefined()
      expect(mesh.position.toArray().every(Number.isFinite)).toBe(true)
    }
  })
  it('changes light, window and sun/moon styling without rebuilding the room', () => {
    const room = new THREE.Group()
    createCozyRoom(room)
    const light = room.getObjectByName('hearth-light')
    const moon = room.getObjectByName('window-moon')
    const geometry = room.getObjectByName('sofa-base')
    expect(light).toBeInstanceOf(THREE.PointLight)
    applyCozyRoomMood(room, 'morning')
    expect((light as THREE.PointLight).intensity).toBe(4)
    expect(moon?.visible).toBe(false)
    applyCozyRoomMood(room, 'twilight')
    expect((light as THREE.PointLight).intensity).toBe(12)
    expect(moon?.visible).toBe(true)
    expect(room.getObjectByName('sofa-base')).toBe(geometry)
  })
})
