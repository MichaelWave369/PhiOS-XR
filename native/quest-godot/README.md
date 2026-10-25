# Φ PhiOS XR · Edition 06 native prototype

This is a **separate, experimental Godot 4.6 OpenXR source project**, alongside the existing Vite/Three.js WebXR edition. It is NOT a Meta Horizon OS replacement, NOT a device launcher, and NOT an installable APK until an Android export is configured and completed.

## What the project contains

- Native `XROrigin3D`, `XRCamera3D`, and left/right `XRController3D` scene hierarchy.
- An in-world, lightweight six-card project catalog with a selection highlight.
- Safe desktop/editor fallback when an OpenXR runtime is unavailable.
- Mouse-ray and left/right key selection for desktop review.
- Initial controller-ray selection logic for `trigger_click` / `select` actions; **unverified** until mapped to and tested against a real Quest controller.
- Recenter-on-start behavior after several XR frames and a desktop `R` shortcut.
- No network calls, secrets, remote process execution, privileged bridge or system APIs.

The native catalog is currently a curated **read-only mirror** of `src/catalog.ts`. Nothing is launched by selecting a card. The browser edition stays independent and continues to deploy to GitHub Pages.

## Build and deployment (later, when hardware is available)

1. Get an official **Godot 4.6.x** editor and matching Android export templates from [Godot](https://godotengine.org/). The prototype is written against 4.6.x APIs.
2. Open `native/quest-godot/project.godot` as a Godot project. Run the scene on a desktop to inspect the fallback.
3. Install OpenJDK 17, Android SDK and the Godot Android build template using **Project → Install Android Build Template**.
4. Configure Android export settings: `Use Gradle Build`, `XR Mode: OpenXR`, ARM64 target. For Quest-specific capabilities, use the officially maintained [Godot OpenXR Vendors plugin](https://github.com/GodotVR/godot_openxr_vendors) and choose the Meta vendor configuration. Follow Godot's version-specific setup.
5. Export and sign a **debug** APK, enable Quest developer mode and use ADB / Godot one-click deploy to sideload. This is an ordinary application install, not a bootloader flash.
6. Log results on the physical headset against [the Edition 06 acceptance plan](../../docs/EDITION_06.md) and Edition 05's Quest Device Lab.

**Do not claim an APK exists from this repository alone**. Android export templates, optional vendor plugin, signing and real-device acceptance are not committed or executed by the existing WebXR CI. If a CI parse check passes, that still is not an Android APK build or evidence of headset tracking.

Official guidance: [Godot Android XR deployment](https://docs.godotengine.org/en/4.6/tutorials/xr/deploying_to_android.html) and [Godot XR scene setup](https://docs.godotengine.org/en/4.6/tutorials/xr/setting_up_xr.html).

## Controls and status

- Desktop left/right arrow: select next/previous card.
- Desktop click: select a card with a 3D ray hit.
- Desktop `R`: recenter workspace.
- Quest: render through OpenXR when initialized. Controller actions, pose reliability, persistence, passthrough and app lifecycle are **NOT_TESTED**.

The user must retain a clear play boundary; this prototype is not a passthrough safety application. Keep every portal read-only until a capability-gated native bridge is designed and reviewed.
