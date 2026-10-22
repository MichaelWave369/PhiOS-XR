import * as THREE from 'three'
import { portals } from './catalog'
import type { ImmersiveMode } from './capabilities'

export type SpatialShell = {
  enter: (mode: ImmersiveMode) => Promise<void>
  select: (id: string) => void
  dispose: () => void
}

type ShellCallbacks = {
  onSelect: (id: string) => void
  onSession: (mode: ImmersiveMode | null) => void
}

/** Canvas textures make the same panels usable in desktop preview and inside the headset. */
function makeTexture(draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void) {
  const canvas = document.createElement('canvas')
  canvas.width = 960
  canvas.height = 600
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D canvas unavailable')
  draw(ctx, canvas.width, canvas.height)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

function rounded(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}

const ink = '#ebf8f8'
const mint = '#79ece0'
const gold = '#dabc82'

function portalTexture(index: number, selected: boolean) {
  const portal = portals[index]
  return makeTexture((ctx, w, h) => {
    const bg = ctx.createLinearGradient(0, 0, w, h)
    bg.addColorStop(0, selected ? '#163c48' : '#102838')
    bg.addColorStop(1, '#081221')
    rounded(ctx, 12, 12, w - 24, h - 24, 42)
    ctx.fillStyle = bg
    ctx.fill()
    ctx.lineWidth = selected ? 7 : 3
    ctx.strokeStyle = selected ? mint : '#3e7882'
    ctx.stroke()
    ctx.fillStyle = '#6f9aa4'
    ctx.font = '700 24px monospace'
    ctx.fillText('FIELD / PORTAL ' + portal.number, 64, 81)
    ctx.fillStyle = selected ? mint : gold
    ctx.textAlign = 'right'
    ctx.fillText(selected ? '● SELECTED' : '● READY', w - 66, 81)
    ctx.textAlign = 'left'
    ctx.fillStyle = mint
    ctx.font = 'bold 93px Georgia, serif'
    ctx.fillText('Φ', 61, 205)
    ctx.fillStyle = ink
    ctx.font = '700 54px system-ui'
    ctx.fillText(portal.name, 65, 306, w - 120)
    ctx.fillStyle = '#c1d9dc'
    ctx.font = '31px system-ui'
    ctx.fillText(portal.subtitle, 65, 370, w - 120)
    ctx.strokeStyle = '#31505d'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(65, 430)
    ctx.lineTo(w - 65, 430)
    ctx.stroke()
    ctx.font = '700 25px monospace'
    ctx.fillStyle = '#9bc5c7'
    ctx.fillText('SELECT WITH CONTROLLER / PINCH', 65, 505, w - 125)
  })
}

function headingTexture() {
  return makeTexture((ctx, w) => {
    ctx.textAlign = 'center'
    ctx.fillStyle = '#76dcd7'
    ctx.font = '600 36px monospace'
    ctx.fillText('SOVEREIGN · COHERENT · LOCAL · FREE', w / 2, 122)
    ctx.fillStyle = ink
    ctx.font = 'bold 120px Georgia, serif'
    ctx.fillText('Φ  PhiOS  XR', w / 2, 303)
    ctx.fillStyle = gold
    ctx.font = '32px monospace'
    ctx.fillText('THE SOVEREIGN SPATIAL SHELL   /   EDITION 01', w / 2, 390)
  })
}

function detailTexture(id: string) {
  const entry = portals.find((item) => item.id === id) ?? portals[0]
  return makeTexture((ctx, w) => {
    const bg = ctx.createLinearGradient(0, 0, w, 0)
    bg.addColorStop(0, '#09212b')
    bg.addColorStop(1, '#101b2a')
    rounded(ctx, 16, 42, w - 32, 480, 35)
    ctx.fillStyle = bg
    ctx.fill()
    ctx.strokeStyle = '#b79b68'
    ctx.lineWidth = 3
    ctx.stroke()
    ctx.fillStyle = gold
    ctx.font = '700 32px monospace'
    ctx.fillText('ACTIVE PORTAL / ' + entry.number, 64, 136)
    ctx.fillStyle = ink
    ctx.font = '700 56px system-ui'
    ctx.fillText(entry.name, 64, 229, w - 120)
    ctx.fillStyle = '#a7c8d1'
    ctx.font = '33px system-ui'
    ctx.fillText(entry.subtitle, 64, 300)
    ctx.fillStyle = '#65d9ce'
    ctx.font = '25px monospace'
    ctx.fillText('EXIT XR TO OPEN EXTERNAL SITE', 64, 405)
    ctx.fillStyle = '#698e97'
    ctx.font = '24px monospace'
    ctx.fillText('NO HOST CONTROL • READ-ONLY PREVIEW', 64, 461)
  })
}

function plane(texture: THREE.Texture, width: number, height: number) {
  return new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshBasicMaterial({
      map: texture, transparent: true, side: THREE.DoubleSide,
      depthWrite: false,
    }),
  )
}

export function createSpatialShell(host: HTMLElement, callbacks: ShellCallbacks): SpatialShell {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#060d19')
  const camera = new THREE.PerspectiveCamera(65, 1, 0.05, 100)
  camera.position.set(0, 1.62, 0.24)
  camera.lookAt(0, 1.45, -2.5)

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.xr.enabled = true
  renderer.xr.setReferenceSpaceType('local-floor')
  renderer.domElement.className = 'world-canvas'
  renderer.domElement.setAttribute('aria-label', 'Interactive PhiOS XR spatial preview')
  host.appendChild(renderer.domElement)

  const decor = new THREE.Group()
  scene.add(decor)
  const grid = new THREE.GridHelper(12, 28, '#1b5961', '#12303c')
  grid.position.y = -0.04
  decor.add(grid)

  const halo = new THREE.Group()
  halo.position.set(0, 1.44, -4.2)
  decor.add(halo)
  for (let i = 0; i < 4; i++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.85 + i * 0.22, i === 0 ? 0.013 : 0.003, 8, 144),
      new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? '#2b9d9a' : '#b59657', transparent: true, opacity: 0.38 - i * 0.05 }),
    )
    halo.add(ring)
  }

  const points: number[] = []
  for (let i = 0; i < 420; i++) {
    const a = i * 2.399963
    const r = 3.4 + (i % 29) * 0.22
    points.push(Math.cos(a) * r, 0.6 + Math.sin(i * 17.31) * 4.7, -2.5 + Math.sin(a) * r)
  }
  const starGeo = new THREE.BufferGeometry()
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))
  decor.add(new THREE.Points(starGeo, new THREE.PointsMaterial({
    color: '#5ea5ae', size: 0.025, sizeAttenuation: true,
    transparent: true, opacity: 0.65,
  })))

  const banner = plane(headingTexture(), 3.25, 1.12)
  banner.position.set(0, 2.63, -2.45)
  scene.add(banner)

  const cards: THREE.Mesh[] = []
  const cardTextures: THREE.Texture[] = []
  portals.forEach((portal, index) => {
    const col = index % 3
    const row = Math.floor(index / 3)
    const theta = (col - 1) * 0.52
    const distance = 2.54
    const texture = portalTexture(index, index === 0)
    cardTextures.push(texture)
    const card = plane(texture, 1.23, 0.79)
    card.position.set(Math.sin(theta) * distance, row === 0 ? 1.96 : 1.02, -Math.cos(theta) * distance)
    card.lookAt(0, 1.45, 0.15)
    card.userData.portalId = portal.id
    card.userData.baseScale = 1
    scene.add(card)
    cards.push(card)
  })

  const details = plane(detailTexture('phios'), 1.85, 0.9)
  details.position.set(0, 0.19, -2.7)
  details.rotation.x = -0.19
  scene.add(details)

  const lineMaterial = new THREE.LineBasicMaterial({ color: '#77e2d9', transparent: true, opacity: 0.85 })
  const raycaster = new THREE.Raycaster()
  const rotation = new THREE.Matrix4()
  const raycasterFrom = (object: THREE.Object3D) => {
    rotation.identity().extractRotation(object.matrixWorld)
    raycaster.ray.origin.setFromMatrixPosition(object.matrixWorld)
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(rotation)
  }
  const activate = (id: string) => {
    setSelected(id)
    callbacks.onSelect(id)
  }
  const controllers: THREE.Group[] = []
  for (let index = 0; index < 2; index++) {
    const controller = renderer.xr.getController(index)
    const beamPoints = [new THREE.Vector3(), new THREE.Vector3(0, 0, -1)]
    const beam = new THREE.Line(new THREE.BufferGeometry().setFromPoints(beamPoints), lineMaterial)
    beam.scale.z = 3
    controller.add(beam)
    const select = () => {
      raycasterFrom(controller)
      const intersection = raycaster.intersectObjects(cards, false)[0]
      const id = intersection?.object.userData.portalId as string | undefined
      if (id) activate(id)
    }
    controller.addEventListener('select', select)
    scene.add(controller)
    controllers.push(controller)

    // XR runtime exposes tracked hand poses when the permission/feature is supported.
    // A small wrist marker is intentionally not represented as a full hand model.
    const hand = renderer.xr.getHand(index)
    const wristMarker = new THREE.Mesh(
      new THREE.SphereGeometry(0.025, 12, 10),
      new THREE.MeshBasicMaterial({ color: '#a3f1e9', transparent: true, opacity: 0.85 }),
    )
    hand.add(wristMarker)
    hand.addEventListener('select', () => {
      raycasterFrom(hand)
      const id = raycaster.intersectObjects(cards, false)[0]?.object.userData.portalId as string | undefined
      if (id) activate(id)
    })
    scene.add(hand)
  }

  let selected = 'phios'
  function setSelected(id: string) {
    const next = portals.findIndex((portal) => portal.id === id)
    if (next < 0 || selected === id) return
    selected = id
    cards.forEach((card, index) => {
      const material = card.material as THREE.MeshBasicMaterial
      const previous = material.map
      material.map = portalTexture(index, portals[index].id === id)
      material.needsUpdate = true
      if (previous) previous.dispose()
      cardTextures[index] = material.map
    })
    const material = details.material as THREE.MeshBasicMaterial
    material.map?.dispose()
    material.map = detailTexture(id)
    material.needsUpdate = true
  }

  const pointer = new THREE.Vector2()
  function onPointerClick(event: MouseEvent) {
    if (renderer.xr.isPresenting) return
    const box = renderer.domElement.getBoundingClientRect()
    pointer.set(
      ((event.clientX - box.left) / box.width) * 2 - 1,
      -((event.clientY - box.top) / box.height) * 2 + 1,
    )
    raycaster.setFromCamera(pointer, camera)
    const id = raycaster.intersectObjects(cards, false)[0]?.object.userData.portalId as string | undefined
    if (id) activate(id)
  }
  renderer.domElement.addEventListener('click', onPointerClick)

  function resize() {
    const width = Math.max(host.clientWidth, 1)
    const height = Math.max(host.clientHeight, 1)
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
  }
  const observer = new ResizeObserver(resize)
  observer.observe(host)
  resize()

  renderer.setAnimationLoop((time) => {
    if (decor.visible) halo.rotation.z = Math.sin(time / 9000) * 0.06
    cards.forEach((card) => {
      const active = card.userData.portalId === selected
      card.scale.setScalar(active ? 1.04 : 1)
    })
    // Device pose and stereo cameras are driven by WebXR while presenting.
    renderer.render(scene, camera)
  })

  async function enter(mode: ImmersiveMode) {
    if (!navigator.xr) throw new Error('This browser does not expose WebXR.')
    if (!await navigator.xr.isSessionSupported(mode)) throw new Error(mode + ' is unavailable on this device.')
    const session = await navigator.xr.requestSession(mode, {
      optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking'],
    })
    session.addEventListener('end', () => {
      scene.background = new THREE.Color('#060d19')
      decor.visible = true
      callbacks.onSession(null)
    })
    try {
      // WebXR AR requires a transparent scene background to expose passthrough.
      scene.background = mode === 'immersive-ar' ? null : new THREE.Color('#060d19')
      decor.visible = mode !== 'immersive-ar'
      await renderer.xr.setSession(session)
      callbacks.onSession(mode)
    } catch (error) {
      await session.end().catch(() => {})
      scene.background = new THREE.Color('#060d19')
      decor.visible = true
      throw error
    }
  }

  function dispose() {
    renderer.setAnimationLoop(null)
    observer.disconnect()
    renderer.domElement.removeEventListener('click', onPointerClick)
    const session = renderer.xr.getSession()
    if (session) void session.end().catch(() => {})
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Points || object instanceof THREE.LineSegments) {
        object.geometry.dispose()
        const materials = Array.isArray(object.material) ? object.material : [object.material]
        for (const material of materials) {
          if (material instanceof THREE.MeshBasicMaterial && material.map) material.map.dispose()
          material.dispose()
        }
      }
    })
    renderer.dispose()
    renderer.domElement.remove()
  }

  return { enter, select: setSelected, dispose }
}
