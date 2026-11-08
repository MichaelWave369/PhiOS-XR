/**
 * Passive PhiSpatial Scene Interchange consumer in PhiOS XR.
 * Compatible with PhiXRCommons phi.spatial.scene.v1, frozen at its R6 schema.
 * All inputs are untrusted descriptions; never instructions or XR permissions.
 */
export const SCENE_SCHEMA = 'phi.spatial.scene.v1'
export const SCENE_TRUTH = 'UNVERIFIED_VISUALIZATION_ONLY'
export const MAX_SCENE_BYTES = 96_000
export const MAX_SCENE_NODES = 120
export const SCENE_COORDINATES = Object.freeze({
  handedness: 'right', upAxis: 'Y', unit: 'meter', origin: 'illustrative-local',
})
export const PROVENANCE_LABELS = Object.freeze({
  synthetic: 'SYNTHETIC EXAMPLE · NOT MEASURED',
  'reported-measurement': 'REPORTED MEASUREMENT · UNVERIFIED',
  'model-output': 'MODEL OUTPUT · UNVERIFIED',
  hypothesis: 'HYPOTHESIS · NOT MEASURED',
})
export type ProvenanceKind = keyof typeof PROVENANCE_LABELS
export type SpatialPoint = { x: number; y: number; z: number }
export type SpatialMetadata = {
  kind: ProvenanceKind
  unit: string
  value: number
  uncertainty: number | null
  source: string
  sourceUrl: string | null
  method: string
}
export type SpatialNode = {
  id: string
  kind: 'sphere' | 'evidence-marker'
  label: string
  position: SpatialPoint
  radius: number
  metadata: SpatialMetadata | null
}
export type SpatialScene = {
  schema: typeof SCENE_SCHEMA
  truth: typeof SCENE_TRUTH
  creator: string
  title: string
  coordinateFrame: typeof SCENE_COORDINATES
  nodes: SpatialNode[]
}
function record(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v)
}
function exact(v: unknown, keys: readonly string[]): v is Record<string, unknown> {
  return record(v) && Object.keys(v).length === keys.length &&
    Object.keys(v).every(k => keys.includes(k))
}
function finite(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v)
}
function text(v: unknown, max: number, label: string): string {
  if (typeof v !== 'string' || !v.trim() || v.length > max ||
      /[\u0000-\u001f\u007f]/.test(v)) throw new TypeError('Invalid ' + label)
  return v.trim()
}
function safeUrl(v: unknown, kind: ProvenanceKind): string | null {
  if (v === null) {
    if (kind === 'reported-measurement') throw new TypeError('Reported measurement requires HTTPS source URL')
    return null
  }
  if (typeof v !== 'string' || v.length > 500) throw new TypeError('Invalid source URL')
  let parsed: URL
  try { parsed = new URL(v) } catch { throw new TypeError('Invalid source URL') }
  if (parsed.href !== v || parsed.protocol !== 'https:' || !parsed.hostname ||
      parsed.username || parsed.password || parsed.hash) {
    throw new TypeError('Source URL must be canonical HTTPS and have no credentials or fragment')
  }
  return v
}
function position(v: unknown): SpatialPoint {
  if (!exact(v, ['x', 'y', 'z']) || !finite(v.x) || !finite(v.y) || !finite(v.z) ||
      Math.abs(v.x) > 6.1 || Math.abs(v.z) > 6.1 || v.y < -.1 || v.y > 8.1) {
    throw new RangeError('Invalid spatial position')
  }
  return { x: v.x, y: v.y, z: v.z }
}
function metadata(v: unknown): SpatialMetadata {
  if (!exact(v, ['kind','unit','value','uncertainty','source','sourceUrl','method']) ||
      typeof v.kind !== 'string' || !Object.hasOwn(PROVENANCE_LABELS,v.kind) ||
      !finite(v.value) || Math.abs(v.value) > 1e9 ||
      (v.uncertainty !== null && (!finite(v.uncertainty) || v.uncertainty < 0 || v.uncertainty > 1e9))) {
    throw new TypeError('Invalid provenance metadata')
  }
  const kind = v.kind as ProvenanceKind
  const unit = text(v.unit,24,'unit')
  if (!/^[a-zA-Z0-9 °%/^._-]+$/.test(unit)) throw new TypeError('Invalid unit')
  return {
    kind, unit, value:v.value as number, uncertainty:v.uncertainty as number | null,
    source:text(v.source,180,'source'), sourceUrl:safeUrl(v.sourceUrl,kind),
    method:text(v.method,240,'method'),
  }
}
function sameCoordinates(v: unknown): boolean {
  return exact(v,['handedness','upAxis','unit','origin']) &&
    v.handedness === SCENE_COORDINATES.handedness &&
    v.upAxis === SCENE_COORDINATES.upAxis &&
    v.unit === SCENE_COORDINATES.unit &&
    v.origin === SCENE_COORDINATES.origin
}
export function normalizeSpatialScene(v: unknown): SpatialScene {
  if (!exact(v,['schema','truth','creator','title','coordinateFrame','nodes']) ||
      v.schema !== SCENE_SCHEMA || v.truth !== SCENE_TRUTH ||
      typeof v.creator !== 'string' || !/^[a-z][a-z0-9-]{1,47}$/.test(v.creator) ||
      !sameCoordinates(v.coordinateFrame) ||
      !Array.isArray(v.nodes) || v.nodes.length > MAX_SCENE_NODES) {
    throw new TypeError('Invalid passive scene schema, provenance label or coordinate frame')
  }
  const ids = new Set<string>()
  const nodes: SpatialNode[] = v.nodes.map((node: unknown) => {
    if (!exact(node,['id','kind','label','position','radius','metadata']) ||
        typeof node.id !== 'string' || !/^[a-z][a-z0-9_-]{0,47}$/.test(node.id) ||
        ids.has(node.id) || (node.kind !== 'sphere' && node.kind !== 'evidence-marker') ||
        !finite(node.radius) || node.radius < .05 || node.radius > 1) {
      throw new TypeError('Invalid or duplicate visual node')
    }
    ids.add(node.id)
    if ((node.kind === 'sphere' && node.metadata !== null) ||
        (node.kind === 'evidence-marker' && node.metadata === null)) {
      throw new TypeError('Invalid node provenance type')
    }
    return {
      id: node.id, kind:node.kind, label:text(node.label,90,'node label'),
      position:position(node.position), radius:node.radius,
      metadata:node.metadata === null ? null : metadata(node.metadata),
    }
  })
  return {
    schema:SCENE_SCHEMA,truth:SCENE_TRUTH,creator:v.creator,
    title:text(v.title,80,'scene title'),
    coordinateFrame:{...SCENE_COORDINATES},
    nodes,
  }
}
export function parseSpatialScene(raw: string): SpatialScene {
  if (typeof raw !== 'string' || new TextEncoder().encode(raw).length > MAX_SCENE_BYTES) {
    throw new RangeError('Scene JSON exceeds 96 KB')
  }
  let parsed: unknown
  try { parsed = JSON.parse(raw) } catch { throw new TypeError('Malformed scene JSON') }
  return normalizeSpatialScene(parsed)
}
