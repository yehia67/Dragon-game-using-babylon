/// <reference path="babylon.max.js" />
/// <reference path="cannon.max.js" />

document.addEventListener("DOMContentLoaded", startGame, false);

var canvas;
var engine;
var scene;
var camera;
var enemyRange = 200;
var currentLevel;
var dragon;
var enemy;
var dragonHealth;
var coins = [];
var arrows = [];
var enemies = [];
var vist = [];
var indicies = [];
var score = 0;
var healthBar, healthBarContainer;
var arrow;
var ground;
var date = new Date();
var meteorFlag = false;
var updateCollisionFlag = false;
var fireFlag = false;
var NEG_Z_VECTOR = new BABYLON.Vector3(0, -1, -1);

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
    scene.collisionsEnabled = true;

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
                /*if(!meteorFlag) {
                    meteorFlag = true;
                    setTimeout(function() {
                        createRocks();
                        meteorFlag = false;
                    }, 700);
                }*/

                if(updateCollisionFlag) {
                    onCollision(coins);
                    updateCollisionFlag = false;
                }

                updateEnemyOrientationAndFire();

                if(!fireFlag) {
                    fireFlag = true;
                    setTimeout(function() {
                        fireArrows();
                        fireFlag = false;
                    }, 5000);
                }

                updateArrows();
            }
            applyCoinsMovement();
        }
    });
}

function addListenerToDragonFire() {
    document.addEventListener("click", function () {
    
        var fireSystem = new BABYLON.ParticleSystem("particles", 2000, scene)
        fireSystem.particleTexture = new BABYLON.Texture("js/textures/flare.png", scene);
        fireSystem.emitter = dragon;
        fireSystem.minEmitBox = new BABYLON.Vector3(0, 15, -30); 
        fireSystem.maxEmitBox = new BABYLON.Vector3(0, 30, -100); 
        fireSystem.color1 = new BABYLON.Color4(1, 0.5, 0, 1.0);
        fireSystem.color2 = new BABYLON.Color4(1, 0.5, 0, 1.0);
        fireSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0.0);
        fireSystem.minSize = 0.3;
        fireSystem.maxSize = 50;    
        fireSystem.minLifeTime = 0.2;
        fireSystem.maxLifeTime = 0.4;
        fireSystem.emitRate = 600;
        fireSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
        fireSystem.gravity = new BABYLON.Vector3(0, 0, 0);
        fireSystem.direction1 = dragon.frontVector;
        fireSystem.direction2 = dragon.frontVector;
        fireSystem.minEmitPower = 1;
        fireSystem.maxEmitPower = 10;
        fireSystem.updateSpeed = 0.007;
        fireSystem.start();

        var origin = new BABYLON.Vector3(dragon.position.x, dragon.position.y, dragon.position.z);
        var direction = dragon.frontVector;
        direction.normalize;
        var length = 1000;

        var ray = new BABYLON.Ray(origin, direction, length);
        //var rayHelper = new BABYLON.RayHelper(ray);
        //rayHelper.show(scene);

        /*setTimeout(function () {
            rayHelper.hide();
        }, 500);*/

        var hit = scene.pickWithRay(ray, function(mesh) {
            if(mesh.name.startsWith("enemies")) {
                return true;
            }
        });

        if(hit.pickedMesh) {
            console.log("hey you");
            scene.beginAnimation(hit.pickedMesh.tempClone.skeletons[0], 51, 72, 0.7, true);
            setTimeout(function() { 
                hit.pickedMesh.tempClone.dispose();
                hit.pickedMesh.dispose();
            }, 800);
        }

        setTimeout(function () {
                   fireSystem.stop();
                    
                }, 500);

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
    BABYLON.SceneLoader.ImportMesh("", "scenes/", "BGE_Dragon_2.5_Blender_Game_Engine.blend.babylon", scene, onDragonLoaded);

    function onDragonLoaded(newMeshes, particleSystems, skeletons) {
        dragon = newMeshes[0];
        dragon.position = new BABYLON.Vector3(0, 70, 30);
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

        //dragon.checkCollisions = true;

        createHealthBar();

        onCollision(coins);

        addListenerToDragonFire();

        importEnemy();
    }
}

function updateHealth() {
    if(dragonHealth > 0) {
        healthBar.scaling.x = dragonHealth / 100;
        healthBar.position.x = ((15 - ((dragonHealth / 200) * 15)) * -1) + ((dragonHealth / 200) * 15);
    } else {
        dragonHealth = 0;
        healthBar.scaling.x = dragonHealth / 100;
        healthBar.position.x = ((15 - ((dragonHealth / 200) * 15)) * -1) + ((dragonHealth / 200) * 15);
    }
}

function createHealthBar() {
    var healthBarMaterial = new BABYLON.StandardMaterial("hb1mat", scene);
    healthBarMaterial.diffuseColor = new BABYLON.Color3.Green();
    healthBarMaterial.backFaceCulling = false;

    var healthBarContainerMaterial = new BABYLON.StandardMaterial("hb2mat", scene);
    healthBarContainerMaterial.diffuseColor = new BABYLON.Color3.Blue();
    healthBarContainerMaterial.backFaceCulling = false;

    healthBar = BABYLON.MeshBuilder.CreatePlane("hb1", {width:30, height:3, subdivisions:4}, scene);        
    healthBarContainer = BABYLON.MeshBuilder.CreatePlane("hb2", {width:30, height:3, subdivisions:4}, scene);       

    healthBar.position = new BABYLON.Vector3(0, 0, -.01);           // Move in front of container slightly.  Without this there is flickering.
    healthBarContainer.position = new BABYLON.Vector3(0, 35, 0);     // Position above player.

    healthBar.parent = healthBarContainer;
    healthBarContainer.parent = dragon;

    healthBar.material = healthBarMaterial;
    healthBarContainer.material = healthBarContainerMaterial;

    healthBarContainer.rotation.y = Math.PI;
    healthBar.rotation.y = Math.PI;
}
                 
function createRocks(){
    var fountain = BABYLON.Mesh.CreateSphere("foutain", 10, 10, scene, false);
    var xPos = (Math.random() * 1000) - 500;
    var zPos = (Math.random() * 1000) - 500;
    fountain.position = new BABYLON.Vector3(xPos, 500, zPos);
    fountain.material = new BABYLON.StandardMaterial("emitterMat", scene);
    fountain.material.diffuseColor = new BABYLON.Color3(98/256, 93/256, 93/256);
    fountain.physicsImpostor = new BABYLON.PhysicsImpostor(fountain, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1, restitution: 0.9 }, scene);
    fountain.checkCollisions = true;

    var smokeSystem = new BABYLON.ParticleSystem("particles", 1000, scene);
    smokeSystem.particleTexture = new BABYLON.Texture("js/textures/flare.png", scene);
    smokeSystem.emitter = fountain; // the starting object, the emitter
    smokeSystem.minEmitBox = new BABYLON.Vector3(-5, -5, -5); // Starting all from
    smokeSystem.maxEmitBox = new BABYLON.Vector3(25, 25, 25); // To...
    smokeSystem.color1 = new BABYLON.Color4(0.1, 0.1, 0.1, 1.0);
    smokeSystem.color2 = new BABYLON.Color4(0.1, 0.1, 0.1, 1.0);
    smokeSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0.0);
    smokeSystem.minSize = 0.3;
    smokeSystem.maxSize = 50;
    smokeSystem.minLifeTime = 0.3;
    smokeSystem.maxLifeTime = 1.5;
    smokeSystem.emitRate = 350;
    smokeSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
    smokeSystem.gravity = new BABYLON.Vector3(0, 0, 0);
    smokeSystem.direction1 = new BABYLON.Vector3(-1.5, 8, -1.5);
    smokeSystem.direction2 = new BABYLON.Vector3(1.5, 8, 1.5);
    smokeSystem.minAngularSpeed = 0;
    smokeSystem.maxAngularSpeed = Math.PI;
    smokeSystem.minEmitPower = 0.5;
    smokeSystem.maxEmitPower = 1.5;
    smokeSystem.updateSpeed = 0.005;
    smokeSystem.start();
     // Create a particle system
    var fireSystem = new BABYLON.ParticleSystem("particles", 2000, scene);
    //Texture of each particle
    fireSystem.particleTexture = new BABYLON.Texture("js/textures/flare.png", scene);
    // Where the particles come from
    fireSystem.emitter = fountain; // the starting object, the emitter
    fireSystem.minEmitBox = new BABYLON.Vector3(-5, -5, -5); // Starting all from
    fireSystem.maxEmitBox = new BABYLON.Vector3(5, 5, 5); // To...
    // Colors of all particles
    fireSystem.color1 = new BABYLON.Color4(1, 0.5, 0, 1.0);
    fireSystem.color2 = new BABYLON.Color4(1, 0.5, 0, 1.0);
    fireSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0.0);
     // Size of each particle (random between...
    fireSystem.minSize = 0.3;
    fireSystem.maxSize = 5;    
    // Life time of each particle (random between...
    fireSystem.minLifeTime = 0.2;
    fireSystem.maxLifeTime = 0.4;
    // Emission rate
    fireSystem.emitRate = 600;
   // Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
    fireSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
    // Set the gravity of all particles
    fireSystem.gravity = new BABYLON.Vector3(0, 0, 0);
    // Direction of each particle after it has been emitted
    fireSystem.direction1 = new BABYLON.Vector3(0, 4, 0);
    fireSystem.direction2 = new BABYLON.Vector3(0, 4, 0);
    // Angular speed, in radians
    fireSystem.minAngularSpeed = 0;
    fireSystem.maxAngularSpeed = Math.PI;
    // Speed
    fireSystem.minEmitPower = 1;
    fireSystem.maxEmitPower = 3;
    fireSystem.updateSpeed = 0.007;
    // Start the particle system
    fireSystem.start();

    /*fountain.actionManager = new BABYLON.ActionManager(scene);
    fountain.actionManager.registerAction(new BABYLON.ExecuteCodeAction({trigger : BABYLON.ActionManager.OnIntersectionEnterTrigger, 
            parameter : dragon}, function () {
                dragonHealth -= 40;
                updateHealth();
                console.log("health decreased");
            }));*/

    setTimeout(function() {
        fireSystem.stop();
        setTimeout(function() {
            smokeSystem.stop();
            fountain.dispose();
        }, 1000);
    }, 5000); 
}

function importEnemy() {
    BABYLON.SceneLoader.ImportMesh("", "scenes/", "archer_version_3.babylon", scene, onEnemyLoaded);

    function onEnemyLoaded(newMeshes, particleSystems, skeletons) {
        enemy = newMeshes[0];
        var boundingBox = calculateBoundingBoxOfCompositeMeshes(newMeshes, 1);
        enemy.bounder = boundingBox.boxMesh;
        enemy.bounder.enemy = enemy;
        enemy.skeletons = [];
        enemy.dead = false;
        for(var i = 0; i < skeletons.length; i++) {
            enemy.skeletons[i] = skeletons[i];
        }

        for(var i = 0; i < 10; i++) {
            enemies[i] = cloneModel(enemy, "enemies_" + i);
            enemies[i].position = new BABYLON.Vector3((Math.random() * 1000) - 500, 23, (Math.random() * 1000) - 500);
            //enemies[i].checkCollisions = true;
            enemies[i].bounder.position = enemies[i].position;
            scene.beginAnimation(enemies[i].skeletons[0], 43, 51, 1.0, true);
            enemies[i].frontVector = dragon.position.subtract(enemies[i].position);
        }

        vist.length = enemies.length;
        for(var i = 0; i < vist.length; i++) {
            vist[i] = 0;
        }

        importArrow();
    }
}

function importArrow() {
    BABYLON.SceneLoader.ImportMesh("", "scenes/", "arrow2.babylon", scene, onArrowLoaded);

    function onArrowLoaded(newMeshes, particleSystems, skeletons) {
        arrow = newMeshes[0];
        var boundingBox = calculateBoundingBoxOfCompositeMeshes(newMeshes, 2);
        arrow.bounder = boundingBox.boxMesh;
        arrow.bounder.arrow = arrow;
        arrow.position = arrow.bounder.position;
        arrow.skeletons = [];
        arrow.hitdragon = false;
        for(var i = 0; i < skeletons.length; i++) {
            arrow.skeletons[i] = skeletons[i];
        }

        arrows.length = enemies.length;

        for(var i = 0; i < enemies.length; i++) {
            arrows[i] = cloneModel(arrow, "arrows_" + i);
            arrows[i].bounder.position = enemies[i].bounder.position.add(enemies[i].frontVector.normalize().multiplyByFloats(30, 5, 30));
            arrows[i].scaling = new BABYLON.Vector3(15, 15, 15);
            //arrows[i].checkCollisions = true;
            arrows[i].isVisible = false;
            arrows[i].frontVector = dragon.position.subtract(arrows[i].position);
            arrows[i].lookAt(dragon.position);
            arrows[i].bounder.lookAt(dragon.position);
            arrows[i].rotation.y += Math.PI / 2;
        }
    }
}

function fireArrows() {
/*var prev =0 ;
             
 var current= date.getTime();
  if (current-prev >= 5000){
    if(arrow) {
   for (var i = 0 ;i< arrows.length;)
    {console.log("Disposed");
                    arrows[i].bounder.dispose();
                    arrows[i].dispose();
                    arrows.splice(i, 1);
                    
                }
                console.log("out of disposal loop");
          console.log(arrows.length);
        for(var i = 0; i < vist.length; i++) {
            if(vist[i] == 1){
                arrows.push(cloneModel(arrow, "arrows_" + arrows.length-1));
                arrows[arrows.length-1].position = enemies[i].position.add(enemies[i].frontVector.normalize().multiplyByFloats(10, 0, 10));
                arrows[arrows.length-1].bounder.position = arrows[arrows.length-1];
                arrows[arrows.length-1].frontVector = dragon.position.subtract(arrows[arrows.length-1].position);
                arrows[arrows.length-1].scaling = new BABYLON.Vector3(10, 10, 10);
                arrows[arrows.length-1].checkCollisions = true;
                arrows[arrows.length-1].lookAt(dragon.position);
                arrows[arrows.length-1].rotation.y += Math.PI / 2;
                console.log("LOL");
               


                
                }
                console.log("out of firing loop");
          console.log(arrows.length);
                                //enemies[i].beginAnimation(enemies[i].skeletons[0], 131, 163, 1.0, true);
                setTimeout(function() {
                    arrows[arrows.length-1].bounder.dispose();
                    arrows[arrows.length-1].dispose();
                    arrows.splice(arrows.length - 1, 1);
                }, 3000);
            }
        }
  
  prev = current ;
}*/
    //console.log("henaaaa");
    if(arrow) {
        console.log("vist : " + vist.length);
        for(var i = 0; i < arrows.length; i++) {
            if(vist[i] === 1){
                //console.log("arrow : " + arrows[i].position);
                arrows[i].isVisible = true;
                arrows[i].position = enemies[i].bounder.position.add(enemies[i].frontVector.normalize().multiplyByFloats(30, 5, 30));
                arrows[i].bounder.position = arrows[i].position;
                arrows[i].frontVector = dragon.position.subtract(arrows[i].position);
                arrows[i].lookAt(dragon.position);
                arrows[i].rotation.y += Math.PI / 2;
                arrows[i].rotation.y += Math.PI / 6;
                arrows[i].bounder.rotation.y = arrows[i].rotation;
                indicies.push(i);
                var index = i;
                console.log("was at : " + i);

                resetArrow(i);
            }
        }
    }
}

function resetArrow(index) {
    setTimeout(function() {
        console.log("now at : " + index);
        arrows[index].isVisible = false;
        arrows[index].position = enemies[index].bounder.position.add(enemies[index].frontVector.normalize().multiplyByFloats(30, 5, 30));
        arrows[index].bounder.position = arrows[index].position;
       // arrows[index].hitdragon = false;
        indicies.splice(indicies.indexOf(index), 1);
    }, 3000);
}

function updateArrows() {
    if (arrow) {
        for (var i = 0; i < indicies.length; i++) {
           // if (!arrows[indicies[i]].hitdragon) {
                if (arrows[indicies[i]].intersectsMesh(dragon, false)) {
                    //    dragon.dragonHealth -= 40;
                    dragonHealth -= 10;
                  
                    updateHealth();
                    resetArrow(indicies[i]);
                    indicies.splice(i, 1);
                    console.log("dam");
                  //  arrows[indicies[i]].hitdragon = true;
                }
                else
                    arrows[indicies[i]].bounder.moveWithCollisions(arrows[indicies[i]].frontVector.multiplyByFloats(0.009, 0.009, 0.009));
            }
       // }
    }
}

function updateEnemyOrientationAndFire() {
    if(enemy) {
        for(var i = 0; i < enemies.length; i++) {
            var target = new BABYLON.Vector3(dragon.position.x, enemies[i].position.y, dragon.position.z);
            enemies[i].lookAt(target);
            enemies[i].frontVector = dragon.position.subtract(enemy.position);

            if (BABYLON.Vector3.Distance(dragon.position,enemies[i].position) <= enemyRange )
            {
                vist[i] = 1;
            }
            else
            {
                vist[i] = 0;
            }
            if (enemies[i].dead)
            {
                console.log("Hit");
                enemies.splice(i, 1);
                arrows.splice(i, 1);
            }
        }
    }
}

function applyMovement(){
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
        //  dragon.frontVector.x = Math.sin(dragon.rotation.y) * -1;
        // dragon.frontVector.z = Math.cos(dragon.rotation.y) * -1;

       // dragon.position.z = -475;
    }
    if (dragon.position.y >= 300)
        dragon.position.y = 300;
}



function levelZero() {
    scene = new BABYLON.Scene(engine);
    score = 0;
    currentLevel = 0;
    dragonHealth = 100;

    var gravityVector = new BABYLON.Vector3(0, -10, 0);
    var physicsPlugin = new BABYLON.CannonJSPlugin();
    scene.enablePhysics(gravityVector, physicsPlugin);

    scene.collisionsEnabled = true;

    //Scene camera
    camera = new BABYLON.FollowCamera("dragonCamera", new BABYLON.Vector3.Zero(), scene);

    //Scene light
    var light = new BABYLON.HemisphericLight("MainLevelLight", new BABYLON.Vector3(0, 10, 0), scene);

    createConfiguredGround();

    camera.attachControl(canvas, true);

    loadCoins(10);
    createDragon();
   
}

function createConfiguredGround()
{
    ground = new BABYLON.Mesh.CreateGroundFromHeightMap("ground", "scenes/lake.png", scenesize, scenesize,
    50, 0, 200, scene, false, onGroundCreated);

    var groundMaterial = new BABYLON.StandardMaterial("m1", scene);

    // groundMaterial.ambientColor = new BABYLON.Color3(1, 0, 0);
    // groundMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);
    groundMaterial.diffuseTexture = new BABYLON.Texture("scenes/RockMountain.jpg", scene);
    groundMaterial.diffuseTexture.uScale = 10;
    groundMaterial.diffuseTexture.vScale = 10;

    function onGroundCreated() {
        ground.material = groundMaterial;
        ground.checkCollisions = true;
        ground.physicsImpostor =  new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.HeightmapImpostor,
            { mass: 0, friction: 10, restitution: .2 }, scene);
    }

    return ground;
}

//Coins Functions

function loadCoins(numberOfCoins) {
    BABYLON.SceneLoader.ImportMesh("", "scenes/", "kimoshhh.babylon", scene, onCoinLoaded);

    function onCoinLoaded(newMeshes, particleSystems, skeletons) {
        coins[0] = newMeshes[0];

        var boundingBox = calculateBoundingBoxOfCompositeMeshes(newMeshes, 0);
        coins[0].bounder = boundingBox.boxMesh;
        coins[0].bounder.coin = coins[0];
        coins[0].bounder.ellipsoidOffset.y += 3;
        //coins[0].position = coins[0].bounder.position;

        coins[0].position = new BABYLON.Vector3(0, 50, 30);

        coins[0].scaling = new BABYLON.Vector3(0.15, 0.15, 0.15);

        coins[0].material = new BABYLON.StandardMaterial("coinMat", scene);
        coins[0].material.diffuseColor = new BABYLON.Color3.Yellow();

        coins[0].rotation.x = Math.PI / 2;

        coins[0].bounder.position = coins[0].position;

        for(var i = 1; i < numberOfCoins; i++) {
            coins[i] = cloneModel(coins[0], "coins_" + i);
            coins[i].position = new BABYLON.Vector3(0, 50, (i * 30) + 30);
            if(i % 2 == 0) {
                coins[i].position.x = 60;
            }

            coins[i].scaling = new BABYLON.Vector3(0.15, 0.15, 0.15);
            coins[i].material = new BABYLON.StandardMaterial("coinMat", scene);
            coins[i].material.diffuseColor = new BABYLON.Color3.Yellow();
            coins[i].rotation.x = Math.PI / 2;

            coins[i].bounder.position = coins[i].position;
        }
    }
}

function onCollision(array) {
    dragon.bounder.actionManager = new BABYLON.ActionManager(scene);
    array.forEach(function(element) {
        dragon.bounder.actionManager.registerAction(new BABYLON.ExecuteCodeAction({trigger : BABYLON.ActionManager.OnIntersectionEnterTrigger, 
            parameter : element.bounder}, function () {
                element.bounder.dispose();
                element.dispose();
                array.splice(array.indexOf(element), 1);
                score++;
                console.log("score : " + score);
                updateCollisionFlag = true;
            }));
    });
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
            //scene.beginAnimation(tempClone.skeletons[i],0, 120, 1.0, true);
        }
    }

    //tempClone.skeleton = model.skeleton.clone("cloneSkeleton");

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

function applyCoinsMovement() {
    for(var i = 0; i < coins.length; i++) {
        coins[i].rotation.y += 0.05;
    }
}

function calculateBoundingBoxOfCompositeMeshes(newMeshes, flag) {
    var minx = 10000; var miny = 10000; var minz = 10000; var maxx = -10000; var maxy = -10000; var maxz = -10000;

    for (var i = 0 ; i < 1 ; i++) {
        console.log("here");
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
    _boxMesh.isVisible = false;

    return { min: { x: minx, y: miny, z: minz }, max: { x: maxx, y: maxy, z: maxz }, lengthX: _lengthX, lengthY: _lengthY, lengthZ: _lengthZ, center: _center, boxMesh: _boxMesh };

}