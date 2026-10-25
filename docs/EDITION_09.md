# Edition 09 · Native Quest controller readiness and input diagnostics

## Scope and status

Edition 09 improves the **native Godot OpenXR APK**, not the existing WebXR page. No physical Quest 3 APK acceptance has been reported. CI proves resource integrity and package compilation only; controller tracking, OpenXR startup, comfort and render stability remain NOT_TESTED on headset.

## What changed

- `openxr_action_map.tres` explicitly declares one `phios` action set, an `aim_pose` and `trigger_click` action, and bindings for the Oculus Touch controller and generic OpenXR simple controller. The Touch trigger is bound to its analog trigger value as a Bool action using the OpenXR type conversion documented by Godot; headset thresholds remain runtime-dependent.
- Left and right `XRController3D` nodes now request `aim_pose` instead of the implicit default pose.
- When tracking data is present, a visible ray extends forward from each controller. It is hidden when tracking is absent.
- The native shell counts trigger-press callbacks and successful local portal hits separately and shows last input/tracking status on a spatial panel.
- A 2.2-second **head-forward** dwell selects local catalog cards when controller selection is unavailable. This uses the headset's forward orientation, **not eye tracking**, camera input, or face recognition. It cannot execute any external URL or OS action.
- A Godot headless test verifies action-map resource loading, minimal action inventory and both profiles. The existing Android debug-APK builder should also rebuild on PR changes.

## Quest hardware checklist

| Check | Observation | Expected |
| --- | --- | --- |
| N09-1 | Start Edition 09 native APK | Native OpenXR scene loads in stereo |
| N09-2 | Hold each controller in front | Tracked ray appears only when tracking is present |
| N09-3 | Press each trigger while aiming away | PRESS increases; HIT does not |
| N09-4 | Aim at a native portal and press trigger | PRESS and HIT increase; selection changes |
| N09-5 | Put controllers down and look steadily at a portal | 2.2-second dwell changes only the local selection |
| N09-6 | Shift gaze before timer finishes | No accidental selection |
| N09-7 | Test both seated and standing safely | UI remains comfortable and reachable |
| N09-8 | Exit using Meta system controls | Horizon OS resumes; no firmware touched |

Record installed APK SHA-256, GitHub run/commit, Quest firmware, left/right controller state, OpenXR status, visual output, and any crash logs. Use PASS, FAIL, BLOCKED, or NOT_TESTED rather than assuming success from builds.

## Safe scope

No root, bootloader change, Meta OS replacement, filesystem bridge, raw passthrough feed, eye tracking, analytics, microphone, controller identifier logging, or remote app execution.

The old Edition 07 **browser** controller failure must not be confused with native Godot's controller behavior. These are separate runtimes and need separate hardware tests.

See [Godot 4.6's XR action map documentation](https://docs.godotengine.org/en/4.6/tutorials/xr/xr_action_map.html) for action and profile semantics.
