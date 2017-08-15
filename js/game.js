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
var isLeftPressed = false;
var isRightPressed = false;
var isUpPressed = false;
var isDownPressed = false;


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
}
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
      /*  if (event.key == '37') {
            isLeftPressed = true;
            
            console.log(" left true");
        }
        if (event.key == '39') {
            isRightPressed = true;
            console.log(" right true");


        }*/
        


    });
    document.onkeydown = function (e) {
        if (e.keyCode == 37) {
            isLeftPressed = true;

           // console.log(" left true");
        }
        if (e.keyCode == 39) {
            isRightPressed = true;
            // console.log(" right true");
        }
            if (e.keyCode == 38) {
                isUpPressed = true;

              //  console.log(" left true");
            }
            if (e.keyCode == 40) {
                isDownPressed = true;
               // console.log(" right true");

        }


    }
    document.onkeyup = function (e) {
        if (e.keyCode == 37) {
            isLeftPressed = false;

           // console.log(" left true");
        }
        if (e.keyCode == 39) {
            isRightPressed = false;
           // console.log(" right true");


        }

        if (e.keyCode == 38) {
            isUpPressed = false;

            //  console.log(" left true");
        }
        if (e.keyCode == 40) {
            isDownPressed = false;
            // console.log(" right true");

        }

    }
    /*document.addEventListener("onkeydown", function (event) {
        console.log(event.keyCode);

        
        if (event.keyCode == 37) {
            isLeftPressed = true;
            
            console.log(" left true");
        }
        if (event.keyCode == 39) {
            isRightPressed = true;
            console.log(" right true");


        }



    });*/

    document.addEventListener("keyup", function () {

        if (event.key == 'a' || event.key == 'A') {
            isAPressed = false;
           // console.log(" A false");
        }
        if (event.key == 'd' || event.key == 'D') {
            isDPressed = false;
           //   console.log(" d false");
        }
        if (event.key == 'w' || event.key == 'W') {
            isWPressed = false;
           //   console.log(" w false");
        }
       /*if (event.key == '37') {
            isLeftPressed = false;

            console.log(" left false");
        }
        if (event.key == '39') {
            isRightPressed = false;

            console.log(" left false");
        }*/
        // breath fire

       
    });



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
	 	dragon.position = new BABYLON.Vector3(0, 30, -1);
	 	dragon.scaling = new BABYLON.Vector3(3, 3, 3);
	 	dragon.frontVector = new BABYLON.Vector3(0, 0, -1);
	 	dragon.rotation.y = 3.14;
        camera.lockedTarget = dragon;
        camera.heightOffset = 20;
        camera.radius = 60;
    }
}


    function applyMovement(){
    	
    	if(isAPressed)
    	{
    	    dragon.position.x += -1;
    	   // console.log("x :" + dragon.position.x)

    	}
    	if (isDPressed) {
    	    dragon.position.x += 1;
    	    //console.log("x :" + dragon.position.x)

    	}
       if (isWPressed) {
           //  dragon.position.z += -1;
           // dragon.moveWithCollisions(dragon.frontVector.multiplyByFloats(1, 1, 1));

           //dragon.frontVector.z--;
         //  console.log(dragon.frontVector.z * Math.cos(dragon.rotation.y)*-1 );
          // console.log(dragon.frontVector.z * Math.cos(dragon.rotation.y) * -1);
           dragon.position.x +=  dragon.frontVector.x /* * Math.cos(dragon.rotation.y) */ *-1;
           dragon.position.z += dragon.frontVector.z /* * Math.cos(dragon.rotation.y)*/  * -1;
           console.log("x :" + dragon.position.x + "       Z:" + dragon.position.z)
           console.log("Front vector x :" + dragon.frontVector.x + "       Z:" + dragon.frontVector.z)


       }
       if (isLeftPressed)
       {
           dragon.rotation.y -= .1 * 0.4;
           dragon.frontVector.x  =  Math.sin(dragon.rotation.y) * -1;
           dragon.frontVector.z  = Math.cos(dragon.rotation.y) * -1;
       }
       if (isRightPressed)
       {
           dragon.rotation.y += .1 * 0.4;
           dragon.frontVector.x = Math.sin(dragon.rotation.y) * -1;
           dragon.frontVector.z = Math.cos(dragon.rotation.y) * -1;
       }
       if (isUpPressed)
       {
           dragon.position.y += 1 ;
       }
       if (isDownPressed)
       {
           dragon.position.y -= 1;
       }
       if (dragon.position.x>=500  )
           dragon.position.x = 500
       if (dragon.position.x <= -500)
           dragon.position.x = -500
       if (dragon.position.z >= 500)
           dragon.position.z = 500
       if (dragon.position.z <= -475)
           dragon.position.z = -475
     //  dragon.frontVector.x = Math.sin(dragon.rotation.y) * -1;
        // dragon.frontVector.z = Math.cos(dragon.rotation.y) * -1;
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
