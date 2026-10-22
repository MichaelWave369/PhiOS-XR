# PhiOS XR · physical Quest 3 acceptance checklist

Edition 02 adds observable spatial input feedback and in-headset controls. **GitHub CI cannot establish that Quest hardware or hand tracking works.** This checklist must be run on a real headset before marking a device/browser version supported.

## Device evidence

- Test date and time zone:
- Quest model and OS version:
- Quest Browser version:
- Controllers or hand tracking enabled:
- HTTPS page URL:
- Git commit and CI run:
- Standing or seated:
- Tester:

## Acceptance matrix

| ID | Action | Expected observation |
| --- | --- | --- |
| Q01 | Open deployed site | 2D preview loads and portals respond |
| Q02 | Inspect ENTER VR and ENTER MR | Unsupported modes disabled; no misleading compatibility claim |
| Q03 | Enter immersive VR | Stereo shell appears with panels in front of the user |
| Q04 | Aim controller at portal | Visible laser, reticle, hover enlargement |
| Q05 | Press select | Detail panel updates to selected portal |
| Q06 | Select in-headset RE-CENTER | Workspace relocates in front of viewer, remains world-stable |
| Q07 | Select in-headset EXIT XR | Immersive session ends; page remains functional |
| Q08 | Enter MR if available | Browser-composited passthrough with spatial shell overlay |
| Q09 | Aim and select toolbar in MR | Ray and action behavior match VR |
| Q10 | Try hand-select / pinch | PASS only if browser emits working WebXR select events |
| Q11 | Deny headset permission | Safe error, no crash, fallback works |
| Q12 | Repeat 10 enter/exit cycles | No stuck XR session or missing panels |
| Q13 | Stand, sit, turn (within safe boundary) | Recenter reacts to current head height and heading |
| Q14 | Monitor thermal/performance symptoms | Record stutter, reloads, and visual comfort without invented FPS |
| Q15 | Exit XR and click a portal link | External project opens through ordinary browser navigation |

Each Q item must be marked PASS, FAIL, BLOCKED, or NOT_TESTED. Record evidence and follow-up issues. A CI build or WebXR feature check is not a hardware acceptance test.

## Boundaries

- Only test in a clear play area using the headset's boundary guidance.
- The application does not capture raw passthrough camera data or identify people.
- Portal selection is navigation, never authorization to execute local PhiOS effects.
- No privileged PhiOS bridge, operating system replacement, or on-device APK is present.

## Report template

```text
Device / firmware:
Browser version:
Build commit:
VR:
MR:
Controllers:
Hand tracking:
Recenter:
Exit:
Stability:
Issues / evidence links:
Reviewer:
```
