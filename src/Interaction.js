import * as BABYLON from "babylonjs";
import { openModal } from "./Viewer";

export const createAnnotation = (scene, url, position, rotation, name) => {
  let annotation = BABYLON.MeshBuilder.CreateDisc(name, {
    radius: 0.25,
    sideOrientation: BABYLON.Mesh.DOUBLESIDE,
  });

  // let gizmoManager = new BABYLON.GizmoManager(scene);
  // gizmoManager.positionGizmoEnabled = true;
  // gizmoManager.usePointerToAttachGizmos = false;
  // gizmoManager.attachToMesh(annotation);

  // annotation.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

  annotation.position = new BABYLON.Vector3(position.x, position.y, position.z);
  annotation.rotation = new BABYLON.Vector3(rotation.x, rotation.y, rotation.z);

  let mat = new BABYLON.StandardMaterial("annotationMat", scene);
  mat.emissiveTexture = new BABYLON.Texture("/image.png", scene, false);
  mat.diffuseColor = BABYLON.Color3.Black();
  annotation.material = mat;

  annotation.actionManager = new BABYLON.ActionManager(scene);
  annotation.actionManager.registerAction(
    new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, () => {
      openModal(url);
    })
  );

  let initialScale = 1;
  let finalScale = 1.25;

  const anim = BABYLON.Animation.CreateAndStartAnimation(
    "infoAnim",
    annotation,
    "scalingDeterminant",
    30,
    30,
    initialScale,
    finalScale,
    BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE,
    null
  );

  anim.onAnimationEndObservable.add(() => {
    if (anim.speedRatio === 1) {
      anim.speedRatio = -1;
    } else {
      anim.speedRatio = 1;
    }
  });

  return annotation;
};
