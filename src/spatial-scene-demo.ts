/**
 * Explicitly user-staged bundled example matching PhiXRCommons R6's
 * four default orbs and 18 invented sinusoidal evidence points.
 * Data is illustrative and never proof of measured physical behavior.
 */
import example from './fixtures/phi-spatial-synthetic-r6.json'
import {parseSpatialScene, type SpatialScene} from './spatial-scene'
export function loadBundledSpatialDemo(): SpatialScene {
  // Use exactly the same strict parser as local file import.
  return parseSpatialScene(JSON.stringify(example))
}
