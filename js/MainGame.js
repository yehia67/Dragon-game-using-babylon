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
var isSpacePressed = false;

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
	//Game.createLevelTwo();

	assetsManager.load();

	assetsManager.onFinish = function(tasks) {
		engine.runRenderLoop(function() {
			Game.scenes[Game.activeScene].renderLoop();
		});
	}
}

Game.createLevelOne = function() {
	var dragon;
	var enemyCount = 50;
	var fireFlag = false;

	var enemyRange = 200;

	var scene = new BABYLON.Scene(engine);

	assetsManager = new BABYLON.AssetsManager(scene);

	var skybox = BABYLON.Mesh.CreateBox("skyBox", 10000.0, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;
    skybox.infiniteDistance = true;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("scenes/sky/sky", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;

	scene.collisionsEnabled = true;
	scene.gravity = new BABYLON.Vector3(0, -10, 0);
	scene.enablePhysics(scene.gravity, new BABYLON.CannonJSPlugin());

	//Scene Camera
	var camera = new BABYLON.FollowCamera("dragonCamera", new BABYLON.Vector3.Zero(), scene);

	var light = new BABYLON.HemisphericLight("MainLevelLight", new BABYLON.Vector3(0, 10, 0), scene);

	createConfiguredGround(scene);

	var sceneIndex = Game.scenes.push(scene) - 1;

	var dragonTask = assetsManager.addMeshTask("Dragon Task", "", "scenes/", "dragon8.babylon");
	dragonTask.onSuccess = function(task) {
		dragon = createDragon(task.loadedMeshes, task.loadedSkeletons, scene, camera);
	}

	var enemiesTask = assetsManager.addMeshTask("Enemies Task", "", "scenes/", "archer_version_3.babylon");
	enemiesTask.onSuccess = function(task) {
		createEnemies(scene, task.loadedMeshes, task.loadedSkeletons, enemyCount);

		createArrows(scene);

		createCoins(scene, dragon);
	}

	Game.scenes[sceneIndex].applyDragonMovement = function(dragon) {
		applyMovement(dragon);
	}

	Game.scenes[sceneIndex].fireDragon = function(scene, dragon) {
		fire(scene, dragon);
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

	Game.scenes[sceneIndex].updateCoins = function() {
		updateCoinsRotation();
	}

	Game.scenes[sceneIndex].updateActiveScene = function(dragon) {
		if(dragon.score === 10) {
			Game.activeScene++;
		}
	}

	Game.scenes[sceneIndex].renderLoop = function() {
		if(!fireFlag) {
			fireFlag = true;
			setTimeout(function() {
				Game.scenes[sceneIndex].enemiesFire(scene, dragon);
				fireFlag = false;
			}, 5000);
		}

		//this.updateActiveScene(dragon);
		this.updateCoins();
		this.updateArrowsPos(dragon);
		this.updateEnemy(dragon, enemyRange);
		this.applyDragonMovement(dragon);
		this.fireDragon(scene, dragon);
		this.render();
	}

	return scene;
}

Game.createLevelTwo = function() {
	var dragon;
    
	var fireFlag = false;
	var meteorFlag = false;

	var enemyRange = 200;

	var scene = new BABYLON.Scene(engine);

	assetsManager = new BABYLON.AssetsManager(scene);

	var skybox = BABYLON.Mesh.CreateBox("skyBox", 10000.0, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;
    skybox.infiniteDistance = true;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("scenes/sky/sky", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;

	scene.collisionsEnabled = true;
	scene.gravity = new BABYLON.Vector3(0, -10, 0);
	scene.enablePhysics(scene.gravity, new BABYLON.CannonJSPlugin());

	//Scene Camera
	var camera = new BABYLON.FollowCamera("dragonCamera", new BABYLON.Vector3.Zero(), scene);

	var light = new BABYLON.HemisphericLight("MainLevelLight", new BABYLON.Vector3(0, 10, 0), scene);

	createConfiguredGround(scene);

	var sceneIndex = Game.scenes.push(scene) - 1;

	var dragonTask = assetsManager.addMeshTask("Dragon Task", "", "scenes/", "dragon8.babylon");
	dragonTask.onSuccess = function(task) {
		dragon = createDragon(task.loadedMeshes, task.loadedSkeletons, scene, camera);
	}

	var enemiesTask = assetsManager.addMeshTask("Enemies Task", "", "scenes/", "archer_version_3.babylon");
	enemiesTask.onSuccess = function(task) {
		createEnemies(scene, task.loadedMeshes, task.loadedSkeletons, 10);

		createArrows(scene);

		createCoins(scene, dragon);
	}

	Game.scenes[sceneIndex].applyDragonMovement = function(dragon) {
		applyMovement(dragon);
	}

	Game.scenes[sceneIndex].fireDragon = function(scene, dragon) {
		fire(scene, dragon);
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

	Game.scenes[sceneIndex].updateCoins = function() {
		updateCoinsRotation();
	}

	Game.scenes[sceneIndex].createMeteors = function(scene, dragon) {
		createRocks(scene, dragon);
	}

	Game.scenes[sceneIndex].renderLoop = function() {
		if(!fireFlag) {
			fireFlag = true;
			setTimeout(function() {
				Game.scenes[sceneIndex].enemiesFire(scene, dragon);
				fireFlag = false;
			}, 5000);
		}

		if(!meteorFlag) {
            meteorFlag = true;
            setTimeout(function() {
                Game.scenes[sceneIndex].createMeteors(scene, dragon);
                meteorFlag = false;
            }, 700);
        }

		//this.updateActiveScene(dragon);
		this.updateCoins();
		this.updateArrowsPos(dragon);
		this.updateEnemy(dragon, enemyRange);
		this.applyDragonMovement(dragon);
		this.fireDragon(scene, dragon);
		this.render();
	}
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

    dragon.score = 0;
    dragon.health = 100;

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

   /* if (isSPressed) {
        dragon.bounder.moveWithCollisions(dragon.frontVector.multiplyByFloats(-1, 1, -1));
    }*/

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


    //Coins collision
    for(var i = 0; i < coins.length; i++) {
    	if(coins[i]) {
	    	if(coins[i].bounder.intersectsMesh(dragon.bounder, false)&& coins[i].isVisible) {
	    	    dragon.score++;

	    	    console.log("score : " + dragon.score);
	    		console.log("da5alt hena");
	    		coins[i].bounder.dispose();
	    		coins[i].dispose();
	    	    //coins[i] = null;
	    		coins.splice(i, 1);
	    	}
	    }
    }
}

function fire(scene, dragon) {
	if(isSpacePressed) {
		var direction = new BABYLON.Vector3(dragon.frontVector.x, -0.5, dragon.frontVector.z);
	    direction.normalize;
	    var fireSystem = new BABYLON.ParticleSystem("particles", 2000, scene)
	    fireSystem.particleTexture = new BABYLON.Texture("js/textures/flare.png", scene);
	    fireSystem.emitter = dragon;
	    fireSystem.minEmitBox = new BABYLON.Vector3(0, 15, -30); 
	    fireSystem.maxEmitBox = new BABYLON.Vector3(0, -300,-100); 
	    fireSystem.color1 = new BABYLON.Color4(1, 0.5, 0, 1.0);
	    fireSystem.color2 = new BABYLON.Color4(1, 0.5, 0, 1.0);
	    fireSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0.0);
	    fireSystem.minSize = 0.3;
	    fireSystem.maxSize = 30;    
	    fireSystem.minLifeTime = 0.2;
	    fireSystem.maxLifeTime = 0.4;
	    fireSystem.emitRate = 800;
	    fireSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
	    fireSystem.gravity = new BABYLON.Vector3(0, 0, 0);
	    fireSystem.direction1 = direction;
	    fireSystem.direction2 = direction;
	    fireSystem.minEmitPower = 1;
	    fireSystem.maxEmitPower = 10;
	    fireSystem.updateSpeed = 0.007;
	    fireSystem.gravity = new BABYLON.Vector3(0, 0, -10);
	    fireSystem.start();

	    var origin = new BABYLON.Vector3(dragon.position.x, dragon.position.y+10, dragon.position.z);
	 
	    
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
	        } else {
	        	return false;
	        }
	    });

	    if(hit.pickedMesh) {
	    	console.log("pickedMesh : " + hit.pickedMesh.name);
	       scene.beginAnimation(hit.pickedMesh.tempClone.skeletons[0], 51, 72, 0.7, true);
	        setTimeout(function() {
	            var index = enemies.indexOf(hit.pickedMesh.tempClone);

	            console.log("index : " + index);
	            hit.pickedMesh.tempClone.dispose();
	            hit.pickedMesh.dispose();
	            arrows[index].bounder.dispose();
	            arrows[index].dispose();
	      
	            //  enemies[index] = null;
	            enemies.splice(index, 1);
	           // arrows[index] = null;
	            indicies.splice(indicies.indexOf(index), 1);
	            arrows.splice(index, 1);
	            coins[index].isVisible = true;
	            coins[index].bounder.checkCollisions = true;
	        }, 900);
	    }

	    setTimeout(function () {
	               fireSystem.stop();
	                
	            }, 500);

	    isSpacePressed = false;
	}

}

function createEnemies(scene, newMeshes, skeletons, numOfEnemies) {
    var index = enemies.push(newMeshes[0]) - 1;
    var enemyDistance = 75;
    var boundingBox = calculateBoundingBoxOfCompositeMeshes(scene, newMeshes, 1);
    enemies[index].bounder = boundingBox.boxMesh;
    enemies[index].bounder.tempClone = enemies[index];

    enemies[index].skeletons = [];

    enemies[index].position = new BABYLON.Vector3(0, 0, 0);
    var direction = new BABYLON.Vector3(0, -1, 0);

    var xPos = (Math.random() * 2001) - 1000;
    var zPos = (Math.random() * 2001) - 1000;

    var ray = new BABYLON.Ray(new BABYLON.Vector3(xPos, 600, zPos), direction, 1000);

    var hit = scene.pickWithRay(ray, function (mesh) {
        if (mesh.name.startsWith("ground")) {
            return true;
        }
    });

    if (hit.pickedMesh) {
        enemies[index].position = hit.pickedPoint;
        enemies[index].position.y += 10;
    }


    for (var i = 0; i < skeletons.length; i++) {
        enemies[index].skeletons[i] = skeletons[i];
    }

    enemies[index].bounder.position = enemies[index].position;
    enemies[index].bounder.name = "enemies_0_bounder";

    enemies[index].frontVector = new BABYLON.Vector3(0, 0, -1);

    scene.beginAnimation(enemies[index].skeletons[0], 43, 51, 0.8, true);
    xPos= -550;

    for (var i = 0; i < numOfEnemies - 1; i++) {
        index = enemies.push(cloneModel(enemies[0], "enemies_" + i)) - 1;

       // xPos = (Math.random() * 2000) - 1000;
        //zPos = (Math.random() * 2000) - 1000;

        zPos = -200 + enemyDistance * (i % 10);
        if (i%10===0 && i!=0) {
            xPos += enemyDistance;
        }
       // console.log("Z": + zpos)
        ray = new BABYLON.Ray(new BABYLON.Vector3(xPos, 500, zPos), direction, 1000);

        hit = scene.pickWithRay(ray, function (mesh) {
            if (mesh.name.startsWith("ground")) {
                return true;
            }
        });

        if (hit.pickedMesh) {
            enemies[index].position = hit.pickedPoint;
            enemies[index].position.y += 10;
        }

        enemies[index].bounder.position = enemies[index].position;

        scene.beginAnimation(enemies[index].skeletons[0], 43, 51, 0.8, true);
    }
   enemies[0].position.x = xPos;
   enemies[0].position.z = -200 + enemyDistance * 9;
   /*for (var i = 0; i < numOfEnemies - 1; i++) {
       enemies[i].position.x = 10 * i;
       enemies[i].position.z = 10;
    }*/
}

function updateEnemyOrientationAndFire(dragon, range) {
	vist = [];
	vist.length = enemies.length;

	for(var i = 0; i < enemies.length; i++) {
		vist[i] = 0;
	}

    for(var i = 0; i < enemies.length; i++) {
    	if(enemies[i]) {
	        var target = new BABYLON.Vector3(dragon.position.x, enemies[i].position.y, dragon.position.z);
	        enemies[i].lookAt(target);
	        enemies[i].frontVector = dragon.position.subtract(enemies[i].position);

	        if (BABYLON.Vector3.Distance(dragon.position,enemies[i].position) <= range)
	        {
	            vist[i] = 1;
	        }
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

    	if(arrows[indicies]) {
	        if (arrows[indicies[i]].bounder.intersectsMesh(dragon.bounder, false)) {

	        	arrows[indicies[i]].isVisible = false;
	            arrows[indicies[i]].position = enemies[indicies[i]].bounder.position.add(BABYLON.Vector3.Zero().add(enemies[indicies[i]].frontVector.normalize().multiplyByFloats(20, 5, 20)));
	            arrows[indicies[i]].bounder.position = arrows[indicies[i]].position;

	            indicies.splice(i, 1);
	            console.log("dam");
	        }
	        else
	            arrows[indicies[i]].bounder.moveWithCollisions(arrows[indicies[i]].frontVector.multiplyByFloats(0.009, 0.009, 0.009));
	    }
    }
}

function createCoins(scene, dragon) {
	BABYLON.SceneLoader.ImportMesh("", "scenes/", "kimoshhh.babylon", scene, onCoinLoaded);

    function onCoinLoaded(newMeshes, particleSystems, skeletons) {
        var index = coins.push(newMeshes[0]) - 1;

        var boundingBox = calculateBoundingBoxOfCompositeMeshes(scene, newMeshes, 0);
        coins[index].bounder = boundingBox.boxMesh;
        coins[index].bounder.tempClone = coins[index];
        coins[index].bounder.ellipsoidOffset.y += 3;
        coins[index].position = coins[index].bounder.position;

        coins[index].position = enemies[index].position;

        coins[index].scaling = new BABYLON.Vector3(0.15, 0.15, 0.15);

        coins[index].material = new BABYLON.StandardMaterial("coinMat", scene);
        coins[index].material.diffuseColor = new BABYLON.Color3.Yellow();

        coins[index].rotation.x = Math.PI / 2;

        coins[index].bounder.position = coins[index].position;

        coins[index].isVisible = false;

        for(var i = 1; i < enemies.length; i++) {
            index = coins.push(cloneModel(coins[index], "coins_" + i)) - 1;
            coins[index].position = enemies[index].position;

            console.log("created coins : " + coins[index].position);
            coins[index].scaling = new BABYLON.Vector3(0.15, 0.15, 0.15);
            coins[index].material = new BABYLON.StandardMaterial("coinMat", scene);
            coins[index].material.diffuseColor = new BABYLON.Color3.Yellow();
            coins[index].rotation.x = Math.PI / 2;

            coins[index].bounder.position = coins[index].position;

            coins[index].isVisible = false;

            coins[index].checkCollisions = false;
            console.log("im here");
        }
    }
}

function updateCoinsRotation() {
	for(var i = 0; i < coins.length; i++) {
		if(coins[i])
			if(coins[i].isVisible === true)
				coins[i].rotation.y += 0.05;
	}
}

function createRocks(scene, dragon){
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
    smokeSystem.emitRate = 50;
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
    fireSystem.emitRate = 150;
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

    fountain.actionManager = new BABYLON.ActionManager(scene);
    fountain.actionManager.registerAction(new BABYLON.ExecuteCodeAction({trigger : BABYLON.ActionManager.OnIntersectionEnterTrigger, 
            parameter : dragon.bounder}, function () {
                dragon.health -= 40;
                console.log("health decreased");
                console.log("dragon health : " + dragon.health);
            }));

    setTimeout(function() {
        fireSystem.stop();
        setTimeout(function() {
            smokeSystem.stop();
            fountain.dispose();
        }, 1000);
    }, 5000); 
}

function createConfiguredGround(scene)
{
    var ground = new BABYLON.Mesh.CreateGroundFromHeightMap("ground", "scenes/lake3.png", scenesize, scenesize,
    50, 0, 500, scene, false, onGroundCreated);

    var groundMaterial = new BABYLON.StandardMaterial("m1", scene);
    ground.name = "ground";
    // groundMaterial.ambientColor = new BABYLON.Color3(1, 0, 0);
    // groundMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);
    groundMaterial.diffuseTexture = new BABYLON.Texture("scenes/RockMountain.jpg", scene);
    groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    groundMaterial.diffuseTexture.uScale = 10;
    groundMaterial.diffuseTexture.vScale = 10;

    function onGroundCreated() {
        ground.material = groundMaterial;
        ground.checkCollisions = true;
        ground.physicsImpostor =  new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.HeightmapImpostor,
            { mass: 0, friction: 10, restitution: .2 }, scene);
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
    _boxMesh.isVisible = false;

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
	if(e.keyCode == 32) {
		isSpacePressed = true;
	}

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