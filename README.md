# Φ PhiOS XR

**The Sovereign Spatial Shell · Edition 07**

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
