extends RefCounted

# A native *observation* of Godot graphics APIs; never device control.
# Called only when the operator toggles the G-key diagnostics.
static func snapshot() -> Dictionary:
    var adapter := RenderingServer.get_video_adapter_name().strip_edges()
    var api := RenderingServer.get_video_adapter_api_version().strip_edges()
    var current_fps := Performance.get_monitor(Performance.TIME_FPS)
    var reported_fps: Variant = null
    if is_finite(current_fps) and current_fps >= 0.0:
        reported_fps = current_fps
    return {
        "schema": "phios.gpu-observation.v1",
        "source": "godot-renderer",
        "authority": "observe-only",
        "status": "observed" if not adapter.is_empty() else "unavailable",
        "adapter_name": adapter.substr(0, 100) if not adapter.is_empty() else null,
        "graphics_api": api.substr(0, 100) if not api.is_empty() else null,
        "engine_reported_fps": reported_fps,
        "gpu_execution_ms": null,
        "vram_mib": null,
        "tensor_tflops": null,
    }


static func status_line() -> String:
    var reading := snapshot()
    var adapter: Variant = reading["adapter_name"]
    var adapter_text := "UNAVAILABLE" if adapter == null else str(adapter).substr(0, 20)
    var fps: Variant = reading["engine_reported_fps"]
    var fps_text := "UNKNOWN" if fps == null else str(roundi(float(fps)))
    return "GPU:%s FPS:%s (ENGINE HINT)" % [adapter_text, fps_text]
