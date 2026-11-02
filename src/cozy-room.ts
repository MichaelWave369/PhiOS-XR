import * as THREE from 'three'

/**
 * The Φ Hearth is an entirely local, low-motion living room around the XR shelf.
 * Decorative meshes never receive input or authority. The calling shell hides
 * this group for immersive AR so passthrough remains unobstructed.
 */
export function createCozyRoom(group: THREE.Group): void {
  group.name = 'The Phi Hearth'
  const fabric = new THREE.MeshLambertMaterial({ color: '#53736c' })
  const fabricDark = new THREE.MeshLambertMaterial({ color: '#344e4b' })
  const pillow = new THREE.MeshLambertMaterial({ color: '#b98c5c' })
  const wood = new THREE.MeshLambertMaterial({ color: '#71503a' })
  const woodLight = new THREE.MeshLambertMaterial({ color: '#9b724e' })
  const wall = new THREE.MeshLambertMaterial({ color: '#394347' })
  const trim = new THREE.MeshLambertMaterial({ color: '#9c7951' })
  const dark = new THREE.MeshLambertMaterial({ color: '#252c32' })
  const rug = new THREE.MeshLambertMaterial({ color: '#745a52' })
  const rugEdge = new THREE.MeshLambertMaterial({ color: '#bd9c78' })
  const leaf = new THREE.MeshLambertMaterial({ color: '#446b4b', side: THREE.DoubleSide })
  const sky = new THREE.MeshBasicMaterial({ color: '#111f34' })
  const moon = new THREE.MeshBasicMaterial({ color: '#f6d9aa' })
  const flame = new THREE.MeshBasicMaterial({ color: '#f9a75b' })
  const glow = new THREE.MeshBasicMaterial({ color: '#e4b985' })

  const box = (
    name: string, width: number, height: number, depth: number,
    x: number, y: number, z: number, material: THREE.Material,
  ) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material)
    mesh.name = name
    mesh.position.set(x, y, z)
    group.add(mesh)
    return mesh
  }
  const disc = (name: string, radius: number, x: number, y: number, z: number, material: THREE.Material) => {
    const mesh = new THREE.Mesh(new THREE.CircleGeometry(radius, 20), material)
    mesh.name = name
    mesh.position.set(x, y, z)
    group.add(mesh)
    return mesh
  }

  group.add(new THREE.HemisphereLight('#e4c49a', '#283844', 2.1))
  const hearthLight = new THREE.PointLight('#ffb579', 23, 7.5, 2)
  hearthLight.position.set(3.1, 1.1, -5.8)
  group.add(hearthLight)
  const readingLight = new THREE.PointLight('#f4dcb4', 11, 5.5, 2)
  readingLight.position.set(-3.4, 2.6, -3.5)
  group.add(readingLight)

  // An enclosed room with a clear standing/seated origin and no animated motion.
  box('wood-floor', 10.4, 0.18, 10.5, 0, -0.17, -2.0, wood)
  for (let i = 0; i < 15; i++) {
    box('floor-board-' + i, 0.65, 0.012, 10.3, -4.63 + i * 0.66, -0.072, -2, i % 3 ? wood : woodLight)
  }
  box('back-wall', 10.4, 4.1, 0.19, 0, 1.89, -7.15, wall)
  box('left-wall', 0.18, 4.1, 10.5, -5.18, 1.89, -2, wall)
  box('right-wall', 0.18, 4.1, 10.5, 5.18, 1.89, -2, wall)
  box('ceiling', 10.4, 0.12, 10.5, 0, 3.99, -2, dark)
  box('back-baseboard', 10.2, 0.17, 0.12, 0, 0.07, -7.0, trim)

  // A quiet dusk window, made from shapes rather than fetched textures.
  box('window-sky', 3.25, 2.12, 0.025, -2.58, 2.35, -7.02, sky)
  disc('window-moon', 0.28, -1.92, 2.87, -6.98, moon)
  for (let i = 0; i < 9; i++) {
    disc('window-star-' + i, 0.018 + (i % 2) * 0.008,
      -3.95 + (i * 0.73) % 2.68, 1.61 + (i * 0.37) % 1.37, -6.975, moon)
  }
  box('window-left-frame', 0.1, 2.34, 0.12, -4.26, 2.35, -6.94, trim)
  box('window-right-frame', 0.1, 2.34, 0.12, -0.9, 2.35, -6.94, trim)
  box('window-top-frame', 3.44, 0.1, 0.12, -2.58, 3.52, -6.94, trim)
  box('window-bottom-frame', 3.44, 0.11, 0.12, -2.58, 1.19, -6.94, trim)
  box('window-mullion', 0.07, 2.15, 0.1, -2.58, 2.35, -6.9, trim)

  // The sofa and lounge tables are beyond the XR cards, not on the play boundary.
  box('sofa-base', 2.75, 0.44, 1.15, 0.1, 0.48, -5.75, fabricDark)
  box('sofa-back', 2.75, 0.92, 0.34, 0.1, 1.04, -6.25, fabric)
  box('sofa-left-arm', 0.34, 0.73, 1.22, -1.35, 0.78, -5.75, fabric)
  box('sofa-right-arm', 0.34, 0.73, 1.22, 1.55, 0.78, -5.75, fabric)
  box('sofa-left-cushion', 1.13, 0.18, 0.92, -0.58, 0.78, -5.68, fabric)
  box('sofa-right-cushion', 1.13, 0.18, 0.92, 0.78, 0.78, -5.68, fabric)
  box('sofa-pillow-left', 0.47, 0.49, 0.18, -0.88, 1.09, -5.99, pillow)
  box('sofa-pillow-right', 0.44, 0.43, 0.18, 1.05, 1.03, -5.98, pillow)
  box('rug-edge', 3.8, 0.025, 2.35, 0.05, -0.047, -3.65, rugEdge)
  box('rug-center', 3.54, 0.028, 2.09, 0.05, -0.026, -3.65, rug)
  box('coffee-table-top', 1.75, 0.12, 0.75, 0.05, 0.43, -4.08, woodLight)
  for (const x of [-0.7, 0.8]) for (const z of [-4.32, -3.85]) {
    box('coffee-table-leg', 0.1, 0.43, 0.1, x, 0.18, z, wood)
  }
  box('book-on-table', 0.38, 0.055, 0.29, -0.24, 0.52, -4.02, fabricDark)

  // A stationary stylized fireplace: glowing coals, never flashing particles.
  box('fireplace-mantel', 2.22, 0.19, 0.57, 3.32, 1.74, -6.62, woodLight)
  box('fireplace-left', 0.36, 1.62, 0.45, 2.33, 0.91, -6.72, trim)
  box('fireplace-right', 0.36, 1.62, 0.45, 4.31, 0.91, -6.72, trim)
  box('fireplace-opening', 1.54, 1.13, 0.03, 3.32, 0.76, -6.63, dark)
  for (let i = 0; i < 5; i++) {
    const ember = box('hearth-ember-' + i, 0.11, 0.27 + (i % 3) * 0.1, 0.05,
      2.88 + i * 0.22, 0.45 + (i % 3) * 0.04, -6.57, flame)
    ember.rotation.z = (i - 2) * 0.22
  }
  box('mantel-picture', 0.92, 0.62, 0.08, 3.32, 2.43, -6.98, wood)
  box('mantel-picture-art', 0.77, 0.47, 0.09, 3.32, 2.43, -6.925, fabricDark)

  // Reading corner, shelves, and plant provide a lived-in silhouette.
  box('bookcase-back', 1.16, 2.62, 0.35, -4.38, 1.36, -5.38, wood)
  for (let i = 0; i < 4; i++) {
    box('bookshelf-' + i, 1.28, 0.1, 0.47, -4.38, 0.36 + i * 0.68, -5.16, woodLight)
  }
  for (let i = 0; i < 12; i++) {
    box('book-spine-' + i, 0.09, 0.35 + (i % 3) * 0.06, 0.24,
      -4.85 + (i % 6) * 0.18, 0.63 + Math.floor(i / 6) * 0.68, -5.06,
      i % 2 ? fabricDark : pillow)
  }
  box('reading-lamp-stand', 0.09, 1.64, 0.09, -3.55, 0.8, -3.45, trim)
  box('reading-lamp-shade', 0.56, 0.4, 0.52, -3.55, 1.74, -3.45, glow)
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.2, 0.5, 10), woodLight)
  pot.name = 'plant-pot'
  pot.position.set(4.08, 0.19, -3.4)
  group.add(pot)
  box('plant-stem', 0.065, 1.15, 0.065, 4.08, 0.91, -3.4, wood)
  for (let i = 0; i < 6; i++) {
    const frond = box('plant-leaf-' + i, 0.12, 0.7, 0.37,
      4.08 + Math.sin(i * Math.PI / 3) * 0.29, 1.22 + (i % 2) * 0.2,
      -3.4 + Math.cos(i * Math.PI / 3) * 0.29, leaf)
    frond.rotation.z = Math.sin(i * Math.PI / 3) * 0.62
    frond.rotation.x = Math.cos(i * Math.PI / 3) * 0.56
  }
}
