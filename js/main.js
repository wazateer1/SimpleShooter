var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;

var renderer = new THREE.WebGLRenderer({
	antialias: true
});
renderer.setSize(WIDTH, HEIGHT);
renderer.setClearColor(0xDDDDDD, 1);
document.body.appendChild(renderer.domElement);

var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera(70, WIDTH / HEIGHT, 0.1, 10000);
camera.position.y = 10;
camera.position.z = 20;
camera.rotation.x = -0.5;
scene.add(camera);

var light1 = new THREE.PointLight(0xffffff, 1.1);
light1.position.set(-15, 10, -20);
scene.add(light1);
var light2 = new THREE.PointLight(0xffffff, 0.6);
light2.position.set(0, 50, 0);
scene.add(light2);
var light3 = new THREE.PointLight(0xffffff, 1.1);
light3.position.set(15, 10, 20);
scene.add(light3);

function generateBattleground() {
	var obstCount = Math.round(Math.random() * 3 + 2), //Random obstacle count between one and three
		obstList = ["cube", "sphere", "cone", "cylinder", "octahedron"], //Five available shapes for obstacles
		obstGrid = ["A1", "A2", "A3", "A4", "B1", "B2", "B3", "B4", "C1", "C2", "C3", "C4"]; //12 possible locations (letters being columns parallel to spawning viewpoint)

	var battleground = new Array(obstCount),
		bgObstList = _.sample(obstList, obstCount),
		bgObstGrid = _.sample(obstGrid, obstCount);

	for (var i = 0; i < obstCount; i++) {
		battleground[i] = {
			'obstacle': bgObstList[i],
			'gridlocation': bgObstGrid[i]
		};
	}

	return battleground;
}

function loadBattlegroundGeometry(bg) {
	//Battleground Material (a light yellow with basic lighting)
	var bgMat = new THREE.MeshLambertMaterial({
		color: 0xfffcf0
	});

	//Battleground group
	var bgGroup = new THREE.Group();

	//Floor
	var floorMat = new THREE.MeshBasicMaterial({
		color: 0xfffcf0
	});
	var floorGeometry = new THREE.BoxBufferGeometry(40, 1, 40);
	var floor = new THREE.Mesh(floorGeometry, floorMat);
	floor.position.set(0, -1, 0);
	bgGroup.add(floor);

	bg.forEach(function (e, i, a) {
		var obstacleGeom;
		switch (e.obstacle) {
			case 'cube':
				obstacleGeom = new THREE.BoxGeometry(6, 6, 6);
				break;
			case 'sphere':
				obstacleGeom = new THREE.SphereGeometry(3, 32, 32);
				break;
			case 'cone':
				obstacleGeom = new THREE.ConeGeometry(3, 6, 32);
				break;
			case 'cylinder':
				obstacleGeom = new THREE.CylinderGeometry(3, 3, 6, 32);
				break;
			case 'octahedron':
				obstacleGeom = new THREE.OctahedronGeometry(3);
				break;
		}
		var obstacleMesh = new THREE.Mesh(obstacleGeom, bgMat);
		switch (e.gridlocation) {
			case 'A1':
				obstacleMesh.position.set(-12, 3, -6);
				break;
			case 'A2':
				obstacleMesh.position.set(-6, 3, -6);
				break;
			case 'A3':
				obstacleMesh.position.set(6, 3, -6);
				break;
			case 'A4':
				obstacleMesh.position.set(12, 3, -6);
				break;
			case 'B1':
				obstacleMesh.position.set(-12, 3, 0);
				break;
			case 'B2':
				obstacleMesh.position.set(-6, 3, 0);
				break;
			case 'B3':
				obstacleMesh.position.set(6, 3, 0);
				break;
			case 'B4':
				obstacleMesh.position.set(12, 3, 0);
				break;
			case 'C1':
				obstacleMesh.position.set(-12, 3, 6);
				break;
			case 'C2':
				obstacleMesh.position.set(-6, 3, 6);
				break;
			case 'C3':
				obstacleMesh.position.set(6, 3, 6);
				break;
			case 'C4':
				obstacleMesh.position.set(12, 3, 6);
				break;
		}

		bgGroup.add(obstacleMesh);
	});
	return bgGroup;
}

scene.add(loadBattlegroundGeometry(generateBattleground()));

function render() {
	requestAnimationFrame(render);

	renderer.render(scene, camera);
}
render();
