import { describe, expect, it } from 'vitest'
import { HEARTH_ARTWORKS, HEARTH_DEFAULT_ARTWORK, HEARTH_ART_KEY, HEARTH_ART_DETAILS,
  isHearthArtwork, readHearthArtwork, writeHearthArtwork, nextHearthArtwork } from './hearth-gallery'

describe('Hearth gallery preference', () => {
  it('defines three original, bounded studies', () => {
    expect(HEARTH_ARTWORKS).toEqual(['golden-spiral', 'field-stars', 'living-bloom'])
    expect(Object.keys(HEARTH_ART_DETAILS)).toEqual([...HEARTH_ARTWORKS])
    expect(isHearthArtwork(HEARTH_DEFAULT_ARTWORK)).toBe(true)
    expect(isHearthArtwork('javascript:alert(1)')).toBe(false)
    expect(isHearthArtwork({ url: 'https://example.com' })).toBe(false)
  })
  it('cycles gallery choices without modifying launch destinations', () => {
    expect(nextHearthArtwork('golden-spiral')).toBe('field-stars')
    expect(nextHearthArtwork('field-stars')).toBe('living-bloom')
    expect(nextHearthArtwork('living-bloom')).toBe('golden-spiral')
  })
  it('persists one validated selection and falls back on denied storage', () => {
    let saved = ''
    const store = {
      getItem: (key: string) => key === HEARTH_ART_KEY ? saved : null,
      setItem: (key: string, value: string) => { if (key === HEARTH_ART_KEY) saved = value },
    }
    expect(readHearthArtwork(store)).toBe('golden-spiral')
    expect(writeHearthArtwork(store, 'living-bloom')).toBe(true)
    expect(readHearthArtwork(store)).toBe('living-bloom')
    saved = '<script>'
    expect(readHearthArtwork(store)).toBe(HEARTH_DEFAULT_ARTWORK)
    const denied = {
      getItem: (): string => { throw new Error('denied') },
      setItem: (): void => { throw new Error('denied') },
    }
    expect(readHearthArtwork(denied)).toBe(HEARTH_DEFAULT_ARTWORK)
    expect(writeHearthArtwork(denied, 'field-stars')).toBe(false)
    expect(readHearthArtwork(null)).toBe(HEARTH_DEFAULT_ARTWORK)
  })
})
