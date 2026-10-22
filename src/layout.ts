/** Pure placement math. No browser globals or OS-level authority. */
export type PlacementVector = { x: number; y: number; z: number }
export type WorkspaceAnchor = PlacementVector & { yaw: number }

/** Move authored panels around a viewer at the moment of recentering. */
export function calculateWorkspaceAnchor(
  head: PlacementVector,
  forward: PlacementVector,
): WorkspaceAnchor {
  const horizontalLength = Math.hypot(forward.x, forward.z)
  const yaw = horizontalLength > 0.0001
    ? Math.atan2(-forward.x, -forward.z)
    : 0
  return { x: head.x, y: head.y - 1.62, z: head.z, yaw }
}
