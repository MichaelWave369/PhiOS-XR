# Edition 05 · Quest Device Lab

## Purpose

Edition 05 adds a browser-based, **local-only** physical Quest testing worksheet to the PhiOS XR web app. It does **not** unlock, flash, root, or replace Meta Horizon OS. The lab helps us establish a reproducible real-headset baseline before a native Quest APK.

## On-device procedure

1. On the Quest 3, open the deployed **HTTPS** [PhiOS XR](https://michaelwave369.github.io/PhiOS-XR/) page in Meta Quest Browser.
2. Open **QUEST DEVICE LAB** below the spatial preview. Enter headset model, firmware, and browser version manually.
3. Verify secure context / WebXR detection. These are **browser probes only**, not proof of camera passthrough, tracking accuracy, hand input, or supported hardware.
4. Run Q01–Q15 from the worksheet. Mark **PASS / FAIL / BLOCKED / NOT_TESTED**, one at a time. If a feature is unavailable, mark BLOCKED rather than implying success.
5. Test immersive interactions inside VR/MR, exit the session, and return to the lab to record outcomes. Record any stutter, comfort, permissions, or UI problems.
6. Export the JSON report using **DOWNLOAD JSON**. If headset downloads are inconvenient, use **COPY JSON** and paste into a private local note. Share a *redacted* report when opening a GitHub issue.
7. Leave unsuccessful tests as FAIL/BLOCKED; rerun after fixes. CI cannot substitute for Quest device evidence.

Session start/end and enter-error events are recorded with UTC timestamps, but a session entering successfully does **not** auto-mark any test PASS.

## Privacy & storage

The worksheet tries to save locally in the current browser's localStorage. It makes no network requests, captures no camera data, room scans, identifiers, or audio. Reports leave the device **only** if the tester uses COPY/DOWNLOAD and chooses to share them. Typed notes and environment strings may contain sensitive information, so review them before sharing. Browser privacy settings or clearing site data can erase the worksheet; export when done.

## Acceptance gate for native APK work

- Q01–Q09 and Q11–Q15 should receive genuine Quest 3 observations.
- Q10 may be BLOCKED if hand-select is unsupported, with browser version recorded.
- Document firmware, browser, commit, and real-device evidence.
- No claims of Quest qualification or independent OS replacement without real measurements.

The lab is intentionally outside the immersive scene so testing results remain accessible after XR exits.
