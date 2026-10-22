import { describe, expect, it } from 'vitest'
import { clampPanelSize, clampPosition, decodeWorkspace, presetPanels } from './workspace'

describe('spatial workspace model', () => {
  it('generates distinct arc and wall arrangements for all six portals', () => {
    const arc = presetPanels('arc')
    const wall = presetPanels('wall')
    expect(arc).toHaveLength(6)
    expect(wall).toHaveLength(6)
    expect(new Set(arc.map((p) => p.id)).size).toBe(6)
    expect(new Set(wall.map((p) => p.id)).size).toBe(6)
    expect(arc[0].position.z).not.toBe(wall[0].position.z)
  })
  it('limits extreme scale or movement so a window cannot be permanently lost', () => {
    expect(clampPanelSize(100)).toBe(1.8)
    expect(clampPanelSize(-12)).toBe(0.75)
    expect(clampPanelSize(Infinity)).toBe(1)
    expect(clampPosition({ x: 999, y: -100, z: 0 })).toEqual({ x: 3.2, y: 0.6, z: -0.85 })
  })
  it('accepts valid snapshots and clamps imported values', () => {
    const panels = presetPanels('arc')
    panels[1].scale = 20
    const snapshot = decodeWorkspace({ version: 1, preset: 'arc', panels })
    expect(snapshot?.panels[1].scale).toBe(1.8)
  })
  it('rejects poisoned schemas, duplicate IDs, unsupported versions and NaN', () => {
    const panels = presetPanels('wall')
    expect(decodeWorkspace({ version: 2, preset: 'wall', panels })).toBeNull()
    expect(decodeWorkspace({ version: 1, preset: 'wall', panels: [panels[0], ...panels.slice(0, 5)] })).toBeNull()
    expect(decodeWorkspace({ version: 1, preset: 'wall', panels: panels.map((p, i) => i ? p : { ...p, scale: NaN }) })).toBeNull()
    expect(decodeWorkspace({ version: 1, preset: 'not-a-layout', panels })).toBeNull()
    expect(decodeWorkspace(null)).toBeNull()
  })
})
