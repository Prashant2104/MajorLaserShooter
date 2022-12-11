import * as BABYLON from "babylonjs";
import "babylonjs-loaders";
import * as GUI from "babylonjs-gui";
import {
  EnemyAudioDispose,
  EnemyFlyConstAudio,
  enemyTakeDamgeSound,
} from "./Audio";
import { IncreaseScore, UpdateHealth } from "./Player";
import { enemyCountMinus } from "./GameManager";
import { DropHealthDrop } from "./Health";
import { InstansiateEnemies, InstantiationSetup } from "./InstansiateEnemies";

let laser;
let enemyRoot;
let enemyRoot_2;
let enemyRoot_3;

let defaultHealth = 100;
let fireDelay = 1000;
export let shootDist = 60;
export let followDist = 120;
let defaultEnemySpawnCount = 15;

let currScene;
let localPlayer;
let enemyContainer = [];
let deathParticle = null;
let explosionParticle;

export const LoadEnemy = async (scene, player) => {
  currScene = scene;
  localPlayer = player;

  EnemyFlyConstAudio(scene);

  explosionParticle = await BABYLON.ParticleHelper.CreateAsync(
    "explosion",
    scene
  );
  for (let i = 0; i < explosionParticle.systems.length; i++) {
    if (explosionParticle.systems[i].name == "shockwave") {
      explosionParticle.systems[i].dispose();
    }
  }

  BABYLON.SceneLoader.LoadAssetContainerAsync(
    "",
    "Models/Enemy_1.glb",
    scene,
    null
  ).then((container) => {
    enemyContainer[0] = container;
    enemyRoot = container.meshes[0];

    let hitTarget = BABYLON.MeshBuilder.CreateBox("Enemy_HitTarget", scene);
    hitTarget.checkCollisions = true;
    hitTarget.visibility = 0;
    enemyRoot.addChild(hitTarget);

    container.animationGroups.forEach((element) => {
      if (element.name == "SMALL BUG BONESAction") {
        element.dispose();
      }
    });
    InstansiateEnemies(defaultEnemySpawnCount, defaultHealth, container);
  });

  BABYLON.SceneLoader.LoadAssetContainerAsync(
    "",
    "Models/Enemy_2.glb",
    scene,
    null
  ).then((container) => {
    enemyContainer[1] = container;
    enemyRoot_2 = container.meshes[0];

    let hitTarget = BABYLON.MeshBuilder.CreateBox("Enemy_HitTarget", scene);
    hitTarget.checkCollisions = true;
    hitTarget.visibility = 0;
    enemyRoot_2.addChild(hitTarget);
    InstansiateEnemies(defaultEnemySpawnCount, defaultHealth, container);
  });

  BABYLON.SceneLoader.LoadAssetContainerAsync(
    "",
    "Models/Enemy_3.glb",
    scene,
    null
  ).then((container) => {
    enemyContainer[2] = container;
    enemyRoot_3 = container.meshes[0];

    let hitTarget = BABYLON.MeshBuilder.CreateBox("Enemy_HitTarget", scene);
    hitTarget.position.y = -0.25;
    hitTarget.scaling = new BABYLON.Vector3(3, 1.5, 2);
    hitTarget.checkCollisions = true;
    hitTarget.visibility = 0;
    enemyRoot_3.addChild(hitTarget);
    InstansiateEnemies(defaultEnemySpawnCount, defaultHealth, container);

    // InstansiateEnemies_3(scene, player, defaultEnemySpawnCount, defaultHealth);
  });

  /********** Laser Prefab Setup **********/
  const laserMat = new BABYLON.StandardMaterial("LaserMat", scene);
  laserMat.emissiveColor = BABYLON.Color3.Red();
  laserMat.unlit = true;
  laserMat.diffuseColor = BABYLON.Color3.Red();

  laser = new BABYLON.MeshBuilder.CreateCapsule(
    "laser",
    { radius: 0.1, tessellation: 8 },
    scene
  );
  laser.rotation.x = Math.PI / 2;
  laser.material = laserMat;
  /********** Laser Prefab Setup **********/
};

export const EnemyShoot = (enemy) => {
  setTimeout(() => {
    if (enemy.parent != null) {
      if (enemy.parent.metadata.canShoot) {
        fireBullet(enemy);
      }
    }
    EnemyShoot(enemy);
  }, fireDelay);
};

export const fireBullet = (enemy) => {
  /********** spawning bullets **********/
  let aimDir = localPlayer
    .getAbsolutePosition()
    .subtract(enemy.getAbsolutePosition())
    .normalize();

  let laserPref = laser.createInstance("Enemy_laser");
  // console.log(laserPref);
  laserPref.isPickable = false;
  laserPref.position = enemy.getAbsolutePosition();
  //laserPref.rotation = activeSpawnPoint.rotation;
  laserPref.lookAt(localPlayer.getAbsolutePosition(), 0, 0, 0);
  laserPref.rotation.x += Math.PI / 2;
  laserPref.checkCollisions = false;
  /********** spawning bullets **********/

  /********** shooting bullets **********/
  laserPref.physicsImpostor = new BABYLON.PhysicsImpostor(
    laserPref,
    BABYLON.PhysicsImpostor.BoxImpostor,
    { mass: 0.01, restitution: 0.5, friction: 0 },
    currScene
  );
  laserPref.physicsImpostor.applyImpulse(
    aimDir.scale(5),
    enemy.getAbsolutePosition()
  );
  // let trailMesh = new BABYLON.TrailMesh(
  //   "BulletTrail",
  //   laserPref,
  //   currScene,
  //   0.035,
  //   1,
  //   true
  // );
  // trailMesh.material = laserPref.material;

  laserPref.actionManager = new BABYLON.ActionManager(currScene);
  laserPref.actionManager.registerAction(
    new BABYLON.ExecuteCodeAction(
      {
        trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger,
        parameter: localPlayer,
      },
      () => {
        let damageAmount = Math.floor(Math.random() * 4) + 4;
        console.log("player hit:  " + damageAmount);
        UpdateHealth(-damageAmount);
      }
    )
  );

  window.setTimeout(function () {
    if (laserPref) {
      laserPref.dispose();
      // trailMesh.dispose();
    }
  }, 500);
  /********** shooting bullets **********/
};

export const GotHit = (enemy) => {
  enemyTakeDamgeSound.play();
  enemy.metadata.enemyMetadata[0] -= Math.floor(Math.random() * 8) + 6;
  // console.log(enemy.metadata);
  // console.log(enemy.metadata.MaxHealth);

  const advText = enemy.getChildren()[0].material.emissiveTexture;
  const healthBar = advText.getChildren()[0].children[0].children[0];
  healthBar.width = `${
    (enemy.metadata.enemyMetadata[0] / enemy.metadata.enemyMetadata[1]) * 100
  }%`;
  if (enemy.metadata.enemyMetadata[0] <= 25) {
    healthBar.background = "Red";
  }

  // console.log(enemy.metadata.Health);

  if (enemy.metadata.enemyMetadata[0] <= 0) {
    // deathParticle.emitter = enemy;
    // deathParticle.start();

    // explosionParticle.emitter.position.x = enemy.parent.parent.position.x;
    // explosionParticle.emitter.position.z = enemy.parent.parent.position.z;
    // explosionParticle.emitter.position.y = enemy.parent.position.y;

    // explosionParticle.start();
    // explosionParticle.systems[0].onStoppedObservable.addOnce(() => {
    //   // explosionParticle.emitter = null;
    //   enemy.parent.parent.dispose();
    // });
    IncreaseScore(10);
    enemyCountMinus();
    enemy.parent.parent.metadata.spawnPoint--;
    EnemyAudioDispose(currScene, enemy);
    if (Math.random() > 0.8) {
      DropHealthDrop(enemy.parent.parent.position);
      // console.log("Health Drop");
    }
    enemy.parent.parent.dispose();
  }
};

export const respawnEnemies = (spawnCount, health, enemyType) => {
  InstansiateEnemies(spawnCount, health, enemyContainer[enemyType]);
};

let advanceTexture;
export const HealthBar = (enemyMesh) => {
  var HealthUI = BABYLON.MeshBuilder.CreatePlane(
    "HealthUI",
    {
      sideOrientation: BABYLON.Mesh.DOUBLESIDE,
    },
    currScene
  );
  HealthUI.isPickable = false;
  HealthUI.parent = enemyMesh;
  HealthUI.position = new BABYLON.Vector3(0, -0.6, 0);
  HealthUI.rotation = new BABYLON.Vector3(0, Math.PI, Math.PI);
  HealthUI.scaling = new BABYLON.Vector3(1, 0.5, 0.2);
  HealthUI.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

  advanceTexture = GUI.AdvancedDynamicTexture.CreateForMesh(
    HealthUI,
    400,
    150,
    false,
    null,
    true
  );
  const healthBarBG = new GUI.Rectangle("HealthBarBG");
  healthBarBG.background = "White";
  healthBarBG.height = "25%";
  healthBarBG.verticalAlignment = 0;
  healthBarBG.cornerRadius = 20;
  healthBarBG.thickness = 3;
  advanceTexture.addControl(healthBarBG);

  const healthBar = new GUI.Rectangle("HealthBar");
  healthBarBG.addControl(healthBar);
  healthBar.horizontalAlignment = 0;
  healthBar.background = "Green";
  healthBar.cornerRadius = 20;
};
