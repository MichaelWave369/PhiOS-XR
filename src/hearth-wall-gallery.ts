import { HEARTH_ARTWORKS, type HearthArtwork } from './hearth-gallery'

/** The three physical picture frames: one focus frame, two quiet preview frames. */
export type HearthWallArt = { kind: 'curated'; artwork: HearthArtwork } | { kind: 'personal'; id: string }
export type HearthWallGallery = { center: HearthWallArt; left: HearthWallArt; right: HearthWallArt }

/** Pure layout choice. No URLs, motion, user input, or implicit navigation. */
export function resolveHearthWallGallery(
  curated: HearthArtwork,
  activePersonalId: string | null,
  personalIds: readonly string[],
): HearthWallGallery {
  const ids = [...new Set(personalIds.filter((id) => id.length > 0))].slice(0, 6)
  const selectedIndex = activePersonalId ? ids.indexOf(activePersonalId) : -1
  const center: HearthWallArt = selectedIndex >= 0
    ? { kind: 'personal', id: ids[selectedIndex] }
    : { kind: 'curated', artwork: curated }

  const curatedIndex = HEARTH_ARTWORKS.indexOf(curated)
  const curatedAlternates = [
    HEARTH_ARTWORKS[(curatedIndex + 1) % HEARTH_ARTWORKS.length],
    HEARTH_ARTWORKS[(curatedIndex + 2) % HEARTH_ARTWORKS.length],
  ]
  const personalAlternates = selectedIndex < 0
    ? ids
    : ids.slice(selectedIndex + 1).concat(ids.slice(0, selectedIndex))
  const left: HearthWallArt = personalAlternates[0]
    ? { kind: 'personal', id: personalAlternates[0] }
    : { kind: 'curated', artwork: curatedAlternates[0] }
  const right: HearthWallArt = personalAlternates[1]
    ? { kind: 'personal', id: personalAlternates[1] }
    : { kind: 'curated', artwork: curatedAlternates[1] }
  return { center, left, right }
}
