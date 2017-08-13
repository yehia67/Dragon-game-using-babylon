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
			applyMovement()
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
	BABYLON.SceneLoader.ImportMesh("drago", "scenes/", "dragon.babylon", scene, function (newMeshes,
	 particleSystems, skeletons) {
	 	var boundingBox = calculateBoundingBoxOfCompositeMeshes(newMeshes);
        newMeshes[0].position = new Babylon.vector3(0.0001,3.6501,3.3172);    
        newMeshes[0].scaling = new Babylon.vector3(1, 1, 1);
        dragonL = newMeshes[0]; });
	
	

	return dragonL;
}


    function applyMovement(){
    	
    	if(isAPressed)
    	{
    		dragonL.position.x -= 1;
    		console.log("shmal A");
    	}
    	if (isDPressed) {
    		dragonL.position.x += 1;
    		console.log("ymyn D");
    	}
       if (isWPressed) {
             dragonL.position.z += 1;
             console.log(" 2odam W");
       }
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

