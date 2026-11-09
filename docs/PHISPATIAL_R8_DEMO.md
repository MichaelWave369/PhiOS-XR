# PhiOS XR R8: Built-in ΦSpace Dynamics demonstration

## Why this rung exists
R7 provides an actual consumer of PhiXRCommons' strict passive scene interchange contract, but using it in a Quest browser previously required manually exporting a JSON file in one app and selecting it in another. That is a cumbersome first acceptance step.

R8 bundles an example scene of **four initial physics orbs** and **18 invented sinusoidal Evidence Lens markers**. The dataset mirrors the default R1/R4 producer demo geometry, with the exact \`phi.spatial.scene.v1\` metadata vocabulary introduced in R6. The fixture is checked into \`src/fixtures/phi-spatial-synthetic-r6.json\` and loaded through the SAME strict \`parseSpatialScene\` validator as user-selected files. It is not fetched from a remote website and cannot silently write state.

## Using it
Open PhiOS XR in desktop or Quest Browser. In **ΦSPATIAL SCENE BRIDGE**, select **LOAD BUILT-IN ΦSPACE DEMO**. Review the pending description and press **CONFIRM · DISPLAY GHOST SCENE**. In VR Worlds view the lab displays a stationary holographic cluster to the viewer's right. Press **ENTER VR** to verify inside the headset. You can inspect evidence marker metadata in the browser UI, or clear the entire scene when finished.

The 2D import and confirmation buttons are not yet in-world XR controls. Complete staging in the browser UI before entering VR. The hologram is intentionally hidden in MR passthrough. The sample itself is not a scientific measurement, real OMEGA dataset or endorsement of source claims.

## What CI proves
Three new tests verify the bundled JSON passes the R6 consumer contract, has 4 passive spheres and 18 evidence markers, never grants gesture/network/physics authority, and is reparsed on each load. Existing import and parser tests continue to run with the normal TypeScript/build gates.

## Still requiring hardware testing
A human must confirm actual rendered placement, field-of-view visibility, legibility and headset comfort using Quest 3. The fixture is **producer-shaped**, but a full end-to-end export from the running PhiXRCommons page imported into the current PhiOS XR deployment is still a separate acceptance gate. There is no WebXR hardware certification merely from a green CI run.
