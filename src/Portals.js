import * as BABYLON from "babylonjs";
import { Space } from "babylonjs";
import { ImportAudio, PortalConstAudio, TeleportAudio } from "./Audio";
import { localPlayer } from "./Player";

// export let portalA_1_pos;
// export let portalB_1_pos;
// export let portalC_1_pos;

// export let portalA_2_pos;
// export let portalB_2_pos;
// export let portalC_2_pos;
let playerCamera = null;
export const Teleport = (player, teleportTo) => {
  // let forward = getForwardVector(teleportTo);
  // console.log(
  //   new BABYLON.Vector3(
  //     teleportTo.position.x + forward.x,
  //     teleportTo.position.y + forward.y,
  //     teleportTo.position.z + forward.z
  //   )
  // );
  TeleportAudio();
  player.position = teleportTo.position.add(getForwardVector(teleportTo));
  // player.position.y = 4;
  let lookPos = new BABYLON.Vector3(
    teleportTo.position.x,
    player.position.y,
    teleportTo.position.z
  );
  // player.rotationQuaternion = null;
  // player.lookAt(lookPos);
  // playerCamera.lookAt(lookPos);
};

export const PortalMeshes = (scene, rootMesh, camera) => {
  //console.log(rootMesh);
  playerCamera = camera;
  let portalA_1 = new BABYLON.MeshBuilder.CreateBox(
    "PortalA_1",
    { height: 4, width: 0.25, depth: 4 },
    scene
  );
  portalA_1.scaling = new BABYLON.Vector3(15, 15, -15);
  portalA_1.isVisible = false;

  let portalA_2 = new BABYLON.MeshBuilder.CreateBox(
    "PortalA_2",
    { height: 4, width: 0.25, depth: 4 },
    scene
  );
  portalA_2.scaling = new BABYLON.Vector3(15, 15, -15);
  portalA_2.isVisible = false;

  let portalB_1 = new BABYLON.MeshBuilder.CreateBox(
    "PortalB_1",
    { height: 4, width: 0.25, depth: 4 },
    scene
  );
  portalB_1.scaling = new BABYLON.Vector3(15, 15, -15);
  portalB_1.isVisible = false;

  let portalB_2 = new BABYLON.MeshBuilder.CreateBox(
    "PortalB_2",
    { height: 4, width: 0.25, depth: 4 },
    scene
  );
  portalB_2.scaling = new BABYLON.Vector3(15, 15, -15);
  portalB_2.isVisible = false;

  let portalC_1 = new BABYLON.MeshBuilder.CreateBox(
    "PortalC_1",
    { height: 4, width: 0.25, depth: 4 },
    scene
  );
  portalC_1.scaling = new BABYLON.Vector3(15, 15, -15);
  portalC_1.isVisible = false;

  let portalC_2 = new BABYLON.MeshBuilder.CreateBox(
    "PortalC_2",
    { height: 4, width: 0.25, depth: 4 },
    scene
  );
  portalC_2.scaling = new BABYLON.Vector3(15, 15, -15);
  portalC_2.isVisible = false;

  for (let i = 0; i < rootMesh.length; i++) {
    switch (rootMesh[i].name) {
      /************** Portal Pair 1 **************/
      case "Avatar_Portal_A":
        rootMesh[i].checkCollisions = true;
        portalA_1.position = new BABYLON.Vector3(
          -rootMesh[i].parent.position.x,
          rootMesh[i].parent.position.y,
          rootMesh[i].parent.position.z
        );
        PortalConstAudio(scene, portalA_1);
        break;

      case "Avatar_Portal_F":
        rootMesh[i].checkCollisions = true;
        portalA_2.position = new BABYLON.Vector3(
          -rootMesh[i].parent.position.x,
          rootMesh[i].parent.position.y,
          rootMesh[i].parent.position.z
        );
        portalA_2.rotation.y = 1.5708;
        PortalConstAudio(scene, portalA_2);
        break;
      /************** Portal Pair 1 **************/

      /************** Portal Pair 2 **************/
      case "Avatar_Portal_B":
        rootMesh[i].checkCollisions = true;
        portalB_1.position = new BABYLON.Vector3(
          -rootMesh[i].parent.position.x,
          rootMesh[i].parent.position.y,
          rootMesh[i].parent.position.z
        );
        PortalConstAudio(scene, portalB_1);
        break;

      case "Avatar_Portal_D":
        rootMesh[i].checkCollisions = true;
        portalB_2.position = new BABYLON.Vector3(
          -rootMesh[i].parent.position.x,
          rootMesh[i].parent.position.y,
          rootMesh[i].parent.position.z
        );
        PortalConstAudio(scene, portalB_2);
        break;
      /************** Portal Pair 2 **************/

      /************** Portal Pair 3 **************/
      case "Avatar_Portal_C":
        rootMesh[i].checkCollisions = true;
        portalC_1.position = new BABYLON.Vector3(
          -rootMesh[i].parent.position.x,
          rootMesh[i].parent.position.y,
          rootMesh[i].parent.position.z
        );
        PortalConstAudio(scene, portalC_1);
        break;

      case "Avatar_Portal_E":
        rootMesh[i].checkCollisions = true;
        portalC_2.position = new BABYLON.Vector3(
          -rootMesh[i].parent.position.x,
          rootMesh[i].parent.position.y,
          rootMesh[i].parent.position.z
        );
        portalC_2.rotation.y = 2.61;
        PortalConstAudio(scene, portalC_2);
        break;
      /************** Portal Pair 3 **************/

      default:
        break;
    }
  }

  scene.registerBeforeRender(() => {
    if (portalA_1.intersectsMesh(localPlayer.parent)) {
      console.log("Teleport");
      Teleport(localPlayer.parent, portalA_2);
    }
    if (portalB_1.intersectsMesh(localPlayer.parent)) {
      console.log("Teleport");
      Teleport(localPlayer.parent, portalB_2);
    }
    if (portalC_1.intersectsMesh(localPlayer.parent)) {
      console.log("Teleport");
      Teleport(localPlayer.parent, portalC_2);
    }
    if (portalA_2.intersectsMesh(localPlayer.parent)) {
      console.log("Teleport");
      Teleport(localPlayer.parent, portalA_1);
    }
    if (portalB_2.intersectsMesh(localPlayer.parent)) {
      console.log("Teleport");
      Teleport(localPlayer.parent, portalB_1);
    }
    if (portalC_2.intersectsMesh(localPlayer.parent)) {
      console.log("Teleport");
      Teleport(localPlayer.parent, portalC_1);
    }
  });
};

const getForwardVector = (portal) => {
  portal.computeWorldMatrix(true);
  let forward_local = new BABYLON.Vector3(2, 0, 0);
  let worldMatrix = portal.getWorldMatrix();
  return BABYLON.Vector3.TransformNormal(forward_local, worldMatrix);
};
