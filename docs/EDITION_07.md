# PhiOS XR Edition 07 · Quest controller rescue / gaze assist

## Grounded observation (October 25, 2026)

The Quest 3 owner reported that the PhiOS XR site opened and rendered in the Quest Browser, but that controller clicks did not work; the device battery was nearly depleted. This **does not yet establish** whether the immersive WebXR VR/MR mode was entered. Treat the report as a useful first hardware observation, not Q03/Q04/Q05 PASS.

Possible causes include controller batteries/pairing, the browser remaining in ordinary 2D mode, headset/browser focus, missing XR input sources, unavailable ray poses, or a raycasting/UI bug. Do not assume which is responsible.

## What we added

- In immersive VR/MR, a live in-world **QUEST INPUT** board shows `session.inputSources.length`, Three.js controller-connected ray count, `selectstart` and completed `select` counts, and last observed event. Numbers describe API observations, not certified hardware tracking.
- The 2D workspace has a **GAZE ASSIST** checkbox, default **on**, to allow navigation without a functioning trigger.
- In immersive mode, aim the center of your view at a portal card for **2.3 continuous seconds**. A mint reticle grows as the dwell completes; the selected portal updates locally. You may also use gaze on `PORTALS`, `TOOLS`, `ARC`, or `WALL`.
- For safety, gaze cannot run `EXIT XR`, `RESET`, `RE-CENTER`, local commands, or external URLs. Use normal headset system controls to exit.
- Completed `select` controller events can also select portals, providing redundancy if the `selectstart` portal-pick path does not complete.
- After exiting XR, the Quest Device Lab shows the most recent session counters, and explicit COPY/DOWNLOAD JSON exports include these diagnostics.

## On-device test after charging

1. Charge the Quest 3 **and controllers** adequately. Verify controllers work in Meta's home interface.
2. Launch [PhiOS XR](https://michaelwave369.github.io/PhiOS-XR/) in Quest Browser. Confirm you are seeing the Edition 07 banner, and **enter immersive VR/MR**. The regular flat browser page is not an immersive acceptance test.
3. Locate the **QUEST INPUT / LIVE** board in the spatial scene. Record `SOURCES`, `RAYS`, `PRESS`, `SELECT`, and `LAST`.
4. Aim your controller at a card. Determine whether a pointer laser/reticle appears. Press/release the trigger once and compare counters before and after. If counts advance but no selection occurs, investigate ray pose and hit testing rather than pairing alone.
5. Move the center of your view onto a card and hold for about 2.3 seconds. Check whether the mint gaze reticle advances and the inspector changes. Gaze is only active in immersive XR, not the ordinary Quest Browser page.
6. Aim at the `TOOLS` action with gaze to check safe workspace switching. Avoid repetitive testing while uncomfortable; use a clear play boundary.
7. Exit VR using headset system controls. In the 2D **Quest Device Lab**, enter firmware/browser versions, mark the relevant Q items, record what happened, and optionally export a reviewed JSON report.

## Interpretation guide

| Observation | Meaning / next check |
| --- | --- |
| Site renders in flat browser | HTML/WebGL view works; VR/MR not necessarily entered |
| Immersive scene visible, `SOURCES 0` | Browser currently reports no input sources; check pairing/mode/runtime |
| `SOURCES > 0`, `RAYS 0` | Browser lists source(s), but Three.js target ray connection not observed; investigate source lifecycle |
| `PRESS` increments, portal unchanged | Controller action reached Three.js; check ray intersection/scene layers |
| Gaze selects, controller does not | Scene hit targets likely reachable; investigate controller-specific event/pose path |
| Gaze never shows the reticle | Center gaze ray may not hit safe targets, or immersive session not active |

The WebXR API explicitly distinguishes `selectstart`, completed `select`, and `selectend`. Controller hand tracking may have different input source lifecycle behavior. Do not infer platform compliance from a single session.

## Limits

No camera/audio capture, controller IDs, account data, analytics endpoint, new OS privileges or bootloader modification. Session diagnostics are transient and may be exported only on user action. Real hardware behavior remains unverified by CI.
