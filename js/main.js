var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;

var renderer = new THREE.WebGLRenderer({
	antialias: true
});
renderer.setSize(WIDTH, HEIGHT);
renderer.setClearColor(0xDDDDDD, 1);
document.body.appendChild(renderer.domElement);

var scene = new THREE.Scene();

//Check pointers and stuff
var blocker = document.getElementById('blocker');
var instructions = document.getElementById('instructions');

var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
if (havePointerLock) {
	var element = document.body;
	var pointerlockchange = function (event) {
		if (document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element) {
			controlsEnabled = true;
			controls.enabled = true;
			blocker.style.display = 'none';
		} else {
			controls.enabled = false;
			blocker.style.display = '-webkit-box';
			blocker.style.display = '-moz-box';
			blocker.style.display = 'box';
			instructions.style.display = '';
		}
	};
	var pointerlockerror = function (event) {
		instructions.style.display = '';
	};
	// Hook pointer lock state change events
	document.addEventListener('pointerlockchange', pointerlockchange, false);
	document.addEventListener('mozpointerlockchange', pointerlockchange, false);
	document.addEventListener('webkitpointerlockchange', pointerlockchange, false);
	document.addEventListener('pointerlockerror', pointerlockerror, false);
	document.addEventListener('mozpointerlockerror', pointerlockerror, false);
	document.addEventListener('webkitpointerlockerror', pointerlockerror, false);
	instructions.addEventListener('click', function (event) {
		instructions.style.display = 'none';
		// Ask the browser to lock the pointer
		element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
		element.requestPointerLock();
	}, false);
} else {
	instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
}

//Camera + Control (thx Mr Doob)
var camera = new THREE.PerspectiveCamera(50, WIDTH / HEIGHT, 0.1, 10000);
var controls = new THREE.PointerLockControls(camera);
controls.getObject().position.y = 3;
controls.getObject().position.z = 20;
scene.add(controls.getObject());

//Lights
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
	var obstCount = Math.round(Math.random() * 2 + 3), //Random obstacle count between three and five
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

//Control variables
var controlsEnabled = false;
var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var canJump = false;
var prevTime = performance.now();
var velocity = new THREE.Vector3();

function initKeyControls() {
	var onKeyDown = function (event) {
		switch (event.keyCode) {
			case 38: // up
			case 87: // w
				moveForward = true;
				break;
			case 37: // left
			case 65: // a
				moveLeft = true;
				break;
			case 40: // down
			case 83: // s
				moveBackward = true;
				break;
			case 39: // right
			case 68: // d
				moveRight = true;
				break;
			case 32: // space
				if (canJump === true) velocity.y += 7;
				canJump = false;
				break;
		}
	};
	var onKeyUp = function (event) {
		switch (event.keyCode) {
			case 38: // up
			case 87: // w
				moveForward = false;
				break;
			case 37: // left
			case 65: // a
				moveLeft = false;
				break;
			case 40: // down
			case 83: // s
				moveBackward = false;
				break;
			case 39: // right
			case 68: // d
				moveRight = false;
				break;
		}
	};
	document.addEventListener('keydown', onKeyDown, false);
	document.addEventListener('keyup', onKeyUp, false);
}
initKeyControls();

function render() {
	requestAnimationFrame(render);

	if (controlsEnabled) {
		var time = performance.now();
		var delta = (time - prevTime) / 1000;

		velocity.x -= velocity.x * 10.0 * delta;
		velocity.z -= velocity.z * 10.0 * delta;

		velocity.y -= 9.8 * 1.0 * delta; //100.0 = mass

		if (moveForward) velocity.z -= 200.0 * delta;
		if (moveBackward) velocity.z += 200.0 * delta;
		if (moveLeft) velocity.x -= 200.0 * delta;
		if (moveRight) velocity.x += 200.0 * delta;

		controls.getObject().translateX(velocity.x * delta);
		controls.getObject().translateY(velocity.y * delta);
		controls.getObject().translateZ(velocity.z * delta);

		if (controls.getObject().position.y < 3) {
			velocity.y = 0;
			controls.getObject().position.y = 3;
			canJump = true;
		}

		prevTime = time;
	}
	renderer.render(scene, camera);
}

scene.add(loadBattlegroundGeometry(generateBattleground()));

render();
