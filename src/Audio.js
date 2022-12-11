import * as BABYLON from "babylonjs";
let teleportSound;
let gunShot;
export const ImportAudio = (scene) => {
  let ambient = new BABYLON.Sound(
    "Ambient",
    "Sounds/AmbientLoop.mp3",
    scene,
    () => {
      ambient.play();
    },
    { loop: true, autoplay: true, volume: 0.05 }
  );
  gunShot = new BABYLON.Sound(
    "gunShot",
    "Sounds/LaserRifleShoot.mp3",
    scene,
    () => {
      // console.log("Gun sound");
    },
    { autoplay: false, loop: false, volume: 0.5 }
  );
  teleportSound = new BABYLON.Sound(
    "teleport",
    "Sounds/PortalTeleport.mp3",
    scene,
    () => {
      // console.log("Teleport sound");
    },
    { autoplay: false, loop: false }
  );
};

export const PortalConstAudio = (scene, portalMesh) => {
  let portalSound = new BABYLON.Sound(
    "portalSound",
    "Sounds/PortalConstantLoop.mp3",
    scene,
    () => {
      portalSound.play();
      // console.log("Portal Sounds");
    },
    {
      loop: true,
      autoplay: true,
      refDistance: 50,
      rolloffFactor: 1,
    }
  );
  portalSound.attachToMesh(portalMesh);
};

export const HeliConstAudio = (scene, HeliMesh) => {
  //let HeliMesh = scene.getMeshByName("chopper_body_Chopper_material_0");
  let HeliSound = new BABYLON.Sound(
    "HeliSound",
    "Sounds/HelicopterLoop.mp3",
    scene,
    () => {
      HeliSound.play();
      // console.log("HelicopterSounds: " + HeliMesh);
    },
    {
      loop: true,
      autoplay: true,
      rolloffFactor: 1,
      spatialSound: true,
      maxDistance: 250,
    }
  );
  HeliSound.attachToMesh(HeliMesh);
  HeliSound.maxDistance = 250;
  // console.log(HeliSound);
};

let enemyFlySound;
export let enemyTakeDamgeSound;
export const EnemyFlyConstAudio = (scene) => {
  enemyFlySound = new BABYLON.Sound(
    "enemyFlySound",
    "Sounds/EnemyFlyAudio.mp3",
    scene,
    () => {
      // console.log("enemy Sounds");
    },
    {
      loop: true,
      autoplay: false,
      rolloffFactor: 1,
      spatialSound: true,
      maxDistance: 150,
    }
  );

  enemyTakeDamgeSound = new BABYLON.Sound(
    "enemyTakeDamgeSound",
    "Sounds/EnemyDamage.mp3",
    scene,
    () => {
      // console.log("enemy damage Sounds");
    },
    {
      loop: false,
      autoplay: false,
      volume: 0.25,
    }
  );
};

export const EnemyAudioClone = (enemyMesh) => {
  let enemyFlySoundClone = enemyFlySound.clone();
  enemyFlySoundClone.name = enemyMesh.name + "_FlySound";
  enemyFlySoundClone.attachToMesh(enemyMesh);
  enemyFlySoundClone.play();
};

export const EnemyAudioDispose = (scene, enemyMesh) => {
  scene.getSoundByName(enemyMesh.name + "_FlySound").dispose();
};

export const TeleportAudio = () => {
  teleportSound.play();
};

export const ShootAudio = () => {
  gunShot.play();
};
