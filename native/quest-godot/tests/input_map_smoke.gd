extends SceneTree

# Headless structural test. Does NOT connect a controller or test a Quest.
func _initialize() -> void:
    var map_resource := load("res://openxr_action_map.tres")
    if not map_resource is OpenXRActionMap:
        push_error("The explicit OpenXR action map did not load")
        quit(1)
        return
    var action_sets: Array = map_resource.get("action_sets")
    var profiles: Array = map_resource.get("interaction_profiles")
    if action_sets.size() != 1 or profiles.size() != 2:
        push_error("Expected one action set and exactly two tested profiles")
        quit(1)
        return

    var mapped: Array = action_sets[0].get("actions")
    var found := []
    for action in mapped:
        found.append(str(action.resource_name))
    if not found.has("aim_pose") or not found.has("trigger_click") or found.size() != 2:
        push_error("Expected explicit aim_pose and trigger_click actions only")
        quit(1)
        return

    var profile_names := []
    for profile in profiles:
        profile_names.append(str(profile.get("interaction_profile_path")))
        var bindings: Array = profile.get("bindings")
        if bindings.size() != 4:
            push_error("Each profile must bind aim and selection on both hands")
            quit(1)
            return
    if not profile_names.has("/interaction_profiles/oculus/touch_controller"):
        push_error("Missing Touch controller profile")
        quit(1)
        return
    if not profile_names.has("/interaction_profiles/khr/simple_controller"):
        push_error("Missing simple controller fallback")
        quit(1)
        return

    print("PhiOS XR native action map validated; device input remains untested")
    quit(0)
