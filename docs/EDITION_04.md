# PhiOS XR · Edition 04 / Interactive Field Tools

## What it actually does

Edition 04 adds two **genuinely interactive, locally rendered** tools inside the immersive scene: a Field Pad for a short private note and a Focus Clock for elapsed time. These are small built-in WebXR tools, **not remote website embeddings** or instances of the PhiOS operating system.

- **PORTALS / TOOLS** switch in the headset's right-hand spatial dock and a matching desktop control.
- In TOOLS mode, point and select the spatial character keys to type in Field Pad. SPACE, ENTER, DELETE, and CLEAR work in both desktop and XR. The note is limited to 240 characters, rendered into a canvas texture, and saved only in localStorage.
- The Focus Clock has START/PAUSE and RESET spatial actions. It uses a monotonic browser clock for elapsed time, and is intentionally a stopwatch, not a reminder or background timer.
- In 2D, a native accessible textarea edits the same Field Pad, and buttons control the Focus Clock. The 3D render updates when their values change.
- The six movable portal cards, ARC/WALL layouts, RESET, RE-CENTER, and EXIT XR remain available in portal mode.
- Quest hand input remains browser-dependent and needs physical testing.

## What it doesn't do

There is no PhiOS privileged bridge, no OS application embedding, no external website rendering in the headset, no key capture outside explicit selections, no Cloud sync, no local file access, and no AI connection.

A remote website might forbid framing with CSP or X-Frame-Options. CORS restrictions mean general DOM/iframe content cannot be turned into an ordinary WebGL CanvasTexture. Thus Edition 04 implements **its own rendered tools**, rather than pretending remote apps are directly interactive.

## Quest acceptance: edition 04

Record headset OS/browser versions and mark each step PASS, FAIL, BLOCKED, or NOT_TESTED.

- T01: Enter VR; choose TOOLS in the XR dock; portal previews hide and the two tool windows appear.
- T02: Select several keys using left and right controllers; Field Pad text changes.
- T03: Test SPACE, DELETE, ENTER, CLEAR; notes remain bounded and legible.
- T04: Enter 240 characters; input stops at limit and does not overflow the visible panel.
- T05: Start and pause Focus Clock; time accumulates, stays paused, and resets.
- T06: Exit VR; note is still present in the 2D editor and on next page load.
- T07: Change text in the 2D editor; updated text appears in the 3D tool preview.
- T08: Return to PORTALS; drag/resize remains functional without ghost interactions.
- T09: Try MR passthrough if supported; no cameras are directly accessed.
- T10: Verify hand gestures where WebXR 'select' events are emitted. Never label untested hand support a pass.

## Trust and privacy

Field Pad content is browser-local, limited, schema-checked, and **not encrypted**. Don't put passwords, tokens, or sensitive records in it. Clearing browser site storage deletes the note. The Focus Clock does not run as a background process when the page is closed.

Nothing in either tool authorizes PhiOS core effects. **Capability != authority.**
