import { describe, expect, it } from 'vitest'
import {
  MAX_NOTE_CHARS, applyPadKey, decodePad, elapsedClock, formatClock, newClock,
  pauseClock, sanitizeNote, startClock,
} from './fieldtools'

describe('spatial field pad', () => {
  it('accepts typed keys, spaces and deletion', () => {
    expect(applyPadKey('HI', 'SPACE')).toBe('HI ')
    expect(applyPadKey('HI', 'DELETE')).toBe('H')
    expect(applyPadKey('HI', 'ENTER')).toBe('HI\n')
    expect(applyPadKey('HI', 'CLEAR')).toBe('')
    expect(applyPadKey('HI', '<script>')).toBe('HI')
  })
  it('bounds imported and typed content', () => {
    expect(applyPadKey('Z'.repeat(MAX_NOTE_CHARS), 'A')).toHaveLength(MAX_NOTE_CHARS)
    expect(sanitizeNote('A\r\nB\u0000C')).toBe('A\nBC')
    expect(decodePad({ version: 1, note: 'OK' })).toBe('OK')
    expect(decodePad({ version: 5, note: 'OK' })).toBeNull()
    expect(decodePad({ version: 1, note: 'X'.repeat(MAX_NOTE_CHARS + 1) })).toBeNull()
    expect(decodePad({ version: 1, note: {} })).toBeNull()
    expect(decodePad(null)).toBeNull()
  })
})

describe('monotonic focus clock', () => {
  it('starts, accumulates, pauses and resumes without double counting', () => {
    const first = startClock(newClock(), 1000)
    expect(startClock(first, 2000)).toBe(first)
    expect(elapsedClock(first, 3500)).toBe(2500)
    const stopped = pauseClock(first, 3500)
    expect(elapsedClock(stopped, 50000)).toBe(2500)
    expect(elapsedClock(startClock(stopped, 6000), 7000)).toBe(3500)
  })
  it('does not go backward from earlier timestamps', () => {
    expect(elapsedClock(startClock(newClock(), 100), 30)).toBe(0)
    expect(formatClock(0)).toBe('00:00')
    expect(formatClock(61000)).toBe('01:01')
    expect(formatClock(3661000)).toBe('01:01:01')
  })
})
