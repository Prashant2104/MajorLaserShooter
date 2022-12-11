import * as BABYLON from "babylonjs";
import "babylonjs-loaders";
import { localPlayer, UpdateHealth } from "./Player";

let scene = null;
let HealthContainer = null;

export const LoadHealth = async (currScene) => {
  scene = currScene;
  BABYLON.SceneLoader.LoadAssetContainerAsync(
    "",
    "Models/HealthDrop.glb",
    currScene,
    null
  ).then((container) => {
    container.meshes[0].name = "HealthDrop";
    container.meshes[0].scaling = new BABYLON.Vector3(100, 100, 100);
    container.meshes[0].getChildMeshes()[0].material.albedoColor =
      new BABYLON.Color3.Black();
    container.meshes[0].getChildMeshes()[0].material.emissiveColor =
      new BABYLON.Color3.FromHexString("#00A500");

    let HealthDropCollider = BABYLON.MeshBuilder.CreateSphere(
      "HealthDropCollider",
      { diameter: 1 },
      currScene
    );
    HealthDropCollider.parent = container.meshes[0].getChildMeshes()[0];
    HealthDropCollider.scaling = new BABYLON.Vector3(7.5, 7.5, 7.5);
    HealthDropCollider.isVisible = false;

    HealthContainer = container;
  });
};

export const DropHealthDrop = (dropPos) => {
  let HealthDrop = HealthContainer.instantiateModelsToScene();

  HealthDrop.rootNodes[0].position.x = dropPos.x;
  HealthDrop.rootNodes[0].position.y = 0;
  HealthDrop.rootNodes[0].position.z = dropPos.z;

  for (let x = 0; x < HealthDrop.animationGroups.length; x++) {
    HealthDrop.animationGroups[x].play(true);
  }

  let healthCollider = HealthDrop.rootNodes[0].getChildMeshes()[1];
  healthCollider.actionManager = new BABYLON.ActionManager(scene);
  healthCollider.actionManager.registerAction(
    new BABYLON.ExecuteCodeAction(
      {
        trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger,
        parameter: localPlayer.parent,
      },
      () => {
        console.log("HEAL");
        UpdateHealth(25);
        HealthDrop.rootNodes[0].dispose();
      }
    )
  );
};
