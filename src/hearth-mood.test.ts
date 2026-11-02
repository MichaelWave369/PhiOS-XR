import { describe, expect, it } from 'vitest'
import {
  HEARTH_DEFAULT_MOOD, HEARTH_MOODS, HEARTH_MOOD_STYLES, HEARTH_MOOD_KEY,
  isHearthMood, nextHearthMood, readHearthMood, writeHearthMood,
} from './hearth-mood'

describe('local-only Hearth ambience', () => {
  it('has three bounded lighting profiles and a stable safe default', () => {
    expect(HEARTH_MOODS).toEqual(['fireside', 'twilight', 'morning'])
    expect(Object.keys(HEARTH_MOOD_STYLES)).toEqual([...HEARTH_MOODS])
    expect(HEARTH_DEFAULT_MOOD).toBe('fireside')
    expect(isHearthMood('morning')).toBe(true)
    expect(isHearthMood('#ff0000')).toBe(false)
    expect(isHearthMood({ script: 'bad' })).toBe(false)
  })

  it('cycles deterministically without creating unbounded presets', () => {
    expect(nextHearthMood('fireside')).toBe('twilight')
    expect(nextHearthMood('twilight')).toBe('morning')
    expect(nextHearthMood('morning')).toBe('fireside')
  })

  it('reads and writes only a validated local enum', () => {
    let saved = ''
    const store = {
      getItem: (key: string) => key === HEARTH_MOOD_KEY ? saved : null,
      setItem: (key: string, value: string) => { if (key === HEARTH_MOOD_KEY) saved = value },
    }
    expect(readHearthMood(store)).toBe('fireside')
    expect(writeHearthMood(store, 'morning')).toBe(true)
    expect(readHearthMood(store)).toBe('morning')
    saved = 'file:///not-a-room'
    expect(readHearthMood(store)).toBe('fireside')
    expect(readHearthMood(null)).toBe('fireside')
  })

  it('fails gracefully when local storage is denied', () => {
    const denied = {
      getItem: (): string => { throw new Error('blocked') },
      setItem: (): void => { throw new Error('blocked') },
    }
    expect(readHearthMood(denied)).toBe('fireside')
    expect(writeHearthMood(denied, 'twilight')).toBe(false)
  })
})
