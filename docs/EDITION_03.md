# PhiOS XR · Edition 03 / Spatial Window Manager

## Scope

This milestone turns the six **portal preview panels** into freely arranged read-only spatial cards.
They are *not* live embedded browser windows or running applications, and no operating-system process or privileged PhiOS action is exposed.

## Controls

- **Desktop:** Click a portal to select. Click and drag its surface to move it. Drag the gold corner handle to resize it. Use the new **ARC** / **WALL** layout buttons or **RESET** to recover a lost arrangement.
- **In headset:** Point the target ray at a portal or its resize handle. Hold the controller select trigger or a WebXR-compatible select gesture, move the ray, and release to place/size the panel. The right-hand floating toolbar has ARC, WALL, RESET, RE-CENTER, and EXIT controls.
- **Recovery:** ARC or WALL applies a known arrangement. RESET clears the saved local workspace and returns to ARC.
- **Persistence:** Placement and size are saved only in the browser's localStorage (versioned, validated, bounded, and best-effort). This is *not* PhiOS governed memory; settings may be lost in private mode or when storage is cleared.
- **MR:** The scene remains over passthrough when WebXR immersive-ar is supported. It does not read raw camera frames.

## Physical acceptance

CI can verify pure layout mathematics and a TypeScript production build. It **cannot** certify the Quest 3 controller, hand-select behavior, display comfort, performance or passthrough. Complete `docs/QUEST_ACCEPTANCE.md` on a real headset, recording:

- W01 desktop move with pointer down/move/up
- W02 desktop resize handle
- W03 XR controller selectstart/selectend drag
- W04 XR resize handle + bounded scale
- W05 all in-world toolbar actions
- W06 saved layout after page refresh
- W07 RESET clears saved layout
- W08 10 cycles: change layout, enter VR, exit and repeat
- W09 seated and standing recenter with windows staying in front
- W10 MR overlay, if supported, with tracking stability

Record PASS / FAIL / BLOCKED / NOT_TESTED per item with device/browser version. Do not call untested hardware paths supported.

## Trust boundary

This window manager only changes local display transforms and selected portal IDs. No frame embeds remote sites, no credentials are collected, no automation grants are made, and no host or network bridge is introduced. Capability is not authority.
