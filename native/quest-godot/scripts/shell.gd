extends Node3D

# Edition 06 native OpenXR proof-of-concept: local, read-only spatial index.
# Does not embed the WebXR site, install another OS, or execute portal links.
const PortalCatalog = preload("res://scripts/portal_catalog.gd")
const PANEL_WIDTH := 0.82
const PANEL_HEIGHT := 0.56
const PANEL_DEPTH := 0.035

@onready var xr_camera: XRCamera3D = $XROrigin/XRCamera
@onready var left_hand: XRController3D = $XROrigin/LeftHand
@onready var right_hand: XRController3D = $XROrigin/RightHand

var workspace: Node3D
var cards: Array[MeshInstance3D] = []
var selected_index := 0
var detail_label: Label3D
var status_label: Label3D
var xr_active := false
var anchor_frames := 0


func _ready() -> void:
    workspace = Node3D.new()
    workspace.name = "SpatialWorkspace"
    add_child(workspace)
    _build_workspace()
    _select(0)
    _place_in_front()

    left_hand.button_pressed.connect(_on_controller_button.bind(left_hand))
    right_hand.button_pressed.connect(_on_controller_button.bind(right_hand))

    var interface: XRInterface = XRServer.find_interface("OpenXR")
    if interface != null and interface.is_initialized():
        get_viewport().use_xr = true
        DisplayServer.window_set_vsync_mode(DisplayServer.VSYNC_DISABLED)
        xr_active = true
        anchor_frames = 5
        status_label.text = "NATIVE OPENXR | READ-ONLY | CONTROLLER INPUT UNVERIFIED"
    else:
        status_label.text = "DESKTOP PREVIEW | OPENXR RUNTIME NOT ACTIVE"
        if OS.has_feature("android"):
            push_warning("OpenXR unavailable on Android. Inspect export presets and vendor configuration.")


func _process(_delta: float) -> void:
    if anchor_frames > 0:
        anchor_frames -= 1
        if anchor_frames == 0:
            _place_in_front()


func _unhandled_input(event: InputEvent) -> void:
    # Desktop/editor fallback and manual navigation; headset mapping is
    # dependent on the exported OpenXR action map.
    if event is InputEventKey and event.pressed and not event.echo:
        if event.keycode == KEY_RIGHT:
            _select((selected_index + 1) % PortalCatalog.PORTALS.size())
        elif event.keycode == KEY_LEFT:
            _select((selected_index + PortalCatalog.PORTALS.size() - 1) % PortalCatalog.PORTALS.size())
        elif event.keycode == KEY_R:
            _place_in_front()
    if not xr_active and event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
        var point := get_viewport().get_mouse_position()
        _pick(xr_camera.project_ray_origin(point), xr_camera.project_ray_origin(point) + xr_camera.project_ray_normal(point) * 10.0)


func _on_controller_button(action_name: String, controller: XRController3D) -> void:
    # A native export must supply matching OpenXR actions/bindings.
    # Do not mark controller input supported until Q03-Q10 pass on-device.
    if action_name == "trigger_click" or action_name == "select":
        _pick(controller.global_position, controller.global_position - controller.global_transform.basis.z * 10.0)


func _pick(ray_start: Vector3, ray_end: Vector3) -> void:
    var query := PhysicsRayQueryParameters3D.create(ray_start, ray_end)
    var hit := get_world_3d().direct_space_state.intersect_ray(query)
    if hit.is_empty():
        return
    var target: Object = hit["collider"]
    if target is StaticBody3D and target.has_meta("portal_index"):
        _select(int(target.get_meta("portal_index")))


func _place_in_front() -> void:
    var eye := xr_camera.global_position
    var forward := -xr_camera.global_transform.basis.z
    forward.y = 0.0
    if forward.length_squared() < 0.001:
        forward = Vector3.FORWARD
    forward = forward.normalized()
    workspace.global_position = eye + forward * 2.35
    workspace.global_position.y = maxf(0.8, eye.y)
    var toward_head := eye - workspace.global_position
    toward_head.y = 0.0
    # Workspace +Z carries readable panel faces.
    workspace.rotation.y = atan2(toward_head.x, toward_head.z)


func _panel_material(color: Color) -> StandardMaterial3D:
    var material := StandardMaterial3D.new()
    material.albedo_color = color
    material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
    return material


func _add_label(parent: Node3D, copy: String, location: Vector3, size: int, color: Color) -> Label3D:
    var label := Label3D.new()
    label.text = copy
    label.font_size = size
    label.pixel_size = 0.0026
    label.modulate = color
    label.position = location
    label.no_depth_test = true
    parent.add_child(label)
    return label


func _build_workspace() -> void:
    _add_label(workspace, "Φ PHIOS XR  /  NATIVE FIELDSPACE", Vector3(0, 1.02, 0.08), 58, Color("#b6f9eb"))
    _add_label(workspace, "SIX PORTALS  •  ZERO REMOTE EXECUTION", Vector3(0, 0.87, 0.08), 30, Color("#e0c38c"))

    for index in range(PortalCatalog.PORTALS.size()):
        var entry: Dictionary = PortalCatalog.PORTALS[index]
        var col := index % 3
        var row := index / 3
        var card := MeshInstance3D.new()
        card.name = "Portal_" + str(index)
        var mesh := BoxMesh.new()
        mesh.size = Vector3(PANEL_WIDTH, PANEL_HEIGHT, PANEL_DEPTH)
        card.mesh = mesh
        card.material_override = _panel_material(Color("#12323f"))
        card.position = Vector3(float(col - 1) * 0.92, 0.36 - float(row) * 0.67, 0.0)
        workspace.add_child(card)
        cards.append(card)

        var body := StaticBody3D.new()
        body.set_meta("portal_index", index)
        body.collision_layer = 1
        body.collision_mask = 0
        card.add_child(body)
        var shape := CollisionShape3D.new()
        var box := BoxShape3D.new()
        box.size = Vector3(PANEL_WIDTH, PANEL_HEIGHT, PANEL_DEPTH)
        shape.shape = box
        body.add_child(shape)

        _add_label(card, str(index + 1).pad_zeros(2) + "  /  " + str(entry["name"]), Vector3(0, 0.075, PANEL_DEPTH), 34, Color("#dcf9f4"))
        _add_label(card, str(entry["hint"]), Vector3(0, -0.085, PANEL_DEPTH), 26, Color("#9dbbc3"))

    detail_label = _add_label(workspace, "", Vector3(0, -0.96, 0.08), 28, Color("#c3e9e5"))
    status_label = _add_label(workspace, "", Vector3(0, -1.13, 0.08), 22, Color("#d8bc86"))


func _select(index: int) -> void:
    selected_index = clampi(index, 0, cards.size() - 1)
    for i in range(cards.size()):
        var material := cards[i].material_override as StandardMaterial3D
        material.albedo_color = Color("#1c6571") if i == selected_index else Color("#12323f")
    var entry: Dictionary = PortalCatalog.PORTALS[selected_index]
    detail_label.text = "SELECTED: " + str(entry["name"]) + "  |  LOCAL CATALOG ONLY"
    # Intentionally do not open URLs, send telemetry, or execute host commands.
