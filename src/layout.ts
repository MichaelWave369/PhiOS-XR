/** Pure placement math. No browser globals or OS-level authority. */
export type PlacementVector = { x: number; y: number; z: number }
export type WorkspaceAnchor = PlacementVector & { yaw: number }

/** Move authored panels around a viewer at the moment of recentering. */
export function calculateWorkspaceAnchor(
  head: PlacementVector,
  forward: PlacementVector,
): WorkspaceAnchor {
  const horizontalLength = Math.hypot(forward.x, forward.z)
  let yaw = horizontalLength > 0.0001
    ? Math.atan2(-forward.x, -forward.z)
    : 0
  // Signed zero and the two equivalent representations of 180° are
  // normalized to stable receipts and deterministic tests.
  if (Object.is(yaw, -0)) yaw = 0
  if (yaw <= -Math.PI) yaw = Math.PI
  return { x: head.x, y: head.y - 1.62, z: head.z, yaw }
}
