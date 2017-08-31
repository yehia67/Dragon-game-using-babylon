document.addEventListener("DOMContentLoaded", startGame, false);

var canvas;
var engine;

var Game = {};
Game.scenes = [];
Game.activeScene = 0;

var assetsManager;

var isAPressed = false;
var isDPressed = false;
var isWPressed = false;
var isSPressed = false;
var isLeftPressed = false;
var isRightPressed = false;
var isUpPressed = false;
var isDownPressed = false;

var enemies = [];
var arrows = [];
var coins = [];
var vist = [];
var indicies = [];

var scenesize = 4000;
var maxheight = 300;

function startGame() {
	canvas = document.getElementById("renderCanvas");
	engine = new BABYLON.Engine(canvas);
	Game.createLevelOne();

	assetsManager.load();

	assetsManager.onFinish = function(tasks) {
		engine.runRenderLoop(function() {
			Game.scenes[Game.activeScene].renderLoop();
		});
	}
}

Game.createLevelOne = function() {
	var dragon;

	var meteorFlag = false;
	var fireFlag = false;
	var score = 0;

	var enemyRange = 200;

	var scene = new BABYLON.Scene(engine);

	assetsManager = new BABYLON.AssetsManager(scene);

	scene.collisionsEnabled = true;
	scene.gravity = new BABYLON.Vector3(0, -10, 0);
	scene.enablePhysics(scene.gravity, new BABYLON.CannonJSPlugin());

	//Scene Camera
	var camera = new BABYLON.FollowCamera("dragonCamera", new BABYLON.Vector3.Zero(), scene);

	var light = new BABYLON.HemisphericLight("MainLevelLight", new BABYLON.Vector3(0, 10, 0), scene);

	var sceneIndex = Game.scenes.push(scene) - 1;

	var dragonTask = assetsManager.addMeshTask("Dragon Task", "", "scenes/", "dragon8.babylon");
	dragonTask.onSuccess = function(task) {
		dragon = createDragon(task.loadedMeshes, task.loadedSkeletons, scene, camera);
	}

	var enemiesTask = assetsManager.addMeshTask("Enemies Task", "", "scenes/", "archer_version_3.babylon");
	enemiesTask.onSuccess = function(task) {
		createEnemies(scene, task.loadedMeshes, task.loadedSkeletons, 10);

		createArrows(scene);
	}

	createConfiguredGround(scene);

	Game.scenes[sceneIndex].applyDragonMovement = function(dragon) {
		applyMovement(dragon);
	}

	Game.scenes[sceneIndex].enemiesFire = function(scene, dragon) {
		fireArrows(scene, dragon)
	}

	Game.scenes[sceneIndex].updateEnemy = function(dragon, enemyRange) {
		updateEnemyOrientationAndFire(dragon, enemyRange);
	}

	Game.scenes[sceneIndex].updateArrowsPos = function(dragon) {
		updateArrows(dragon);
	}

	Game.scenes[sceneIndex].renderLoop = function() {
		if(!fireFlag) {
			fireFlag = true;
			setTimeout(function() {
				Game.scenes[sceneIndex].enemiesFire(scene, dragon);
				fireFlag = false;
			}, 5000);
		}

		this.updateArrowsPos(dragon);
		this.updateEnemy(dragon, enemyRange);
		this.applyDragonMovement(dragon);
		this.render();
	}

	return scene;
}

function createDragon(newMeshes, skeletons, scene, camera) {
    var dragon = newMeshes[0];
    dragon.position = new BABYLON.Vector3(0, -100, 30);
    dragon.scaling = new BABYLON.Vector3(0.51, 0.51, 0.51);
    dragon.frontVector = new BABYLON.Vector3(0, 0, -1);
    dragon.rotation.y = 3.14;
    camera.lockedTarget = dragon;
    camera.heightOffset = 20;
    camera.radius = 60;

    var boundingBox = calculateBoundingBoxOfCompositeMeshes(scene, newMeshes, 3);
    dragon.bounder = boundingBox.boxMesh;
    dragon.bounder.position = new BABYLON.Vector3(0, 70, 30);
    dragon.position = dragon.bounder.position;

    return dragon;
}

function applyMovement(dragon){
   	dragon.frontVector.x = Math.sin(dragon.rotation.y) * -1;
    dragon.frontVector.z = Math.cos(dragon.rotation.y) * -1;
    if(isAPressed) {
        var direction = new BABYLON.Vector3(Math.cos(dragon.rotation.y), 0, Math.sin(dragon.rotation.y)*-1);
        dragon.bounder.moveWithCollisions(direction);
    }

    if (isWPressed) {
        dragon.bounder.moveWithCollisions(dragon.frontVector.multiplyByFloats(1, 1, 1));
    }

    if (isDPressed) {
        var direction = new BABYLON.Vector3(Math.cos(dragon.rotation.y) * -1, 0, Math.sin(dragon.rotation.y));
        dragon.bounder.moveWithCollisions(direction);
    }

    if (isSPressed) {
        dragon.bounder.moveWithCollisions(dragon.frontVector.multiplyByFloats(-1, 1, -1));
    }

    if (isLeftPressed)
    {
        dragon.rotation.y -= .1 * 0.4;
    }

    if (isRightPressed)
    {
        dragon.rotation.y += .1 * 0.4;
    }

    if (isUpPressed)
    {
        var up = new BABYLON.Vector3(0, 0.5, 0);
        dragon.bounder.moveWithCollisions(up);
    }

    if (isDownPressed)
    {
        var down = new BABYLON.Vector3(0, -0.5, 0);
        dragon.bounder.moveWithCollisions(down);
    }

    if (dragon.position.x>=scenesize/2)
        dragon.position.x = scenesize / 2;

    if (dragon.position.x <= -scenesize / 2)
        dragon.position.x = -scenesize / 2;

    if (dragon.position.z >= scenesize / 2)
        dragon.position.z = scenesize / 2;

    if (dragon.position.z <= -scenesize / 2)
    {
        dragon.position.z = -scenesize / 2;
    }
    if (dragon.position.y >= maxheight)
        dragon.position.y = maxheight;
}

function createEnemies(scene, newMeshes, skeletons, numOfEnemies) {
    var index = enemies.push(newMeshes[0]) - 1;

    console.log("index ; " + index);

    var boundingBox = calculateBoundingBoxOfCompositeMeshes(scene, newMeshes, 1);
    enemies[index].bounder = boundingBox.boxMesh;
    enemies[index].bounder.enemy = enemies[index];

    enemies[index].skeletons = [];

    enemies[index].position = new BABYLON.Vector3(0, -100, -100);
    enemies[index].bounder.position = enemies[index].position;
    enemies[index].bounder.name = "enemies_0";

    enemies[index].frontVector = new BABYLON.Vector3(0, 0, -1);

    for(var i = 0; i < skeletons.length; i++) {
        enemies[index].skeletons[i] = skeletons[i];
    }

    scene.beginAnimation(enemies[index].skeletons[0], 43, 51, 0.8, true);

    for(var i = 0; i < numOfEnemies - 1; i++) {
    	index = enemies.push(cloneModel(enemies[0], "enemies_" + i)) - 1;

    	enemies[index].bounder.position = new BABYLON.Vector3((Math.random() * 500), -100, (Math.random() * 500));
    	enemies[index].position = enemies[index].bounder.position;

    	scene.beginAnimation(enemies[index].skeletons[0], 43, 51, 0.8, true);
    }
}

function updateEnemyOrientationAndFire(dragon, range) {
	vist = [];
	vist.length = enemies.length;

	for(var i = 0; i < enemies.length; i++) {
		vist[i] = 0;
	}

    for(var i = 0; i < enemies.length; i++) {
        var target = new BABYLON.Vector3(dragon.position.x, enemies[i].position.y, dragon.position.z);
        enemies[i].lookAt(target);
        enemies[i].frontVector = dragon.position.subtract(enemies[i].position);

        if (BABYLON.Vector3.Distance(dragon.position,enemies[i].position) <= range)
        {
            vist[i] = 1;
        }
    }
}

function createArrows(scene) {
	BABYLON.SceneLoader.ImportMesh("", "scenes/", "arrow2.babylon", scene, onArrowLoaded);

    function onArrowLoaded(newMeshes, particleSystems, skeletons) {
        var index = arrows.push(newMeshes[0]) - 1;

        var boundingBox = calculateBoundingBoxOfCompositeMeshes(scene, newMeshes, 2);
        arrows[index].bounder = boundingBox.boxMesh;
        arrows[index].bounder.arrow = arrows[index];
        arrows[index].position = arrows[index].bounder.position;

        arrows[index].skeletons = [];

        arrows[index].speed = 0.009;

        arrows[index].isVisible = false;

        arrows[index].position = enemies[index].bounder.position.add(BABYLON.Vector3.Zero().add(enemies[index].frontVector.normalize().multiplyByFloats(20, 5, 20)));

        arrows[index].scaling = new BABYLON.Vector3(15, 15, 15);

        for(var i = 0; i < skeletons.length; i++) {
            arrows[index].skeletons[i] = skeletons[i];
        }

        console.log("enemies length : " + enemies.length);
        for(var i = 0; i < enemies.length - 1; i++) {

            index = arrows.push(cloneModel(arrows[index], "arrows_" + i)) - 1;

            arrows[index].bounder.position = enemies[index].bounder.position.add(BABYLON.Vector3.Zero().add(enemies[index].frontVector.normalize().multiplyByFloats(20, 5, 20)));
            arrows[index].position = arrows[index].bounder.position;

            arrows[index].scaling = new BABYLON.Vector3(15, 15, 15);

            arrows[index].isVisible = false;

            arrows[index].rotation.y += Math.PI / 2;
        }
    }
}

function fireArrows(scene, dragon) {
	for(var i = 0; i < enemies.length; i++) {
        if(vist[i] === 1){
            scene.beginAnimation(enemies[i].skeletons[0], 1, 43, 0.8, true);
            arrows[i].position = enemies[i].bounder.position.add(BABYLON.Vector3.Zero().add(enemies[i].frontVector.normalize().multiplyByFloats(20, 5, 20)));
            arrows[i].bounder.position = arrows[i].position;
            console.log("bounder : " + arrows[i].bounder.position);
            console.log("arrow : " + arrows[i].position);
            arrows[i].frontVector = dragon.position.subtract(arrows[i].position);
            arrows[i].lookAt(dragon.position);
            arrows[i].rotation.y += Math.PI / 2;
            arrows[i].rotation.y += Math.PI / 6;
            arrows[i].isVisible = true;
            indicies.push(i);
            var index = i;

            resetArrow(i);
            stopAnimation(i);
        }
    }

    function resetArrow(index) {
	    setTimeout(function() {
	        console.log("now at : " + index);
	        if(arrows[index]) {
	            arrows[index].isVisible = false;
	            arrows[index].position = enemies[index].bounder.position.add(BABYLON.Vector3.Zero().add(enemies[index].frontVector.normalize().multiplyByFloats(20, 5, 20)));
	            arrows[index].bounder.position = arrows[index].position;

	            indicies.splice(indicies.indexOf(index), 1);
	        }
	    }, 4000);
	}

	function stopAnimation(index) {
	    setTimeout(function() {
	        if(enemies[index])
	            scene.beginAnimation(enemies[index].skeletons[0], 43, 51, 0.8, true);
	    }, 700);
	}
}

function updateArrows(dragon) {
    for (var i = 0; i < indicies.length; i++) {

        if (arrows[indicies[i]].intersectsMesh(dragon, false)) {

        	arrows[indicies[i]].isVisible = false;
            arrows[indicies[i]].position = enemies[indicies[i]].bounder.position.add(BABYLON.Vector3.Zero().add(enemies[indicies[i]].frontVector.normalize().multiplyByFloats(20, 5, 20)));
            arrows[indicies[i]].bounder.position = arrows[indicies[i]].position;

            indicies.splice(i, 1);
            console.log("dam");
          //  arrows[indicies[i]].hitdragon = true;
        }
        else
            arrows[indicies[i]].bounder.moveWithCollisions(arrows[indicies[i]].frontVector.multiplyByFloats(0.009, 0.009, 0.009));
    }
}

function createConfiguredGround(scene)
{
    var ground = new BABYLON.Mesh.CreateGroundFromHeightMap("ground", "scenes/lake2.png", 1000, 5000,
    50, -150, 200, scene, false, onGroundCreated);

    var groundMaterial = new BABYLON.StandardMaterial("m1", scene);

    // groundMaterial.ambientColor = new BABYLON.Color3(1, 0, 0);
    // groundMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);
    groundMaterial.diffuseTexture = new BABYLON.Texture("scenes/RockMountain.jpg", scene);
    groundMaterial.diffuseTexture.uScale = 10;
    groundMaterial.diffuseTexture.vScale = 10;

    function onGroundCreated() {
        ground.material = groundMaterial;
        ground.checkCollisions = true;
        /*ground.physicsImpostor =  new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.HeightmapImpostor,
            { mass: 0, friction: 10, restitution: .2 }, scene);*/
    }
}

function cloneModel(model,name) {
    //console.log("in cloneModel");
    var tempClone;
    tempClone = model.clone("clone_" + name);
    
    tempClone.bounder = model.bounder.clone("bounder");
    tempClone.bounder.tempClone = tempClone;
    tempClone.bounder.name = name + "_bounder";

    //console.log("bounder done");

    tempClone.skeletons = [];

    if(model.skeletons) {
        for (var i = 0; i < model.skeletons.length; i += 1) {
            tempClone.skeletons[i] = model.skeletons[i].clone("skeleton clone #" + name +  i);
        }
    }

    if (model._children) {
        //model is a parent mesh with multiple _children.
        for (var i = 0; i < model._children.length; i += 1) {
            if (tempClone.skeletons.length > 1) //Mostlikely a seperate skeleton for each child mesh..
                tempClone._children[i].skeleton = tempClone.skeletons[i];
            else //Mostlikely a single skeleton for all child meshes.
                tempClone._children[i].skeleton = tempClone.skeletons[0];
        }
    } else {
        tempClone.skeleton = tempClone.skeletons[0];
    }

    return tempClone;
}


function calculateBoundingBoxOfCompositeMeshes(scene, newMeshes, flag) {
    var minx = 10000; var miny = 10000; var minz = 10000; var maxx = -10000; var maxy = -10000; var maxz = -10000;

    for (var i = 0 ; i < newMeshes.length; i++) {

        var positions = new BABYLON.VertexData.ExtractFromGeometry(newMeshes[i]).positions;
       // newMeshes[i].checkCollisions = true;
        if (!positions) continue;
        var index = 0;

        for (var j = index ; j < positions.length ; j += 3) {
            if (positions[j] < minx)
                minx = positions[j];
            if (positions[j] > maxx)
                maxx = positions[j];
        }
        index = 1;

        for (var j = index ; j < positions.length ; j += 3) {
            if (positions[j] < miny)
                miny = positions[j];
            if (positions[j] > maxy)
                maxy = positions[j];
        }
        index = 2;
        for (var j = index ; j < positions.length ; j += 3) {
            if (positions[j] < minz)
                minz = positions[j];
            if (positions[j] > maxz)
                maxz = positions[j];
        }

    }

    var _lengthX = (minx * maxx > 1) ? Math.abs(maxx - minx) : Math.abs(minx * -1 + maxx);
    var _lengthY = (miny * maxy > 1) ? Math.abs(maxy - miny) : Math.abs(miny * -1 + maxy);
    var _lengthZ = (minz * maxz > 1) ? Math.abs(maxz - minz) : Math.abs(minz * -1 + maxz);
    var _center = new BABYLON.Vector3((minx + maxx) / 2.0, (miny + maxy) / 2.0, (minz + maxz) / 2.0);

    var _boxMesh = BABYLON.Mesh.CreateBox("bounder", 1, scene);

    if(flag === 0) {
        _boxMesh.scaling.x = _lengthX / 10.0;
        _boxMesh.scaling.y = _lengthY + 10;
        _boxMesh.scaling.z = _lengthZ / 5.5;
    } else if(flag === 1) {
        _boxMesh.scaling.x = 10;
        _boxMesh.scaling.y = 30;
        _boxMesh.scaling.z = 10;
    } else if(flag === 2) {
        _boxMesh.scaling.x = 20;
        _boxMesh.scaling.y = 5;
        _boxMesh.scaling.z = 5;
    } else if(flag === 3) {
        _boxMesh.scaling.x = 30;
        _boxMesh.scaling.y = 30;
        _boxMesh.scaling.z = 40;
    }
    _boxMesh.position.y += .5; // if I increase this, the dude gets higher in the skyyyyy
    _boxMesh.checkCollisions = true;
    _boxMesh.material = new BABYLON.StandardMaterial("alpha", scene);
    _boxMesh.material.alpha = .2;
    _boxMesh.isVisible = true;

    return { min: { x: minx, y: miny, z: minz }, max: { x: maxx, y: maxy, z: maxz }, lengthX: _lengthX, lengthY: _lengthY, lengthZ: _lengthZ, center: _center, boxMesh: _boxMesh };
}


document.addEventListener("keydown", function (event) {

    if (event.key == 'a' || event.key == 'A') {
        isAPressed = true;
    }

    if (event.key == 'd' || event.key == 'D') {
        isDPressed = true;
    }

    if (event.key == 'w' || event.key == 'W') {
        isWPressed = true;
    }

    if (event.key == 's' || event.key == 'S') {
        isSPressed = true;
    }
});

document.onkeydown = function (e) {
    if (e.keyCode == 37) {
        isLeftPressed = true;
    }
    if (e.keyCode == 39) {
        isRightPressed = true;
    }
    if (e.keyCode == 38) {
        isUpPressed = true;
    }
    if (e.keyCode == 40) {
        isDownPressed = true;
    }
}

document.onkeyup = function (e) {
    if (e.keyCode == 37) {
        isLeftPressed = false;
    }
    if (e.keyCode == 39) {
        isRightPressed = false;
    }

    if (e.keyCode == 38) {
        isUpPressed = false;
    }
    if (e.keyCode == 40) {
        isDownPressed = false;
    }
}

document.addEventListener("keyup", function () {

    if (event.key == 'a' || event.key == 'A') {
        isAPressed = false;
    }
    if (event.key == 'd' || event.key == 'D') {
        isDPressed = false;
    }
    if (event.key == 'w' || event.key == 'W') {
        isWPressed = false;
    }
    if (event.key == 's' || event.key == 'S') {
        isSPressed = false;
    }
});