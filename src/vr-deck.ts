/** Pure, local-only state for the PhiOS XR synthwave VR-world carousel. */
export type Deck = { readonly order: readonly string[]; readonly active: string }
export type DeckSlot = { id: string; slot: -1 | 0 | 1 }

export function createDeck(ids: readonly string[]): Deck {
  if (ids.length === 0 || new Set(ids).size !== ids.length) {
    throw new Error('Deck requires unique, nonempty destinations')
  }
  return { order: [...ids], active: ids[0] }
}

export function selectDeck(deck: Deck, id: string): Deck {
  return deck.order.includes(id) ? { ...deck, active: id } : deck
}

export function stepDeck(deck: Deck, step: -1 | 1): Deck {
  const index = deck.order.indexOf(deck.active)
  const next = (index + step + deck.order.length) % deck.order.length
  return { ...deck, active: deck.order[next] }
}

export function shuffleDeck(deck: Deck, random: () => number = Math.random): Deck {
  const order = [...deck.order]
  // Fisher-Yates: use an injected random source in tests, without persisting state.
  for (let i = order.length - 1; i > 0; i--) {
    const n = random()
    const j = Math.min(i, Math.max(0, Math.floor((Number.isFinite(n) ? n : 0) * (i + 1))))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  // Even an improbable identical shuffle should visibly advance the deck.
  if (order.length > 1 && order.every((value, i) => value === deck.order[i])) {
    order.push(order.shift()!)
  }
  return { order, active: order[0] }
}

/** Show only three tangible cards at once: left preview / focused / right preview. */
export function deckSlots(deck: Deck): DeckSlot[] {
  const count = deck.order.length
  const index = deck.order.indexOf(deck.active)
  if (count === 1) return [{ id: deck.active, slot: 0 }]
  if (count === 2) return [
    { id: deck.active, slot: 0 },
    { id: deck.order[(index + 1) % count], slot: 1 },
  ]
  return [
    { id: deck.order[(index - 1 + count) % count], slot: -1 },
    { id: deck.active, slot: 0 },
    { id: deck.order[(index + 1) % count], slot: 1 },
  ]
}
