import * as BABYLON from "babylonjs";
import "babylonjs-loaders";
import { ShootAudio } from "./Audio";
import { GotHit } from "./EnemyAI";
import { LocalPlayerUI_VR } from "./Player";
import { createXRExperience } from "./script";

export let bulletCount = 100;
let width;
let height;
let canFire = false;
let fireDist = 175;
fireDist = Math.pow(fireDist, 2);

let crossHair;
let activeSpawnPoint;
let laser;
let trailMesh;

let heliHitCount = 0;

let laserGunRoot;
export let currGun;

let VrRay = null;
let VrRayHelper = null;

export const spawnWeapon = (scene, camera, player) => {
  BABYLON.SceneLoader.ImportMeshAsync(
    "",
    "Gun/",
    "LaserGunNew.glb", //Gun Model Name
    scene,
    null
  ).then((loadedMeshes) => {
    laserGunRoot = loadedMeshes.meshes[0];
    laserGunRoot.name = "gun0";

    loadedMeshes.transformNodes.forEach((element) => {
      if (element.name.includes("SpawnPoint")) {
        activeSpawnPoint = element;
      }
    });
    laserGunRoot.setParent(player);
    laserGunRoot.position.x = 0.15;
    laserGunRoot.position.y = -0.4;
    laserGunRoot.position.z = 0.2;
    laserGunRoot.rotation = new BABYLON.Vector3(0, 0, Math.PI);
    currGun = laserGunRoot;
    /********** Cross-hair **********/
    let aimMat = new BABYLON.StandardMaterial("CrossMat", scene);
    aimMat.diffuseTexture = new BABYLON.Texture("CrossHair2.png", scene);
    aimMat.emissiveTexture = new BABYLON.Texture("CrossHair2.png", scene);
    aimMat.diffuseTexture.hasAlpha = true;
    aimMat.unlit = true;

    crossHair = BABYLON.MeshBuilder.CreatePlane(
      "CrossHair",
      { size: 0.07 },
      scene
    );
    crossHair.parent = camera;
    crossHair.position.z = 1;
    crossHair.scaling = new BABYLON.Vector3(0.7, 0.7, 0.7);
    crossHair.isPickable = false;
    crossHair.material = aimMat;
    /********** Cross-hair **********/

    /********** Laser Prefab Setup **********/
    const laserMat = new BABYLON.StandardMaterial("LaserMat", scene);
    laserMat.emissiveColor = BABYLON.Color3.Blue();
    laserMat.unlit = true;
    laserMat.diffuseColor = BABYLON.Color3.Blue();

    laser = new BABYLON.MeshBuilder.CreateIcoSphere(
      "PlayerLaser",
      { radius: 0.05 },
      scene
    );
    // laser.rotation.x = Math.PI / 2;
    laser.material = laserMat;
    /********** Laser Prefab Setup **********/
    canFire = true;
    if (BABYLON.WebXRSessionManager.IsSessionSupportedAsync("immersive-vr"))
      createXRExperience(laserGunRoot);
  });
};

export const SetupVrWeapon = (scene) => {
  currGun.rotation.x = 0.6981317;
  currGun.position = new BABYLON.Vector3.Zero();
  currGun.scaling.scaleInPlace(0.25);
  console.log(currGun.scaling);

  VrRay = new BABYLON.Ray();
  VrRayHelper = new BABYLON.RayHelper(VrRay);

  let dir = new BABYLON.Vector3(0, 0, 1);
  let rayOrigin = new BABYLON.Vector3.Zero();
  let length = 1000;

  VrRayHelper.attachToMesh(activeSpawnPoint, dir, rayOrigin, length);
  VrRayHelper.show(scene);

  LocalPlayerUI_VR(currGun, scene);

  // scene.registerBeforeRender(() => {
  //   let hit = scene.pickWithRay(VrRay);
  //   if (hit.hit) {
  //     VrRayHelper.show(scene, BABYLON.Color3.Red());
  //   } else {
  //     VrRayHelper.show(scene, BABYLON.Color3.Green());
  //   }
  // });
};

export const ExitVrWeapon = () => {
  VrRayHelper.dispose();
};

export const PlayerShootVR = (scene) => {
  let hit = scene.pickWithRay(VrRay);

  if (canFire && hit.hit) {
    ShootAudio();

    let hitMesh = hit.pickedMesh;
    let hitPoint = hit.pickedPoint;

    if (hitMesh.name.includes("HitTarget")) {
      let enemyDist = BABYLON.Vector3.DistanceSquared(
        hitMesh.getAbsolutePosition(),
        activeSpawnPoint.getAbsolutePosition()
      );
      // console.log(enemyDist);
      if (enemyDist <= fireDist) {
        GotHit(hitMesh);
      }
    }
    // if (hitMesh.name.includes("chopper")) {
    //   heliHitCount++;
    //   if (heliHitCount >= 25) {
    //     console.log(hitMesh);
    //   }
    // }

    /********** spawning bullets **********/
    let aimDir = hitPoint
      .subtract(activeSpawnPoint.getAbsolutePosition())
      .normalize();

    let laserPref = laser.createInstance("PlayerLaser" + bulletCount);
    laserPref.isPickable = false;
    laserPref.position = activeSpawnPoint.getAbsolutePosition();
    //laserPref.rotation = activeSpawnPoint.rotation;
    laserPref.lookAt(hitPoint, 0, 0, 0);
    laserPref.rotation.x += Math.PI / 2;
    laserPref.checkCollisions = false;

    /********** spawning bullets **********/

    /********** shooting bullets **********/
    laserPref.physicsImpostor = new BABYLON.PhysicsImpostor(
      laserPref,
      BABYLON.PhysicsImpostor.BoxImpostor,
      { mass: 0.1, restitution: 0.5, friction: 0 },
      scene
    );
    laserPref.physicsImpostor.applyImpulse(
      aimDir.scale(5),
      activeSpawnPoint.getAbsolutePosition()
    );

    // let trailMesh = new BABYLON.TrailMesh(
    //   "BulletTrail",
    //   laserPref,
    //   scene,
    //   0.035,
    //   1,
    //   true
    // );
    // trailMesh.material = laserPref.material;

    window.setTimeout(function () {
      if (laserPref) {
        laserPref.dispose();
        // trailMesh.dispose();
      }
    }, 50);
    /********** shooting bullets **********/
  }
};

export const PlayerShoot = (scene, camera) => {
  width = scene.getEngine().getRenderWidth();
  height = scene.getEngine().getRenderHeight();

  let pickInfo = scene.pick(width / 2, height / 2, null, false, camera);

  if (canFire && pickInfo.hit) {
    ShootAudio();
    let hitMesh = pickInfo.pickedMesh;
    let hitPoint = pickInfo.pickedPoint;

    if (hitMesh.name.includes("HitTarget")) {
      let enemyDist = BABYLON.Vector3.DistanceSquared(
        hitMesh.getAbsolutePosition(),
        activeSpawnPoint.getAbsolutePosition()
      );
      // console.log(enemyDist);
      if (enemyDist <= fireDist) {
        GotHit(hitMesh);
      }
    }

    /********** spawning bullets **********/
    let aimDir = hitPoint
      .subtract(activeSpawnPoint.getAbsolutePosition())
      .normalize();

    let laserPref = laser.createInstance("PlayerLaser" + bulletCount);
    laserPref.isPickable = false;
    laserPref.position = activeSpawnPoint.getAbsolutePosition();
    //laserPref.rotation = activeSpawnPoint.rotation;
    laserPref.lookAt(hitPoint, 0, 0, 0);
    laserPref.rotation.x += Math.PI / 2;
    laserPref.checkCollisions = false;

    /********** spawning bullets **********/

    /********** shooting bullets **********/
    laserPref.physicsImpostor = new BABYLON.PhysicsImpostor(
      laserPref,
      BABYLON.PhysicsImpostor.BoxImpostor,
      { mass: 0.1, restitution: 0.5, friction: 0 },
      scene
    );
    laserPref.physicsImpostor.applyImpulse(
      aimDir.scale(5),
      activeSpawnPoint.getAbsolutePosition()
    );

    // let trailMesh = new BABYLON.TrailMesh(
    //   "BulletTrail",
    //   laserPref,
    //   scene,
    //   0.035,
    //   1,
    //   true
    // );
    // trailMesh.material = laserPref.material;

    window.setTimeout(function () {
      if (laserPref) {
        laserPref.dispose();
        // trailMesh.dispose();
      }
    }, 50);
    /********** shooting bullets **********/
  }
};
