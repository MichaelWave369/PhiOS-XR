import * as THREE from 'three'

export const GALLERY_EXHIBIT_COUNT = 6

/**
 * A second, static viewing environment with six framed pictures, built
 * entirely from local geometry. The camera is NEVER moved by switching rooms.
 */
export function createGalleryRoom(group: THREE.Group): void {
  group.name = 'Phi Hearth private gallery'
  const plaster = new THREE.MeshLambertMaterial({ color: '#394847' })
  const walnut = new THREE.MeshLambertMaterial({ color: '#805e44' })
  const trim = new THREE.MeshLambertMaterial({ color: '#c1a277' })
  const mat = new THREE.MeshLambertMaterial({ color: '#e5d4b4' })
  const dark = new THREE.MeshLambertMaterial({ color: '#273535' })
  function box(name: string, size: [number, number, number], pos: [number, number, number], material: THREE.Material) {
    const object = new THREE.Mesh(new THREE.BoxGeometry(...size), material)
    object.name = name
    object.position.set(...pos)
    group.add(object)
    return object
  }

  // Open entry zone behind the viewer. No automatic walking/collision.
  box('gallery-floor', [8.2, 0.14, 8.2], [0, -0.16, -1.35], walnut)
  box('gallery-back-wall', [8.2, 3.85, 0.16], [0, 1.86, -5.32], plaster)
  box('gallery-left-wall', [0.16, 3.85, 8.2], [-4.05, 1.86, -1.35], plaster)
  box('gallery-right-wall', [0.16, 3.85, 8.2], [4.05, 1.86, -1.35], plaster)
  box('gallery-ceiling', [8.2, 0.1, 8.2], [0, 3.83, -1.35], dark)
  box('gallery-back-plinth', [7.9, 0.12, 0.16], [0, 0.16, -5.2], trim)
  box('gallery-left-plinth', [0.14, 0.12, 7.9], [-3.92, 0.16, -1.3], trim)
  box('gallery-right-plinth', [0.14, 0.12, 7.9], [3.92, 0.16, -1.3], trim)

  const ambient = new THREE.HemisphereLight('#f3e2ca', '#394849', 2.0)
  ambient.name = 'gallery-ambient-light'
  group.add(ambient)
  const spot = new THREE.PointLight('#fff1d3', 16, 8, 2)
  spot.name = 'gallery-reading-light'
  spot.position.set(0, 3.15, -3.1)
  group.add(spot)

  // Center and both side walls, all artworks facing the viewing area.
  const spots: { pos: [number, number, number]; yaw: number }[] = [
    { pos: [-1.5, 2.06, -5.18], yaw: 0 },
    { pos: [1.5, 2.06, -5.18], yaw: 0 },
    { pos: [-3.89, 2.06, -1.55], yaw: Math.PI / 2 },
    { pos: [-3.89, 2.06, -3.67], yaw: Math.PI / 2 },
    { pos: [3.89, 2.06, -1.55], yaw: -Math.PI / 2 },
    { pos: [3.89, 2.06, -3.67], yaw: -Math.PI / 2 },
  ]
  spots.forEach(({ pos, yaw }, index) => {
    const frame = new THREE.Group()
    frame.name = 'gallery-exhibit-group-' + index
    frame.position.set(...pos)
    frame.rotation.y = yaw
    group.add(frame)
    const surround = new THREE.Mesh(new THREE.BoxGeometry(1.66, 1.27, 0.09), trim)
    surround.position.z = 0.02
    surround.name = 'gallery-exhibit-frame-' + index
    frame.add(surround)
    const border = new THREE.Mesh(new THREE.BoxGeometry(1.47, 1.08, 0.022), mat)
    border.position.z = 0.075
    frame.add(border)
    const picture = new THREE.Mesh(
      new THREE.PlaneGeometry(1.36, 0.98),
      new THREE.MeshBasicMaterial({ color: '#fff', side: THREE.DoubleSide }),
    )
    picture.name = 'gallery-exhibit-painting-' + index
    picture.position.z = 0.096
    frame.add(picture)
  })
}
