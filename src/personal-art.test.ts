import { describe, expect, it } from 'vitest'
import { detectedRasterType, PERSONAL_ART_MAX_INPUT_BYTES, readPersonalArtMode,
  sanitizePersonalArtName, validatePersonalArtSize, writePersonalArtMode } from './personal-art'

describe('private Domistika PNG interchange', () => {
  it('accepts real PNG, JPEG or WebP signatures but never SVG/HTML masquerading as images', () => {
    expect(detectedRasterType(new Uint8Array([137,80,78,71,13,10,26,10]))).toBe('image/png')
    expect(detectedRasterType(new Uint8Array([255,216,255]))).toBe('image/jpeg')
    expect(detectedRasterType(new Uint8Array([82,73,70,70,0,0,0,0,87,69,66,80]))).toBe('image/webp')
    expect(detectedRasterType(new TextEncoder().encode('<svg onload=evil>'))).toBeNull()
    expect(detectedRasterType(new TextEncoder().encode('<!DOCTYPE html>'))).toBeNull()
  })
  it('rejects empty and oversized files before decoding', () => {
    expect(() => validatePersonalArtSize(0)).toThrow()
    expect(() => validatePersonalArtSize(-1)).toThrow()
    expect(() => validatePersonalArtSize(Infinity)).toThrow()
    expect(() => validatePersonalArtSize(PERSONAL_ART_MAX_INPUT_BYTES + 1)).toThrow()
    expect(() => validatePersonalArtSize(1000)).not.toThrow()
  })
  it('bounds untrusted filenames and mode preferences', () => {
    expect(sanitizePersonalArtName('<My Art>\n')).toBe('My Art')
    expect(sanitizePersonalArtName('')).toBe('My artwork')
    expect(sanitizePersonalArtName('A'.repeat(100)).length).toBe(64)
    let saved = ''
    const storage = { getItem: () => saved, setItem: (_: string, value: string) => { saved = value } }
    expect(readPersonalArtMode(storage)).toBe('curated')
    writePersonalArtMode(storage, 'personal')
    expect(readPersonalArtMode(storage)).toBe('personal')
    saved = 'anything-else'
    expect(readPersonalArtMode(storage)).toBe('curated')
    expect(readPersonalArtMode({ getItem: () => { throw Error('denied') } })).toBe('curated')
    expect(() => writePersonalArtMode({ setItem: () => { throw Error('denied') } }, 'personal')).not.toThrow()
  })
})
