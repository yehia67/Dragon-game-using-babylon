function MainGame() {
	document.getElementById("renderCanvas").style.display = "inline-block";
	document.getElementById("container").style.display = "inline-block";
	document.getElementById("scoreLabel").style.display = "inline-block";
	document.getElementById("imgScore").style.display = "inline-block";
	document.getElementById("MainUI").style.display = "none";
	document.getElementById("startGameBtn").style.display = "none";
	document.getElementById("gameInstructionsbtn").style.display = "none";
	document.getElementById("gameInstructions").style.display = "none";
	document.getElementById("youAreDead").style.display = "none";
	document.getElementById("youWonContainer").style.display = "none";

	var canvas;
	var engine;

	var died = false;
	var won = false;

	var Game = {};
	Game.scenes = [];
	Game.activeScene = 0;
	Game.assetsManagers = [];

	var enemiesKilled = 0;

    var bonusScore = 0;

	var isAPressed = false;
	var isDPressed = false;
	var isWPressed = false;
	var isSPressed = false;
	var isLeftPressed = false;
	var isRightPressed = false;
	var isUpPressed = false;
	var isDownPressed = false;
	var isSpacePressed = false;

    var coinTimeOut = 10000;
	var scenesize = 4000;
	var maxheight = 300;

	function startGame() {
		canvas = document.getElementById("renderCanvas");
		engine = new BABYLON.Engine(canvas);
		engine.enableOfflineSupport = false;

		window.addEventListener('resize', function () {
	        engine.resize();
	    });

		Game.createLevelOne();
	    Game.createLevelTwo();
		Game.createLevelThree();

		engine.runRenderLoop(function() {
			if(Game.scenes[Game.activeScene].isReady) {
				Game.scenes[Game.activeScene].renderLoop();
				if(won) {
					engine.stopRenderLoop();

					Winning();
				}
                if(died) {
                    engine.stopRenderLoop();

                    Dead();
                }
            } else {
				return;
            }
		});
	}

	Game.createLevelOne = function() {

		var dragon;
		 
		var fireFlag = false;

		var coinModel

		var enemyRange = 200;

		var scene = new BABYLON.Scene(engine);

		scene.enemies = [];
		scene.arrows = [];
		scene.coins = [];
	    scene.trees = [];
		scene.vist = [];
		scene.enemyCount = 20;
		scene.dragon;
	    scene.castle;

		scene.fireSound;
		scene.coinSound;
		scene.backgroundSound;
		scene.wingsSound;
	    

		Game.assetsManagers[0] = new BABYLON.AssetsManager(scene);

		BABYLON.SceneLoader.ImportMesh("", "scenes/", "kimoshhh.babylon", scene, onCoinLoaded);

		var fireSoundTask = Game.assetsManagers[0].addBinaryFileTask("fire task", "sounds/Small Fireball.mp3");
        fireSoundTask.onSuccess = function (task) {
        	scene.fireSound = new BABYLON.Sound("fire", task.data, scene, null, { loop: false });
        }

        var coinSoundTask = Game.assetsManagers[0].addBinaryFileTask("coin task", "sounds/235273__godowan__coins3.wav");
        coinSoundTask.onSuccess = function (task) {
        	scene.coinSound = new BABYLON.Sound("coin", task.data, scene, null, { loop: false });
        }

        var wingsSoundTask = Game.assetsManagers[0].addBinaryFileTask("Wings sound task", "sounds/Wings Flapping.mp3");
        wingsSoundTask.onSuccess = function(task) {
        	scene.wingsSound = new BABYLON.Sound("wings", task.data, scene, null, { loop : true});
        }

		function onCoinLoaded(newMeshes, particleSystems, skeletons) {
		    coinModel = newMeshes[0];

		    var boundingBox = calculateBoundingBoxOfCompositeMeshes(scene, newMeshes, 0);
		    coinModel.bounder = boundingBox.boxMesh;
		    coinModel.bounder.tempClone = coinModel;
		    coinModel.bounder.ellipsoidOffset.y += 3;
		    coinModel.position = new BABYLON.Vector3(0, 0, 0);

		    coinModel.scaling = new BABYLON.Vector3(0.15, 0.15, 0.15);

		    coinModel.material = new BABYLON.StandardMaterial("coinMat", scene);
		    coinModel.material.diffuseColor = new BABYLON.Color3.Yellow();

		    coinModel.rotation.x = Math.PI / 2;

		    coinModel.bounder.position = coinModel.position;

		    coinModel.isVisible = false;
		    coinModel.bounder.checkCollisions = false;

		    coinModel.diposed = false;
		}

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

		//createConfiguredGround(scene);

		var sceneIndex = Game.scenes.push(scene) - 1;

		var dragonTask = Game.assetsManagers[0].addMeshTask("Dragon Task", "", "dragonKhalil/", "dragonKhalil.babylon");
		dragonTask.onSuccess = function(task) {
			dragon = createDragon(task.loadedMeshes, task.loadedSkeletons, scene, camera);
			scene.dragon = dragon;
		}

		var enemiesTask = Game.assetsManagers[0].addMeshTask("Enemies Task", "", "scenes/", "archer_version_3.babylon");
		enemiesTask.onSuccess = function(task) {
		    createEnemies(scene, task.loadedMeshes, task.loadedSkeletons, scene.enemyCount);
		}

		var arrowsTask = Game.assetsManagers[0].addMeshTask("Arrows Task", "", "scenes/", "arrow2.babylon");
		arrowsTask.onSuccess = function(task) {
		    createArrows(scene, task.loadedMeshes, task.loadedSkeletons, 0.03, scene.enemyCount);
		}

	    /*var CastleTask = Game.assetsManagers[0].addMeshTask("Castle Task", "", "scenes/", "castle.babylon");
	    CastleTask.onSuccess = function(task) {
	        scene.castle = task.loadedMeshes[0];
	        scene.castle.scaling = new BABYLON.Vector3(30, 30, 30);
	    }*/
	  
	    var TreeTask = Game.assetsManagers[0].addMeshTask("Tree Task", "", "scenes/", "tree.babylon");
	    TreeTask.onSuccess = function(task) {
	        createTrees(scene, task.loadedMeshes, task.loadedSkeletons, 25);
	    }

		Game.scenes[sceneIndex].applyDragonMovement = function (scene, dragon) {
	        applyMovement(scene, dragon);
	    }

	    Game.scenes[sceneIndex].fireDragon = function (scene, dragon, coinModel) {
	        fire(scene, dragon, coinModel);
	    }

	    Game.scenes[sceneIndex].enemiesFire = function (scene, dragon) {
	        fireArrows(scene, dragon)
	    }

	    Game.scenes[sceneIndex].updateEnemy = function (scene, dragon, enemyRange) {
	        updateEnemyOrientationAndFire(scene, dragon, enemyRange);
	    }

	    Game.scenes[sceneIndex].updateArrowsPos = function (scene, dragon) {
	        updateArrows(scene, dragon);
	    }

	    Game.scenes[sceneIndex].updateCoins = function (scene) {
	        updateCoinsRotation(scene);
	    }

	    Game.scenes[sceneIndex].createMeteors = function (scene, dragon) {
	        createRocks(scene, dragon);
	    }

		Game.scenes[sceneIndex].updateActiveScene = function(dragon) {
		    if (enemiesKilled === scene.enemyCount) {
		    		won = true;
		            enemiesKilled = 0;
		            Game.activeScene++;
		            Game.assetsManagers[Game.activeScene].load();
			}
		}

		Game.assetsManagers[0].load();

		Game.scenes[sceneIndex].isReady = false;

		Game.assetsManagers[0].onFinish = function(tasks) {
			console.log("here");
			createConfiguredGround(scene, "scenes/lake4.png", "textures/grass.png");
	    	document.getElementById("scoreLabel").textContent = "x " + dragon.score;
	    	scene.wingsSound.play();
		}

		Game.scenes[sceneIndex].renderLoop = function() {
			if(!fireFlag) {
				fireFlag = true;
				setTimeout(function() {
					Game.scenes[sceneIndex].enemiesFire(scene, dragon);
					fireFlag = false;
				}, 5000);
			}

			this.updateActiveScene(dragon);
			this.updateCoins(scene);
			this.updateArrowsPos(scene, dragon);
			this.updateEnemy(scene, dragon, enemyRange);
			this.applyDragonMovement(scene, dragon);
			this.fireDragon(scene, dragon, coinModel);
			this.render();
		}

		return scene;
	}

	Game.createLevelTwo = function() {
		var dragon;
		var fireFlag = false;
		var meteorFlag = false;

		var coinModel;

		var enemyRange = 250;

		var scene = new BABYLON.Scene(engine);

		scene.enemies = [];
		scene.arrows = [];
		scene.coins = [];
		scene.vist = [];

		scene.enemyCount = 25;

		scene.dragon;
	    scene.castle;
		scene.cactus = [];

	    scene.fireSound;
		scene.coinSound;
		scene.backgroundSound;

		Game.assetsManagers[1] = new BABYLON.AssetsManager(scene);

        var fireSoundTask = Game.assetsManagers[1].addBinaryFileTask("fire task", "sounds/Small Fireball.mp3");
        fireSoundTask.onSuccess = function (task) {
        	scene.fireSound = new BABYLON.Sound("fire", task.data, scene, null, { loop: false });
        }

        var coinSoundTask = Game.assetsManagers[1].addBinaryFileTask("coin task", "sounds/235273__godowan__coins3.wav");
        coinSoundTask.onSuccess = function (task) {
        	scene.coinSound = new BABYLON.Sound("coin", task.data, scene, null, { loop: false });
        }

		BABYLON.SceneLoader.ImportMesh("", "scenes/", "kimoshhh.babylon", scene, onCoinLoaded);

		function onCoinLoaded(newMeshes, particleSystems, skeletons) {
		    coinModel = newMeshes[0];

		    var boundingBox = calculateBoundingBoxOfCompositeMeshes(scene, newMeshes, 0);
		    coinModel.bounder = boundingBox.boxMesh;
		    coinModel.bounder.tempClone = coinModel;
		    coinModel.bounder.ellipsoidOffset.y += 3;
		    coinModel.position = new BABYLON.Vector3(0, 0, 0);

		    coinModel.scaling = new BABYLON.Vector3(0.15, 0.15, 0.15);

		    coinModel.material = new BABYLON.StandardMaterial("coinMat", scene);
		    coinModel.material.diffuseColor = new BABYLON.Color3.Yellow();

		    coinModel.rotation.x = Math.PI / 2;

		    coinModel.bounder.position = coinModel.position;

		    coinModel.isVisible = false;
		    coinModel.bounder.checkCollisions = false;

		    coinModel.diposed = false;
		}

		var skybox = BABYLON.Mesh.CreateBox("skyBox", 10000.0, scene);
	    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
	    skyboxMaterial.backFaceCulling = false;
	    skyboxMaterial.disableLighting = true;
	    skybox.material = skyboxMaterial;
	    skybox.infiniteDistance = true;
	    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("scenes/sky/sky", scene);
	    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;

	    /*scene.fogMode = BABYLON.Scene.FOGMODE_EXP
	    scene.fogDensity = 0.002;
	    scene.fogColor = new BABYLON.Color3(0.9, 0.9, 0.85);*/

		scene.collisionsEnabled = true;
		scene.gravity = new BABYLON.Vector3(0, -10, 0);
		scene.enablePhysics(scene.gravity, new BABYLON.CannonJSPlugin());

		var camera = new BABYLON.FollowCamera("dragonCamera", new BABYLON.Vector3.Zero(), scene);

		var light = new BABYLON.HemisphericLight("MainLevelLight", new BABYLON.Vector3(0, 10, 0), scene);

		var sceneIndex = Game.scenes.push(scene) - 1;

		var dragonTask = Game.assetsManagers[1].addMeshTask("Dragon Task", "", "dragonKhalil/", "dragonKhalil.babylon");
		dragonTask.onSuccess = function(task) {
			dragon = createDragon(task.loadedMeshes, task.loadedSkeletons, scene, camera);

			scene.dragon = dragon;
		}
		bonusScore = 0;
		var enemiesTask = Game.assetsManagers[1].addMeshTask("Enemies Task", "", "scenes/", "archer_version_3.babylon");
		enemiesTask.onSuccess = function(task) {
			createEnemies(scene, task.loadedMeshes, task.loadedSkeletons, scene.enemyCount);
		}

		var arrowsTask = Game.assetsManagers[1].addMeshTask("Arrows Task", "", "scenes/", "arrow2.babylon");
		arrowsTask.onSuccess = function(task) {
			createArrows(scene, task.loadedMeshes, task.loadedSkeletons, 0.06, scene.enemyCount);
		}

	    var CactusTask = Game.assetsManagers[1].addMeshTask("Cactus Task", "", "scenes/", "cactusplant.babylon");
        CactusTask.onSuccess = function(task) {
	        createCactus(scene, task.loadedMeshes, task.loadedSkeletons, 10);
	    }

		Game.scenes[sceneIndex].applyDragonMovement = function (scene, dragon) {
	        applyMovement(scene, dragon);
	    }

	    Game.scenes[sceneIndex].fireDragon = function (scene, dragon, coinModel) {
	        fire(scene, dragon, coinModel);
	    }

	    Game.scenes[sceneIndex].enemiesFire = function (scene, dragon) {
	        fireArrows(scene, dragon)
	    }

	    Game.scenes[sceneIndex].updateEnemy = function (scene, dragon, enemyRange) {
	        updateEnemyOrientationAndFire(scene, dragon, enemyRange);
	    }

	    Game.scenes[sceneIndex].updateArrowsPos = function (scene, dragon) {
	        updateArrows(scene, dragon);
	    }

	    Game.scenes[sceneIndex].updateCoins = function (scene) {
	        updateCoinsRotation(scene);
	    }

	    Game.scenes[sceneIndex].createMeteors = function (scene, dragon) {
	        createRocks(scene, dragon);
	    }

	    Game.scenes[sceneIndex].updateActiveScene = function(dragon) {
	        if (enemiesKilled === scene.enemyCount) {
	            maxheight = 600;
				Game.activeScene++;
				Game.assetsManagers[Game.activeScene].load();
				enemiesKilled = 0;
			}
		}

	    Game.scenes[sceneIndex].isReady = false;

	    Game.assetsManagers[1].onFinish = function() {
	    	createConfiguredGround(scene, "scenes/lake3.png", "textures/sand.jpg");
	    	document.getElementById("scoreLabel").textContent = "x " + dragon.score;
	    }

		Game.scenes[sceneIndex].renderLoop = function() {
			if(!fireFlag) {
				fireFlag = true;
				setTimeout(function() {
					Game.scenes[sceneIndex].enemiesFire(scene, dragon);
					fireFlag = false;
				}, 4500);
			}

			if(!meteorFlag) {
	            meteorFlag = true;
	            setTimeout(function() {
	                Game.scenes[sceneIndex].createMeteors(scene, dragon);
	                meteorFlag = false;
	            }, 900);
	        }

			this.updateActiveScene(dragon);
			this.updateCoins(scene);
			this.updateArrowsPos(scene, dragon);
			this.updateEnemy(scene, dragon, enemyRange);
			this.applyDragonMovement(scene, dragon);
			this.fireDragon(scene, dragon, coinModel);
			this.render();
		}
	}

	Game.createLevelThree = function () {
	    var dragon;
	    var fireFlag = false;
	    var meteorFlag = false;

	    var enemyRange = 300;

	    var coindModel;

	    var scene = new BABYLON.Scene(engine);

	    scene.enemies = [];
		scene.arrows = [];
		scene.coins = [];
		scene.vist = [];
		scene.enemyCount = 30;
		scene.dragon;

		scene.fireSound;
		scene.coinSound;
		scene.backgroundSound;

	    Game.assetsManagers[2] = new BABYLON.AssetsManager(scene);

        var fireSoundTask = Game.assetsManagers[2].addBinaryFileTask("fire task", "sounds/Small Fireball.mp3");
        fireSoundTask.onSuccess = function (task) {
        	scene.fireSound = new BABYLON.Sound("fire", task.data, scene, null, { loop: false });
        }

        var coinSoundTask = Game.assetsManagers[2].addBinaryFileTask("coin task", "sounds/235273__godowan__coins3.wav");
        coinSoundTask.onSuccess = function (task) {
        	scene.coinSound = new BABYLON.Sound("coin", task.data, scene, null, { loop: false });
        }

	    BABYLON.SceneLoader.ImportMesh("", "scenes/", "kimoshhh.babylon", scene, onCoinLoaded);

	    function onCoinLoaded(newMeshes, particleSystems, skeletons) {
	        coinModel = newMeshes[0];

	        var boundingBox = calculateBoundingBoxOfCompositeMeshes(scene, newMeshes, 0);
	        coinModel.bounder = boundingBox.boxMesh;
	        coinModel.bounder.tempClone = coinModel;
	        coinModel.bounder.ellipsoidOffset.y += 3;
	        coinModel.position = new BABYLON.Vector3(0, 0, 0);

	        coinModel.scaling = new BABYLON.Vector3(0.15, 0.15, 0.15);

	        coinModel.material = new BABYLON.StandardMaterial("coinMat", scene);
	        coinModel.material.diffuseColor = new BABYLON.Color3.Yellow();

	        coinModel.rotation.x = Math.PI / 2;

	        coinModel.bounder.position = coinModel.position;

	        coinModel.isVisible = false;
	        coinModel.bounder.checkCollisions = false;

	        coinModel.diposed = false;
	    }

	    var skybox = BABYLON.Mesh.CreateBox("skyBox", 10000.0, scene);
	    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
	    skyboxMaterial.backFaceCulling = false;
	    skyboxMaterial.disableLighting = true;
	    skybox.material = skyboxMaterial;
	    skybox.infiniteDistance = true;
	    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("scenes/sky/sky", scene);
	    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;

	    scene.fogMode = BABYLON.Scene.FOGMODE_EXP
	    scene.fogDensity = 0.002;
	    scene.fogColor = new BABYLON.Color3(0.9, 0.9, 0.85);

	    scene.collisionsEnabled = true;
	    scene.gravity = new BABYLON.Vector3(0, -10, 0);
	    scene.enablePhysics(scene.gravity, new BABYLON.CannonJSPlugin());

	    var camera = new BABYLON.FollowCamera("dragonCamera", new BABYLON.Vector3.Zero(), scene);

	    var light = new BABYLON.HemisphericLight("MainLevelLight", new BABYLON.Vector3(0, 10, 0), scene);

	    var sceneIndex = Game.scenes.push(scene) - 1;

	    var dragonTask = Game.assetsManagers[2].addMeshTask("Dragon Task", "", "dragonKhalil/", "dragonKhalil.babylon");
	    dragonTask.onSuccess = function (task) {
	        dragon = createDragon(task.loadedMeshes, task.loadedSkeletons, scene, camera);

	        scene.dragon = dragon;
	    }


	    var enemiesTask = Game.assetsManagers[2].addMeshTask("Enemies Task", "", "scenes/", "archer_version_3.babylon");
	    enemiesTask.onSuccess = function (task) {
	        createEnemies(scene, task.loadedMeshes, task.loadedSkeletons, scene.enemyCount);
	    }

	    var arrowsTask = Game.assetsManagers[2].addMeshTask("Arrows Task", "", "scenes/", "arrow2.babylon");
		arrowsTask.onSuccess = function(task) {
		    createArrows(scene, task.loadedMeshes, task.loadedSkeletons, 0.1, scene.enemyCount);
		}
	     
	    Game.scenes[sceneIndex].applyDragonMovement = function (scene, dragon) {
	        applyMovement(scene, dragon);
	    }

	    Game.scenes[sceneIndex].fireDragon = function (scene, dragon, coinModel) {
	        fire(scene, dragon, coinModel);
	    }

	    Game.scenes[sceneIndex].enemiesFire = function (scene, dragon) {
	        fireArrows(scene, dragon)
	    }

	    Game.scenes[sceneIndex].updateEnemy = function (scene, dragon, enemyRange) {
	        updateEnemyOrientationAndFire(scene, dragon, enemyRange);
	    }

	    Game.scenes[sceneIndex].updateArrowsPos = function (scene, dragon) {
	        updateArrows(scene, dragon);
	    }

	    Game.scenes[sceneIndex].updateCoins = function (scene) {
	        updateCoinsRotation(scene);
	    }

	    Game.scenes[sceneIndex].createMeteors = function (scene, dragon) {
	        createRocks(scene, dragon);
	    }

	    Game.scenes[sceneIndex].haveWon = function() {
	    	if(enemiesKilled === 25) {
	    		won = true;
	    	}
	    }

	    Game.scenes[sceneIndex].isReady = false;

	    Game.assetsManagers[2].onFinish = function() {
	    	createConfiguredGround(scene, "scenes/hm4.png", "scenes/vc_texture.jpg");
	    	document.getElementById("scoreLabel").textContent = "x " + dragon.score;
	    }

	    Game.scenes[sceneIndex].renderLoop = function () {
	        if (!fireFlag) {
	            fireFlag = true;
	            setTimeout(function () {
	                Game.scenes[sceneIndex].enemiesFire(scene, dragon);
	                fireFlag = false;
	            }, 4000);
	        }

	        if (!meteorFlag) {
	            meteorFlag = true;
	            setTimeout(function () {
	                Game.scenes[sceneIndex].createMeteors(scene, dragon);
	                meteorFlag = false;
	            }, 500);
	        }

	        this.haveWon();
	        this.updateCoins(scene);
			this.updateArrowsPos(scene, dragon);
			this.updateEnemy(scene, dragon, enemyRange);
			this.applyDragonMovement(scene, dragon);
			this.fireDragon(scene, dragon, coinModel);
			this.render();
	    }
	}

	function createDragon(newMeshes, skeletons, scene, camera) {
	    var dragon = newMeshes[0];

	    dragon.skeletons = [];

	    for(var i = 0; i < skeletons.length; i++) {
	    	dragon.skeletons[i] = skeletons[i];
	    }

	    var theSkin = scene.getMaterialByName("untitled.WyvernSkin");
		theSkin.backFaceCulling = false;

	    scene.beginAnimation(dragon.skeletons[0], 41, 49, 0.01, true);

	    dragon.scaling = new BABYLON.Vector3(25, 25, 25);
	    dragon.frontVector = new BABYLON.Vector3(0, 0, -1);
	    dragon.rotation.y = 3.14;
	    camera.lockedTarget = dragon;
	    camera.heightOffset = 20;
	    camera.radius = 80;

	    var boundingBox = calculateBoundingBoxOfCompositeMeshes(scene, newMeshes, 3);
	    dragon.bounder = boundingBox.boxMesh;
		dragon.bounder.position = dragon.position;

	    dragon.score = 0;
	    dragon.health = 100+bonusScore;
	    dragon.isDead = false;

	    createHealthBar(scene, dragon);
	    if (Game.activeScene === 2)
	    {
	        dragon.position.y = maxheight - 50;
	    }
	    return dragon;
	}

	function createHealthBar(scene, dragon) {
	    var healthBarMaterial = new BABYLON.StandardMaterial("hb1mat", scene);
	    healthBarMaterial.diffuseColor = new BABYLON.Color3.Green();
	    healthBarMaterial.backFaceCulling = false;

	    var healthBarContainerMaterial = new BABYLON.StandardMaterial("hb2mat", scene);
	    healthBarContainerMaterial.diffuseColor = new BABYLON.Color3.Blue();
	    healthBarContainerMaterial.backFaceCulling = false;

	    healthBar = BABYLON.MeshBuilder.CreatePlane("hb1", {width:1.5, height:0.07, subdivisions:4}, scene);        
	    healthBarContainer = BABYLON.MeshBuilder.CreatePlane("hb2", {width:1.5, height:.07, subdivisions:4}, scene);

	    healthBar.scaling.x = dragon.health / 100;
	    healthBarContainer.scaling.x = dragon.health / 100;    

	    healthBar.position = new BABYLON.Vector3(0, .001, -.01);           // Move in front of container slightly.  Without this there is flickering.
	    healthBarContainer.position = new BABYLON.Vector3(0, 1, 0);     // Position above player.

	    healthBar.parent = healthBarContainer;
	    healthBarContainer.parent = dragon;

	    healthBar.material = healthBarMaterial;
	    healthBarContainer.material = healthBarContainerMaterial;

	    healthBarContainer.rotation.y = Math.PI;
	    healthBar.rotation.y = Math.PI;
	}

	function updateHealth(scene, dragon) {
	    if(dragon.health > 0) {
	        healthBar.scaling.x = dragon.health / 100;
	        healthBar.position.x = ((0.75 - ((dragon.health / 200) * 0.75)) * -1) + ((dragon.health / 200) * 0.75);
	    } else {
	    	healthBar.scaling.x = dragon.health / 100;
	        healthBar.position.x = ((0.75 - ((dragon.health / 200) * 0.75)) * -1) + ((dragon.health / 200) * 0.75);
	        if(!dragon.isDead) {
	            dragon.isDead = true;
	            scene.beginAnimation(dragon.skeletons[0], 1, 28, 3, true);
	            setTimeout(function() {
	                died = true;
	            }, 1070);
	        }
	    }
	}

	function applyMovement(scene, dragon){
	   	dragon.frontVector.x = Math.sin(dragon.rotation.y) * -1;
	    dragon.frontVector.z = Math.cos(dragon.rotation.y) * -1;
	    if(isAPressed) {
	        var direction = new BABYLON.Vector3(Math.cos(dragon.rotation.y), 0, Math.sin(dragon.rotation.y)*-1);
	        dragon.bounder.moveWithCollisions(direction);
	    }

	    if (isWPressed) {
	        dragon.bounder.moveWithCollisions(dragon.frontVector.multiplyByFloats(2, 0, 2));
	    }

	    if (isDPressed) {
	        var direction = new BABYLON.Vector3(Math.cos(dragon.rotation.y) * -1, 0, Math.sin(dragon.rotation.y));
	        dragon.bounder.moveWithCollisions(direction);
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
	        var up = new BABYLON.Vector3(0, 1, 0);
	        dragon.bounder.moveWithCollisions(up);
	    }

	    if (isDownPressed)
	    {
	        var down = new BABYLON.Vector3(0, -1, 0);
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
	    for(var i = 0; i < scene.coins.length; i++) {
	    	if(scene.coins[i]) {
		    	if(scene.coins[i].bounder.intersectsMesh(dragon.bounder, false) && scene.coins[i].isVisible) {
		    		console.log("henaa");
		    	    dragon.score++;
                    scene.coinSound.play();
		    	    if (dragon.score >= scene.enemyCount / 2)
		    	    {
		    	        bonusScore += 5;
		    	    }
                    scene.coins[i].bounder.dispose();
		    		scene.coins[i].dispose();
		    		document.getElementById("scoreLabel").textContent = "x " + dragon.score;
		    	    //scene.coins.splice(i, 1);
		    		scene.coins[i] = null;
		    	}
		    }
	    }
	}

	function fire(scene, dragon, coinModel) {
		if(isSpacePressed) {

	        scene.fireSound.play();
			var direction = new BABYLON.Vector3(dragon.frontVector.x, -1, dragon.frontVector.z);
		    direction.normalize;
		    var fireSystem = new BABYLON.ParticleSystem("particles", 2000, scene)
		    fireSystem.particleTexture = new BABYLON.Texture("js/textures/flare.png", scene);
		    fireSystem.emitter = dragon;
		    fireSystem.minEmitBox = new BABYLON.Vector3(0, 0, 0); 
		    fireSystem.maxEmitBox = new BABYLON.Vector3(0, -2, -7)
		    fireSystem.color1 = new BABYLON.Color4(1, 0.5, 0, 1.0);
		    fireSystem.color2 = new BABYLON.Color4(1, 0.5, 0, 1.0);
		    fireSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0.0);
		    fireSystem.minSize = 0.3;
		    fireSystem.maxSize = 30;    
		    fireSystem.minLifeTime = 0.2;
		    fireSystem.maxLifeTime = 1.0;
		    fireSystem.emitRate = 800;
		    fireSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
		    fireSystem.gravity = new BABYLON.Vector3(0, 0, 0);
		    fireSystem.direction1 = new BABYLON.Vector3(0, -10, -10);
		    fireSystem.direction2 = new BABYLON.Vector3(0, -10, -10);
		    fireSystem.minEmitPower = 1;
		    fireSystem.maxEmitPower = 10;
		    fireSystem.updateSpeed = 0.007;
		    fireSystem.gravity = new BABYLON.Vector3(0, -10, -10);
		    fireSystem.start();

		    var origin = new BABYLON.Vector3(dragon.position.x, dragon.position.y, dragon.position.z);
		 
		    
		    var length = 1000;

		    var ray = new BABYLON.Ray(origin, direction, length);

		    /*var rayHelper = new BABYLON.RayHelper(ray);
		    rayHelper.show(scene);

		    setTimeout(function () {
		        rayHelper.hide();
		    }, 500);*/

		    var hit = scene.pickWithRay(ray, function(mesh) {
		        if(mesh.name.startsWith("enemies")) {
		            return true;
		        } else {
		        	return false;
		        }
		    });

		    if(hit.pickedMesh && !hit.pickedMesh.tempClone.isDead) {

				scene.beginAnimation(hit.pickedMesh.tempClone.skeletons[0], 51, 72, 0.7, true);
				hit.pickedMesh.tempClone.isDead = true;
				enemiesKilled++;
				console.log(enemiesKilled);
				setTimeout(function() {
				    var index = scene.enemies.indexOf(hit.pickedMesh.tempClone);

				    hit.pickedMesh.tempClone.dispose();
				    hit.pickedMesh.dispose();

				    scene.enemies.splice(index, 1);
				    scene.arrows[index].move = false;
				    scene.arrows[index].bounder.dispose();
				    scene.arrows[index].dispose();

				    scene.arrows.splice(index, 1);

				    var coin = cloneModel(coinModel, "coins_");
				    scene.coins.push(coin);
				    coin.position = hit.pickedMesh.position;
				    coin.position.y += 30;
				    coin.bounder.position = coin.position;

				    coin.scaling = new BABYLON.Vector3(0.15, 0.15, 0.15);
				    coin.material = new BABYLON.StandardMaterial("coinMat", scene);
				    coin.material.diffuseColor = new BABYLON.Color3.Yellow();
				    coin.rotation.x = Math.PI / 2;
				    coin.diposed = false;

				    coin.isVisible = true;
				    coin.bounder.checkCollisions = true;
                    
				    (function (coin) {
				       
				        setTimeout(function () {
				            if (coin) {
				                coin.isVisible = false;
				                coin.bounder.dispose();
				                coin.dispose();
				                //scene.coins.splice(scene.coins.indexOf(coin), 1);
                              
				                scene[scene.coins.indexOf(coin)] = null;
				            }
				            }, coinTimeOut);
				           
				    }(coin));
				    
				  
                  	
				}, 900);
		    }

		   /* function disposeCoin(index) {
		    	scene.coins[index].diposed = true;
		    	setTimeout(function () {
                	if(scene.coins[index]) {
                    	scene.coins[index].bounder.dispose();
                    	scene.coins[index].dispose();
                		scene.coins.splice(index, 1);
                	}

              	}, coinTimeOut);
		    }*/

		    setTimeout(function () {
		               fireSystem.stop();
		                
		            }, 500);

		    isSpacePressed = false;
		}

	}

	function createEnemies(scene, newMeshes, skeletons, numOfEnemies) {
	    var index = scene.enemies.push(newMeshes[0]) - 1;

	    var boundingBox = calculateBoundingBoxOfCompositeMeshes(scene, newMeshes, 1);
	    scene.enemies[index].bounder = boundingBox.boxMesh;
	    scene.enemies[index].bounder.tempClone = scene.enemies[index];

	    scene.enemies[index].skeletons = [];

	    scene.enemies[index].isDead = false;

	    for(var i = 0; i < skeletons.length; i++) {
	        scene.enemies[index].skeletons[i] = skeletons[i];
	    }

	    /*var direction = new BABYLON.Vector3(0, -1, 0);

	    var xPos = (Math.random() * 2001) - 1000;
	    var zPos = (Math.random() * 2001) - 1000;

	    var ray = new BABYLON.Ray(new BABYLON.Vector3(xPos, 505, zPos), direction, 10000);

	    var hit = scene.pickWithRay(ray, function (mesh) {
	        if (mesh.name.startsWith("ground")) {
	            return true;
	        }
	    });

	    if (hit.pickedMesh) {
	        scene.enemies[index].position = hit.pickedPoint;
	        scene.enemies[index].position.y += 10;
	    }*/

	    scene.enemies[index].bounder.position = scene.enemies[index].position;
	    scene.enemies[index].bounder.name = "enemies_0_bounder";

	    scene.enemies[index].frontVector = new BABYLON.Vector3(0, 0, -1);

	    scene.beginAnimation(scene.enemies[index].skeletons[0], 43, 51, 0.8, true);
	   
	    for (var i = 0; i < numOfEnemies - 1; i++) {
	        index = scene.enemies.push(cloneModel(scene.enemies[0], "enemies_" + i)) - 1;

			/*xPos = (Math.random() * 2000) - 1000;
	        zPos = (Math.random() * 2000) - 1000;

	        ray = new BABYLON.Ray(new BABYLON.Vector3(xPos, 500, zPos), direction, 10000);

	        hit = scene.pickWithRay(ray, function (mesh) {
	            if (mesh.name.startsWith("ground")) {
	                return true;
	            }
	        });

	        if (hit.pickedMesh) {
	            scene.enemies[index].position = hit.pickedPoint;
	            scene.enemies[index].position.y += 10;
	        }*/

	        scene.enemies[index].bounder.position = scene.enemies[index].position;

	        scene.beginAnimation(scene.enemies[index].skeletons[0], 43, 51, 0.8, true);
	    }
	}

	function updateEnemyOrientationAndFire(scene, dragon, range) {
		scene.vist = [];
		scene.vist.length = scene.enemies.length;

		for(var i = 0; i < scene.enemies.length; i++) {
			scene.vist[i] = 0;
		}

	    for(var i = 0; i < scene.enemies.length; i++) {
	    	if(scene.enemies[i]) {
		        var target = new BABYLON.Vector3(dragon.position.x, scene.enemies[i].position.y, dragon.position.z);
		        scene.enemies[i].lookAt(target);
		        scene.enemies[i].frontVector = dragon.position.subtract(scene.enemies[i].position);

		        if (BABYLON.Vector3.Distance(dragon.position,scene.enemies[i].position) <= range)
		        {
		            scene.vist[i] = 1;
		        }
		    }
	    }
	}

	function createArrows(scene, newMeshes, skeletons, speed, numOfArrows) {
		console.log("here2");

		var index = scene.arrows.push(newMeshes[0]) - 1;

        var boundingBox = calculateBoundingBoxOfCompositeMeshes(scene, newMeshes, 2);
        scene.arrows[index].bounder = boundingBox.boxMesh;
        scene.arrows[index].bounder.arrow = scene.arrows[index];

        scene.arrows[index].skeletons = [];

        scene.arrows[index].speed = speed;

        scene.arrows[index].isVisible = false;

        scene.arrows[index].scaling = new BABYLON.Vector3(15, 15, 15);

        console.log(numOfArrows);

        for(var i = 0; i < numOfArrows - 1; i++) {
            index = scene.arrows.push(cloneModel(scene.arrows[index], "arrows_" + i)) - 1;

            scene.arrows[index].scaling = new BABYLON.Vector3(15, 15, 15);

            scene.arrows[index].isVisible = false;

            scene.arrows[index].rotation.y += Math.PI / 2;

            scene.arrows[index].speed = speed;
        }
	}

	function fireArrows(scene, dragon) {
		for(var i = 0; i < scene.enemies.length; i++) {
	        if(scene.vist[i] === 1){
	            scene.beginAnimation(scene.enemies[i].skeletons[0], 1, 43, 0.8, true);
	            scene.arrows[i].position = scene.enemies[i].bounder.position.add(BABYLON.Vector3.Zero().add(scene.enemies[i].frontVector.normalize().multiplyByFloats(20, 5, 20)));
	            scene.arrows[i].bounder.position = scene.arrows[i].position;
	            scene.arrows[i].frontVector = dragon.position.subtract(scene.arrows[i].position);
	            scene.arrows[i].lookAt(dragon.position);
	            scene.arrows[i].rotation.y += Math.PI / 2;
	            scene.arrows[i].rotation.y += Math.PI / 6;
	            scene.arrows[i].isVisible = true;
	            scene.arrows[i].move = true;
	            var index = i;

	            resetArrow(i);
	            stopAnimation(i);
	        } else {
	        	scene.arrows[i].move = false;
	        }
	    }

	    function resetArrow(index) {
		    setTimeout(function() {
		        if(scene.arrows[index]) {
		            scene.arrows[index].isVisible = false;
		            scene.arrows[index].position = scene.enemies[index].bounder.position.add(BABYLON.Vector3.Zero().add(scene.enemies[index].frontVector.normalize().multiplyByFloats(20, 5, 20)));
		            scene.arrows[index].bounder.position = scene.arrows[index].position;

		            scene.arrows[index].move = false;
		        }
		    }, 4000);
		}

		function stopAnimation(index) {
		    setTimeout(function() {
		        if(scene.enemies[index])
		            scene.beginAnimation(scene.enemies[index].skeletons[0], 43, 51, 0.8, true);
		    }, 700);
		}
	}

	function updateArrows(scene, dragon) {
	    for (var i = 0; i < scene.arrows.length; i++) {

	    	if(scene.arrows[i].move) {
		        if (scene.arrows[i].bounder.intersectsMesh(dragon.bounder, false)) {

		        	scene.arrows[i].isVisible = false;
		           	scene.arrows[i].position = scene.enemies[i].bounder.position.add(BABYLON.Vector3.Zero().add(scene.enemies[i].frontVector.normalize().multiplyByFloats(20, 5, 20)));
		            scene.arrows[i].bounder.position = scene.arrows[i].position;
		            scene.arrows[i].move = false;

		            dragon.health -= 10;
		            updateHealth(scene, dragon);
		        } else {
		            scene.arrows[i].bounder.moveWithCollisions(scene.arrows[i].frontVector.multiplyByFloats(scene.arrows[i].speed, 
		            	scene.arrows[i].speed, scene.arrows[i].speed));
		        }
		    }
	    }
	}

	/*function createCoins(scene, dragon) {
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
	        coins[index].bounder.checkCollisions = false;

	        for(var i = 1; i < enemies.length; i++) {
	            index = coins.push(cloneModel(coins[index], "coins_" + i)) - 1;
	            coins[index].position = enemies[index].position;
	            coins[index].bounder.position = coins[index].position;

	            console.log("created coins : " + coins[index].position);
	            coins[index].scaling = new BABYLON.Vector3(0.15, 0.15, 0.15);
	            coins[index].material = new BABYLON.StandardMaterial("coinMat", scene);
	            coins[index].material.diffuseColor = new BABYLON.Color3.Yellow();
	            coins[index].rotation.x = Math.PI / 2;

	            coins[index].isVisible = false;
	            coins[index].bounder.checkCollisions = false;
	        }

	        /*for(var i = 0; i < coins.length; i++) {
	        	coins[i].bounder.actionManager = new BABYLON.ActionManager(scene);
	        	coins[i].bounder.registerAction(new BABYLON.ExecuteCodeAction({trigger : BABYLON.ActionManager.OnIntersectionEnterTrigger, 
		            parameter : dragon.bounder}, function () {
		            	dragon.score++;
		            	dragon._initScoreUpdate();
		            }));
	        }
	    }
	}*/

	function updateCoinsRotation(scene) {
		for(var i = 0; i < scene.coins.length; i++) {
			if(scene.coins[i])
				if(scene.coins[i].isVisible === true)
					scene.coins[i].rotation.y += 0.05;
		}
	}

	function createTrees(scene, newMeshes, skeletons, numOfTrees) {
	    var index = scene.trees.push(newMeshes[0]) - 1

	    scene.trees[index].skeletons = [];

	    for(var i = 0; i < skeletons.length; i++) {
	        scene.trees[index].skeletons[i] = skeletons[i];
	    }
	    scene.trees[index].scaling = new BABYLON.Vector3(5, 5, 5);
	    var boundingBox = calculateBoundingBoxOfCompositeMeshes(scene,newMeshes,4);
	    scene.trees[index].bounder = boundingBox.boxMesh;
	    scene.trees[index].bounder.tempClone = scene.trees[index];
	    scene.trees[index].position = scene.trees[index].bounder.position;

	    for(var i = 1; i < numOfTrees; i++) {
	        index = scene.trees.push(cloneModel(scene.trees[index], "trees_" + index)) - 1;
	    }
	}


    function createCactus(scene, newMeshes, skeletons, numOfCactus) {
        var index = scene.cactus.push(newMeshes[0]) - 1

        scene.cactus[index].skeletons = [];

        for(var i = 0; i < skeletons.length; i++) {
            scene.cactus[index].skeletons[i] = skeletons[i];
        }
        scene.cactus[index].scaling = new BABYLON.Vector3(5, 5, 5);
        var boundingBox = calculateBoundingBoxOfCompositeMeshes(scene,newMeshes,4);
        scene.cactus[index].bounder = boundingBox.boxMesh;
        scene.cactus[index].bounder.tempClone = scene.cactus[index];
        scene.cactus[index].position = scene.cactus[index].bounder.position;

        for(var i = 1; i < numOfCactus; i++) {
            index = scene.cactus.push(cloneModel(scene.cactus[index], "cactus_" + index)) - 1;
        }
    }

	function createRocks(scene, dragon){
	    var fountain = BABYLON.Mesh.CreateSphere("foutain", 10, 10, scene, false);
	    var xPos = (Math.random() * 2000) - 1000;
	    var zPos = (Math.random() * 2000) - 1000;
	    fountain.position = new BABYLON.Vector3(xPos, 500, zPos);
	    fountain.material = new BABYLON.StandardMaterial("emitterMat", scene);
	    fountain.material.diffuseColor = new BABYLON.Color3(98/256, 93/256, 93/256);
	    fountain.physicsImpostor = new BABYLON.PhysicsImpostor(fountain, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1, restitution: 0.9 }, scene);
	    fountain.checkCollisions = true;

	    var smokeSystem = new BABYLON.ParticleSystem("particles", 100, scene);
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
	    fireSystem.emitRate = 200;
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
	                dragon.health -= 20;
	                updateHealth(scene, dragon);
	            }));

	    setTimeout(function() {
	        fireSystem.stop();
	        setTimeout(function() {
	            smokeSystem.stop();
	            if(fountain)
	            	fountain.dispose();
	        }, 1000);
	    }, 5000); 
	}

	function createConfiguredGround(scene, directory, texture)
	{
	    var ground = new BABYLON.Mesh.CreateGroundFromHeightMap("ground", directory, scenesize, scenesize,
	    100, 0, 500, scene, false, onGroundCreated);

	    var groundMaterial = new BABYLON.StandardMaterial("m1", scene);
	    ground.name = "ground";
	    // groundMaterial.ambientColor = new BABYLON.Color3(1, 0, 0);
	    // groundMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);
	    groundMaterial.diffuseTexture = new BABYLON.Texture(texture, scene);
	    groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
	    groundMaterial.diffuseTexture.uScale = 10;
	    groundMaterial.diffuseTexture.vScale = 10;

	    function onGroundCreated() {
	        ground.material = groundMaterial;
	        ground.checkCollisions = true;
	        ground.physicsImpostor =  new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.HeightmapImpostor,
	            { mass: 0, friction: 10, restitution: .2 }, scene);

	        //positioning dragon
	        var direction = new BABYLON.Vector3(0, -1, 0);

		    var ray = new BABYLON.Ray(new BABYLON.Vector3(0, 505, 30), direction, 10000);

		    var hit = scene.pickWithRay(ray, function (mesh) {
		        if (mesh.name.startsWith("ground")) {
		            return true;
		        }
		    });

		    if (hit.pickedMesh) {
		        scene.dragon.position = hit.pickedPoint;
		        scene.dragon.position.y += 100;
		        scene.dragon.bounder.position = scene.dragon.position;
		    }

		    //positioning enemies
		    for(var i = 0; i < scene.enemies.length; i++) {
		    	var direction = new BABYLON.Vector3(0, -1, 0);

			    var ray = new BABYLON.Ray(new BABYLON.Vector3((Math.random() * 2000) - 1000, 505, (Math.random() * 2000) - 1000), direction, 10000);

			    var hit = scene.pickWithRay(ray, function (mesh) {
			        if (mesh.name.startsWith("ground")) {
			            return true;
			        }

			        return false;
			    });

			    if (hit.pickedMesh && hit.pickedPoint.y <= maxheight-50) {
			        scene.enemies[i].position = hit.pickedPoint;
			        scene.enemies[i].position.y += 10;
			        scene.enemies[i].bounder.position = scene.enemies[i].position;

		            scene.arrows[i].bounder.position = scene.enemies[i].bounder.position.add(BABYLON.Vector3.Zero().add(scene.enemies[i].frontVector.normalize().multiplyByFloats(20, 5, 20)));
		            scene.arrows[i].position = scene.arrows[i].bounder.position;
			    }
			    else {
			        console.log("Fixed");
			        i--;
			    }
		    }

	        if(scene.trees) {
	        	var counter = 0;
	            for(var i = 0; i < scene.trees.length; i++) {
	                var direction = new BABYLON.Vector3(0, -1, 0);

	                var ray = new BABYLON.Ray(new BABYLON.Vector3((Math.random() * 2000) - 1000, 505, (Math.random() * 2000) - 1000), direction, 10000);

	                var hit = scene.pickWithRay(ray, function (mesh) {
	                    if (mesh.name.startsWith("ground")) {

	                        return true;
	                    }

	                    return false;
	                });

	                if (hit.pickedMesh) {
	                    scene.trees[i].position = hit.pickedPoint;
	                    scene.trees[i].bounder.position = scene.trees[i].position;
	                }
	            }
	        }



            if(scene.cactus) {
                var counter = 0;
                for(var i = 0; i < scene.cactus.length; i++) {
                    var direction = new BABYLON.Vector3(0, -1, 0);

                    var ray = new BABYLON.Ray(new BABYLON.Vector3((Math.random() * 2000) - 1000, 505, (Math.random() * 2000) - 1000), direction, 10000);

                    var hit = scene.pickWithRay(ray, function (mesh) {
                        if (mesh.name.startsWith("ground")) {

                            return true;
                        }

                        return false;
                    });

                    if (hit.pickedMesh) {
                        scene.cactus[i].position = hit.pickedPoint;
                        scene.cactus[i].bounder.position = scene.cactus[i].position;
                    }
                }
            }

	        if(scene.castle) {
	            var direction = new BABYLON.Vector3(0, -1, 0);

	            var ray = new BABYLON.Ray(new BABYLON.Vector3((Math.random() * 2000) - 1000, 505, (Math.random() * 2000) - 1000), direction, 10000);

	            var hit = scene.pickWithRay(ray, function (mesh) {
	                if (mesh.name.startsWith("ground")) {
	                    return true;
	                }
	            });

	            if (hit.pickedMesh) {
	                scene.castle.position = hit.pickedPoint;
	                //scene.trees[i].bounder.position = scene.trees[i].position;
	            }
	        }

		    scene.isReady = true;
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
	        _boxMesh.scaling.x = 20;
	        _boxMesh.scaling.y = 30;
	        _boxMesh.scaling.z = 20;
	    } else if(flag === 2) {
	        _boxMesh.scaling.x = 20;
	        _boxMesh.scaling.y = 10;
	        _boxMesh.scaling.z = 10;
	    } else if(flag === 3) {
	        _boxMesh.scaling.x = 30;
	        _boxMesh.scaling.y = 15;
	        _boxMesh.scaling.z = 30;
	    } else if(flag === 4) {
	        _boxMesh.scaling.x = 40;
	        _boxMesh.scaling.y = 100;
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


	startGame();
}