/// <reference path="babylon.max.js" />
/// <reference path="cannon.max.js" />

document.addEventListener("DOMContentLoaded", startGame, false);

var canvas;
var engine;
var scene;
var camera;

var currentLevel;
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
	 	dragon = newMeshes[1];
	 	dragon.position = new BABYLON.Vector3(0, 30, 0);
        dragon.scaling = new BABYLON.Vector3(3, 3, 3);
        camera.lockedTarget = dragon;
        camera.radius = 50;
    }
}


    function applyMovement(){
    	
    	if(isAPressed)
    	{
    		dragon.position.x += 1;
    	}
    	if (isDPressed) {
    		dragon.position.x += -1;
    	}
       if (isWPressed) {
             dragon.position.z += -1;
       }
    }



function levelZero() {
	scene = new BABYLON.Scene(engine);
	currentLevel = 0;

    //Scene camera
    camera = new BABYLON.FollowCamera("dragonCamera", new BABYLON.Vector3.Zero(), scene);
    
    createDragon();

    camera.attachControl(canvas, true);

	//Scene light
	var light = new BABYLON.HemisphericLight("MainLevelLight", new BABYLON.Vector3(0, 10, 0), scene);

    var ground = createConfiguredGround();
}

function createConfiguredGround()
{

    var ground = new BABYLON.Mesh.CreateGroundFromHeightMap
        ("ground", "scenes/lake.png", 1000, 1000,
        50,-50, 100, scene, false, onGroundCreated);

    var groundMaterial = new BABYLON.StandardMaterial("m1", scene);
   // groundMaterial.ambientColor = new BABYLON.Color3(1, 0, 0);
   // groundMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);
    groundMaterial.diffuseTexture = new BABYLON.Texture("scenes/RockMountain.jpg", scene);
   groundMaterial.diffuseTexture.uScale = 10;
    groundMaterial.diffuseTexture.vScale = 10;

    function onGroundCreated() {
        ground.material = groundMaterial;
        ground.checkCollisions = true;
    }

    return ground;
}