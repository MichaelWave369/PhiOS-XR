# Φ PhiOS XR

**The Sovereign Spatial Shell · Edition 01**

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

- **Edition 01 (this PR)**: 3D spatial dashboard + 2D accessible fallback, VR/MR entry, controller selection, optional hand-select hooks, read-only catalog, tests, CI and Pages build.
- **Edition 02**: Quest device acceptance and better input feedback, session exit UI, reposition/scale panels, performance budgets, WebXR Layers study.
- **Edition 03**: Read-only authenticated PhiOS bridge (only after separate capability/authority design and threat review).
- **Edition 04**: Stateful spatial workspaces and deeper Field Atlas / Constellation components.
- **Later**: Native Quest packaging, only after confirming API support and permission constraints; never claim this replaces Horizon OS.

## Related

Core repository: https://github.com/MichaelWave369/PhiOS

Meta WebXR guidance: https://developers.meta.com/vr/documentation/web/webxr-overview/

Meta mixed reality: https://developers.meta.com/vr/documentation/web/webxr-mixed-reality/

## License

MIT. PhiOS XR is independent of Meta and is not a Meta product.
