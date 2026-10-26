# PhiOS XR Edition 10 · Quest TestFlight (Windows / USB)

**Status:** developer test utility, not a verified headset release. Edition 09's Godot OpenXR Android APK builds in GitHub Actions. Actual installation, stereo rendering and Quest controller input remain **NOT_TESTED** on physical hardware.

The TestFlight kit comes inside the GitHub Actions APK artifact ZIP, alongside the built APK, `SHA256SUMS.txt`, and `apk-badging.txt`.

## 1. Get the correct APK kit

1. In the [PhiOS-XR Actions tab](https://github.com/MichaelWave369/PhiOS-XR/actions/workflows/native-debug-apk.yml), open the most recent **successful** `Build PhiOS XR native debug APK` run for the merged `main` branch.
2. Download its `phios-xr-quest-debug-<commit>` artifact. Do not use a random third-party mirror.
3. Extract the entire ZIP into a folder on your Windows PC. Keep these five files **together**:
   - `PhiOS-XR-Quest-debug.apk`
   - `SHA256SUMS.txt`
   - `apk-badging.txt`
   - `quest-testflight.ps1`
   - `Quest-TestFlight-README.md`
4. Inspect the script's contents before running anything. The included signing key is ephemeral per CI run and the APK is not a production release.

## 2. Install the minimum external prerequisites

Quest sideloading requires a one-time development setup: a Meta developer-enabled Quest 3, a verified developer account/team, a **USB-C data cable**, and Google's Android **Platform Tools** with `adb.exe` accessible on PATH or through `-AdbPath`. Windows may also need the official Meta/Oculus ADB driver. No Android Studio or Godot installation is needed to use the prebuilt APK.

- [Meta: test your app on your headset](https://developers.meta.com/vr/documentation/android-apps/enable-developer-mode/)
- [Meta: USB/Windows device setup and ADB driver](https://developers.meta.com/vr/documentation/native/android/mobile-device-setup/)
- [Google: Android Platform Tools download](https://developer.android.com/tools/releases/platform-tools)

Use the Meta Horizon mobile app to enable **Developer Mode** for your paired headset. Connect a data-capable USB cable, put on the headset, and approve the **USB debugging** prompt. These are normal supported developer controls, not a bootloader unlock.

## 3. Verify without touching the Quest

Open PowerShell in the extracted folder:

```powershell
.\quest-testflight.ps1
```

The script checks the APK file, the manifest's **SHA-256**, the stated Android package name, and size. In default mode it does **not** need ADB and makes **no headset connection**.

If Windows prevents local PowerShell scripts from running, inspect the script and Windows file properties first; do not weaken execution policy system-wide just to launch a test.

Note: A correct checksum verifies against the provided manifest, not against GitHub's identity. Only obtain the ZIP from this repo's trusted Actions run and inspect the source/commit first.

## 4. Optional USB install

When the battery and controllers are charged and the headset shows the USB debugging authorization:

```powershell
.\quest-testflight.ps1 -Install
```

The script checks that **exactly one directly connected USB Android device** is authorized, confirms the model appears to be a Quest, and displays the headset battery. Then it requires you to type `INSTALL` before calling `adb -d install -r`.

The script does **not** enable developer mode, start ADB over Wi-Fi, root, flash, unlock, request camera/microphone data, erase packages, or bypass permissions.

If ADB is installed in a nonstandard folder, supply its full path:

```powershell
.\quest-testflight.ps1 -Install -AdbPath "C:\Android\platform-tools\adb.exe"
```

If installation fails with `INSTALL_FAILED_UPDATE_INCOMPATIBLE`, STOP. Debug APKs built by different CI runs have different signatures. The script intentionally does **not** uninstall or wipe app data. Only after reviewing/backing up app-local data and accepting its loss should you consider uninstalling `org.enterthefield.phiosxr` manually through device settings or developer tools before installing the replacement. This is **never** automatic.

## 5. Launch and capture test evidence

In Quest, open **Library → Unknown Sources** and find **PhiOS XR**. If the app launches, use [Edition 09's headset checklist](EDITION_09.md) to evaluate immersive stereo rendering, controller rays, left/right trigger presses, local selection, gaze dwell and exiting safely.

For troubleshooting, the script can save a **small, filtered local logcat snapshot**, without automatic upload:

```powershell
.\quest-testflight.ps1 -CaptureLogs
```

It saves a `local-device-logs/quest-xr-YYYYMMDD-HHMMSS.txt` beside the extracted artifact. **Review and redact logs** before sharing. Logs can still include private details or system paths even when filtered.

After testing, report: firmware version, APK run ID/commit, headset battery, whether the app launched in immersive VR, controller/trigger observations, gaze result, crash/stutter, and PASS/FAIL/BLOCKED/NOT_TESTED for Edition 09 test rows. Do not claim hardware qualification solely from a successful installation.

## Why we keep WebXR separate

The live [PhiOS XR WebXR page](https://michaelwave369.github.io/PhiOS-XR/) continues working independently. Edition 07's browser input diagnostics and Edition 09's native input map are **different runtimes**. A failure in one does not automatically diagnose the other.

**Nothing in this kit removes Meta Horizon OS or takes over the Quest boot process.**
