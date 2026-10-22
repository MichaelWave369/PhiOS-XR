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

export function getPortal(id: string): Portal | undefined {
  return portals.find((portal) => portal.id === id)
}
