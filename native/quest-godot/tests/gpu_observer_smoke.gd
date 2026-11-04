extends SceneTree

# Headless structural smoke. Not physical GPU/Quest validation.
const GpuObserver = preload("res://scripts/gpu_observer.gd")


func _initialize() -> void:
    var reading: Dictionary = GpuObserver.snapshot()
    if reading.get("schema") != "phios.gpu-observation.v1":
        push_error("Missing GPU observation contract")
        quit(1)
        return
    if reading.get("authority") != "observe-only":
        push_error("Native observer must not claim device authority")
        quit(1)
        return
    if reading.get("gpu_execution_ms") != null or reading.get("tensor_tflops") != null:
        push_error("Native observer must not invent GPU execution or Tensor throughput")
        quit(1)
        return
    if not GpuObserver.status_line().begins_with("GPU:"):
        push_error("GPU status must be a bounded local readout")
        quit(1)
        return
    print("Native GPU observation contract passed (hardware unverified)")
    quit(0)
