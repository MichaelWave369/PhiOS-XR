import { describe, expect, it } from 'vitest'
import { createDeck, deckSlots, selectDeck, shuffleDeck, stepDeck } from './vr-deck'

const ids = ['domistika-xr', 'btm-vr', 'spark-vr', 'pulse369-vr', 'lenz-xr'] as const

describe('synthwave VR world shuffle deck', () => {
  it('focuses one world with just two adjacent previews', () => {
    const deck = createDeck(ids)
    expect(deck.active).toBe('domistika-xr')
    expect(deckSlots(deck)).toEqual([
      { id: 'lenz-xr', slot: -1 },
      { id: 'domistika-xr', slot: 0 },
      { id: 'btm-vr', slot: 1 },
    ])
  })

  it('wraps past the last world and preserves explicit selection', () => {
    let deck = createDeck(ids)
    deck = stepDeck(deck, -1)
    expect(deck.active).toBe('lenz-xr')
    deck = stepDeck(deck, 1)
    expect(deck.active).toBe('domistika-xr')
    deck = selectDeck(deck, 'spark-vr')
    expect(deck.active).toBe('spark-vr')
    expect(selectDeck(deck, 'untrusted')).toEqual(deck)
    expect(deckSlots(deck).map((item) => item.id)).toEqual([
      'btm-vr', 'spark-vr', 'pulse369-vr',
    ])
  })

  it('shuffles every destination once without changing original order or identity', () => {
    const first = createDeck(ids)
    const shuffled = shuffleDeck(first, () => 0)
    expect(new Set(shuffled.order)).toEqual(new Set(ids))
    expect(shuffled.order).toHaveLength(ids.length)
    expect(first.order).toEqual(ids)
    expect(shuffled.active).toBe(shuffled.order[0])
    expect(shuffled.order).not.toEqual(first.order)
  })

  it('guarantees a visible change even on an identity shuffle', () => {
    const first = createDeck(ids)
    const shuffled = shuffleDeck(first, () => 0.999999)
    expect(shuffled.order).not.toEqual(first.order)
    expect(new Set(shuffled.order)).toEqual(new Set(ids))
  })

  it('rejects unusable decks and handles a single card', () => {
    expect(() => createDeck([])).toThrow()
    expect(() => createDeck(['x', 'x'])).toThrow()
    const solo = createDeck(['x'])
    expect(deckSlots(solo)).toEqual([{ id: 'x', slot: 0 }])
    expect(stepDeck(solo, 1).active).toBe('x')
  })
})
