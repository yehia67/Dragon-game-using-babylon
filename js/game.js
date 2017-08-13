/// <reference path="babylon.max.js" />
/// <reference path="cannon.max.js" />

document.addEventListener("DOMContentLoaded", startGame, false);

var canvas;
var engine;
var scene;
var currentLevel;
var dragonL;
var dragon;
var isAPressed = false;
var isDPressed = false;
var isWPressed = false;
function startGame() {
	canvas = document.getElementById("renderCanvas");
	engine = new BABYLON.Engine(canvas);
	currentLevel = 0;
	loadScene();
     
     
	engine.runRenderLoop(function() {
		if(scene) {
			scene.render();
			if(dragon) {
				applyMovement();
			}
		}
	});


    document.addEventListener("keydown", function (event) {

        if (event.key == 'a' || event.key == 'A') {
            isAPressed = true;
            console.log(" A true");
        }
        if (event.key == 'd' || event.key == 'D') {
            isDPressed = true;
            console.log(" D true");
        }
        if (event.key == 'w' || event.key == 'W') {
            isWPressed = true;
            console.log(" W true");
        }
        


    });

    document.addEventListener("keyup", function () {

        if (event.key == 'a' || event.key == 'A') {
            isAPressed = false;
            console.log(" A false");
        }
        if (event.key == 'd' || event.key == 'D') {
            isDPressed = false;
              console.log(" d false");
        }
        if (event.key == 'w' || event.key == 'W') {
            isWPressed = false;
              console.log(" w false");
        }
        // breath fire

       
    });}



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
	BABYLON.SceneLoader.ImportMesh("", "scenes/", "dragon.babylon", scene, onDragonLoaded);

	function onDragonLoaded(newMeshes, particleSystems, skeletons) {
	 	dragon = newMeshes[0];
	 	dragon.position = new BABYLON.Vector3(0, 10, 0);
    }
}


    function applyMovement(){
    	
    	if(isAPressed)
    	{
    		dragon.position.x -= 1;
    		console.log(dragon.position);
    	}
    	if (isDPressed) {
    		dragon.position.x += 1;
    		console.log(dragon.position);
    	}
       if (isWPressed) {
             dragon.position.z += 1;
             console.log(dragon.position);
       }
    }



function levelZero() {
	scene = new BABYLON.Scene(engine);
	currentLevel = 0;
	var box = new BABYLON.Mesh.CreateBox("test_box", 1, scene);
	box.material = new BABYLON.StandardMaterial("mat", scene);
	box.material.diffuseColor = new BABYLON.Color3.Red();
	box.position.z = 10;
      
	//Scene follow camera
	var camera = new BABYLON.ArcRotateCamera("ArcRotateCamera", (Math.PI / 2), (Math.PI / 2) - 0.35, 30, dragon, scene);

	//Scene light
	var light = new BABYLON.HemisphericLight("MainLevelLight", new BABYLON.Vector3(0, 10, 0), scene);

	createDragon();

	camera.lockedTarget = dragon;
	camera.attachControl(canvas);
}

function createConfiguredGround()
{

    var ground = new BABYLON.Mesh.CreateGroundFromHeightMap
        ("ground", "scenes/Landscape1.jpg", 1000, 1000,
        50, 0, 100, scene, false, onGroundCreated);

    var groundMaterial = new BABYLON.StandardMaterial("m1", scene);
    groundMaterial.ambientColor = new BABYLON.Color3(1, 0, 0);
    groundMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);
    groundMaterial.diffuseTexture = new BABYLON.Texture("scenes/checker_large.gif", scene);
    groundMaterial.diffuseTexture.uScale = 10;
    groundMaterial.diffuseTexture.vScale = 10;

    function onGroundCreated() {
        ground.material = groundMaterial;
        ground.checkCollisions = true;
    }

    return ground;
}