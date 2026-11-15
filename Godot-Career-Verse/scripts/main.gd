extends Node3D

const PLAYER_SCRIPT = preload("res://scripts/player_controller.gd")
const NEED_DECAY_PER_GAME_MINUTE := {"hunger": 0.028, "energy": 0.018, "hygiene": 0.014, "social": 0.009, "fun": 0.011}
const NEED_LABELS := {"hunger": "Lapar", "energy": "Energi", "hygiene": "Kebersihan", "social": "Sosial", "fun": "Hiburan"}
const SAVE_PATH := "user://career_verse_3d_save.json"

var player: CVPlayer
var sun: DirectionalLight3D
var clock_minutes := 8.0 * 60.0
var day_count := 1
var game_minutes_elapsed := 0.0
var needs := {"hunger": 100.0, "energy": 100.0, "hygiene": 100.0, "social": 70.0, "fun": 70.0}
var skill := 1.0
var wallet := 1200000
var info_label: Label
var clock_label: Label
var needs_label: Label
var customization_panel: PanelContainer
var touch_controls: Control
var npc_routines: Array[Dictionary] = []
var career_data: Dictionary = {}

func _ready() -> void:
	_load_career_reference_data()
	_build_environment()
	_build_town()
	_build_player()
	_build_ui()
	_load_game()

func _process(delta: float) -> void:
	var game_minutes := delta * 2.0
	game_minutes_elapsed += game_minutes
	clock_minutes += game_minutes
	while clock_minutes >= 1440.0:
		clock_minutes -= 1440.0
		day_count += 1
	for need in NEED_DECAY_PER_GAME_MINUTE:
		needs[need] = maxf(0.0, float(needs[need]) - float(NEED_DECAY_PER_GAME_MINUTE[need]) * game_minutes)
	_update_clock_and_lighting()
	_update_needs_display()
	_update_npc_routines(delta)

func _load_career_reference_data() -> void:
	# The browser prototype remains the source of truth for hiring/career gameplay.
	# Read a small reference snapshot when this folder is hosted at the repository root.
	var path := "res://../Career-verse-main/data/world/company-workplaces.json"
	if not FileAccess.file_exists(path):
		return
	var file := FileAccess.open(path, FileAccess.READ)
	if file:
		var parsed = JSON.parse_string(file.get_as_text())
		if parsed is Dictionary:
			career_data = parsed

func _update_clock_and_lighting() -> void:
	var hour := int(clock_minutes / 60.0)
	var minute := int(clock_minutes) % 60
	clock_label.text = "Hari %d · %02d:%02d" % [day_count, hour, minute]
	var daylight := clampf(sin((clock_minutes / 1440.0) * TAU - PI / 2.0) * 0.5 + 0.5, 0.12, 1.0)
	sun.rotation_degrees.x = -((clock_minutes / 1440.0) * 360.0 - 90.0)
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
	_add_building("home", "Rumah", "Beristirahat dan memulihkan energi serta kebersihan.", Vector3(-13, 0, 12), Vector3(9, 6, 8), Color("#d6b99a"))
	_add_building("workplace", "Kantor Nusa Global", "Tempat kerja simulasi. Karier dan tugas lengkap tetap tersedia di game browser.", Vector3(17, 0, -13), Vector3(11, 12, 10), Color("#7c9da9"))
	_add_building("cafe", "Kafe Senja", "Makan dan bertemu warga untuk memulihkan rasa lapar.", Vector3(-17, 0, -12), Vector3(9, 5, 8), Color("#c58e68"))
	_add_building("market", "Pasar Harian", "Membeli makanan dan kebutuhan sehari-hari.", Vector3(16, 0, 13), Vector3(10, 6, 9), Color("#8d9d78"))
	_add_building("school", "Sekolah Nusa Bangsa", "Belajar untuk meningkatkan skill simulasi.", Vector3(31, 0, 1), Vector3(10, 7, 12), Color("#d6c77e"))
	_add_building("park", "Taman Kota", "Bersantai untuk memulihkan hiburan dan kebutuhan sosial.", Vector3(-31, 0, 0), Vector3(8, 4, 8), Color("#7c9b83"))
	for x in [-25.0, 25.0]:
		for z in [-27.0, 27.0]:
			_add_lamp(Vector3(x, 0, z))
	for i in range(7):
		_add_tree(Vector3(-25 + i * 8.0, 0, 23 if i % 2 == 0 else -23))
	_add_npc("ResidentA", Vector3(-5, 0, -5), Color("#b77c8b"), [Vector3(-5, 0, -5), Vector3(-11, 0, -8), Vector3(-8, 0, 2)])
	_add_npc("ResidentB", Vector3(6, 0, 7), Color("#6688a5"), [Vector3(6, 0, 7), Vector3(11, 0, 4), Vector3(4, 0, -3)])
	_add_npc("ResidentC", Vector3(24, 0, -2), Color("#b68c55"), [Vector3(24, 0, -2), Vector3(19, 0, -5), Vector3(26, 0, 6)])

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
	var body := _add_box(id.capitalize(), pos + Vector3(0, size.y / 2.0, 0), size, color)
	body.set_meta("building_id", id)
	body.set_meta("building_name", title)
	body.set_meta("building_description", description)
	_add_box(id.capitalize() + "Roof", pos + Vector3(0, size.y + 0.22, 0), Vector3(size.x + 0.5, 0.45, size.z + 0.5), color.darkened(0.25), false)
	_add_box(id.capitalize() + "Door", pos + Vector3(0, 1.15, size.z / 2.0 + 0.04), Vector3(1.25, 2.3, 0.12), Color("#594638"), false)
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
	var material := StandardMaterial3D.new()
	material.albedo_color = Color("#527b55")
	foliage.material_override = material
	add_child(foliage)

func _add_npc(npc_name: String, pos: Vector3, color: Color, waypoints: Array[Vector3]) -> void:
	var npc := Node3D.new()
	npc.name = npc_name
	npc.position = pos
	var torso := MeshInstance3D.new()
	var capsule := CapsuleMesh.new()
	capsule.radius = 0.32
	capsule.height = 1.45
	torso.mesh = capsule
	torso.position.y = 0.95
	var body_material := StandardMaterial3D.new()
	body_material.albedo_color = color
	torso.material_override = body_material
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
	npc_routines.append({"node": npc, "waypoints": waypoints, "index": 0, "wait": randf_range(0.0, 2.0), "speed": randf_range(0.7, 1.15)})

func _update_npc_routines(delta: float) -> void:
	for routine in npc_routines:
		var npc: Node3D = routine.node
		var waypoints: Array = routine.waypoints
		if not is_instance_valid(npc) or waypoints.is_empty():
			continue
		if float(routine.wait) > 0.0:
			routine.wait = maxf(0.0, float(routine.wait) - delta)
			continue
		var target: Vector3 = waypoints[int(routine.index)]
		var offset := target - npc.position
		offset.y = 0.0
		if offset.length() < 0.25:
			routine.index = (int(routine.index) + 1) % waypoints.size()
			routine.wait = randf_range(0.8, 2.2)
			continue
		npc.position += offset.normalized() * float(routine.speed) * delta
		npc.rotation.y = atan2(offset.x, offset.z)

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
	top.set_anchors_and_offsets_preset(Control.PRESET_TOP_WIDE)
	top.offset_left = 20
	top.offset_top = 16
	top.offset_right = -20
	top.offset_bottom = 58
	root.add_child(top)
	clock_label = Label.new()
	clock_label.add_theme_font_size_override("font_size", 20)
	clock_label.text = "Hari 1 · 08:00"
	top.add_child(clock_label)
	var spacer := Control.new()
	spacer.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	top.add_child(spacer)
	var profile := Button.new()
	profile.text = "Karakter"
	profile.pressed.connect(_toggle_customization)
	top.add_child(profile)
	var save_button := Button.new()
	save_button.text = "Simpan"
	save_button.pressed.connect(_save_game)
	top.add_child(save_button)
	needs_label = Label.new()
	needs_label.position = Vector2(24, 72)
	needs_label.custom_minimum_size = Vector2(260, 145)
	needs_label.add_theme_font_size_override("font_size", 16)
	root.add_child(needs_label)
	info_label = Label.new()
	info_label.set_anchors_and_offsets_preset(Control.PRESET_CENTER_BOTTOM)
	info_label.position = Vector2(-250, -90)
	info_label.custom_minimum_size = Vector2(500, 60)
	info_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	info_label.add_theme_font_size_override("font_size", 17)
	info_label.text = "Selamat datang. Dekati bangunan lalu tekan E untuk berinteraksi."
	root.add_child(info_label)
	customization_panel = PanelContainer.new()
	customization_panel.position = Vector2(24, 220)
	customization_panel.custom_minimum_size = Vector2(310, 260)
	customization_panel.visible = false
	root.add_child(customization_panel)
	var content := VBoxContainer.new()
	content.add_theme_constant_override("separation", 8)
	customization_panel.add_child(content)
	var heading := Label.new()
	heading.text = "KUSTOMISASI KARAKTER"
	heading.add_theme_font_size_override("font_size", 18)
	content.add_child(heading)
	_add_custom_button(content, "Presentasi karakter", 1, 0, 0, 0)
	_add_custom_button(content, "Warna kulit", 0, 1, 0, 0)
	_add_custom_button(content, "Warna rambut", 0, 0, 1, 0)
	_add_custom_button(content, "Warna pakaian", 0, 0, 0, 1)
	var close := Button.new()
	close.text = "Tutup"
	close.pressed.connect(_close_customization)
	content.add_child(close)
	_build_touch_controls(root)
	_update_needs_display()

func _build_touch_controls(root: Control) -> void:
	touch_controls = Control.new()
	touch_controls.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	touch_controls.mouse_filter = Control.MOUSE_FILTER_IGNORE
	touch_controls.visible = OS.has_feature("mobile")
	root.add_child(touch_controls)
	_add_touch_button("↑", "move_forward", Vector2(76, -190), Vector2(64, 64))
	_add_touch_button("←", "move_left", Vector2(8, -122), Vector2(64, 64))
	_add_touch_button("↓", "move_back", Vector2(76, -122), Vector2(64, 64))
	_add_touch_button("→", "move_right", Vector2(144, -122), Vector2(64, 64))
	_add_touch_button("Lari", "sprint", Vector2(-168, -190), Vector2(72, 58))
	_add_touch_button("Lompat", "jump", Vector2(-88, -190), Vector2(78, 58))
	_add_touch_button("Interaksi", "interact", Vector2(-168, -122), Vector2(158, 58))

func _add_touch_button(caption: String, action: String, offset: Vector2, dimensions: Vector2) -> void:
	var button := Button.new()
	button.text = caption
	button.custom_minimum_size = dimensions
	button.set_anchors_preset(Control.PRESET_BOTTOM_RIGHT)
	button.position = offset
	button.size = dimensions
	button.focus_mode = Control.FOCUS_NONE
	button.button_down.connect(func(): Input.action_press(action))
	button.button_up.connect(func(): Input.action_release(action))
	touch_controls.add_child(button)

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

func _update_needs_display() -> void:
	if not is_instance_valid(needs_label):
		return
	var lines: Array[String] = []
	for need in NEED_LABELS:
		lines.append("%s: %d/100" % [NEED_LABELS[need], roundi(float(needs[need]))])
	lines.append("Skill: %.1f  ·  Saldo: Rp%s" % [skill, String.num_int64(wallet)])
	needs_label.text = "KEBUTUHAN\n" + "\n".join(lines)

func _on_interacted(target_id: String, target_name: String, description: String) -> void:
	var feedback := description
	match target_id:
		"home":
			needs.energy = minf(100.0, float(needs.energy) + 30.0)
			needs.hygiene = minf(100.0, float(needs.hygiene) + 28.0)
			feedback = "Beristirahat di rumah. Energi dan kebersihan pulih."
		"cafe", "market":
			if wallet >= 25000:
				wallet -= 25000
				needs.hunger = minf(100.0, float(needs.hunger) + 32.0)
				feedback = "Membeli makanan seharga Rp25.000. Rasa lapar berkurang."
			else:
				feedback = "Saldo belum cukup untuk membeli makanan."
		"park":
			needs.fun = minf(100.0, float(needs.fun) + 28.0)
			needs.social = minf(100.0, float(needs.social) + 16.0)
			feedback = "Bersantai di taman. Hiburan dan kebutuhan sosial pulih."
		"school":
			skill = minf(10.0, skill + 0.2)
			feedback = "Mengikuti sesi belajar singkat. Skill simulasi naik 0,2."
		"workplace":
			feedback = "Lokasi kerja simulasi. Untuk lamaran, tugas, gaji, dan promosi, gunakan Career-Verse versi browser."
	info_label.text = "%s\n%s" % [target_name, feedback]
	_update_needs_display()

func _save_game() -> void:
	var data := {
		"schema_version": 2,
		"player_position": [player.global_position.x, player.global_position.y, player.global_position.z],
		"clock_minutes": clock_minutes,
		"day_count": day_count,
		"game_minutes_elapsed": game_minutes_elapsed,
		"needs": needs,
		"skill": skill,
		"wallet": wallet,
		"gender_index": player.gender_index,
		"skin_index": player.skin_index,
		"hair_index": player.hair_index,
		"outfit_index": player.outfit_index
	}
	var file := FileAccess.open(SAVE_PATH, FileAccess.WRITE)
	if file:
		file.store_string(JSON.stringify(data, "\t"))
		info_label.text = "Progres dunia 3D berhasil disimpan."
	else:
		info_label.text = "Tidak dapat menyimpan progres di perangkat ini."

func _load_game() -> void:
	if not FileAccess.file_exists(SAVE_PATH):
		return
	var file := FileAccess.open(SAVE_PATH, FileAccess.READ)
	if not file:
		return
	var parsed = JSON.parse_string(file.get_as_text())
	if not parsed is Dictionary:
		return
	var pos: Array = parsed.get("player_position", [0, 1.2, 20])
	if pos.size() >= 3:
		player.global_position = Vector3(float(pos[0]), float(pos[1]), float(pos[2]))
	clock_minutes = fposmod(float(parsed.get("clock_minutes", 480.0)), 1440.0)
	day_count = maxi(1, int(parsed.get("day_count", 1)))
	game_minutes_elapsed = maxf(0.0, float(parsed.get("game_minutes_elapsed", 0.0)))
	var saved_needs = parsed.get("needs", {})
	if saved_needs is Dictionary:
		for need in needs:
			needs[need] = clampf(float(saved_needs.get(need, needs[need])), 0.0, 100.0)
	skill = clampf(float(parsed.get("skill", skill)), 1.0, 10.0)
	wallet = maxi(0, int(parsed.get("wallet", wallet)))
	player.gender_index = int(parsed.get("gender_index", 0))
	player.skin_index = int(parsed.get("skin_index", 0))
	player.hair_index = int(parsed.get("hair_index", 0))
	player.outfit_index = int(parsed.get("outfit_index", 0))
	player._apply_appearance()
	_update_clock_and_lighting()
	_update_needs_display()
