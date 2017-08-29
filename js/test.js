document.addEventListener("DOMContentLoaded", startGame, false);

var canvas;
var engine;

var Game = {};
Game.scenes = [];
Game.activeScene = 0;
Game.meteorFlag = false;
Game.fireFlag = false;
Game.assetsManager;

var isAPressed = false;
var isDPressed = false;
var isWPressed = false;
var isSPressed = false;
var isLeftPressed = false;
var isRightPressed = false;
var isUpPressed = false;
var isDownPressed = false;

Game.createLevelOne = function() {
	var dragon;

	var enemies = [];
	var arrows = [];
	var coins = [];
	var vist = [];
	var indicies = [];

	var score = 0;

	var scene = new BABYLON.Scene(engine);

	scene.collisionsEnabled = true;
	scene.gravity = new BABYLON.Vector3(0, -10, 0);
	scene.enablePhysics(scene.gravity, new BABYLON.CannonJSPlugin());

	//Scene Camera
	var followCamera = new BABYLON.FollowCamera("dragonCamera", new BABYLON.Vector3.Zero(), scene);

	Game.scenes.push(scene);

	Game.assetsManager = new AssetsManager(scene);

	var dragonTask = Game.assetsManager.addMeshTask("Dragon Task", "", "scenes/",
		"BGE_Dragon_2.5_Blender_Game_Engine.blend.babylon");

	dragonTask.onSuccess = function(task) {
		dragon = createDragon(task.loadedMeshes, task.loadedSkeletons, camera);
		dragon.dragonHealth = 100;
	}

	var enemyTask = Game.assetsManager.addMeshTask("Enemies Task", "", "scenes/",
		"archer_version_3.babylon");

	enemyTask.onSuccess = function(task) {
		createEnemies(enemies, 20, task.loadedMeshes, task.loadedSkeletons);
	}

	var arrowsTask = Game.assetsManager.addMeshTask("Arrows Task", "", "scenes/",
		"arrow2.babylon");

	arrowsTask.onSuccess = function(task) {
		createArrows(arrows, enemies, task.loadedMeshes, task.loadedSkeletons);
	}

	Game.scenes[0].fireArrows = fireArrows(enemies, arrows, scenes, indicies);
	Game.scenes[0].
}

function createDragon(newMeshes, skeletons, camera) {
	var dragon = newMeshes[0];
    dragon.position = new BABYLON.Vector3(0, -100, 30);
    dragon.scaling = new BABYLON.Vector3(0.51, 0.51, 0.51);
    dragon.frontVector = new BABYLON.Vector3(0, 0, -1);
    dragon.rotation.y = 3.14;
    camera.lockedTarget = dragon;
    camera.heightOffset = 20;
    camera.radius = 60;

    var boundingBox = calculateBoundingBoxOfCompositeMeshes(newMeshes, 3);
    dragon.bounder = boundingBox.boxMesh;
    dragon.bounder.position = new BABYLON.Vector3(0, 70, 30);
    dragon.position = dragon.bounder.position;

    return dragon;
}

function createEnemies(enemies, numOfEnemies, newMeshes, skeletons) {
	enemies[0] = newMeshes[0];

    var boundingBox = calculateBoundingBoxOfCompositeMeshes(newMeshes, 1);
    enemies[0].bounder = boundingBox.boxMesh;
    enemies[0].bounder.enemy = enemies[0];

    enemies[0].skeletons = [];

    enemies[0].position = new BABYLON.Vector3((Math.random() * 1000) - 500, -150, (Math.random() * 1000) - 500);

    enemies[0].dead = false;
    enemies[0].fire = false;

    for(var i = 0; i < skeletons.length; i++) {
        enemies[0].skeletons[i] = skeletons[i];
    }

    enemies[0].bounder.name = "enemies_0";
    enemies[0]..frontVector = dragon.position.subtract(enemies[i].position);

	scene.beginAnimation(enemies[0].skeletons[0], 43, 51, 1.0, true);

    for(var i = 0; i < numOfEnemies - 1; i++) {
        enemies[i] = cloneModel(enemies[0], "enemies_" + i);

        enemies[i].position = new BABYLON.Vector3((Math.random() * 1000) - 500, -260, (Math.random() * 1000) - 500);
        enemies[i].bounder.position = enemies[i].position;

        scene.beginAnimation(enemies[i].skeletons[0], 43, 51, 1.0, true);
    }
}

function createArrows(arrows, enemies, newMeshes, skeletons) {
    arrows.length = enemies.length;

	arrows[0] = newMeshes[0];

    var boundingBox = calculateBoundingBoxOfCompositeMeshes(newMeshes, 2);
    arrows[0].bounder = boundingBox.boxMesh;
    arrows[0].bounder.arrow = arrows[0];
    arrows[0].bounder.name = "arrows_0";

    arrows[0].position = arrow.bounder.position;

    arrows[0].isVisible = false;
   	arrows[0].scaling = new BABYLON.Vector3(15, 15, 15);

    arrows[0].skeletons = [];
    arrows[0].speed = 0.009;

	arrows[0].frontVector = dragon.position.subtract(arrows[i].position);
	arrows[i].lookAt(dragon.position);
	arrows[i].bounder.lookAt(dragon.position);
	arrows[i].rotation.y += Math.PI / 2;


    for(var i = 0; i < skeletons.length; i++) {
        arrows[0].skeletons[i] = skeletons[i];
    }

    for(var i = 0; i < enemies.length; i++) {
        arrows[i] = cloneModel(arrow, "arrows_" + i);

        arrows[i].bounder.position = enemies[i].bounder.position.add(BABYLON.Vector3.Zero().add(enemies[i].frontVector.normalize().multiplyByFloats(20, 5, 20)));
    }
}

function fireArrows(enemies, arrows, scene, indicies) {
	for(var i = 0; i < arrows.length; i++) {
	    if(vist[i] === 1){
	        scene.beginAnimation(enemies[i].skeletons[0], 1, 43, 0.8, true);
	        arrows[i].isVisible = true;
	        arrows[i].position = enemies[i].bounder.position.add(BABYLON.Vector3.Zero().add(enemies[i].frontVector.normalize().multiplyByFloats(20, 5, 20)));
	        arrows[i].bounder.position = arrows[i].position;
	        arrows[i].frontVector = dragon.position.subtract(arrows[i].position);
	        arrows[i].lookAt(dragon.position);
	        arrows[i].rotation.y += Math.PI / 2;
	        arrows[i].rotation.y += Math.PI / 6;
	        arrows[i].bounder.rotation.y = arrows[i].rotation;
	        indicies.push(i);

	        resetArrow(i);
	        stopAnimation(i);
	    }
	}
}

function stopAnimation(index) {
    setTimeout(function() {
        if(enemies[index])
            scene.beginAnimation(enemies[index].skeletons[0], 43, 51, 0.8, true);
    }, 700);
}

function resetArrow(index) {
    setTimeout(function() {
        console.log("now at : " + index);
        if(arrows[index]) {
            arrows[index].isVisible = false;
            arrows[index].position = enemies[index].bounder.position.add(BABYLON.Vector3.Zero().add(enemies[index].frontVector.normalize().multiplyByFloats(20, 5, 20)));
            arrows[index].bounder.position = arrows[index].position;
           // arrows[index].hitdragon = false;
            indicies.splice(indicies.indexOf(index), 1);
        }
    }, 3000);
}

function updateArrows(indicies, dragon) {
    for (var i = 0; i < indicies.length; i++) {

        if (arrows[indicies[i]].intersectsMesh(dragon, false)) {
            dragon.dragonHealth -= 10;
          
            updateHealth();
            resetArrow(indicies[i]);
            indicies.splice(i, 1);
            console.log("dam");

        } else
            arrows[indicies[i]].bounder.moveWithCollisions(arrows[indicies[i]].frontVector.multiplyByFloats(0.009, 0.009, 0.009));
    }
}