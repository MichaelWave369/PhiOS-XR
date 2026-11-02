import { HEARTH_ARTWORKS, type HearthArtwork } from './hearth-gallery'
import type { HearthWallArt } from './hearth-wall-gallery'
import { GALLERY_EXHIBIT_COUNT } from './gallery-room'

/** Deterministic exhibit inventory; the active art is first, then local works. */
export function resolveGalleryRoomExhibits(
  selected: HearthArtwork,
  activePersonalId: string | null,
  personalIds: readonly string[],
): HearthWallArt[] {
  const ids = [...new Set(personalIds.filter((id) => id.length > 0))].slice(0, 6)
  const active = activePersonalId && ids.includes(activePersonalId) ? activePersonalId : null
  const personalItems: HearthWallArt[] = [
    ...(active ? [active] : []),
    ...ids.filter((id) => id !== active),
  ].map((id) => ({ kind: 'personal', id }))
  const startingItem: HearthWallArt[] = active ? [] : [{ kind: 'curated', artwork: selected }]
  const curatedChoices: HearthWallArt[] = HEARTH_ARTWORKS
    .filter((id) => id !== selected).concat(selected)
    .map((artwork) => ({ kind: 'curated', artwork }))
  const result = [...startingItem, ...personalItems]
  let idx = 0
  while (result.length < GALLERY_EXHIBIT_COUNT) {
    result.push(curatedChoices[idx++ % curatedChoices.length])
  }
  return result.slice(0, GALLERY_EXHIBIT_COUNT)
}
