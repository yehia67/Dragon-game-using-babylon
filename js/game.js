/// <reference path="babylon.max.js" />
/// <reference path="cannon.max.js" />

document.addEventListener("DOMContentLoaded", startGame, false);

var canvas;
var engine;
var scene;
var camera;

var currentLevel;
var dragon;
var coin = [];
var isAPressed = false;
var isDPressed = false;
var isWPressed = false;
var isSPressed = false;
var isLeftPressed = false;
var isRightPressed = false;
var isUpPressed = false;
var isDownPressed = false;
var scenesize = 2000;

function startGame() {
    canvas = document.getElementById("renderCanvas");
    engine = new BABYLON.Engine(canvas);
    currentLevel = 0;
    loadScene();
    loadCoins();
    var skybox = BABYLON.Mesh.CreateBox("skyBox", 10000.0, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;
    skybox.infiniteDistance = true;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("scenes/sky/sky", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;

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

    /*  if (event.key == '37') {
    =======
    if (event.key == 's' || event.key == 'S') {
    isSPressed = true;
    console.log(" S true");

    }
    if (event.key == '37') {
    >>>>>>> e53ff8e2582be527437cb6f8818ce07ee3aedab3
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

    /*if (event.key == '37') {
    =======
    if (event.key == 's' || event.key == 'S') {
    isSPressed = false;
    console.log(" S false");
    }
    if (event.key == '37') {
    >>>>>>> e53ff8e2582be527437cb6f8818ce07ee3aedab3
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
    /*BABYLON.SceneLoader.ImportMesh("", "scenes/", "alduin-dragon.babylon", scene, onDragonLoaded);

    function onDragonLoaded(newMeshes, particleSystems, skeletons) {
        dragon = newMeshes[0];
        dragon.position = new BABYLON.Vector3(0, 30, -1);
        dragon.scaling = new BABYLON.Vector3(0.05, 0.05, 0.05);
        dragon.frontVector = new BABYLON.Vector3(0, 0, -1);
        dragon.rotation.y = 3.14;
        camera.lockedTarget = dragon;
        camera.heightOffset = 20;
        camera.radius = 60;
    }*/

    dragon = new BABYLON.Mesh.CreateBox("dragonBox", 2, scene);

    dragon.checkCollisions = true;

    dragon.material = new BABYLON.StandardMaterial("dragonMaterial", scene);
    dragon.material.diffuseColor = new BABYLON.Color3.Red();
    dragon.position = new BABYLON.Vector3(0, 20, 500);
    dragon.rotation.y = 3.14;
    dragon.frontVector = new BABYLON.Vector3(0, 0, -1);

    camera.lockedTarget = dragon;
}


function applyMovement(){
    dragon.frontVector.x = Math.sin(dragon.rotation.y) * -1;
    dragon.frontVector.z = Math.cos(dragon.rotation.y) * -1;
   if(isAPressed)
   {
      // dragon.frontVector.x += -1;
       //dragon.moveWithCollisions(dragon.frontVector.multiplyByFloats(0, 0, 0));
       dragon.position.x += Math.cos(dragon.rotation.y);
       dragon.position.z += Math.sin(dragon.rotation.y)*-1 ;
      
    }

    if (isWPressed) {
        dragon.moveWithCollisions(dragon.frontVector.multiplyByFloats(1, 1, 1));
    }

    if (isDPressed) {
        //var xpos = Math.cos(dragon.rotation.y) * -1;
       // var left = new BABYLON.Vector3(xpos, 0, 0);
        // dragon.moveWithCollisions(left);
        dragon.position.x += Math.cos(dragon.rotation.y)*-1;
        dragon.position.z += Math.sin(dragon.rotation.y) ;
    }

    if (isSPressed) {
        dragon.moveWithCollisions(dragon.frontVector.multiplyByFloats(-1, 1, -1));
    }

    if (isLeftPressed)
    {
        dragon.rotation.y -= .1 * 0.4;
     //   dragon.frontVector.x  =  Math.sin(dragon.rotation.y) * -1;
     //   dragon.frontVector.z  = Math.cos(dragon.rotation.y) * -1;
    }

    if (isRightPressed)
    {
        dragon.rotation.y += .1 * 0.4;
      //  dragon.frontVector.x = Math.sin(dragon.rotation.y) * -1;
       // dragon.frontVector.z = Math.cos(dragon.rotation.y) * -1;
    }

    if (isUpPressed)
    {
        dragon.position.y += 1 ;
    }

    if (isDownPressed)
    {
        dragon.position.y -= 1;
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
        //  dragon.frontVector.x = Math.sin(dragon.rotation.y) * -1;
        // dragon.frontVector.z = Math.cos(dragon.rotation.y) * -1;

       // dragon.position.z = -475;
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
    ("ground", "scenes/lake.png", scenesize, scenesize,
    50,-150, 100, scene, false, onGroundCreated);

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

function loadCoins() {
    BABYLON.SceneLoader.ImportMesh("", "scenes/", "kimoshhh.babylon", scene, onCoinLoaded);
    var zrand;
    function onCoinLoaded(newMeshes, particleSystems, skeletons) {
        for (var i = 0; i < 4; i++) {
            zrand  = Math.floor(Math.random() * 501);
            newMeshes[0].position = new BABYLON.Vector3(0, 30, zrand);
            newMeshes[0].scaling = new BABYLON.Vector3(0.25, 0.25, 0.25);
            newMeshes[0].material = new BABYLON.StandardMaterial("coinMat", scene);
            newMeshes[0].material.diffuseColor = new BABYLON.Color3.Yellow();
            newMeshes[0].rotation.x = Math.PI / 2;
            coin[i] = newMeshes[0];
        }
    }
}