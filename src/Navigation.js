import * as BABYLON from "babylonjs";
// import reticleImg from "../../assets/Reticle.png";
import { HeliConstAudio } from "./Audio";
import { importedanimationGroups, localPlayer } from "./Player";

export const enableNavigation = (rootMesh, scene) => {
  for (let index = 0; index < rootMesh._children.length; index++) {
    const element = rootMesh._children[index];
    if (element.name === "Ground") {
      element.material.emissiveColor = new BABYLON.Color3.FromHexString(
        "#00F6FF"
      );
      element.material.emissiveTexture.uScale = 5;
      element.material.emissiveTexture.vScale = 5;
    } else if (
      element.name === "Black_Glass" ||
      element.name === "BlueLight" ||
      element.name === "Burj"
    ) {
      element.checkCollisions = true;
    } else if (element.name === "Fog") {
      element.checkCollisions = true;
    }
  }
};

const loadReticle = (scene, camera) => {
  const reticle = new BABYLON.MeshBuilder.CreateDisc(
    "reticle",
    {
      radius: 0.5,
      sideOrientation: BABYLON.Mesh.DOUBLESIDE,
    },
    scene
  );
  reticle.isPickable = false;
  reticle.rotation.set(Math.PI / 2, camera.rotation.y, Math.PI);
  const reticleMat = new BABYLON.StandardMaterial("reticleMat", scene);
  const tex = new BABYLON.Texture(reticleImg, scene);
  reticleMat.diffuseTexture = tex;
  reticleMat.emissiveTexture = tex;
  reticleMat.opacityTexture = tex;
  reticle.material = reticleMat;

  return reticle;
};

let targetLocation = null;
let distance = 0;

export const stopNavigation = () => {
  distance = 0;
};

export const pointerEvents = (scene, camera, anim) => {
  scene.registerBeforeRender(function () {
    if (distance > 0) {
      const speed = 0.2;
      distance -= speed;
      localPlayer.parent.movePOV(0, 0, -speed);
      anim.play(false);
      if (distance <= 0) {
        anim.stop();
      }
    }
  });

  // const reticle = loadReticle(scene, camera);
  scene.onPointerObservable.add((pointerInfo) => {
    switch (pointerInfo.type) {
      case BABYLON.PointerEventTypes.POINTERMOVE:
        reticle.isVisible = false;
        if (pointerInfo.pickInfo.pickedMesh) {
          switch (pointerInfo.pickInfo.pickedMesh.name) {
            case "navmesh": {
              if (reticle) {
                reticle.isVisible = true;
                reticle.position = new BABYLON.Vector3(
                  pointerInfo.pickInfo.pickedPoint.x,
                  pointerInfo.pickInfo.pickedPoint.y + 0.2,
                  pointerInfo.pickInfo.pickedPoint.z
                );
              }
              break;
            }
          }
          break;
        }

      case BABYLON.PointerEventTypes.POINTERTAP:
        if (pointerInfo.pickInfo.pickedMesh) {
          switch (pointerInfo.pickInfo.pickedMesh.name) {
            case "navmesh": {
              targetLocation = new BABYLON.Vector3(
                pointerInfo.pickInfo.pickedPoint.x,
                localPlayer.parent.position.y,
                pointerInfo.pickInfo.pickedPoint.z
              );

              localPlayer.animations[localPlayer["currentAnim"]]?.stop();

              //move
              localPlayer.parent.lookAt(targetLocation);
              distance = BABYLON.Vector3.Distance(
                localPlayer.parent.position,
                targetLocation
              );
              distance = Math.abs(distance);

              break;
            }
          }
          break;
        }
    }
  });
};

function moveToTarget(objectToMove, pointToMoveTo) {
  let runningAnim = importedanimationGroups.find(
    (anim) => anim.name === "WALKING_ANIM"
  );
  var moveVector = pointToMoveTo.subtract(objectToMove.position);
  if (moveVector.length() > 0.1) {
    moveVector = moveVector.normalize();
    moveVector = moveVector.scale(0.2);

    runningAnim.play(false);
    objectToMove.moveWithCollisions(moveVector);
  } else {
    targetLocation = null;
    runningAnim.stop();
  }
}

function facePoint(rotatingObject, pointToRotateTo) {
  // a directional vector from one object to the other one
  var direction = pointToRotateTo.subtract(rotatingObject.position);

  var v1 = new BABYLON.Vector3(0, 0, 1);
  var v2 = direction;

  // calculate the angle for the new direction
  var angle = Math.acos(BABYLON.Vector3.Dot(v1, v2.normalize()));
  if (direction.x < 0) angle = angle * -1;

  // calculate both angles in degrees
  var angleDegrees = Math.round((angle * 180) / Math.PI);
  var playerRotationDegrees = Math.round(
    (rotatingObject.rotation.y * 180) / Math.PI
  );

  // calculate the delta
  var deltaDegrees = playerRotationDegrees - angleDegrees + 180;

  // check which direction to turn to take the shortest turn
  if (deltaDegrees > 180) {
    deltaDegrees = deltaDegrees - 360;
  } else if (deltaDegrees < -180) {
    deltaDegrees = deltaDegrees + 360;
  }

  // rotate until the difference between the object angle and the target angle is no more than 3 degrees
  if (Math.abs(deltaDegrees) > 3) {
    var rotationSpeed = Math.round(Math.abs(deltaDegrees));

    if (deltaDegrees > 0) {
      rotatingObject.rotation.y -= (rotationSpeed * Math.PI) / 180;
      if (rotatingObject.rotation.y < -Math.PI) {
        rotatingObject.rotation.y = Math.PI;
      }
    }
    if (deltaDegrees < 0) {
      rotatingObject.rotation.y += (rotationSpeed * Math.PI) / 180;
      if (rotatingObject.rotation.y > Math.PI) {
        rotatingObject.rotation.y = -Math.PI;
      }
    }
    // return true since the rotation is in progress
    return true;
  } else {
    // return false since no rotation needed to be done
    return false;
  }
}
