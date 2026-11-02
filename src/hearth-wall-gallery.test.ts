import { describe, expect, it } from 'vitest'
import { resolveHearthWallGallery } from './hearth-wall-gallery'

describe('three-frame Hearth wall art', () => {
  it('displays different original studies in all three frames without imports', () => {
    expect(resolveHearthWallGallery('golden-spiral', null, [])).toEqual({
      center: { kind: 'curated', artwork: 'golden-spiral' },
      left: { kind: 'curated', artwork: 'field-stars' },
      right: { kind: 'curated', artwork: 'living-bloom' },
    })
  })
  it('keeps the chosen personal painting centered and previews up to two neighbors', () => {
    const result = resolveHearthWallGallery('golden-spiral', 'b', ['a', 'b', 'c', 'd'])
    expect(result.center).toEqual({ kind: 'personal', id: 'b' })
    expect(result.left).toEqual({ kind: 'personal', id: 'c' })
    expect(result.right).toEqual({ kind: 'personal', id: 'd' })
  })
  it('shows only one copy of an imported painting and falls back safely', () => {
    const one = resolveHearthWallGallery('field-stars', 'one', ['one'])
    expect(one.center).toEqual({ kind: 'personal', id: 'one' })
    expect(one.left.kind).toBe('curated')
    expect(one.right.kind).toBe('curated')
    expect(resolveHearthWallGallery('living-bloom', null, ['legacy']).left)
      .toEqual({ kind: 'personal', id: 'legacy' })
  })
  it('rejects unavailable selections and bounds any duplicates in gallery metadata', () => {
    const result = resolveHearthWallGallery('field-stars', 'missing', ['a', 'a', 'b'])
    expect(result.center).toEqual({ kind: 'curated', artwork: 'field-stars' })
    expect(result.left).toEqual({ kind: 'personal', id: 'a' })
    expect(result.right).toEqual({ kind: 'personal', id: 'b' })
  })
})
