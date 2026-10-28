export type Portal = {
  id: string
  name: string
  subtitle: string
  description: string
  href: string
  kind: 'system' | 'intelligence' | 'exploration' | 'creative' | 'evidence'
  number: string
}

export const portals: readonly Portal[] = [
  {
    id: 'phios', name: 'PHIOS CORE', subtitle: 'The sovereign foundation',
    description: 'Local-first computation, explicit authority, and verifiable action. The XR shell is a separate, unprivileged interface.',
    href: 'https://github.com/MichaelWave369/PhiOS', kind: 'system', number: '01'
  },
  {
    id: 'vessel', name: 'SUPER Φ.VESSEL', subtitle: 'Intelligence chamber',
    description: 'Explore the multi-agent interface. Edition 01 links to the existing experience; no privileged PhiOS bridge is connected.',
    href: 'https://superphivessel.netlify.app/', kind: 'intelligence', number: '02'
  },
  {
    id: 'atlas', name: 'FIELD ATLAS', subtitle: 'The living library',
    description: 'Discover the wider MichaelWave369 project ecosystem through the evolving book of worlds.',
    href: 'https://github.com/MichaelWave369/FieldAtlas', kind: 'exploration', number: '03'
  },
  {
    id: 'constellation', name: 'CONSTELLATION', subtitle: 'The living architecture',
    description: 'Enter the visual repository universe. Future editions may embed navigable constellations directly into XR.',
    href: 'https://michaelwave369.github.io/FieldConstellation/', kind: 'exploration', number: '04'
  },
  {
    id: 'domistika', name: 'DOMISTIKA', subtitle: 'Creative laboratory',
    description: 'Experimental visual rooms and composition tools, connected here as a discoverable portal.',
    href: 'https://michaelwave369.github.io/Domistika/', kind: 'creative', number: '05'
  },
  {
    id: 'ledger', name: 'REALITY LEDGER', subtitle: 'Evidence over assertion',
    description: 'The governing principle: capability is not authority. No real ledger reads or writes are wired in this preview.',
    href: 'https://github.com/MichaelWave369/PhiOS', kind: 'evidence', number: '06'
  }
]

/** Curated, external WebXR destinations. Separate from the six saved PhiOS portals. */
export const vrWorlds: readonly Portal[] = [
  {
    id: 'domistika-xr', name: 'DOMISTIKA XR', subtitle: 'Spatial sketch studio',
    description: 'Draw on floating canvases in desktop, VR, or mixed reality. Opens a separate, experimental Domistika XR site.',
    href: 'https://michaelwave369.github.io/Domistika/xr.html', kind: 'creative', number: 'V1'
  },
  {
    id: 'btm-vr', name: 'BREAK THE MATRIX', subtitle: 'Neon Signal · VR combat',
    description: 'Michael Wave and Ori in a twelve-sector shooter. Choose Immersive VR or VR Arcade after opening the game.',
    href: 'https://michaelwave369.github.io/BTM/', kind: 'creative', number: 'V2'
  },
  {
    id: 'spark-vr', name: 'SPARK THE SUBSTRATE', subtitle: 'Immersive two-room lab',
    description: 'Explore the dedicated Spark WebXR prototype, with a desktop fallback and experimental Quest controls.',
    href: 'https://michaelwave369.github.io/SparkTheSubstrate/vr/', kind: 'exploration', number: 'V3'
  },
  {
    id: 'pulse369-vr', name: 'PULSE 369 QUEST LAB', subtitle: 'VR rhythm and tracking test',
    description: 'Public, standalone controller/rhythm practice and Quest tracking diagnostics. Not the full hosted Pulse 369 fitness studio, which currently requires access.',
    href: 'https://michaelwave369.github.io/Pulse369/quest.html', kind: 'creative', number: 'V4'
  },
  {
    id: 'lenz-xr', name: 'LENZ XR', subtitle: 'Connected reality gates',
    description: 'Explore four linked LENZ zones in its stationary, experimental immersive VR laboratory. Full 3D game mechanics are still in development.',
    href: 'https://michaelwave369.github.io/LENZ/xr.html', kind: 'exploration', number: 'V5'
  }
]

export function getVrWorld(id: string): Portal | undefined {
  return vrWorlds.find((world) => world.id === id)
}

export function getPortal(id: string): Portal | undefined {
  return portals.find((portal) => portal.id === id) ?? getVrWorld(id)
}
