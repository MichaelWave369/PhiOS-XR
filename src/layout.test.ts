import { describe, expect, it } from 'vitest'
import { calculateWorkspaceAnchor } from './layout'

describe('spatial recenter placement', () => {
  it('centers on a forward-facing standing viewer', () => {
    expect(calculateWorkspaceAnchor(
      { x: 0, y: 1.62, z: 0 },
      { x: 0, y: 0, z: -1 },
    )).toEqual({ x: 0, y: 0, z: 0, yaw: 0 })
  })
  it('repositions around a seated viewer', () => {
    const position = calculateWorkspaceAnchor(
      { x: 1.5, y: 1.1, z: -2 },
      { x: 1, y: -0.5, z: 0 },
    )
    expect(position).toMatchObject({ x: 1.5, z: -2 })
    expect(position.y).toBeCloseTo(-0.52)
    expect(position.yaw).toBeCloseTo(-Math.PI / 2)
  })
  it('handles backwards facing and a near-vertical gaze', () => {
    expect(calculateWorkspaceAnchor({ x: 0, y: 1.62, z: 0 }, { x: 0, y: 0, z: 1 }).yaw)
      .toBeCloseTo(Math.PI)
    expect(calculateWorkspaceAnchor({ x: 0, y: 1.62, z: 0 }, { x: 0, y: -1, z: 0 }).yaw)
      .toBe(0)
  })
})
