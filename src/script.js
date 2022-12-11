import "babylonjs-loaders";

import * as BABYLON from "babylonjs";

// import mainModel from "./assets/LaserWorld4.glb";
// import spawnPoint from "./assets/SpawnPoints.glb";

import { enableNavigation } from "./Navigation";
import { CreatePlayerAgent, loadNavmesh } from "./NavmeshAgent";
import {
  inputController,
  keyboardEvents,
  localPlayer,
  spawnLocalPlayer,
} from "./Player";
import { PortalMeshes } from "./Portals";
import { HeliConstAudio, ImportAudio } from "./Audio";
import { LoadHealth } from "./Health";
import { LoadEnemy } from "./EnemyAI";

export let currentLoadedModel = null;
export let expLoadedAnimations = [];
export let enemySpawnPoint = null;
export let gameover = null;
export let defaultPipeline = null;
export let portalAnim;
let quality = "high";

const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const scene = new BABYLON.Scene(engine);
scene.ambientColor = new BABYLON.Color3(1, 1, 1);
scene.debugLayer.show();

const Setup = async () => {
  // await Ammo();
  scene.enablePhysics();
};
Setup();

const dsm = new BABYLON.DeviceSourceManager(scene.getEngine());
engine.runRenderLoop(() => {
  if (scene) {
    scene.render();
    var keyboard = dsm.getDeviceSource(BABYLON.DeviceType.Keyboard);
    if (keyboard && camera) {
      inputController(
        camera,
        keyboard.getInput(87),
        keyboard.getInput(83),
        keyboard.getInput(65),
        keyboard.getInput(68),
        keyboard.getInput(38),
        keyboard.getInput(40),
        keyboard.getInput(37),
        keyboard.getInput(39),
        keyboard.getInput(16),
        keyboard.getInput(32),
        scene
      );
    }
  }
});

/********** Camera **********/
const camera = new BABYLON.ArcRotateCamera(
  "Camera",
  1.57,
  1.4,
  9,
  new BABYLON.Vector3(0, 2.5, 30),
  scene
);
camera.attachControl(canvas, false);
camera.fov = 1;
camera.minZ = 0;
camera.inertia = 0.8;
camera.keysUp.pop(38);
camera.keysDown.pop(40);
camera.keysLeft.pop(37);
camera.keysRight.pop(39);
camera.keysLeft.pop(68);
camera.keysRight.pop(65);
/********** Camera **********/

/********** Pointer Lock **********/
canvas.onclick = function () {
  canvas.requestPointerLock =
    canvas.requestPointerLock ||
    canvas.mozRequestPointerLock ||
    canvas.webkitRequestPointerLock;
  canvas.requestPointerLock();
};
/********** Pointer Lock **********/

/********** Lights **********/
const light = new BABYLON.HemisphericLight(
  "light1",
  new BABYLON.Vector3(0, 1, 0),
  scene
);
light.intensity = 0.7;

const images = [
  "./skybox/nx.jpg",
  "./skybox/py.jpg",
  "./skybox/nz.jpg",
  "./skybox/px.jpg",
  "./skybox/ny.jpg",
  "./skybox/pz.jpg",
];

const envTex = new BABYLON.CubeTexture.CreateFromImages(images, scene);
scene.environmentIntensity = 1.6;

const skybox = scene.createDefaultSkybox(envTex, true, 10000);
skybox.material.reflectionTexture.rotationY = 3;
/********** Lights **********/

keyboardEvents(scene);
const setupScene = async () => {
  BABYLON.SceneLoader.ImportMesh(
    "",
    "Models/SpawnPoints.glb",
    "",
    scene,
    (loadedMeshes) => {
      enemySpawnPoint = loadedMeshes[0].getChildTransformNodes()[0];
      enemySpawnPoint.getChildTransformNodes().forEach((e) => {
        e.metadata = { enemySpawnCount: 0 };
      });
    }
  );
  BABYLON.SceneLoader.ImportMesh(
    "",
    "Models/ColliderMesh.glb",
    "",
    scene,
    (loadedMeshes) => {
      loadedMeshes[0].name = "ColliderMesh";
      loadedMeshes[0].getChildren()[0].checkCollisions = true;
      loadedMeshes[0].getChildren()[0].isVisible = false;
    }
  );

  BABYLON.SceneLoader.ImportMesh(
    "",
    "Models/LaserWorld4.glb",
    "",
    scene,
    (loadedMeshes, ps, skel, animGrps) => {
      let rootMesh = loadedMeshes[0];
      rootMesh.name = "Environment";
      currentLoadedModel = rootMesh;

      loadNavmesh("NavmeshData4.bin", scene).then(() => {
        if (BABYLON.WebXRSessionManager.IsSessionSupportedAsync("immersive-vr"))
          createXRExperience();
      });

      scene.getMaterialByName("Chopper_material").albedoColor =
        new BABYLON.Color3.Black();
      scene.getMaterialByName("chopper_rotors").albedoColor =
        new BABYLON.Color3.Black();
      let a, b;
      loadedMeshes.forEach((mesh) => {
        if (mesh.name == "chopper_body_Chopper_material_0") {
          HeliConstAudio(scene, mesh);
        }
        if (mesh.name == "BlueLight") {
          mesh.material = mesh.material.clone("PillarLight");
          a = mesh;
          mesh.material.albedoColor = BABYLON.Color3.Black();
        }
        if (mesh.name == "Ground") {
          b = mesh;
        }
        if (mesh.name.includes("PortalLIght")) {
          mesh.animations = [];
          mesh.scaling = new BABYLON.Vector3.One();
          Rotationloop(mesh, "rotation.x", 15, scene);
        }
        if (mesh.name.includes("Fog")) {
          mesh.animations = [];
          Rotationloop(mesh, "rotation.y", 0.2, scene);
        }
        if (mesh.name.includes("Dome")) {
          mesh.animations = [];
          Rotationloop(mesh, "rotation.y", 0.025, scene);
        }
      });
      LerpColor(a, b, scene);

      for (let x = 0; x < animGrps.length; x++) {
        let currAnimGrp = animGrps[x];

        if (currAnimGrp.name.includes("Portal")) {
          currAnimGrp.dispose();
        } else currAnimGrp.play(true);
      }

      enableNavigation(rootMesh, scene);
      camera.lowerRadiusLimit = 0;
      camera.upperRadiusLimit = 0;
      camera.radius = 0;
      camera.lowerBetaLimit = 1;
      camera.upperBetaLimit = 2.25;
      camera.alpha = 1.57;
      camera.beta = 1.3;

      /******************* PostProcessing *******************/
      //#region postprocess
      if (quality == "high") {
        defaultPipeline = new BABYLON.DefaultRenderingPipeline(
          "default",
          true,
          scene,
          [camera]
        );
        defaultPipeline.bloomEnabled = true;
        defaultPipeline.bloomThreshold = 0.9;
        defaultPipeline.bloomWeight = 0.2;
        defaultPipeline.bloomKernel = 30;
        defaultPipeline.bloomScale = 0.5;
        defaultPipeline.imageProcessingEnabled = true;
        defaultPipeline.imageProcessing.toneMappingEnabled = true;
        defaultPipeline.imageProcessing.toneMappingType = 1;
        defaultPipeline.imageProcessing.exposure = 1.2;
        defaultPipeline.sharpenEnabled = true;
        defaultPipeline.sharpen.edgeAmount = 0.4;
        defaultPipeline.imageProcessing.vignetteEnabled = true;
        defaultPipeline.imageProcessing.vignetteColor =
          new BABYLON.Color3.Red();
        defaultPipeline.imageProcessing.vignetteWeight = 2;
        defaultPipeline.imageProcessing.vignetteCameraFov = 0;
      } else if (quality == "medium") {
        defaultPipeline = new BABYLON.DefaultRenderingPipeline(
          "default",
          true,
          scene,
          [camera]
        );
        defaultPipeline.bloomEnabled = true;
        defaultPipeline.bloomThreshold = 0.9;
        defaultPipeline.bloomWeight = 0.2;
        defaultPipeline.bloomKernel = 30;
        defaultPipeline.bloomScale = 0.5;
        defaultPipeline.sharpenEnabled = true;
        defaultPipeline.sharpen.edgeAmount = 0.4;
        defaultPipeline.imageProcessing.vignetteEnabled = true;
        defaultPipeline.imageProcessing.vignetteColor =
          new BABYLON.Color3.Red();
        defaultPipeline.imageProcessing.vignetteWeight = 2;
        defaultPipeline.imageProcessing.vignetteCameraFov = 0;
      } else if (quality == "low") {
        console.log("Sup Peasent?");
      }
      //#endregion
      /******************* PostProcessing *******************/

      scene.executeWhenReady(() => {
        spawnLocalPlayer("Pacific", camera, scene).then(() => {
          PortalMeshes(scene, loadedMeshes, camera);
          ImportAudio(scene);
          LoadHealth(scene);
          CreatePlayerAgent();
          LoadEnemy(scene, localPlayer.parent);
        });
      });
    }
  );
};
const createXRExperience = async () => {
  const xr = await scene.createDefaultXRExperienceAsync();
  const webXRInput = await xr.input;
  const featuresManager = xr.baseExperience.featuresManager;

  const teleportation = featuresManager.enableFeature(
    BABYLON.WebXRFeatureName.TELEPORTATION,
    "stable" /* or latest */,
    {
      xrInput: webXRInput,
      // add options here
      floorMeshes: [scene.getMeshByName("navmeshdebug")],
      renderingGroupId: 1,
    }
  );

  teleportation.rotationEnabled = true;
  teleportation.backwardsMovementEnabled = true;
  teleportation.backwardsTeleportationDistance = 1.0;
  teleportation.parabolicCheckRadius = 3;
  xr.baseExperience.camera.setTransformationFromNonVRCamera();
  webXRInput.onControllerAddedObservable.add((controller) => {
    controller.onMotionControllerInitObservable.add((motionController) => {
      if (
        motionController.handness === "left" ||
        motionController.handness === "right"
      ) {
        const xr_ids = motionController.getComponentIds();
        for (let index = 0; index < xr_ids.length; index++) {
          let component = motionController.getComponent(xr_ids[index]);

          switch (xr_ids[index]) {
            case "xr-standard-trigger":
              component.onButtonStateChangedObservable.add(() => {
                if (component.pressed) {
                  console.log(
                    xr.pointerSelection.getMeshUnderPointer(controller.uniqueId)
                  );
                }
              });
              break;
          }
        }
      }
    });
  });
};

export const LerpColor = (a, b, scene) => {
  let LerpColorAnim = new BABYLON.Animation(
    "ColorLerp",
    "material.emissiveColor",
    30,
    BABYLON.Animation.ANIMATIONTYPE_COLOR3,
    BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
  );
  let keys = [];
  keys.push({
    frame: 0,
    value: new BABYLON.Color3(0.5, 1, 0.5),
  });
  keys.push({
    frame: 100,
    value: new BABYLON.Color3(1, 0.5, 0.5),
  });
  keys.push({
    frame: 200,
    value: new BABYLON.Color3(0.5, 0.5, 1),
  });
  keys.push({
    frame: 300,
    value: new BABYLON.Color3(0.5, 1, 0.5),
  });
  LerpColorAnim.setKeys(keys);
  a.animations.push(LerpColorAnim);
  b.animations.push(LerpColorAnim);
  scene.beginAnimation(a, 0, 300, true);
  scene.beginAnimation(b, 0, 300, true);
};
export const Rotationloop = (a, parameter, speed, scene) => {
  let RotationloopAnim = new BABYLON.Animation(
    "Rotationloop",
    parameter,
    speed,
    BABYLON.Animation.ANIMATIONTYPE_FLOAT,
    BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
  );
  let rot = a.rotationQuaternion.toEulerAngles();
  a.rotationQuaternion = null;
  a.rotation.y = rot.y;
  let keys = [];
  keys.push({
    frame: 0,
    value: 0,
  });
  keys.push({
    frame: 30,
    value: -2 * Math.PI,
  });
  RotationloopAnim.setKeys(keys);
  a.animations.push(RotationloopAnim);
  scene.beginAnimation(a, 0, 30, true);
};

setupScene();
