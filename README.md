# Φ PhiOS XR

**The Sovereign Spatial Shell · Edition 11: The Φ Hearth**

An experimental, open-source WebXR workspace for Quest 3 and other compatible browsers. PhiOS XR is a **separate user interface**, not a replacement for Meta Horizon OS, and not an installation of the PhiOS x86_64 Linux image.

**Status: alpha preview.** The current build is a functioning desktop 3D scene plus a VR / mixed-reality WebXR shell. It features a portal catalog, scene selection by mouse and XR controller, optional XR hand input, capability detection, and a read-only portal inspector. Portal links open normal sites from the 2D interface. There is **no privileged bridge to PhiOS**, no autonomous agent, and no operating-system integration.

## Quick start

Requirements: Node.js 22+ and npm.

```bash
git clone https://github.com/MichaelWave369/PhiOS-XR.git
cd PhiOS-XR
npm install
npm run dev
```

Open the local URL shown by Vite (usually `http://localhost:5173`). Desktop mode is always available when WebGL works: click cards in the 3D scene or use the portal index on the left. The inspector on the right offers an **Open external project** link.

```bash
npm run typecheck
npm test
npm run build
npm run preview
```

## The Φ Hearth · living-room XR home

The default desktop and WebXR VR scene is now a warm, stationary, original 3D living room with wood flooring, a sofa, rug, coffee table, reading corner, night window, plants and a glowing fireplace. The home is a **calm starting place** rather than a neon highway. No downloadable textures, autoplay music, blinking flames, network shaders, dynamic physics or privileged operations are required. It uses simple geometry and local materials. The entire room is hidden during **immersive MR** to preserve passthrough; the same read-only shelf and controls remain available. A browser-based 2D catalog remains the accessible fallback.

The three-card carousel has become the **Hearth Shelf**. The six original PhiOS portals, saved workspace layout, local Field Pad / Focus Clock, recenter / exit controls, input diagnostics and safe gaze selection are unchanged. Gaze can select a shelf item but **cannot launch websites**. A controller select on OPEN PORTAL, or a deliberate 2D link, navigates to the selected external project. This ends the shared PhiOS XR context; it does not embed or install the destination.

### Immersive destinations (existing, experimental)

- **Domistika XR:** https://michaelwave369.github.io/Domistika/xr.html
- **Break the Matrix:** https://michaelwave369.github.io/BTM/
- **Spark the Substrate VR:** https://michaelwave369.github.io/SparkTheSubstrate/vr/
- **Pulse 369 Quest Lab:** https://michaelwave369.github.io/Pulse369/quest.html (public lab; not the account-backed studio)
- **LENZ XR:** https://michaelwave369.github.io/LENZ/xr.html (experimental stationary portals, not a full game)

### XR companions (not presented as playable immersive worlds)

- **Phi XR Commons:** https://michaelwave369.github.io/PhiXRCommons/ (shared-room work-in-progress)
- **GEN.E.WRIST:** https://michaelwave369.github.io/GenEWrist/ (context and wrist UI)
- **OverStrings:** https://michaelwave369.github.io/OverStrings/ (hand/spatial instrument research)
- **Opti-Eyes:** https://michaelwave369.github.io/Opti-Eyes/ (adaptive-optics research)

The destination links are external sites. Their current headset and cross-origin launch behavior must be verified on a Quest 3, and no shared app session, live room scanning, camera frames, Meta OS replacement or device-level privileges are claimed.

**Quest comfort acceptance:** Test seated and standing recenter, arm's-length shelf selection, controller/hand-select fallback, readable cards, stable 72/90 Hz performance where supported, 10 enter/exit cycles, and MR passthrough visibility on the actual headset. CI can verify TypeScript and unit tests, not physical comfort or device compatibility.

## Edition 12: Three quiet room moods

The Hearth has three locally stored, bounded lighting choices: **Fireside**, **Twilight**, and **Morning**. Use the accessible browser buttons or point, trigger or safely gaze-dwell over the **MOOD** button beside OPEN PORTAL inside the immersive shelf. The room's existing lights and window colors update instantly without rebuilding geometry or adding animation; no sounds, downloaded shaders, remote resources or privileged features. Each selection is saved only to this browser when storage is allowed; blocked storage falls back to Fireside without breaking navigation. The MR compositor remains transparent and the decorative room stays hidden.

Quest 3 acceptance: switch all three moods with the 2D buttons, a controller trigger, and gaze dwell; enter/exit VR and MR; ensure the MOOD target does not overlap OPEN PORTAL; check the shelf remains readable and the frame rate remains comfortable. Green CI is not a physical headset certification.

## Edition 13: Original local Hearth Gallery

A framed artwork is mounted above the Hearth sofa. Choose between three original, procedurally rendered studies: **Golden Spiral**, **Field Stars**, and **Living Bloom**. The painting texture is generated once on load, and only swapped when a new choice is made. The old GPU texture is disposed. No user files, network images, project artwork or remote integrations are loaded. These are original Φ-style studies, **not existing Domistika exports**.

Gallery controls are in the accessible browser interface and as the new **ART** button on the immersive shelf alongside MOOD and OPEN PORTAL. Controller selection and the existing 2.3-second safe gaze dwell may change art without leaving PhiOS XR. As with mood, preferences use a bounded local-storage value with safe defaults if storage is disabled. **Gaze still cannot launch external links**. The gallery and other room decor are hidden in immersive AR so passthrough remains unobstructed.

Quest hardware acceptance: verify artwork is legible from seated and standing viewpoints; select all three gallery styles using 2D buttons, controller selection and safe gaze; check the ART and OPEN PORTAL targets are distinct and do not cause unintended navigation; confirm VR and MR entry/exit, local preference persistence, and acceptable frame rate.

## Edition 14: Domistika-to-Hearth personal art (single local slot)

**Domistika XR already supports Export PNG** for flat-canvas/easel paintings. Export a PNG at [Domistika XR](https://michaelwave369.github.io/Domistika/xr.html), then open the [PhiOS XR Hearth](https://michaelwave369.github.io/PhiOS-XR/), choose **IMPORT DOMISTIKA PNG**, and pick that local exported file. JPEG and WebP raster images are also accepted. The file is magic-byte checked, input-limited to 8 MB and 32 megapixels, rendered with preserved aspect ratio onto a 1024×768 neutral matte, and saved only as a prepared PNG in this browser's IndexedDB when storage is available. Untrusted SVG, HTML, file URLs and project JSON are not accepted.

**One personal-art slot** can be shown as **MY ART** alongside the original Golden Spiral / Field Stars / Living Bloom choices. The immersive **ART** control cycles the original choices plus MY ART if you have imported one. Its trigger and safe gaze dwell change only the picture; **external navigation still requires explicit OPEN PORTAL**. IMPORT and REMOVE actions remain visible 2D file controls, which cannot silently open device files from a headset XR session. No automatic cloud sync, import from another origin, server upload, Domistika JSON editing, 3D GLB preview, or transfer between desktop and Quest is claimed.

The file-picker import displays the art even if IndexedDB is blocked (session only); when persistence succeeds it restores across browser visits on the **same origin and device**. To remove PhiOS XR's local copy, use **REMOVE LOCAL COPY** after confirming; the original Domistika PNG is never altered. The gallery remains hidden in MR passthrough and image texture replacement disposes old GPU textures.

**Quest acceptance checklist:** export one Domistika painting to PNG and explicitly import it through Quest Browser's normal file picker *outside immersive mode*, then enter VR and confirm MY ART appears in the wall frame. Cycle ART from a controller and gaze; verify frame visibility, no inadvertent OPEN PORTAL activation, MR passthrough, seated/standing comfort, and same-device reloading. Desktop imports do not appear automatically on Quest because browsers and devices do not share storage. CI cannot certify physical Quest behavior.

## Edition 15: Private six-piece Domistika Gallery

The Hearth now holds **up to six personal PNGs** from explicit Domistika XR Export PNG actions, plus three original procedural studies. A two-column browser gallery lets you view or remove individual local paintings; the immersive **ART** panel cycles all three original pieces followed by the imported set. The room still displays one framed picture at a time so Quest rendering doesn't add several full-resolution textures.

**Existing users keep their painting:** the original Edition 14 IndexedDB entry remains untouched under \`personal-painting\` and appears as the first personal item with ID \`legacy\`. Additional imports use separate random UUID keys. Deleting one picture only removes that entry. No silent replacement or eviction when the six-item limit is reached. Data stays in the same browser origin, and session-only fallback remains possible when IndexedDB writes are blocked.

Input validations, 8 MB file and 32 MP decode limits, 1024×768 texture limit, no remote image fetching, no automatic device sync, and explicit-only OPEN PORTAL navigation are retained. **ART** cycles choices using the existing controller-select and safe gaze. Importing/deleting still requires browser UI, never a headset gaze action.

Quest QA: test migration with one preexisting personal picture; import up to six PNGs and confirm a seventh is refused; cycle all nine artworks in VR; delete a currently displayed image; reload and confirm remaining images persist on that device; verify MR decor remains hidden and controller/hand input and comfort. Automated checks do not replace physical headset testing.

## Edition 16: Three-frame living-room gallery wall

The Hearth now physically displays **three framed artworks at the same time**. The main painting over the sofa remains the currently selected Domistika or procedural piece. The former mantel picture over the fireplace becomes a right-hand preview, while a new left-wall picture joins the reading corner without covering the existing window. It is **not a new room, nor free locomotion yet**. The three artworks are visible by turning toward their frames in the existing living room.

The two peripheral preview frames show other distinct local paintings from the saved six-piece collection when available, falling back to the remaining original geometric studies. ART controller select and gaze dwell remain selection-only, updating the three-frame arrangement with no external navigation. No extra fetches or auto-play; gallery texture changes run on selection/import/removal only, never once per animation frame. Peripherals downsample personal paintings to 512×384. The main selected frame still retains the 1024×768 prepared image.

Existing local image records, source Domistika PNGs, preference formats, and the Quest input/navigation scheme stay unchanged. In MR passthrough the entire decorative room including all three frames remains hidden.

**Hardware gate:** On Quest 3, check paintings are visible and correctly face the viewer from a comfortable seated/standing position; switch among originals and six personal artworks, ensure per-frame previews change without stutter, inspect the left-wall picture's orientation, MR transparency and comfort. Only an on-headset test can qualify layout and performance.

## Edition 17: Φ Gallery Room (stationary comfort-first room switch)

**The Φ Hearth now has two connected virtual interiors.** The cozy Hearth retains its original sofa, fireplace, three framed works, world shelf, tools, and system portals. From the headset shelf use the new **GALLERY** panel, or the accessible **ART GALLERY** browser button, to enter a dedicated small exhibition room with six framed paintings. Use the in-room **HEARTH** return panel to go home, or **NEXT ART** to cycle the selected painting. Both rooms reuse the same WebXR session, camera, tracked position and controls. The room **swaps environments around your stationary headset** at an explicit click/trigger, with **no continuous artificial locomotion, camera animation, involuntary turning, or teleporting of the tracked player**. This is a room transition, not real physical room-scale navigation.

The room draws six local exhibit frames: two on the rear wall and two facing inward on each side wall. It shows the currently selected personal painting first when available, then the other saved Domistika pieces, and fills any empty positions from our three locally generated studies. Local imported canvases appear as 512×384 textures in the gallery to limit GPU use. Exhibit textures update only on entering the gallery or changing the saved collection/selection, and old textures are disposed. Files never upload; Edition 14–16 local IndexedDB and preference formats remain unchanged. Gallery frames are **decorative only** and cannot open links, edit paintings, or request privileges.

**Safety:** The environment switch requires explicit controller select or pointer click, *not* gaze-dwell, so the room cannot unexpectedly change when you look at a control. Safe ART gaze cycling remains. Existing OPEN PORTAL navigation is only available in the Hearth and still requires explicit activation. Mixed reality hides both virtual rooms and leaves passthrough transparent; returning to VR/desktop shows the chosen environment again.

**Quest acceptance:** In Quest Browser enter VR, use GALLERY, turn your head (or physically turn safely) to inspect all six pictures, click NEXT ART, return with HEARTH, and confirm controls remain selectable, seated/standing head motion is tracked, no nausea/unwanted movement, stable frame rate, and MR passthrough remains visible. Confirm desktop view, stored personal PNGs and portal launches remain intact. CI cannot certify headset comfort or FPS.

## Quest 3 testing

1. Use the GitHub Pages deployment at `https://michaelwave369.github.io/PhiOS-XR/` **after** the deployment workflow has succeeded and GitHub Pages is configured for **GitHub Actions**.
2. Open the HTTPS URL in **Meta Quest Browser**. Use `ENTER VR` for `immersive-vr` or `ENTER MR` for `immersive-ar`, if supported.
3. Select a 3D panel with a controller trigger. Hand tracking is requested as an optional feature; its select/pinch behavior depends on the runtime and must be verified on-device.
4. Leave immersive mode with headset/system controls, then use the normal 2D inspector to open the selected external project.

**Important:** WebXR normally requires a secure context (HTTPS or localhost). Accessing a local dev server from the Quest via plain `http://LAN-IP:5173` does not meet the secure-context requirement. Use the HTTPS deployment or configure local HTTPS with a headset-trusted certificate.

The renderer uses transparent background in immersive AR so the browser's passthrough compositor can show the room. It does **not** receive raw passthrough camera frames, and does not perform room scanning or spatial anchoring. The desktop fallback does not simulate headset tracking.

## Current modules

- Φ PhiOS Core: architecture and governed runtime source.
- Super Φ.Vessel: multi-agent experience (external portal).
- Field Atlas: living library (external portal).
- Field Constellation: repository universe (external portal).
- Domistika: creative visual rooms (external portal).
- Reality Ledger: principle and architecture (placeholder portal; no ledger adapter).

Links are curated static metadata. They are not imported executables or integrations.

## Security and authority

The browser page has **no host-process execution**, no PhiOS lease issuance, no file-system or memory read, no secrets, and no authority broker. Future bridges must adhere to the underlying PhiOS rule **capability != authority**: explicit operator approval, origin binding, least privileges, independently verifiable receipts, and no ambient commands. See [SECURITY.md](SECURITY.md).

## Roadmap

- **Edition 01 (merged)**: 3D spatial dashboard + 2D accessible fallback, VR/MR entry, controller selection, optional hand-select hooks, read-only catalog, tests, CI and Pages build.
- **Edition 02**: Quest device acceptance and better input feedback, session exit UI, reposition/scale panels, performance budgets, WebXR Layers study.
- **Edition 03**: Read-only authenticated PhiOS bridge (only after separate capability/authority design and threat review).
- **Edition 04 (merged)**: Stateful spatial workspaces and deeper Field Atlas / Constellation components.
- **Edition 05**: Quest Device Lab for real-headset acceptance evidence (web-only; no native launcher yet).
- **Later**: Native Quest packaging, only after confirming API support and permission constraints; never claim this replaces Horizon OS.

## Related

Core repository: https://github.com/MichaelWave369/PhiOS

Meta WebXR guidance: https://developers.meta.com/vr/documentation/web/webxr-overview/

Meta mixed reality: https://developers.meta.com/vr/documentation/web/webxr-mixed-reality/

## License

MIT. PhiOS XR is independent of Meta and is not a Meta product.

## Edition 02 Quest interaction upgrade

Two controls now exist **inside** the immersive environment, alongside the lower information panel:

- **RE-CENTER** moves the workspace ahead of your current direction at a height matched to your head.
- **EXIT XR** ends the WebXR session, returning to the ordinary browser page.

The XR target rays now have visible controller lasers and reticles. Hovered portals and action panels enlarge slightly. Press select to navigate or activate an in-world control.

Controllers use the standard WebXR `select` event. Hand-tracked input may emit the same event in supported browser configurations. This remains **untested on Quest hardware** and cannot be claimed as universal pinch support. The desktop mouse continues to work, and auxiliary HTML buttons appear for session control where visible.

Document real on-headset results in [the Quest acceptance checklist](docs/QUEST_ACCEPTANCE.md). Do not claim that VR, MR, hand input, physical performance, or stability is qualified from CI alone.


## Edition 03: Spatial Window Manager

Edition 03 introduces spatial **preview-panel** manipulation. On desktop, drag a panel with your mouse or pointer to move it; drag its gold corner handle to resize. On headsets, hold controller select over a panel or handle, move the ray and release. WebXR hand select may work on supported runtimes, but real Quest testing is still required.

**ARC** and **WALL** presets rearrange the scene. **RESET** discards browser-saved placement, returning to ARC. A validated version-1 workspace snapshot is saved to the current browser's localStorage on successful manipulation, subject to browser storage permissions. Controls are duplicated in the immersive scene on the right-hand side and in the regular page.

These are **not embedded websites**, remote desktop streams, OS windows, or privileged applications. Projects remain curated outbound links used from the 2D inspector after leaving XR. The UI has no PhiOS runtime authority.

See [Edition 03 documentation](docs/EDITION_03.md) for controls, acceptance and security scope.


## Edition 04: Interactive Field Tools

Switch from **PORTALS** to **FIELD TOOLS** using the browser controls or the in-headset spatial dock. Two real, first-party WebGL tools become active:

1. **Field Pad**: Write a short note (up to 240 characters) with a spatial alphabet keyboard in VR or the native desktop textarea. Notes save to this browser's localStorage on edits. There is no Cloud sync or encryption.
2. **Focus Clock**: Start, pause, resume or reset a local elapsed-time stopwatch, using either headset actions or normal HTML buttons. It is not a background scheduler, reminder or alarm.

**PORTALS** returns to six movable project cards; earlier layouts and placement are preserved. This milestone does not attempt remote websites as WebGL textures, because ordinary iframe content is not freely available to the renderer and many sites forbid embedding. The real project destinations remain outbound links.

Physical Quest controller/hand acceptance and mixed reality behavior are still **NOT_TESTED**. See [Edition 04 acceptance](docs/EDITION_04.md) for the manual test plan.


## Edition 05: Quest Device Lab

A collapsible **Quest Device Lab** below the existing workspace provides a physical Quest 3 acceptance worksheet for Q01–Q15. Each check is manually marked PASS/FAIL/BLOCKED/NOT_TESTED; browser WebXR capability probes are displayed separately and **never** treated as proof of device compatibility. Device, firmware, browser and observations are entered by the tester. The page logs immersive session start/end and entry errors, saves the worksheet in browser localStorage when allowed, and supports explicit JSON download or clipboard copy. No network submission, device rooting, Meta OS replacement, or camera access is added.

Follow [the Edition 05 test protocol](docs/EDITION_05.md) before making on-device claims. Physical hardware results remain **NOT_TESTED** until somebody runs the acceptance matrix on a real headset.


## Edition 06: Native Quest/OpenXR source prototype

A **separate** native Godot 4.6.x project now lives under [`native/quest-godot/`](native/quest-godot/README.md). It contains an OpenXR scene and six local, read-only spatial portal cards, plus a desktop fallback and a dedicated Godot CI parse/smoke workflow. **No Android APK is built or installed; native headset behavior is untested.**

- Source and deployment prerequisites: [native Quest project](native/quest-godot/README.md)
- Native hardware acceptance requirements: [Edition 06 checklist](docs/EDITION_06.md)
- The WebXR shell remains the deployable GitHub Pages application; Edition 07 adds input diagnostics and gaze assistance.

Godot smoke tests only validate desktop source loading. Android export and Quest 3 testing require a separate physical-device gate. Neither project replaces Meta Horizon OS.


## Edition 07: Quest controller rescue

An initial physical Quest 3 browser visit successfully loaded the site, but the tester reported that the controllers could not select objects. We have **not yet established whether immersive VR/MR was entered or whether the issue originated in controller power, browser focus, WebXR source exposure or scene raycasting**.

Edition 07 adds a *nonprivileged* in-headset live input readout (source count, connected target rays, selectstart/select event counts, last input event) and a deliberately restricted **gaze assist**. Gaze is on by default and can be switched off in the 2D workspace before entering XR. Hold your gaze on a portal or a safe mode/layout button for 2.3 seconds; a growing mint reticle indicates the dwell progress. Gaze **cannot** invoke EXIT XR, RESET, RE-CENTER, remote links or privileged actions. All portal selection remains read-only.

After exiting immersive mode, Quest Device Lab shows the last input counters and includes them in an explicitly exported JSON report. No network telemetry or personal controller identifiers are collected.

Follow the [Edition 07 test protocol](docs/EDITION_07.md). Green GitHub CI does not prove on-device controller compatibility or actual headset interaction.


## Edition 08: Native Quest debug APK build pipeline

The separate Godot 4.6.2 project includes an ARM64 Android OpenXR debug export preset. A dedicated [GitHub Actions workflow](.github/workflows/native-debug-apk.yml) assembles a **short-lived developer APK artifact** without needing the Quest 3 connected. If the workflow passes, inspect its APK, SHA-256 and Android metadata under Actions → Artifacts. The [Edition 08 runbook](docs/EDITION_08.md) covers installation and testing.

This is still **not tested on physical Quest hardware**, does not replace Meta Horizon OS, and is not a production-signed release. The built-in Godot 4.6 Android OpenXR loader is an initial generic path; Meta-specific integrations may be needed later. The existing WebXR site is unaffected.


## Edition 09: Native controller input readiness

The **native Godot** app now carries a minimal explicit OpenXR action map, tracked controller aim beams, in-world press/hit counters and head-forward dwell selection of *read-only* portal cards. This is separate from Edition 07's WebXR browser diagnostics. The [Edition 09 test protocol](docs/EDITION_09.md) makes no on-headset claims until real Quest 3 testing. Both native CI and the debug APK workflow must remain green before considering installation.


## Edition 10: Quest TestFlight, the real-device gate

A Windows-friendly **local-only Quest test kit** is now bundled with every successful native APK Actions artifact. After extracting the ZIP, `quest-testflight.ps1` verifies SHA-256 and Android package metadata by default, without touching a headset. A user must expressly supply `-Install`, connect **one authorized USB Quest**, and type `INSTALL` before it uses supported ADB sideloading. `-CaptureLogs` is separate, opt-in, and saves filtered diagnostics locally for review.

No firmware flashes, bootloader access, automatic uninstalls, remote uploads, secrets, or automatic execution are introduced. Native immersive display and controller compatibility remain **NOT_TESTED on physical Quest hardware**.

See the [Edition 10 Quest TestFlight runbook](docs/EDITION_10.md) and [Windows PowerShell test tool](tools/quest-testflight.ps1). Only obtain debug APKs from this repo's successful GitHub Actions runs.
