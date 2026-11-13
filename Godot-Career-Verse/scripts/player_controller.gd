extends CharacterBody3D
class_name CVPlayer

signal interacted(target_name: String, description: String)

@export var move_speed: float = 5.2
@export var sprint_multiplier: float = 1.65
@export var mouse_sensitivity: float = 0.0025
@onready var pivot: Node3D = $CameraPivot
@onready var spring_arm: SpringArm3D = $CameraPivot/SpringArm3D
@onready var camera: Camera3D = $CameraPivot/SpringArm3D/Camera3D
@onready var body_mesh: MeshInstance3D = $BodyMesh

var gravity: float = ProjectSettings.get_setting("physics/3d/default_gravity")
var gender_index: int = 0
var skin_index: int = 0
var hair_index: int = 0
var outfit_index: int = 0
var mouse_captured: bool = true

const SKIN_COLORS: Array[Color] = [Color("#f1c7a5"), Color("#d99b72"), Color("#9a6246"), Color("#6a4538")]
const HAIR_COLORS: Array[Color] = [Color("#30231f"), Color("#6b422d"), Color("#c69a4b"), Color("#292b36")]
const OUTFIT_COLORS: Array[Color] = [Color("#477b91"), Color("#a56e91"), Color("#657d58"), Color("#343b4a")]

func _ready() -> void:
	_setup_input()
	Input.mouse_mode = Input.MOUSE_MODE_CAPTURED
	_apply_appearance()

func _setup_input() -> void:
	_add_key_action("move_forward", KEY_W)
	_add_key_action("move_back", KEY_S)
	_add_key_action("move_left", KEY_A)
	_add_key_action("move_right", KEY_D)
	_add_key_action("sprint", KEY_SHIFT)
	_add_key_action("interact", KEY_E)
	_add_key_action("jump", KEY_SPACE)

func _add_key_action(action: String, key: Key) -> void:
	if not InputMap.has_action(action):
		InputMap.add_action(action)
	var event := InputEventKey.new()
	event.physical_keycode = key
	InputMap.action_add_event(action, event)

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseMotion and mouse_captured:
		pivot.rotate_y(-event.relative.x * mouse_sensitivity)
		pivot.rotation.x = clampf(pivot.rotation.x - event.relative.y * mouse_sensitivity, deg_to_rad(-45), deg_to_rad(35))
	elif event.is_action_pressed("ui_cancel"):
		mouse_captured = not mouse_captured
		Input.mouse_mode = Input.MOUSE_MODE_CAPTURED if mouse_captured else Input.MOUSE_MODE_VISIBLE
	elif event.is_action_pressed("interact"):
		_try_interact()

func _physics_process(delta: float) -> void:
	if not is_on_floor():
		velocity.y -= gravity * delta
	elif Input.is_action_just_pressed("jump"):
		velocity.y = 4.5

	var input_vector := Input.get_vector("move_left", "move_right", "move_forward", "move_back")
	var basis := pivot.global_transform.basis
	var direction := (basis.x * input_vector.x + -basis.z * input_vector.y)
	direction.y = 0.0
	direction = direction.normalized()
	var speed := move_speed * (sprint_multiplier if Input.is_action_pressed("sprint") else 1.0)
	velocity.x = move_toward(velocity.x, direction.x * speed, 22.0 * delta)
	velocity.z = move_toward(velocity.z, direction.z * speed, 22.0 * delta)
	move_and_slide()

	if direction.length_squared() > 0.01:
		var target_angle := atan2(direction.x, direction.z)
		body_mesh.rotation.y = lerp_angle(body_mesh.rotation.y, target_angle, 10.0 * delta)

func _try_interact() -> void:
	var from := camera.global_position
	var to := from + -camera.global_transform.basis.z * 5.5
	var query := PhysicsRayQueryParameters3D.create(from, to)
	query.exclude = [get_rid()]
	var hit := get_world_3d().direct_space_state.intersect_ray(query)
	if hit and hit.collider.has_meta("building_name"):
		interacted.emit(str(hit.collider.get_meta("building_name")), str(hit.collider.get_meta("building_description")))

func customize(gender_delta: int = 0, skin_delta: int = 0, hair_delta: int = 0, outfit_delta: int = 0) -> void:
	gender_index = posmod(gender_index + gender_delta, 2)
	skin_index = posmod(skin_index + skin_delta, SKIN_COLORS.size())
	hair_index = posmod(hair_index + hair_delta, HAIR_COLORS.size())
	outfit_index = posmod(outfit_index + outfit_delta, OUTFIT_COLORS.size())
	_apply_appearance()

func _apply_appearance() -> void:
	var skin_material := StandardMaterial3D.new()
	skin_material.albedo_color = SKIN_COLORS[skin_index]
	body_mesh.material_override = skin_material
	var outfit := get_node_or_null("OutfitMesh") as MeshInstance3D
	if outfit:
		var outfit_material := StandardMaterial3D.new()
		outfit_material.albedo_color = OUTFIT_COLORS[outfit_index]
		outfit.material_override = outfit_material
	var hair := get_node_or_null("HairMesh") as MeshInstance3D
	if hair:
		var hair_material := StandardMaterial3D.new()
		hair_material.albedo_color = HAIR_COLORS[hair_index]
		hair.material_override = hair_material
	var capsule := body_mesh.mesh as CapsuleMesh
	if capsule:
		capsule.height = 1.55 if gender_index == 0 else 1.48
		capsule.radius = 0.34 if gender_index == 0 else 0.31
