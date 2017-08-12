/// <reference path="babylon.max.js" />
/// <reference path="cannon.max.js" />

document.addEventListener("DOMContentLoaded", startGame, false);

var canvas;
var engine;
var scene;
var currentLevel;

var dragon;

function startGame() {
	canvas = document.getElementById("renderCanvas");
	engine = new BABYLON.Engine(canvas);
	currentLevel = 0;
	loadScene();

	engine.runRenderLoop(function() {
		if(scene) {
			scene.render();
		}
	});
}

function loadScene() {
	switch(currentLevel) {
		case 0:
			console.log("called level zero!");
			levelZero();
			break;
		case 1:
			levelOne();
			break;
		case 2:
			levelTwo();
			break;
		case 3:
			levelThree();
			break;
		case 4:
			levelFour();
			break;
	}
}

function createDragon() {
	var dragonLevel = new BABYLON.Mesh.CreateBox("dragon", 2, scene);
	dragonLevel.material = new BABYLON.StandardMaterial("DragonMaterial", scene);
	dragonLevel.material.diffuseColor = new BABYLON.Color3(1, 0, 0);
	dragonLevel.position.y = 6;

	dragonLevel.scaling.z = 6;

	return dragonLevel;
}

function levelZero() {
	scene = new BABYLON.Scene(engine);
	currentLevel = 0;

	//Scene follow camera
	var camera = new BABYLON.ArcRotateCamera("ArcRotateCamera", (Math.PI / 2), (Math.PI / 2) - 0.35, 7, dragon, scene);

	//Scene light
	var light = new BABYLON.HemisphericLight("MainLevelLight", new BABYLON.Vector3(0, 10, 0), scene);

	dragon = createDragon();

	camera.lockedTarget = dragon;
	camera.attachControl(canvas);
}

