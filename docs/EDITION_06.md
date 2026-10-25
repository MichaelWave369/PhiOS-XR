# Edition 06 · Native OpenXR / Quest 3 proof of concept

## Motivation

Edition 05 is a WebXR application in the browser. Edition 06 begins a true **native** immersive app path with open-source Godot + OpenXR rather than placing the website inside an Android WebView (a WebView wrapper by itself does not provide reliable immersive WebXR runtime support).

## Scope

| Capability | Status |
| --- | --- |
| Native Godot scene/source | Implemented in `native/quest-godot/` |
| OpenXR runtime detection | Source implemented; physical test pending |
| Read-only spatial portal cards | Source implemented; desktop/Quest acceptance pending |
| Selection by desktop click/keys | Source implemented; runtime test pending |
| Controller-ray selection | Source implemented; bindings + Quest test pending |
| Android ARM64 debug APK | NOT BUILT |
| Device installation & permissions | NOT TESTED |
| Native Quest passthrough MR | NOT IMPLEMENTED |
| Hand tracking | NOT IMPLEMENTED |
| Launch external projects | NOT IMPLEMENTED (intentional) |
| Replace Meta Horizon OS / bootloader | OUT OF SCOPE |
| Native integration with PhiOS/Keyhole | NOT IMPLEMENTED |

## Next acceptance gate

N01: Godot project imports with no errors in a compatible 4.6 editor (CI parse check where available).

N02: Desktop preview displays six distinct cards with no XR runtime present.

N03: Arrow key and mouse selection highlight the correct card, without external navigation.

N04: Android ARM64 debug APK exports and installs via developer mode/ADB, without root.

N05: The Quest starts native OpenXR with a stable immersive view.

N06: Panels remain world-stable while seated and while turning within a safe boundary.

N07: Controller trigger/select actions hit and highlight a card; record the action map actually used.

N08: Exiting with Meta system controls returns to Horizon OS without crash.

N09: Relaunch the application ten times; record loss of tracking, crashes or heat issues.

N10: Confirm no privileged file reads, credentials, outbound network calls, or device OS changes.

Record Godot version, Android SDK, Quest firmware, headset model, controller mappings, commit SHA, each Nxx result and relevant redacted logs. CI only supports source-level confidence. A native APK and all physical behavior require separate validation.

## Architecture

```
Quest 3 hardware
  └─ Meta Horizon OS / Android XR runtime (unchanged)
      └─ Native PhiOS XR debug APK (planned)
          ├─ OpenXR and Godot scene
          ├─ Local six-portal catalog (read-only)
          └─ Future PhiOS / PhiKeyhole bridge (not authorized or wired)
```

Target future vendors through OpenXR, but do not assume current Quest-specific Android packaging will run unmodified on other headsets. Do not request permissions unless a concrete feature requires them.

## Security boundary

No custom firmware, bootloader access, root, sideload bypass, raw camera capture or OS replacement. Never label a `green` test workflow as proof of Quest-native support. Users should install only builds whose signing source and contents they trust.
