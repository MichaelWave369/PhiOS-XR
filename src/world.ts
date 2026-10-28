import * as THREE from 'three'
import { getPortal, getVrWorld, portals, vrWorlds, type Portal } from './catalog'
import { createDeck, deckSlots, selectDeck, shuffleDeck, stepDeck } from './vr-deck'
import type { ImmersiveMode } from './capabilities'
import { emptyDiagnostics, nextGaze, safeGazeTarget, type GazeState, type XRInputDiagnostics } from './xr-input'
import { calculateWorkspaceAnchor } from './layout'
import { clearWorkspace, clampPanelSize, clampPosition, loadWorkspace, presetPanels, saveWorkspace, type LayoutPreset } from './workspace'
import { applyPadKey, elapsedClock, formatClock, loadPad, newClock, pauseClock, sanitizeNote, savePad, startClock, type ClockState } from './fieldtools'
export type ViewMode = 'portals' | 'tools' | 'worlds'
export type ClockDisplay = { time: string; running: boolean }

export type SpatialShell = {
  enter: (mode: ImmersiveMode) => Promise<void>
  select: (id: string) => void
  recenter: () => void
  exit: () => Promise<void>
  arrange: (preset: LayoutPreset) => void
  reset: () => void
  setView: (mode: ViewMode) => void
  setNote: (value: string) => void
  clockAction: (action: 'toggle' | 'reset') => void
  setGazeAssist: (enabled: boolean) => void
  deckAction: (action: 'previous' | 'next' | 'shuffle') => void
  dispose: () => void
}

type ShellCallbacks = {
  onSelect: (id: string) => void
  onSession: (mode: ImmersiveMode | null) => void
  onLayout: (preset: LayoutPreset) => void
  onView: (mode: ViewMode) => void
  onNote: (note: string) => void
  onClock: (state: ClockDisplay) => void
  onInput?: (snapshot: XRInputDiagnostics) => void
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

function portalTexture(index: number, selected: boolean, source: readonly Portal[] = portals) {
  const portal = source[index]
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
    ctx.fillText('HOLD SELECT TO MOVE / CORNER TO SIZE', 65, 505, w - 125)
  })
}


/** Material-generated OutRun art, bundled locally without remote textures or shaders. */
function vrCardTexture(world: Portal, focused: boolean) {
  return makeTexture((ctx, w, h) => {
    const gradient = ctx.createLinearGradient(0, 0, w, h)
    gradient.addColorStop(0, '#192e50')
    gradient.addColorStop(0.55, '#101a35')
    gradient.addColorStop(1, '#0a1124')
    rounded(ctx, 11, 11, w - 22, h - 22, 42)
    ctx.fillStyle = gradient
    ctx.fill()
    ctx.lineWidth = focused ? 10 : 5
    ctx.strokeStyle = focused ? '#ffb363' : '#55dedc'
    ctx.stroke()
    // Distinctive neon horizon, sun, and disappearing highway inside each card.
    const sun = ctx.createLinearGradient(0, 110, 0, 340)
    sun.addColorStop(0, '#ffca79')
    sun.addColorStop(1, '#ef4b9b')
    ctx.fillStyle = sun
    ctx.beginPath()
    ctx.arc(730, 234, 105, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#121e3b'
    for (let i = 0; i < 6; i++) ctx.fillRect(625, 248 + i * 17, 210, 4 + i * 2)
    ctx.strokeStyle = '#ff5ea5'
    ctx.lineWidth = 3
    for (let i = 0; i < 8; i++) {
      const y = 382 + i * i * 2.7
      ctx.beginPath()
      ctx.moveTo(55, y)
      ctx.lineTo(903, y)
      ctx.stroke()
    }
    for (const edge of [-1, -0.5, 0.5, 1]) {
      ctx.beginPath()
      ctx.moveTo(480, 372)
      ctx.lineTo(480 + 530 * edge, 580)
      ctx.stroke()
    }
    ctx.fillStyle = '#6de9e3'
    ctx.font = 'bold 27px monospace'
    ctx.fillText('FIELD / XR WORLD ' + world.number, 52, 78)
    ctx.fillStyle = '#fff2de'
    ctx.font = 'bold 61px system-ui'
    ctx.shadowColor = '#ff428e'
    ctx.shadowBlur = focused ? 24 : 10
    ctx.fillText(world.name, 52, 272, 805)
    ctx.shadowBlur = 0
    ctx.fillStyle = '#b6f8ef'
    ctx.font = '31px system-ui'
    ctx.fillText(world.subtitle, 53, 329, 780)
    ctx.fillStyle = focused ? '#ffc27c' : '#82d4d0'
    ctx.font = 'bold 27px monospace'
    ctx.fillText(focused ? 'FRONT OF DECK  /  OPEN BELOW' : 'SELECT TO BRING FORWARD', 53, 555, 845)
  })
}

function createOutrunBackdrop(group: THREE.Group) {
  const lines: number[] = []
  // A single inexpensive line-segment mesh forms the receding neon highway.
  for (let i = 0; i <= 22; i++) {
    const z = -0.55 - (i / 22) ** 1.55 * 16
    lines.push(-11, -0.07, z, 11, -0.07, z)
  }
  for (let i = -12; i <= 12; i++) {
    lines.push(0, -0.07, -16.5, i * 0.88, -0.07, -0.55)
  }
  const road = new THREE.BufferGeometry()
  road.setAttribute('position', new THREE.Float32BufferAttribute(lines, 3))
  group.add(new THREE.LineSegments(road, new THREE.LineBasicMaterial({
    color: '#ff4e9c', transparent: true, opacity: 0.62, depthWrite: false,
  })))

  const peaks: number[] = []
  for (let i = 0; i < 18; i++) {
    const x = -16.2 + i * 1.8
    const height = 0.35 + ((i * 7) % 9) * 0.22
    peaks.push(x, 0, -9.4, x + 0.9, height, -9.4, x + 1.8, 0, -9.4)
  }
  const mountains = new THREE.BufferGeometry()
  mountains.setAttribute('position', new THREE.Float32BufferAttribute(peaks, 3))
  group.add(new THREE.Mesh(mountains, new THREE.MeshBasicMaterial({
    color: '#272751', side: THREE.DoubleSide, depthWrite: false,
  })))

  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  if (ctx) {
    const sun = ctx.createLinearGradient(0, 46, 0, 455)
    sun.addColorStop(0, '#ffe6a1')
    sun.addColorStop(0.45, '#ff9b76')
    sun.addColorStop(1, '#eb398b')
    ctx.fillStyle = sun
    ctx.beginPath()
    ctx.arc(256, 256, 207, 0, Math.PI * 2)
    ctx.fill()
    // Interrupted sunset bands: classic synthwave, procedurally painted.
    ctx.globalCompositeOperation = 'destination-out'
    for (let i = 0; i < 7; i++) {
      ctx.fillRect(38, 276 + i * 23, 440, 3 + i * 3)
    }
    ctx.globalCompositeOperation = 'source-over'
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    const sunPlane = plane(texture, 4.6, 4.6)
    sunPlane.position.set(0, 2.2, -10)
    group.add(sunPlane)
  }
}

function headingTexture() {
  return makeTexture((ctx, w) => {
    ctx.textAlign = 'center'
    ctx.fillStyle = '#76dcd7'
    ctx.font = '600 36px monospace'
    ctx.fillText('SOVEREIGN · CREATIVE · LOCAL · FREE', w / 2, 122)
    ctx.fillStyle = ink
    ctx.font = 'bold 120px Georgia, serif'
    ctx.fillText('Φ  PhiOS  XR', w / 2, 303)
    ctx.fillStyle = gold
    ctx.font = '32px monospace'
    ctx.fillText('NEON HIGHWAY  /  ENTER THE FIELD', w / 2, 390)
  })
}

function detailTexture(id: string) {
  const entry = getPortal(id) ?? portals[0]
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
  createOutrunBackdrop(decor)

  const points: number[] = []
  for (let i = 0; i < 420; i++) {
    const a = i * 2.399963
    const r = 3.4 + (i % 29) * 0.22
    points.push(Math.cos(a) * r, 0.6 + Math.sin(i * 17.31) * 4.7, -2.5 + Math.sin(a) * r)
  }
  const starGeo = new THREE.BufferGeometry()
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))
  decor.add(new THREE.Points(starGeo, new THREE.PointsMaterial({
    color: '#8ad5ed', size: 0.022, sizeAttenuation: true,
    transparent: true, opacity: 0.65,
  })))

  const banner = plane(headingTexture(), 3.25, 1.12)
  banner.position.set(0, 3.11, -2.45)
  workspace.add(banner)

  const recovered = loadWorkspace()
  let activePreset: LayoutPreset = recovered?.preset ?? 'arc'
  const startingPanels = recovered?.panels ?? presetPanels('arc')
  const cards: THREE.Mesh[] = []
  const cardTextures: THREE.Texture[] = []
  const resizeHandles: THREE.Mesh[] = []
  portals.forEach((portal, index) => {
    const texture = portalTexture(index, index === 0)
    cardTextures.push(texture)
    const card = plane(texture, 1.23, 0.79)
    const state = startingPanels[index]
    card.position.set(state.position.x, state.position.y, state.position.z)
    if (activePreset === 'arc') card.lookAt(0, 1.45, 0.15)
    card.scale.setScalar(state.scale)
    card.userData.portalId = portal.id
    workspace.add(card)
    cards.push(card)

    // A tangible bottom-right resize tab, separately hit-tested from the card.
    const handle = new THREE.Mesh(
      new THREE.PlaneGeometry(0.19, 0.16),
      new THREE.MeshBasicMaterial({ color: '#dcbf82', side: THREE.DoubleSide, depthTest: false }),
    )
    handle.userData.resizeId = portal.id
    workspace.add(handle)
    resizeHandles.push(handle)
  })

  function positionHandle(index: number) {
    const card = cards[index]
    const handle = resizeHandles[index]
    handle.quaternion.copy(card.quaternion)
    handle.position.copy(card.position).add(
      new THREE.Vector3(0.615 * card.scale.x, -0.395 * card.scale.y, 0.018)
        .applyQuaternion(card.quaternion),
    )
  }
  cards.forEach((_, index) => positionHandle(index))

  // The world deck focuses one generous card with two angled previews.
  // Unlike the movable system portals, these five cards never alter saved layouts.
  let deck = createDeck(vrWorlds.map((world) => world.id))
  const worldCards: THREE.Mesh[] = vrWorlds.map((world) => {
    const card = plane(vrCardTexture(world, world.id === deck.active), 1.68, 1.04)
    card.userData.portalId = world.id
    card.visible = false
    workspace.add(card)
    return card
  })

  function layoutDeck() {
    const slots = deckSlots(deck)
    worldCards.forEach((card, index) => {
      const position = slots.find((slot) => slot.id === vrWorlds[index].id)
      card.visible = view === 'worlds' && !!position
      if (!position) return
      const side = position.slot
      card.position.set(side * 1.40, side === 0 ? 1.74 : 1.67, side === 0 ? -1.97 : -2.36)
      card.rotation.set(0, side * -0.26, 0)
      card.scale.setScalar(side === 0 ? 1.03 : 0.72)
    })
  }

  const details = plane(detailTexture('phios'), 1.85, 0.9)
  details.position.set(0, 0.19, -2.7)
  details.rotation.x = -0.19
  workspace.add(details)

  // WebXR renders the canvas, not the surrounding HTML; add in-headset controls.
  const controls = [
    { action: 'portals', label: 'PORTALS', hint: 'PROJECTS', y: 3.04 },
    { action: 'worlds', label: 'VR WORLDS', hint: '5 DESTINATIONS', y: 2.67 },
    { action: 'tools', label: 'TOOLS', hint: 'LIVE APPS', y: 2.30 },
    { action: 'arc', label: 'ARC', hint: 'CURVED', y: 1.93 },
    { action: 'wall', label: 'WALL', hint: 'FLAT GRID', y: 1.56 },
    { action: 'reset', label: 'RESET', hint: 'RECOVER', y: 1.19 },
    { action: 'recenter', label: 'RE-CENTER', hint: 'FACE FORWARD', y: 0.82 },
    { action: 'exit', label: 'EXIT XR', hint: 'END SESSION', y: 0.45 },
  ] as const
  const actionPanels = controls.map(({ action, label, hint, y }) => {
    const control = plane(actionTexture(label, hint), 0.78, 0.35)
    control.position.set(2.28, y, -2.55)
    control.userData.action = action
    workspace.add(control)
    return control
  })

  function layoutControlDock(mode: ViewMode) {
    // Keep the world deck intimate: five controls across the top, not an
    // eight-button rail floating in the distance. Non-world views retain
    // their original controls and layout tools.
    const topActions = ['portals', 'worlds', 'tools', 'recenter', 'exit']
    actionPanels.forEach((panel, index) => {
      const item = controls[index]
      if (mode === 'worlds') {
        const slot = topActions.indexOf(item.action)
        panel.visible = slot !== -1
        if (slot !== -1) panel.position.set((slot - 2) * 0.86, 2.60, -1.95)
      } else {
        panel.visible = true
        panel.position.set(2.28, item.y, -2.55)
      }
    })
  }
  const deckButtons = [
    { action: 'deck-prev', title: '◀ PREV', x: -1.39 },
    { action: 'deck-shuffle', title: 'SHUFFLE', x: 0 },
    { action: 'deck-next', title: 'NEXT ▶', x: 1.39 },
  ].map(({ action, title, x }) => {
    const button = plane(actionTexture(title, 'VR WORLD DECK'), 1.14, 0.36)
    button.position.set(x, 0.94, -1.97)
    button.userData.action = action
    button.visible = false
    workspace.add(button)
    return button
  })
  // Explicit controller click on this button navigates the current Quest Browser tab.
  // Gaze selection alone can NEVER activate external navigation.
  const openWorldPanel = plane(actionTexture('OPEN WORLD', 'LEAVE PHIOS XR'), 1.65, 0.42)
  openWorldPanel.position.set(0, 0.47, -1.97)
  openWorldPanel.userData.action = 'launch-world'
  openWorldPanel.visible = false
  workspace.add(openWorldPanel)

  // First-party spatial tools are interactive WebGL surfaces, not embedded websites.
  const toolGroup = new THREE.Group()
  toolGroup.visible = false
  workspace.add(toolGroup)
  let view: ViewMode = 'worlds'
  cards.forEach((card) => { card.visible = false })
  resizeHandles.forEach((handle) => { handle.visible = false })
  details.visible = false
  banner.visible = false
  layoutControlDock('worlds')
  layoutDeck()
  let note = loadPad()
  let clock: ClockState = newClock()
  let lastClockText = '00:00'

  function miniTexture(label: string, accent = false) {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 128
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('2D canvas unavailable')
    ctx.fillStyle = accent ? '#315d60' : '#183744'
    ctx.fillRect(2, 2, 252, 124)
    ctx.strokeStyle = accent ? '#e7c78c' : '#79c6c6'
    ctx.lineWidth = 6
    ctx.strokeRect(4, 4, 248, 120)
    ctx.fillStyle = '#edfaf8'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = '700 54px system-ui'
    ctx.fillText(label, 128, 64, 234)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
  }
  function drawRows(ctx: CanvasRenderingContext2D, text: string, width: number) {
    ctx.font = '32px monospace'
    const rows: string[] = []
    for (const paragraph of text.split('\n')) {
      let line = ''
      for (const character of paragraph) {
        if (ctx.measureText(line + character).width > width) {
          rows.push(line)
          line = ''
        }
        line += character
      }
      rows.push(line)
    }
    for (const [index, line] of rows.slice(0, 10).entries()) {
      ctx.fillText(line, 48, 207 + index * 38)
    }
  }
  function noteTexture() {
    return makeTexture((ctx, w, h) => {
      ctx.fillStyle = '#102634'
      ctx.fillRect(0, 0, w, h)
      ctx.strokeStyle = '#4d8f91'
      ctx.lineWidth = 8
      ctx.strokeRect(10, 10, w - 20, h - 20)
      ctx.fillStyle = '#82e6da'
      ctx.font = '700 48px monospace'
      ctx.fillText('FIELD PAD / LOCAL', 48, 78)
      ctx.fillStyle = '#b1d7d5'
      ctx.font = '26px monospace'
      ctx.fillText('NO SYNC  ·  NO MODEL  ·  NO EXECUTION', 48, 126)
      ctx.fillStyle = '#f1f9f7'
      drawRows(ctx, note || 'SELECT KEYS BELOW TO WRITE…', w - 92)
      ctx.fillStyle = '#e1c18a'
      ctx.font = '25px monospace'
      ctx.fillText('FIELD NOTES / ' + note.length + ' OF 240', 48, h - 30)
    })
  }
  function clockTexture(time: string) {
    return makeTexture((ctx, w, h) => {
      ctx.fillStyle = '#0e2630'
      ctx.fillRect(0, 0, w, h)
      ctx.strokeStyle = '#8c875f'
      ctx.lineWidth = 8
      ctx.strokeRect(10, 10, w - 20, h - 20)
      ctx.fillStyle = '#d9c188'
      ctx.font = '700 48px monospace'
      ctx.fillText('FOCUS CLOCK / LOCAL', 48, 78)
      ctx.fillStyle = '#719fa9'
      ctx.font = '29px monospace'
      ctx.fillText('MONOTONIC ELAPSED TIME', 48, 132)
      ctx.fillStyle = '#e9fff8'
      ctx.textAlign = 'center'
      ctx.font = '700 144px monospace'
      ctx.fillText(time, w / 2, 336, w - 80)
      ctx.fillStyle = clock.startedAt === null ? '#d9bd85' : '#80e3c3'
      ctx.font = '700 30px monospace'
      ctx.fillText(clock.startedAt === null ? 'PAUSED' : 'RUNNING', w / 2, 420)
      ctx.font = '25px monospace'
      ctx.fillStyle = '#91abb1'
      ctx.fillText('NO BACKGROUND REMINDERS', w / 2, h - 34)
    })
  }
  const noteBoard = plane(noteTexture(), 1.76, 1.1)
  noteBoard.position.set(-0.94, 2.05, -2.5)
  toolGroup.add(noteBoard)
  const clockBoard = plane(clockTexture('00:00'), 1.76, 1.1)
  clockBoard.position.set(0.94, 2.05, -2.5)
  toolGroup.add(clockBoard)
  const keyMeshes: THREE.Mesh[] = []
  const addKey = (label: string, x: number, y: number, width: number, app: 'pad' | 'clock') => {
    const key = plane(miniTexture(label, app === 'clock'), width, 0.17)
    key.position.set(x, y, -2.43)
    key.userData[app === 'pad' ? 'padKey' : 'clockAction'] = label
    toolGroup.add(key)
    keyMeshes.push(key)
  }
  for (const [rowIndex, row] of ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'].entries()) {
    for (let index = 0; index < row.length; index++) {
      addKey(row[index], -0.97 + (index - (row.length - 1) / 2) * 0.235, 1.28 - rowIndex * 0.205, 0.215, 'pad')
    }
  }
  addKey('SPACE', -1.47, 0.64, 0.50, 'pad')
  addKey('ENTER', -0.87, 0.64, 0.48, 'pad')
  addKey('DELETE', -0.26, 0.64, 0.52, 'pad')
  addKey('CLEAR', 0.35, 0.64, 0.46, 'pad')
  addKey('TOGGLE', 1.07, 1.28, 0.48, 'clock')
  addKey('RESET', 1.64, 1.28, 0.48, 'clock')
  const targets: THREE.Mesh[] = [...cards, ...worldCards, ...deckButtons, openWorldPanel, ...resizeHandles, ...actionPanels, ...keyMeshes]
  const gazeTargets: THREE.Mesh[] = [...cards, ...worldCards, ...actionPanels]
  const gazeReticle = new THREE.Mesh(
    new THREE.RingGeometry(0.027, 0.049, 28),
    new THREE.MeshBasicMaterial({ color: '#a6f6dd', side: THREE.DoubleSide, depthTest: false }),
  )
  gazeReticle.visible = false
  scene.add(gazeReticle)

  // A small in-headset status panel keeps missing input sources observable.
  const inputTexture = makeTexture((ctx, w, h) => {
    ctx.fillStyle = '#0d2833'
    ctx.fillRect(0, 0, w, h)
  })
  const inputBoard = plane(inputTexture, 1.66, 0.55)
  inputBoard.position.set(-2.08, 0.12, -2.4)
  inputBoard.visible = false
  workspace.add(inputBoard)
  let input: XRInputDiagnostics = emptyDiagnostics()
  let gazeEnabled = true
  let gaze: GazeState = { target: null, since: 0, fired: false }
  let gazeProgress = 0
  let lastInputDraw = -Infinity
  const connectedRays = new Set<number>()

  function setGazeAssist(enabled: boolean) {
    gazeEnabled = enabled
    gaze = { target: null, since: 0, fired: false }
    gazeReticle.visible = false
    input = { ...input, gazeAssist: enabled }
    callbacks.onInput?.({ ...input })
    lastInputDraw = -Infinity
  }

  function noteInput(event: string) {
    input = {
      ...input,
      sourceCount: renderer.xr.getSession()?.inputSources?.length ?? 0,
      connectedRays: connectedRays.size,
      lastEvent: event.slice(0, 65),
    }
    callbacks.onInput?.({ ...input })
    lastInputDraw = -Infinity
  }

  function drawInputBoard() {
    const canvas = inputTexture.image as HTMLCanvasElement
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#0b2935'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = '#78c9bf'
    ctx.lineWidth = 7
    ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16)
    ctx.fillStyle = '#d5f7f0'
    ctx.font = 'bold 48px monospace'
    ctx.fillText('QUEST INPUT / LIVE', 38, 95)
    ctx.font = '36px monospace'
    ctx.fillStyle = '#a6ddd7'
    ctx.fillText('SOURCES ' + input.sourceCount + '  RAYS ' + input.connectedRays, 38, 181)
    ctx.fillText('PRESS ' + input.selectStarts + '  SELECT ' + input.selects, 38, 251)
    ctx.fillStyle = '#e3c58a'
    ctx.font = '32px monospace'
    ctx.fillText('LAST: ' + input.lastEvent, 38, 321, canvas.width - 70)
    ctx.fillStyle = gazeEnabled ? '#8debc7' : '#879caa'
    ctx.fillText(
      gazeEnabled ? 'GAZE ON / DWELL ' + Math.round(gazeProgress * 100) + '%' : 'GAZE ASSIST OFF',
      38, 397, canvas.width - 70,
    )
    ctx.fillStyle = '#aabcc5'
    ctx.font = '26px monospace'
    ctx.fillText('Only safe navigation / no system actions', 38, 466, canvas.width - 70)
    inputTexture.needsUpdate = true
  }

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

  function persist() {
    saveWorkspace({
      version: 1, preset: activePreset,
      panels: cards.map((card, index) => ({
        id: portals[index].id,
        position: { x: card.position.x, y: card.position.y, z: card.position.z },
        scale: card.scale.x,
      })),
    })
  }

  function arrange(preset: LayoutPreset, persistLayout = true) {
    activePreset = preset
    for (const [index, state] of presetPanels(preset).entries()) {
      const card = cards[index]
      card.position.set(state.position.x, state.position.y, state.position.z)
      card.rotation.set(0, 0, 0)
      if (preset === 'arc') card.lookAt(0, 1.45, 0.15)
      card.scale.setScalar(1)
      positionHandle(index)
    }
    callbacks.onLayout(preset)
    if (persistLayout) persist()
  }

  function reset() {
    clearWorkspace()
    arrange('arc', false)
  }

  function cardForTarget(object: THREE.Object3D): THREE.Mesh | null {
    const id = object.userData.portalId ?? object.userData.resizeId
    const index = portals.findIndex((portal) => portal.id === id)
    return index === -1 ? null : cards[index]
  }

  type Drag = {
    card: THREE.Mesh
    mode: 'move' | 'resize'
    distance: number
    startScale: number
    startPoint: THREE.Vector3
    right: THREE.Vector3
    offset: THREE.Vector3
    plane: THREE.Plane
  }
  function beginDrag(object: THREE.Object3D, hitPoint: THREE.Vector3, distance: number): Drag | null {
    const card = cardForTarget(object)
    if (!card) return null
    const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(card.getWorldQuaternion(new THREE.Quaternion()))
    const center = card.getWorldPosition(new THREE.Vector3())
    return {
      card,
      mode: object.userData.resizeId ? 'resize' : 'move',
      distance,
      startScale: card.scale.x,
      startPoint: hitPoint.clone(),
      right: new THREE.Vector3(1, 0, 0).applyQuaternion(card.getWorldQuaternion(new THREE.Quaternion())),
      offset: center.sub(hitPoint),
      plane: new THREE.Plane().setFromNormalAndCoplanarPoint(normal, card.getWorldPosition(new THREE.Vector3())),
    }
  }

  function updateDrag(drag: Drag, point: THREE.Vector3) {
    const card = drag.card
    if (drag.mode === 'move') {
      const local = workspace.worldToLocal(point.clone().add(drag.offset))
      const limited = clampPosition(local)
      card.position.set(limited.x, limited.y, limited.z)
    } else {
      const difference = point.clone().sub(drag.startPoint).dot(drag.right)
      card.scale.setScalar(clampPanelSize(drag.startScale + difference * 1.4))
    }
    positionHandle(cards.indexOf(card))
  }
  function setView(mode: ViewMode) {
    view = mode
    toolGroup.visible = mode === 'tools'
    details.visible = mode === 'portals'
    banner.visible = mode !== 'worlds'
    layoutControlDock(mode)
    cards.forEach((card) => { card.visible = mode === 'portals' })
    resizeHandles.forEach((handle) => { handle.visible = mode === 'portals' })
    layoutDeck()
    deckButtons.forEach((button) => { button.visible = mode === 'worlds' })
    openWorldPanel.visible = mode === 'worlds'
    if (mode === 'worlds' && !getVrWorld(selected)) activate(deck.active)
    if (mode === 'portals' && !portals.some((portal) => portal.id === selected)) activate(portals[0].id)
    callbacks.onView(view)
  }
  function deckAction(action: 'previous' | 'next' | 'shuffle') {
    deck = action === 'shuffle' ? shuffleDeck(deck) : stepDeck(deck, action === 'previous' ? -1 : 1)
    layoutDeck()
    activate(deck.active)
  }
  function setNote(text: string) {
    const next = sanitizeNote(text)
    if (next === note) return
    note = next
    const material = noteBoard.material as THREE.MeshBasicMaterial
    material.map?.dispose()
    material.map = noteTexture()
    material.needsUpdate = true
    savePad(note)
    callbacks.onNote(note)
  }
  function updateClockTexture(time: string) {
    const material = clockBoard.material as THREE.MeshBasicMaterial
    material.map?.dispose()
    material.map = clockTexture(time)
    material.needsUpdate = true
    callbacks.onClock({ time, running: clock.startedAt !== null })
  }
  function clockAction(action: 'toggle' | 'reset') {
    const now = performance.now()
    if (action === 'reset') clock = newClock()
    else if (clock.startedAt !== null) clock = pauseClock(clock, now)
    else clock = startClock(clock, now)
    lastClockText = formatClock(elapsedClock(clock, now))
    updateClockTexture(lastClockText)
  }
  const xrDrags = new Map<THREE.Group, Drag>()
  type Pointer = { controller: THREE.Group; beam: THREE.Line; reticle: THREE.Mesh }
  const pointers: Pointer[] = []
  const hitFrom = (controller: THREE.Group) => {
    controller.updateMatrixWorld(true)
    raycasterFrom(controller)
    return raycaster.intersectObjects(targets.filter(mesh => mesh.visible && mesh.parent?.visible !== false), false)[0]
  }

  function updateGaze(time: number) {
    if (!renderer.xr.isPresenting || !gazeEnabled) {
      gazeReticle.visible = false
      gaze = { target: null, since: 0, fired: false }
      gazeProgress = 0
      return
    }
    const xrCamera = renderer.xr.getCamera()
    xrCamera.updateMatrixWorld(true)
    const origin = xrCamera.getWorldPosition(new THREE.Vector3())
    const direction = xrCamera.getWorldDirection(new THREE.Vector3()).normalize()
    raycaster.set(origin, direction)
    const hit = raycaster.intersectObjects(
      gazeTargets.filter((mesh) => mesh.visible && mesh.parent?.visible !== false), false,
    )[0]
    const target = hit ? safeGazeTarget(
      hit.object.userData.portalId as string | undefined,
      hit.object.userData.action as string | undefined,
    ) : null
    const advanced = nextGaze(gaze, target, time)
    gaze = advanced.state
    gazeProgress = advanced.progress
    gazeReticle.visible = Boolean(target && hit)
    if (target && hit) {
      gazeReticle.position.copy(hit.point).addScaledVector(direction, -0.016)
      hit.object.getWorldQuaternion(gazeReticle.quaternion)
      gazeReticle.scale.setScalar(1 + advanced.progress * 0.48)
    }
    if (advanced.activate && hit) activateTarget(hit.object)
  }

  function activateTarget(object: THREE.Object3D) {
    const id = object.userData.portalId as string | undefined
    const action = object.userData.action as string | undefined
    const padKey = object.userData.padKey as string | undefined
    const timerKey = object.userData.clockAction as string | undefined
    if (padKey) setNote(applyPadKey(note, padKey))
    else if (timerKey === 'TOGGLE') clockAction('toggle')
    else if (timerKey === 'RESET') clockAction('reset')
    else if (id) activate(id)
    else if (action === 'tools') setView('tools')
    else if (action === 'portals') setView('portals')
    else if (action === 'worlds') setView('worlds')
    else if (action === 'deck-prev' && view === 'worlds') deckAction('previous')
    else if (action === 'deck-next' && view === 'worlds') deckAction('next')
    else if (action === 'deck-shuffle' && view === 'worlds') deckAction('shuffle')
    else if (action === 'launch-world' && view === 'worlds') {
      const world = getVrWorld(selected)
      // Navigation occurs only on explicit controller select / pointer click.
      // It leaves PhiOS XR rather than trying to embed another immersive session.
      if (world) window.location.assign(world.href)
    }
    else if (action === 'arc') arrange('arc')
    else if (action === 'wall') arrange('wall')
    else if (action === 'reset') reset()
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
    controller.addEventListener('connected', () => {
      connectedRays.add(index)
      noteInput('RAY ' + index + ' CONNECTED')
    })
    controller.addEventListener('disconnected', () => {
      connectedRays.delete(index)
      xrDrags.delete(controller)
      noteInput('RAY ' + index + ' DISCONNECTED')
    })
    controller.addEventListener('selectstart', () => {
      input = { ...input, selectStarts: input.selectStarts + 1 }
      noteInput('RAY ' + index + ' SELECTSTART')
      if (!renderer.xr.isPresenting) return
      scene.updateMatrixWorld(true)
      const hit = hitFrom(controller)
      if (!hit) return
      const id = (hit.object.userData.portalId ?? hit.object.userData.resizeId) as string | undefined
      if (id) activate(id)
      const drag = beginDrag(hit.object, hit.point, hit.distance)
      if (drag) xrDrags.set(controller, drag)
    })
    controller.addEventListener('selectend', () => {
      if (xrDrags.delete(controller)) persist()
    })
    controller.addEventListener('select', () => {
      input = { ...input, selects: input.selects + 1 }
      noteInput('RAY ' + index + ' SELECT')
      if (!renderer.xr.isPresenting || xrDrags.has(controller)) return
      const hit = hitFrom(controller)
      if (hit && (hit.object.userData.portalId || hit.object.userData.action || hit.object.userData.padKey || hit.object.userData.clockAction)) activateTarget(hit.object)
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

  let selected = deck.active
  function setSelected(id: string) {
    if (!getPortal(id)) return
    if (getVrWorld(id)) {
      deck = selectDeck(deck, id)
      layoutDeck()
    }
    if (selected === id) return
    selected = id
    cards.forEach((card, index) => {
      const material = card.material as THREE.MeshBasicMaterial
      const previous = material.map
      material.map = portalTexture(index, portals[index].id === id)
      material.needsUpdate = true
      if (previous) previous.dispose()
      cardTextures[index] = material.map
    })
    worldCards.forEach((card, index) => {
      const material = card.material as THREE.MeshBasicMaterial
      material.map?.dispose()
      material.map = vrCardTexture(vrWorlds[index], vrWorlds[index].id === id)
      material.needsUpdate = true
    })
    const material = details.material as THREE.MeshBasicMaterial
    material.map?.dispose()
    material.map = detailTexture(id)
    material.needsUpdate = true
  }

  const pointer = new THREE.Vector2()
  let desktopDrag: { id: number; drag: Drag } | null = null
  const rayFromPointer = (event: PointerEvent) => {
    const box = renderer.domElement.getBoundingClientRect()
    pointer.set(
      ((event.clientX - box.left) / box.width) * 2 - 1,
      -((event.clientY - box.top) / box.height) * 2 + 1,
    )
    raycaster.setFromCamera(pointer, camera)
  }
  function onPointerDown(event: PointerEvent) {
    if (renderer.xr.isPresenting || event.button !== 0) return
    rayFromPointer(event)
    scene.updateMatrixWorld(true)
    const hit = raycaster.intersectObjects(targets.filter(mesh => mesh.visible && mesh.parent?.visible !== false), false)[0]
    if (!hit) return
    const id = (hit.object.userData.portalId ?? hit.object.userData.resizeId) as string | undefined
    if (id) activate(id)
    const drag = beginDrag(hit.object, hit.point, hit.distance)
    if (drag) {
      desktopDrag = { id: event.pointerId, drag }
      renderer.domElement.setPointerCapture(event.pointerId)
      event.preventDefault()
    } else activateTarget(hit.object)
  }
  function onPointerMove(event: PointerEvent) {
    if (!desktopDrag || event.pointerId !== desktopDrag.id || renderer.xr.isPresenting) return
    rayFromPointer(event)
    const position = raycaster.ray.intersectPlane(desktopDrag.drag.plane, new THREE.Vector3())
    if (position) updateDrag(desktopDrag.drag, position)
  }
  function endPointer(event: PointerEvent) {
    if (!desktopDrag || event.pointerId !== desktopDrag.id) return
    desktopDrag = null
    if (renderer.domElement.hasPointerCapture(event.pointerId)) {
      renderer.domElement.releasePointerCapture(event.pointerId)
    }
    persist()
  }
  renderer.domElement.addEventListener('pointerdown', onPointerDown)
  renderer.domElement.addEventListener('pointermove', onPointerMove)
  renderer.domElement.addEventListener('pointerup', endPointer)
  renderer.domElement.addEventListener('pointercancel', endPointer)

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
    // Static, low-draw-call synthwave geometry avoids per-frame scene animation.
    const displayTime = formatClock(elapsedClock(clock, time))
    if (displayTime !== lastClockText) {
      lastClockText = displayTime
      updateClockTexture(displayTime)
    }
    const hovered = new Set<THREE.Object3D>()
    if (renderer.xr.isPresenting) {
      scene.updateMatrixWorld(true)
      for (const pointer of pointers) {
        const held = xrDrags.get(pointer.controller)
        if (held) {
          hitFrom(pointer.controller)
          let point: THREE.Vector3 | null = null
          if (held.mode === 'move') {
            point = raycaster.ray.at(held.distance, new THREE.Vector3())
          } else {
            point = raycaster.ray.intersectPlane(held.plane, new THREE.Vector3())
          }
          if (point) updateDrag(held, point)
        }
        scene.updateMatrixWorld(true)
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
    cards.forEach((card) => {
      const material = card.material as THREE.MeshBasicMaterial
      material.color.setHex(hovered.has(card) ? 0xc3fff1 : 0xffffff)
    })
    resizeHandles.forEach((handle) => {
      const material = handle.material as THREE.MeshBasicMaterial
      material.color.setHex(hovered.has(handle) ? 0xffffff : 0xdcbf82)
    })
    worldCards.forEach((card) => {
      const material = card.material as THREE.MeshBasicMaterial
      material.color.setHex(hovered.has(card) ? 0xc3fff1 : 0xffffff)
    })
    actionPanels.forEach((panel) => panel.scale.setScalar(hovered.has(panel) ? 1.08 : 1))
    deckButtons.forEach((button) => button.scale.setScalar(hovered.has(button) ? 1.06 : 1))
    openWorldPanel.scale.setScalar(hovered.has(openWorldPanel) ? 1.06 : 1)
    renderer.render(scene, camera)
    // Render has updated the XR camera pose; use it for head-gaze raycasts.
    updateGaze(time)
    inputBoard.visible = renderer.xr.isPresenting
    if (renderer.xr.isPresenting && time - lastInputDraw >= 450) {
      input = { ...input, sourceCount: renderer.xr.getSession()?.inputSources?.length ?? 0 }
      drawInputBoard()
      callbacks.onInput?.({ ...input })
      lastInputDraw = time
    }
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
    const onSourcesChanged = () => noteInput('INPUT SOURCES CHANGED')
    session.addEventListener('inputsourceschange', onSourcesChanged)
    session.addEventListener('end', () => {
      session.removeEventListener('inputsourceschange', onSourcesChanged)
      inputBoard.visible = false
      gazeReticle.visible = false
      connectedRays.clear()
      gaze = { target: null, since: 0, fired: false }
      gazeProgress = 0
      noteInput('SESSION ENDED')
      scene.background = new THREE.Color('#060d19')
      decor.visible = true
      workspace.position.set(0, 0, 0)
      workspace.rotation.set(0, 0, 0)
      xrDrags.clear()
      desktopDrag = null
      callbacks.onSession(null)
    })
    try {
      // WebXR AR requires a transparent scene background to expose passthrough.
      scene.background = mode === 'immersive-ar' ? null : new THREE.Color('#060d19')
      decor.visible = mode !== 'immersive-ar'
      await renderer.xr.setSession(session)
      input = { ...emptyDiagnostics(gazeEnabled), sourceCount: session.inputSources.length }
      noteInput('SESSION OPENED')
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
    renderer.domElement.removeEventListener('pointerdown', onPointerDown)
    renderer.domElement.removeEventListener('pointermove', onPointerMove)
    renderer.domElement.removeEventListener('pointerup', endPointer)
    renderer.domElement.removeEventListener('pointercancel', endPointer)
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

  callbacks.onLayout(activePreset)
  callbacks.onView(view)
  callbacks.onNote(note)
  callbacks.onClock({ time: lastClockText, running: false })
  return { enter, select: setSelected, recenter, exit, arrange, reset, setView, setNote, clockAction, setGazeAssist, deckAction, dispose }
}
