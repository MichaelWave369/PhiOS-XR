# PhiOS XR · ΦSpatial Scene Consumer R7

## Actual integration
PhiOS XR consumes the versioned, read-only \`phi.spatial.scene.v1\` format produced by PhiXRCommons R6. This is an **in-repository integration in a second running WebXR application**, not merely a format described in a document.

The standalone \`SpatialScenePanel\` lives below the PhiOS XR Hearth gallery and uses a local file input. A file is parsed in memory but is NOT rendered automatically. The user must explicitly press **CONFIRM · DISPLAY GHOST SCENE**. The app then renders up to 120 colored, translucent wireframe spheres and evidence markers as a distinct holographic group within its existing Three.js/WebXR scene. Switching to VR Worlds view makes the display visible from desktop or VR.

The group is fixed to the local XR workspace at a comfortable right-side exhibit position with a scale of 0.13. There is **no locomotion**, physics body, collision, user tracking, raycast target, portal launch, file-system privilege, or forced camera movement. In immersive AR/MR it is hidden to preserve passthrough clarity.

The panel can inspect the labels and unverified provenance metadata in the regular 2D browser interface. Metadata, source URLs and method names are displayed only as React text, never fetched or executed. In-headset controller selection of individual imported nodes is **not implemented** in this rung. The holograms are deliberately noninteractive, not linked to existing Hearth world picks.

## Contract
- Strict root schema, fixed \`UNVERIFIED_VISUALIZATION_ONLY\` label and \`right/Y/meter/illustrative-local\` coordinate frame.
- Two visual node classes: \`sphere\` and \`evidence-marker\`.
- Bounded 96 KB input, up to 120 nodes, bounded IDs/text/finite positions/radii, strict key names.
- Evidence markers expose source claims from one of \`synthetic\`, \`reported-measurement\`, \`model-output\`, or \`hypothesis\`. Reported measurements must provide HTTPS provenance, but are **not verified measurements**.
- Imported scenes do not include physics velocity, gravity, room access, gesture control or application authority.
- No automatic network access, cross-origin transfer, browser storage or background file reads.

## Manual acceptance gate
1. Merge PhiXRCommons R6 and use its Spatial Lab's **EXPORT PASSIVE SCENE JSON**.
2. Open PhiOS XR, select the scene file under **ΦSpatial Scene Bridge**, preview metadata and confirm display.
3. With VR Worlds active, find the stationary right-side hologram in desktop view and in a real Quest 3 VR headset; make sure portal actions and normal headset tracking are unchanged.
4. Enter MR and confirm the hologram hides; return to VR and confirm it shows.
5. Clear and import malformed, oversized and incompatible files. Verify rejected input never replaces the current scene and no new network request occurs.

CI verifies typechecking, parser tests and the app build; physical Quest performance/comfort and actual cross-application file import remain a **human field-test requirement**, not an accomplished certification.
