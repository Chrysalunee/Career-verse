extends Node3D

const PLAYER_SCRIPT = preload("res://scripts/player_controller.gd")
var player: CVPlayer
var sun: DirectionalLight3D
var clock_minutes: float = 8.0 * 60.0
var info_label: Label
var clock_label: Label
var customization_panel: PanelContainer
var save_path := "user://career_verse_3d_save.json"

func _ready() -> void:
	_build_environment()
	_build_town()
	_build_player()
	_build_ui()
	_load_game()

func _process(delta: float) -> void:
	clock_minutes = fmod(clock_minutes + delta * 2.0, 1440.0)
	var hour := int(clock_minutes / 60.0)
	var minute := int(clock_minutes) % 60
	clock_label.text = "%02d:%02d  |  Day 1" % [hour, minute]
	sun.rotation_degrees.x = -((clock_minutes / 1440.0) * 360.0 - 90.0)
	var daylight := clampf(sin((clock_minutes / 1440.0) * TAU - PI / 2.0) * 0.5 + 0.5, 0.12, 1.0)
	sun.light_energy = lerpf(0.18, 1.15, daylight)

func _build_environment() -> void:
	var world := WorldEnvironment.new()
	var environment := Environment.new()
	environment.background_mode = Environment.BG_SKY
	var sky := Sky.new()
	var sky_material := ProceduralSkyMaterial.new()
	sky_material.sky_top_color = Color("#477da5")
	sky_material.sky_horizon_color = Color("#c8d9df")
	sky_material.ground_bottom_color = Color("#263b35")
	sky_material.ground_horizon_color = Color("#9eaa9d")
	sky.sky_material = sky_material
	environment.sky = sky
	environment.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	environment.ambient_light_color = Color("#b9cbd4")
	environment.ambient_light_energy = 0.65
	world.environment = environment
	add_child(world)
	sun = DirectionalLight3D.new()
	sun.rotation_degrees = Vector3(-35, -25, 0)
	sun.shadow_enabled = true
	sun.light_energy = 1.1
	add_child(sun)

func _build_town() -> void:
	_add_box("Ground", Vector3(0, -0.35, 0), Vector3(100, 0.5, 100), Color("#78936b"), true)
	_add_box("MainRoad", Vector3(0, -0.08, 0), Vector3(12, 0.12, 90), Color("#454a4e"), false)
	_add_box("CrossRoad", Vector3(0, -0.07, 0), Vector3(90, 0.13, 10), Color("#454a4e"), false)
	for i in range(8):
		var z := -34.0 + float(i) * 9.5
		_add_box("RoadLine", Vector3(0, 0.005, z), Vector3(0.22, 0.02, 3.5), Color("#e9dfbd"), false)
	_add_building("Home", "Your home", "Rest, change your appearance, and manage your daily routine.", Vector3(-13, 0, 12), Vector3(9, 6, 8), Color("#d6b99a"))
	_add_building("Office", "Nusa Global Office", "Explore career opportunities and start your working day.", Vector3(17, 0, -13), Vector3(11, 12, 10), Color("#7c9da9"))
	_add_building("Cafe", "Kafe Senja", "Buy food and meet other residents of the town.", Vector3(-17, 0, -12), Vector3(9, 5, 8), Color("#c58e68"))
	_add_building("Market", "Pasar Harian", "Shop for daily essentials and groceries.", Vector3(16, 0, 13), Vector3(10, 6, 9), Color("#8d9d78"))
	_add_building("School", "Nusa Bangsa School", "Learn new skills and improve your qualifications.", Vector3(31, 0, 1), Vector3(10, 7, 12), Color("#d6c77e"))
	_add_building("Park", "Central Park Pavilion", "Take a break and improve your happiness.", Vector3(-31, 0, 0), Vector3(8, 4, 8), Color("#7c9b83"))
	for x in [-25.0, 25.0]:
		for z in [-27.0, 27.0]:
			_add_lamp(Vector3(x, 0, z))
	for i in range(7):
		_add_tree(Vector3(-25 + i * 8.0, 0, 23 if i % 2 == 0 else -23))
	_add_npc(Vector3(-5, 0, -5), Color("#b77c8b"))
	_add_npc(Vector3(6, 0, 7), Color("#6688a5"))
	_add_npc(Vector3(24, 0, -2), Color("#b68c55"))

func _add_box(object_name: String, pos: Vector3, size: Vector3, color: Color, collision: bool = true) -> StaticBody3D:
	var body := StaticBody3D.new()
	body.name = object_name
	body.position = pos
	var mesh := MeshInstance3D.new()
	var box := BoxMesh.new()
	box.size = size
	mesh.mesh = box
	var material := StandardMaterial3D.new()
	material.albedo_color = color
	material.roughness = 0.88
	mesh.material_override = material
	body.add_child(mesh)
	if collision:
		var shape := CollisionShape3D.new()
		var box_shape := BoxShape3D.new()
		box_shape.size = size
		shape.shape = box_shape
		body.add_child(shape)
	add_child(body)
	return body

func _add_building(id: String, title: String, description: String, pos: Vector3, size: Vector3, color: Color) -> void:
	var body := _add_box(id, pos + Vector3(0, size.y / 2.0, 0), size, color)
	body.set_meta("building_name", title)
	body.set_meta("building_description", description)
	var roof := _add_box(id + "Roof", pos + Vector3(0, size.y + 0.22, 0), Vector3(size.x + 0.5, 0.45, size.z + 0.5), color.darkened(0.25), false)
	var door := _add_box(id + "Door", pos + Vector3(0, 1.15, size.z / 2.0 + 0.04), Vector3(1.25, 2.3, 0.12), Color("#594638"), false)
	var sign := Label3D.new()
	sign.text = title
	sign.font_size = 30
	sign.position = pos + Vector3(0, size.y + 1.1, size.z / 2.0 + 0.35)
	sign.pixel_size = 0.008
	add_child(sign)

func _add_lamp(pos: Vector3) -> void:
	_add_box("StreetLampPole", pos + Vector3(0, 2.2, 0), Vector3(0.12, 4.4, 0.12), Color("#4b4c4b"), false)
	var bulb := OmniLight3D.new()
	bulb.position = pos + Vector3(0, 4.4, 0)
	bulb.light_color = Color("#ffe3b0")
	bulb.light_energy = 0.45
	bulb.omni_range = 7
	add_child(bulb)

func _add_tree(pos: Vector3) -> void:
	_add_box("TreeTrunk", pos + Vector3(0, 1.5, 0), Vector3(0.45, 3, 0.45), Color("#72533a"), false)
	var foliage := MeshInstance3D.new()
	var sphere := SphereMesh.new()
	sphere.radius = 1.55
	sphere.height = 3.1
	foliage.mesh = sphere
	foliage.position = pos + Vector3(0, 3.4, 0)
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color("#527b55")
	foliage.material_override = mat
	add_child(foliage)

func _add_npc(pos: Vector3, color: Color) -> void:
	var npc := Node3D.new()
	npc.position = pos
	var torso := MeshInstance3D.new()
	var capsule := CapsuleMesh.new()
	capsule.radius = 0.32
	capsule.height = 1.45
	torso.mesh = capsule
	torso.position.y = 0.95
	var mat := StandardMaterial3D.new()
	mat.albedo_color = color
	torso.material_override = mat
	npc.add_child(torso)
	var head := MeshInstance3D.new()
	var sphere := SphereMesh.new()
	sphere.radius = 0.23
	sphere.height = 0.46
	head.mesh = sphere
	head.position.y = 1.83
	var skin := StandardMaterial3D.new()
	skin.albedo_color = Color("#d7a987")
	head.material_override = skin
	npc.add_child(head)
	add_child(npc)

func _build_player() -> void:
	var player_node := CharacterBody3D.new()
	player_node.set_script(PLAYER_SCRIPT)
	player = player_node as CVPlayer
	player.name = "Player"
	player.position = Vector3(0, 1.2, 20)
	var collision := CollisionShape3D.new()
	var capsule_shape := CapsuleShape3D.new()
	capsule_shape.radius = 0.34
	capsule_shape.height = 1.7
	collision.shape = capsule_shape
	player.add_child(collision)
	var body_mesh := MeshInstance3D.new()
	body_mesh.name = "BodyMesh"
	var capsule := CapsuleMesh.new()
	capsule.radius = 0.34
	capsule.height = 1.55
	body_mesh.mesh = capsule
	body_mesh.position.y = 0.95
	player.add_child(body_mesh)
	var outfit := MeshInstance3D.new()
	outfit.name = "OutfitMesh"
	var outfit_mesh := CapsuleMesh.new()
	outfit_mesh.radius = 0.345
	outfit_mesh.height = 0.92
	outfit.mesh = outfit_mesh
	outfit.position.y = 0.78
	player.add_child(outfit)
	var hair := MeshInstance3D.new()
	hair.name = "HairMesh"
	var hair_mesh := SphereMesh.new()
	hair_mesh.radius = 0.35
	hair_mesh.height = 0.42
	hair.mesh = hair_mesh
	hair.position.y = 1.72
	player.add_child(hair)
	var pivot := Node3D.new()
	pivot.name = "CameraPivot"
	pivot.position.y = 1.55
	player.add_child(pivot)
	var arm := SpringArm3D.new()
	arm.name = "SpringArm3D"
	arm.spring_length = 5.2
	arm.margin = 0.15
	pivot.add_child(arm)
	var camera := Camera3D.new()
	camera.name = "Camera3D"
	camera.current = true
	camera.fov = 72
	arm.add_child(camera)
	player.interacted.connect(_on_interacted)
	add_child(player)

func _build_ui() -> void:
	var layer := CanvasLayer.new()
	add_child(layer)
	var root := Control.new()
	root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	layer.add_child(root)
	var top := HBoxContainer.new()
	top.position = Vector2(24, 20)
	top.add_theme_constant_override("separation", 16)
	root.add_child(top)
	clock_label = Label.new()
	clock_label.add_theme_font_size_override("font_size", 22)
	clock_label.text = "08:00  |  Day 1"
	top.add_child(clock_label)
	var spacer := Control.new()
	spacer.custom_minimum_size.x = 600
	top.add_child(spacer)
	var profile := Button.new()
	profile.text = "Character"
	profile.pressed.connect(_toggle_customization)
	top.add_child(profile)
	var save_button := Button.new()
	save_button.text = "Save Game"
	save_button.pressed.connect(_save_game)
	top.add_child(save_button)
	var help := Label.new()
	help.text = "WASD Move   •   Shift Run   •   Mouse Look   •   E Interact   •   Esc Release Mouse"
	help.position = Vector2(24, 64)
	help.add_theme_font_size_override("font_size", 15)
	root.add_child(help)
	info_label = Label.new()
	info_label.position = Vector2(24, 110)
	info_label.custom_minimum_size = Vector2(420, 100)
	info_label.add_theme_font_size_override("font_size", 17)
	info_label.text = "Welcome to Career-Verse. Explore the town and approach a building."
	root.add_child(info_label)
	customization_panel = PanelContainer.new()
	customization_panel.position = Vector2(24, 185)
	customization_panel.custom_minimum_size = Vector2(310, 260)
	customization_panel.visible = false
	root.add_child(customization_panel)
	var content := VBoxContainer.new()
	content.add_theme_constant_override("separation", 8)
	customization_panel.add_child(content)
	var heading := Label.new()
	heading.text = "CHARACTER CUSTOMIZATION"
	heading.add_theme_font_size_override("font_size", 18)
	content.add_child(heading)
	_add_custom_button(content, "Gender: Male / Female", 1, 0, 0, 0)
	_add_custom_button(content, "Skin tone", 0, 1, 0, 0)
	_add_custom_button(content, "Hair color", 0, 0, 1, 0)
	_add_custom_button(content, "Outfit color", 0, 0, 0, 1)
	var close := Button.new()
	close.text = "Close"
	close.pressed.connect(_close_customization)
	content.add_child(close)
	var footer := Label.new()
	footer.text = "Prototype placeholder models — replace with rigged humanoid assets in the next stage."
	footer.position = Vector2(24, 850)
	footer.add_theme_font_size_override("font_size", 13)
	root.add_child(footer)

func _add_custom_button(parent: VBoxContainer, caption: String, gender: int, skin: int, hair: int, outfit: int) -> void:
	var button := Button.new()
	button.text = caption + "  ◀  ▶"
	button.pressed.connect(func(): player.customize(gender, skin, hair, outfit))
	parent.add_child(button)

func _toggle_customization() -> void:
	customization_panel.visible = not customization_panel.visible
	if customization_panel.visible:
		player.mouse_captured = false
		Input.mouse_mode = Input.MOUSE_MODE_VISIBLE

func _close_customization() -> void:
	customization_panel.visible = false
	player.mouse_captured = true
	Input.mouse_mode = Input.MOUSE_MODE_CAPTURED

func _on_interacted(target_name: String, description: String) -> void:
	info_label.text = "%s\n%s" % [target_name, description]

func _save_game() -> void:
	var data := {
		"player_position": [player.global_position.x, player.global_position.y, player.global_position.z],
		"clock_minutes": clock_minutes,
		"gender_index": player.gender_index,
		"skin_index": player.skin_index,
		"hair_index": player.hair_index,
		"outfit_index": player.outfit_index
	}
	var file := FileAccess.open(save_path, FileAccess.WRITE)
	if file:
		file.store_string(JSON.stringify(data, "\t"))
		info_label.text = "Game saved successfully."

func _load_game() -> void:
	if not FileAccess.file_exists(save_path):
		return
	var file := FileAccess.open(save_path, FileAccess.READ)
	if not file:
		return
	var parsed = JSON.parse_string(file.get_as_text())
	if typeof(parsed) != TYPE_DICTIONARY:
		return
	var pos: Array = parsed.get("player_position", [0, 1.2, 20])
	player.global_position = Vector3(float(pos[0]), float(pos[1]), float(pos[2]))
	clock_minutes = float(parsed.get("clock_minutes", 480.0))
	player.gender_index = int(parsed.get("gender_index", 0))
	player.skin_index = int(parsed.get("skin_index", 0))
	player.hair_index = int(parsed.get("hair_index", 0))
	player.outfit_index = int(parsed.get("outfit_index", 0))
	player._apply_appearance()
