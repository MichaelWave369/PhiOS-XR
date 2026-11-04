# PhiOS XR GPU Observatory · frame cadence Rung 1

The web XR Hearth and Quest Device Lab offer a manually armed, bounded read-only frame cadence recorder. Press **START XR FRAME SAMPLE** in the 2D lab, enter VR/MR, return to the 2D view, then **STOP**.

- Captures at most **240 successive immersive render callback intervals** from Three.js `renderer.setAnimationLoop`.
- Ignores timestamps outside immersive sessions, nonfinite values, duplicate intervals and intervals >=250 ms. Returns median and p95 interval in milliseconds; `unavailable` if no samples.
- Does **not** claim measured GPU time, CPU time, Quest compositor timing, frame prediction, actual display refresh or headset comfort. Frame reprojection can conceal missed app frames.
- Opt-in only; no ongoing telemetry, remote network transmission, storage, GPU power modifications or unlock integration.
- Results align with `phios.gpu-observation.v1` observation/provenance vocabulary, but callback samples are not interchangeable with the native `nvidia-smi` snapshot.
- Hardware acceptance still requires real Quest 3 testing, seated and standing, and a clear safe boundary.

Next research rung: vendor-supported `XRFrame` timing fields where exposed and trustworthy, renderer stats, JS main-thread profiling, thermal headroom and repeatable 72/90 Hz comfort tests. Never infer measured GPU throughput from callback pacing.

## Native Godot Quest proof-of-concept

The parallel Godot native shell has a manual G-key capability view with only Godot-provided adapter label and engine FPS hint; headset controllers do **not** activate this view in v0.1. The headless CI structural test confirms read-only schema and no fabricated throughput, but does not prove actual Quest 3 device support.
