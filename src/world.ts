import * as THREE from 'three'
import { portals } from './catalog'
import type { ImmersiveMode } from './capabilities'
import { calculateWorkspaceAnchor } from './layout'

export type SpatialShell = {
  enter: (mode: ImmersiveMode) => Promise<void>
  select: (id: string) => void
  recenter: () => void
  exit: () => Promise<void>
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
    ctx.fillText('THE SOVEREIGN SPATIAL SHELL   /   EDITION 02', w / 2, 390)
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

function actionTexture(title: string, hint: string) {
  return makeTexture((ctx, w, h) => {
    rounded(ctx, 18, 44, w - 36, h - 88, 45)
    ctx.fillStyle = '#133b46'
    ctx.fill()
    ctx.lineWidth = 5
    ctx.strokeStyle = '#8be7d6'
    ctx.stroke()
    ctx.fillStyle = ink
    ctx.textAlign = 'center'
    ctx.font = 'bold 83px system-ui'
    ctx.fillText(title, w / 2, 286, w - 100)
    ctx.fillStyle = gold
    ctx.font = '43px monospace'
    ctx.fillText(hint, w / 2, 382, w - 105)
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
  const workspace = new THREE.Group()
  scene.add(workspace)
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
  workspace.add(decor)
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
  workspace.add(banner)

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
    workspace.add(card)
    cards.push(card)
  })

  const details = plane(detailTexture('phios'), 1.85, 0.9)
  details.position.set(0, 0.19, -2.7)
  details.rotation.x = -0.19
  workspace.add(details)

  // WebXR renders the canvas, not the surrounding HTML; add in-headset controls.
  const controls = [
    { action: 'recenter', label: 'RE-CENTER', hint: 'FACE FORWARD', x: -1.48 },
    { action: 'exit', label: 'EXIT XR', hint: 'END SESSION', x: 1.48 },
  ] as const
  const actionPanels = controls.map(({ action, label, hint, x }) => {
    const control = plane(actionTexture(label, hint), 0.84, 0.36)
    control.position.set(x, 0.25, -2.55)
    control.rotation.x = -0.12
    control.userData.action = action
    workspace.add(control)
    return control
  })
  const targets: THREE.Mesh[] = [...cards, ...actionPanels]

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
  type Pointer = { controller: THREE.Group; beam: THREE.Line; reticle: THREE.Mesh }
  const pointers: Pointer[] = []
  const hitFrom = (controller: THREE.Group) => {
    controller.updateMatrixWorld(true)
    raycasterFrom(controller)
    return raycaster.intersectObjects(targets, false)[0]
  }

  function activateTarget(object: THREE.Object3D) {
    const id = object.userData.portalId as string | undefined
    const action = object.userData.action as string | undefined
    if (id) activate(id)
    else if (action === 'recenter') recenter()
    else if (action === 'exit') void exit().catch(() => {})
  }

  // A tracked input source's target ray receives 'select' for controllers
  // and hand gestures when the browser emits that standard WebXR event.
  for (let index = 0; index < 2; index++) {
    const controller = renderer.xr.getController(index)
    const beam = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(), new THREE.Vector3(0, 0, -1),
      ]),
      new THREE.LineBasicMaterial({ color: '#80e8d8', transparent: true, opacity: 0.8 }),
    )
    beam.scale.z = 3.6
    beam.visible = false
    controller.add(beam)
    const reticle = new THREE.Mesh(
      new THREE.RingGeometry(0.026, 0.039, 30),
      new THREE.MeshBasicMaterial({ color: '#e4c78b', side: THREE.DoubleSide, depthTest: false }),
    )
    reticle.visible = false
    scene.add(reticle)
    controller.addEventListener('select', () => {
      if (!renderer.xr.isPresenting) return
      const hit = hitFrom(controller)
      if (hit) activateTarget(hit.object)
    })
    scene.add(controller)
    pointers.push({ controller, beam, reticle })
    const hand = renderer.xr.getHand(index)
    hand.add(new THREE.Mesh(
      new THREE.SphereGeometry(0.025, 12, 10),
      new THREE.MeshBasicMaterial({ color: '#a3f1e9', transparent: true, opacity: 0.85 }),
    ))
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
    const hit = raycaster.intersectObjects(targets, false)[0]
    if (hit) activateTarget(hit.object)
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

  const head = new THREE.Vector3()
  const forward = new THREE.Vector3()
  let pendingRecenter = false

  function recenter() {
    if (!renderer.xr.isPresenting) {
      workspace.position.set(0, 0, 0)
      workspace.rotation.set(0, 0, 0)
      return
    }
    const xrCamera = renderer.xr.getCamera()
    xrCamera.getWorldPosition(head)
    xrCamera.getWorldDirection(forward)
    const anchor = calculateWorkspaceAnchor(head, forward)
    workspace.position.set(anchor.x, anchor.y, anchor.z)
    workspace.rotation.set(0, anchor.yaw, 0)
    workspace.updateMatrixWorld(true)
  }

  async function exit() {
    const session = renderer.xr.getSession()
    if (session) await session.end()
  }

  renderer.setAnimationLoop((time) => {
    if (decor.visible) halo.rotation.z = Math.sin(time / 9000) * 0.06
    const hovered = new Set<THREE.Object3D>()
    if (renderer.xr.isPresenting) {
      scene.updateMatrixWorld(true)
      for (const pointer of pointers) {
        const hit = hitFrom(pointer.controller)
        pointer.beam.visible = true
        pointer.beam.scale.z = hit ? Math.min(4, hit.distance) : 3.6
        pointer.reticle.visible = Boolean(hit)
        if (hit) {
          pointer.reticle.position.copy(hit.point).addScaledVector(raycaster.ray.direction, -0.015)
          hit.object.getWorldQuaternion(pointer.reticle.quaternion)
          hovered.add(hit.object)
        }
      }
    } else {
      for (const pointer of pointers) {
        pointer.beam.visible = false
        pointer.reticle.visible = false
      }
    }
    cards.forEach((card) => card.scale.setScalar(
      hovered.has(card) ? 1.08 : card.userData.portalId === selected ? 1.04 : 1,
    ))
    actionPanels.forEach((panel) => panel.scale.setScalar(hovered.has(panel) ? 1.10 : 1))
    renderer.render(scene, camera)
    // Render updates the XR camera pose. Apply recenter for the next frame.
    if (renderer.xr.isPresenting && pendingRecenter) {
      recenter()
      pendingRecenter = false
    }
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
      workspace.position.set(0, 0, 0)
      workspace.rotation.set(0, 0, 0)
      callbacks.onSession(null)
    })
    try {
      // WebXR AR requires a transparent scene background to expose passthrough.
      scene.background = mode === 'immersive-ar' ? null : new THREE.Color('#060d19')
      decor.visible = mode !== 'immersive-ar'
      await renderer.xr.setSession(session)
      pendingRecenter = true
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

  return { enter, select: setSelected, recenter, exit, dispose }
}
