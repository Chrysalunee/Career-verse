extends Node3D
class_name CVHumanoidVisual

# Replaceable procedural humanoid blockout. Keep proportions and pivots compatible
# with later GLB/Skeleton3D character assets.
var walking := false
var walk_clock := 0.0
var gender_index := 0
var skin_material: StandardMaterial3D
var hair_material: StandardMaterial3D
var outfit_material: StandardMaterial3D
var pants_material: StandardMaterial3D
var shoe_material: StandardMaterial3D
var limb_pivots: Array[Node3D] = []
var torso: MeshInstance3D

func _ready() -> void:
	_build_character()
	set_appearance(Color("#d99b72"), Color("#30231f"), Color("#477b91"), 0)

func _process(delta: float) -> void:
	if walking:
		walk_clock += delta * 9.0
	else:
		walk_clock = move_toward(walk_clock, 0.0, delta * 5.0)
	for i in range(limb_pivots.size()):
		var phase := walk_clock + (PI if i >= 2 else 0.0) + (PI if i % 2 == 1 else 0.0)
		limb_pivots[i].rotation.x = sin(phase) * (0.42 if walking else 0.0)
	if torso:
		torso.position.y = 1.2 + (absf(sin(walk_clock * 2.0)) * 0.035 if walking else 0.0)

func set_walking(value: bool) -> void:
	walking = value

func set_appearance(skin: Color, hair: Color, outfit: Color, gender: int = 0) -> void:
	gender_index = posmod(gender, 2)
	if skin_material == null:
		return
	skin_material.albedo_color = skin
	hair_material.albedo_color = hair
	outfit_material.albedo_color = outfit
	# A subtle silhouette variation; the underlying skeleton/pivots stay compatible.
	if torso:
		torso.scale = Vector3(0.94, 1.0, 0.94) if gender_index == 1 else Vector3.ONE

func _build_character() -> void:
	skin_material = _make_material(Color("#d99b72"), 0.82)
	hair_material = _make_material(Color("#30231f"), 0.9)
	outfit_material = _make_material(Color("#477b91"), 0.88)
	pants_material = _make_material(Color("#40536a"), 0.9)
	shoe_material = _make_material(Color("#302c2b"), 0.95)
	var detail_material := _make_material(Color("#fff3df"), 0.7)
	var iris_material := _make_material(Color("#382820"), 0.55)
	var mouth_material := _make_material(Color("#8d514a"), 0.8)

	torso = _mesh("Torso", _capsule(0.29, 0.78), Vector3(0, 1.2, 0), outfit_material)
	torso.scale = Vector3.ONE
	_mesh("Pelvis", _capsule(0.235, 0.38), Vector3(0, 0.77, 0), pants_material)
	_mesh("Neck", _capsule(0.085, 0.2), Vector3(0, 1.66, 0), skin_material)
	_mesh("Head", _sphere(0.235, 0.47), Vector3(0, 1.88, 0), skin_material)
	_mesh("HairCap", _sphere(0.25, 0.25), Vector3(0, 2.055, -0.018), hair_material).scale = Vector3(1.0, 0.62, 1.0)
	_mesh("HairBack", _sphere(0.235, 0.42), Vector3(0, 1.91, -0.105), hair_material).scale = Vector3(1.0, 0.9, 0.55)
	for side in [-1.0, 1.0]:
		_mesh("Ear", _sphere(0.055, 0.09), Vector3(side * 0.225, 1.88, 0), skin_material)
		_mesh("EyeWhite", _sphere(0.035, 0.045), Vector3(side * 0.083, 1.9, 0.205), detail_material)
		_mesh("Eye", _sphere(0.017, 0.022), Vector3(side * 0.083, 1.9, 0.237), iris_material)
		_mesh("Brow", _capsule(0.018, 0.075), Vector3(side * 0.083, 1.955, 0.207), hair_material)
		_mesh("SideHair", _capsule(0.065, 0.22), Vector3(side * 0.205, 1.91, -0.015), hair_material)
	_mesh("Nose", _sphere(0.035, 0.06), Vector3(0, 1.855, 0.235), skin_material)
	var mouth := _mesh("Mouth", _box(Vector3(0.075, 0.014, 0.012)), Vector3(0, 1.81, 0.222), mouth_material)

	for side in [-1.0, 1.0]:
		var arm_pivot := Node3D.new()
		arm_pivot.name = "ArmPivot"
		arm_pivot.position = Vector3(side * 0.335, 1.48, 0)
		add_child(arm_pivot)
		_mesh("UpperArm", _capsule(0.09, 0.43), Vector3(0, -0.22, 0), outfit_material, arm_pivot)
		_mesh("Forearm", _capsule(0.073, 0.38), Vector3(0, -0.59, 0.015), skin_material, arm_pivot)
		_mesh("Hand", _sphere(0.075, 0.13), Vector3(0, -0.82, 0.025), skin_material, arm_pivot)
		limb_pivots.append(arm_pivot)

	for side in [-1.0, 1.0]:
		var leg_pivot := Node3D.new()
		leg_pivot.name = "LegPivot"
		leg_pivot.position = Vector3(side * 0.145, 0.78, 0)
		add_child(leg_pivot)
		_mesh("Thigh", _capsule(0.115, 0.48), Vector3(0, -0.22, 0), pants_material, leg_pivot)
		_mesh("LowerLeg", _capsule(0.09, 0.43), Vector3(0, -0.59, 0.015), pants_material, leg_pivot)
		_mesh("Shoe", _box(Vector3(0.23, 0.13, 0.36)), Vector3(0, -0.84, 0.065), shoe_material, leg_pivot)
		limb_pivots.append(leg_pivot)

func _make_material(color: Color, rough: float) -> StandardMaterial3D:
	var material := StandardMaterial3D.new()
	material.albedo_color = color
	material.roughness = rough
	return material

func _capsule(radius: float, height: float) -> CapsuleMesh:
	var mesh := CapsuleMesh.new()
	mesh.radius = radius
	mesh.height = height
	mesh.radial_segments = 16
	mesh.rings = 8
	return mesh

func _sphere(radius: float, height: float) -> SphereMesh:
	var mesh := SphereMesh.new()
	mesh.radius = radius
	mesh.height = height
	mesh.radial_segments = 20
	mesh.rings = 12
	return mesh

func _box(size: Vector3) -> BoxMesh:
	var mesh := BoxMesh.new()
	mesh.size = size
	return mesh

func _mesh(part_name: String, mesh_resource: Mesh, pos: Vector3, material: Material, parent: Node = null) -> MeshInstance3D:
	var target: Node = self if parent == null else parent
	var instance := MeshInstance3D.new()
	instance.name = part_name
	instance.mesh = mesh_resource
	instance.position = pos
	instance.material_override = material
	instance.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_ON
	target.add_child(instance)
	return instance
