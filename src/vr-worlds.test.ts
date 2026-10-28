import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { getPortal, getVrWorld, portals, vrWorlds } from './catalog'
import { decodeWorkspace, presetPanels } from './workspace'
import { safeGazeTarget } from './xr-input'

describe('five curated VR destinations', () => {
  it('points to the actual XR entries, including Pulse 369 Quest Lab and LENZ XR', () => {
    expect(vrWorlds.map(({ id, href }) => [id, href])).toEqual([
      ['domistika-xr', 'https://michaelwave369.github.io/Domistika/xr.html'],
      ['btm-vr', 'https://michaelwave369.github.io/BTM/'],
      ['spark-vr', 'https://michaelwave369.github.io/SparkTheSubstrate/vr/'],
      ['pulse369-vr', 'https://michaelwave369.github.io/Pulse369/quest.html'],
      ['lenz-xr', 'https://michaelwave369.github.io/LENZ/xr.html'],
    ])
    for (const world of vrWorlds) {
      expect(getPortal(world.id)).toEqual(world)
      expect(getVrWorld(world.id)).toEqual(world)
      expect(new URL(world.href).protocol).toBe('https:')
    }
    expect(getVrWorld('phios')).toBeUndefined()
    expect(getVrWorld('nonexistent')).toBeUndefined()
    expect(getVrWorld('pulse369-vr')?.description).toContain('Not the full hosted Pulse 369 fitness studio')
    expect(getVrWorld('lenz-xr')?.description).toContain('stationary')
    expect(new Set(vrWorlds.map(({ id }) => id)).size).toBe(vrWorlds.length)
  })

  it('does not break existing six-portal locally saved workspace snapshots', () => {
    expect(portals).toHaveLength(6)
    expect(vrWorlds).toHaveLength(5)
    const panels = presetPanels('arc')
    expect(panels).toHaveLength(6)
    expect(decodeWorkspace({ version: 1, preset: 'arc', panels })?.panels).toEqual(panels)
  })

  it('allows gaze to select a VR card or switch mode, never launch a world', () => {
    expect(safeGazeTarget('spark-vr')).toBe('portal:spark-vr')
    expect(safeGazeTarget('lenz-xr')).toBe('portal:lenz-xr')
    expect(safeGazeTarget('pulse369-vr')).toBe('portal:pulse369-vr')
    expect(safeGazeTarget(undefined, 'worlds')).toBe('action:worlds')
    expect(safeGazeTarget(undefined, 'launch-world')).toBeNull()
  })

  it('keeps the five spatial panels in a two-row layout distinct from the saved six', () => {
    const source = readFileSync(new URL('./world.ts', import.meta.url), 'utf8')
    expect(source).toContain('const columns = Math.min(3, vrWorlds.length)')
    expect(source).toContain('const row = Math.floor(index / columns)')
    expect(source).toContain('const rowCount = Math.min(columns, vrWorlds.length - row * columns)')
    expect(source).toContain('2.30 - row * 0.97')
  })

  it('requires explicit spatial OPEN WORLD activation for navigation', () => {
    const world = readFileSync(new URL('./world.ts', import.meta.url), 'utf8')
    expect(world).toContain("else if (action === 'launch-world' && view === 'worlds')")
    expect(world).toContain('if (world) window.location.assign(world.href)')
    expect(world).toContain('const gazeTargets: THREE.Mesh[] = [...cards, ...worldCards, ...actionPanels]')
    expect(world).not.toMatch(/gazeTargets:.*openWorldPanel/)
  })
})
