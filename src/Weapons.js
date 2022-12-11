import * as BABYLON from "babylonjs";
import "babylonjs-loaders";
import { ShootAudio } from "./Audio";
import { GotHit } from "./EnemyAI";

export let bulletCount = 100;
let width;
let height;
let canFire = true;

let decalSize = new BABYLON.Vector3(1, 1, 1);
let vColors;
let paintBullet;
let decalMats = [];

let crossHair;
let bulletSpawnPoint = [];
let activeSpawnPoint;
let laser;
let trailMesh;

let heliHitCount = 0;

let laserGunRoot;
export let currGun;

export const spawnWeapon = (scene, camera, player) => {
  BABYLON.SceneLoader.ImportMesh(
    "",
    "Gun/LaserGun3.glb",
    "",
    scene,
    (meshes) => {
      laserGunRoot = meshes[0];
      laserGunRoot.name = "gun0";
      activeSpawnPoint = scene.getTransformNodeByName("SpawnPoint");
      laserGunRoot.setParent(player);
      laserGunRoot.position.x = 0.1;
      laserGunRoot.position.y = -0.25;
      laserGunRoot.position.z = 0.2;
      laserGunRoot.rotation = new BABYLON.Vector3(0, 0, Math.PI);
      currGun = laserGunRoot;

      let gunMat = scene.getMeshByName("gun").material;
      gunMat.metallic = 0.75;
      gunMat.roughness = 0.75;
    }
  );

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
  laserMat.emissiveColor = BABYLON.Color3.Red();
  laserMat.unlit = true;
  laserMat.diffuseColor = BABYLON.Color3.Red();

  laser = new BABYLON.MeshBuilder.CreateCapsule(
    "PlayerLaser",
    { radius: 0.025, tessellation: 8 },
    scene
    // (meshes) => {
    //   meshes[0].unfreezeWorldMatrix();
    // }
  );
  laser.rotation.x = Math.PI / 2;
  laser.material = laserMat;
  /********** Laser Prefab Setup **********/
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
      GotHit(hitMesh);
    }
    // if (hitMesh.name.includes("chopper")) {
    //   heliHitCount++;
    //   if (heliHitCount >= 25) {
    //     console.log(hitMesh);
    //   }
    // }
    // console.log(hitMesh.name);

    /********** spawning bullets **********/
    let aimDir = pickInfo.pickedPoint
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
