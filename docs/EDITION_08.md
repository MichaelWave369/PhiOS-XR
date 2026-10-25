# Edition 08 · First reproducible native PhiOS XR debug APK

This adds an **Android ARM64 OpenXR export** for the existing Godot 4.6.2 native spatial shell. The GitHub Actions workflow produces a **short-lived debug APK artifact**, then inspects its package metadata and calculates SHA-256. This is NOT an alternative operating system, bootloader operation, native Meta launcher replacement, app-store release, proof of VR rendering, or production-ready installation.

## Current scopes

- Existing [WebXR site](https://michaelwave369.github.io/PhiOS-XR/) remains unchanged and usable in Quest Browser.
- The separate Godot project at `native/quest-godot/` now contains `export_presets.cfg` with **Quest Debug**, OpenXR, Gradle, and ARM64 only.
- Workflow `.github/workflows/native-debug-apk.yml` pins a matching Godot editor and export templates, uses JDK 17 and Android SDK, installs Android Gradle templates, creates a throwaway debug signing key, runs `--export-debug`, inspects the APK, and uploads the result as a GitHub Actions artifact.
- The vendor plugin is **not** bundled in this milestone. Godot 4.6 provides a built-in generic Android OpenXR loader; Meta-specific functionality and headset runtime behavior still require research and acceptance testing.
- No camera or microphone permissions are requested by our app configuration. The OpenXR export may add platform-required features and broker declarations, which must be inspected before installation.

## Retrieve the debug APK (only after the workflow is green)

1. Open **Actions → Build PhiOS XR native debug APK** in the PhiOS-XR repository.
2. Open the successful run for the intended commit and retrieve its `phios-xr-quest-debug-<commit SHA>` artifact.
3. Unzip it. Inspect `apk-badging.txt` and verify the APK hash using `SHA256SUMS.txt`.
4. This is a developer test build, **not** proof of Quest 3 support. Do not install from unknown mirrors.

## Later: install on the physical Quest 3

In the headset, enable developer mode through the Meta-supported device/account flow, connect by USB data cable, and approve USB debugging. On your own computer, use Android Platform Tools:

```bash
adb devices
adb install -r PhiOS-XR-Quest-debug.apk
```

The package ID is `org.enterthefield.phiosxr`. Find `PhiOS XR` in the headset's developer/unknown-source app list. If `INSTALL_FAILED_UPDATE_INCOMPATIBLE` appears, the previous APK may have been signed with a different **per-run** CI debug key. Back up relevant app-local data first. Then uninstall the old debug build only if you accept losing its local app data:

```bash
adb uninstall org.enterthefield.phiosxr
adb install PhiOS-XR-Quest-debug.apk
```

Never flash, unlock, root, or modify the Quest system partition for this application.

## Evidence gate

| ID | Requirement | CI can establish? |
| --- | --- | --- |
| A01 | Godot project source parses on Linux | Yes |
| A02 | ARM64 Android APK exports and opens as a valid ZIP | Yes |
| A03 | Android package metadata exists and SHA256 is captured | Yes |
| A04 | APK can be installed through authorized ADB on Quest 3 | **No: physical test** |
| A05 | OpenXR session starts and presents stereo scene | **No: physical test** |
| A06 | Controller target rays and selections work | **No: physical test** |
| A07 | App exits gracefully to normal Meta home | **No: physical test** |
| A08 | Ten relaunches without crashes or instability | **No: physical test** |

When testing, log Quest firmware, controller mode, Godot export run commit, APK hash, any ADB errors, and individual pass/fail outcomes. **Do not confuse GitHub green with hardware green.**

## Security / provenance

Public PR artifacts are developer-signed using an ephemeral, insecure-for-distribution debug key. Do **not** ship this as a production release. No release keystore or credentials are committed to the repo, and signing data does not appear in published outputs. The artifact expires after seven days. Reproducible sources do not imply bitwise-identical debug APKs due to per-run keys and Gradle build inputs.

Follow official documentation for [Godot 4.6 Android XR](https://docs.godotengine.org/en/4.6/tutorials/xr/deploying_to_android.html) and [Godot CLI export](https://docs.godotengine.org/en/4.6/tutorials/editor/command_line_tutorial.html).
