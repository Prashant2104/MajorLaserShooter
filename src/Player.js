import * as BABYLON from "babylonjs";
import * as GUI from "babylonjs-gui";
import { PlayerShoot, spawnWeapon } from "./Weapons";
import { defaultPipeline, GameOver, gameover, inVr } from "./script";

let Camera;

export let importedanimationGroups = [];

export let localPlayer;
export let camTarget;
let colliderMesh;

let playerHealth = 100;
export let playerScore = 0;

let playerSPwnPos = new BABYLON.Vector3(-500, 3, -400);

export const EnterVrPlayer = (scene, VRCAM) => {
  // colliderMesh.parent = VRCAM;
  scene.registerBeforeRender(() => {
    if (inVr)
      colliderMesh.position = new BABYLON.Vector3(
        VRCAM.position.x,
        colliderMesh.position.y,
        VRCAM.position.z
      );
  });
};

export const spawnLocalPlayer = async (userid, camera, scene) => {
  Camera = camera;
  let gender = "Male_Final.glb";

  await BABYLON.SceneLoader.ImportMeshAsync("", gender, "", scene, null).then(
    (loadedMesh) => {
      localPlayer = loadedMesh.meshes[0];

      for (let i = 1; i < loadedMesh.meshes.length; i++) {
        loadedMesh.meshes[i].visibility = 0;
        loadedMesh.meshes[i].isPickable = false;
      }

      localPlayer.name = "Pacific";
      LocalPlayerUI();
      localPlayer.rotation = new BABYLON.Vector3.Zero();

      colliderMesh = BABYLON.MeshBuilder.CreateBox(
        userid,
        { height: 1 },
        scene
      );
      colliderMesh.checkCollisions = true;
      colliderMesh.isVisible = false;
      colliderMesh.name = "PlayerColliderMesh";
      colliderMesh.isPickable = false;
      colliderMesh.addChild(localPlayer);
      colliderMesh.position = playerSPwnPos;
      colliderMesh.scaling = new BABYLON.Vector3(2, 2, 2);
      colliderMesh.rotation = new BABYLON.Vector3.Zero();
      colliderMesh.metadata = { videoAdded: false };

      colliderMesh.physicsImpostor = new BABYLON.PhysicsImpostor(
        colliderMesh,
        BABYLON.PhysicsImpostor.BoxImpostor,
        { mass: 1, restitution: 0, friction: 1 },
        scene
      );

      localPlayer.position = new BABYLON.Vector3(0, -0.9, 0);
      localPlayer.rotation.y = 0;

      camTarget = new BABYLON.Mesh("CamTarget", scene, colliderMesh);
      camTarget.position.y = 0.9;
      //camTarget.position.z = 0.15;

      camera.lockedTarget = camTarget;
      camera.radius = 0;
      camera.lowerRadiusLimit = 0;
      camera.upperRadiusLimit = 0;

      camera.alpha = 3.13;
      camera.beta = 1.385;
      camera.lowerBetaLimit = 1;
      camera.upperBetaLimit = 2.25;
      scene.registerBeforeRender(() => {
        if (colliderMesh.position.y >= 3.3 || colliderMesh.position.y <= 3.25) {
          colliderMesh.physicsImpostor.setAngularVelocity(
            BABYLON.Vector3.Zero()
          );
        }
      });
    }
  );
};

export let LocalAdvTex;
export const LocalPlayerUI = () => {
  LocalAdvTex = GUI.AdvancedDynamicTexture.CreateFullscreenUI("PlayerUI");

  const healthBarBG = new GUI.Rectangle("HealthBarBG");
  healthBarBG.background = "White";
  healthBarBG.height = "5%";
  healthBarBG.width = "75%";
  healthBarBG.top = 12;
  healthBarBG.paddingTopInPixels = 5;
  healthBarBG.verticalAlignment = 0;
  healthBarBG.cornerRadius = 20;
  healthBarBG.thickness = 3;
  LocalAdvTex.addControl(healthBarBG);

  const healthBar = new GUI.Rectangle("HealthBar");
  healthBarBG.addControl(healthBar);
  healthBar.horizontalAlignment = 0;
  healthBar.background = "Green";
  healthBar.cornerRadius = 20;

  const scorePanel = new GUI.Rectangle("scorePanel");
  scorePanel.background = "Black";
  scorePanel.alpha = 0.5;
  scorePanel.verticalAlignment = 0;
  scorePanel.horizontalAlignment = 0;
  scorePanel.height = "7.5%";
  scorePanel.width = "7%";
  scorePanel.paddingTopInPixels = 10;
  scorePanel.paddingLeftInPixels = 50;
  scorePanel.cornerRadius = 7.5;
  scorePanel.thickness = 1.5;
  LocalAdvTex.addControl(scorePanel);

  const scoreText = new GUI.TextBlock("ScoreText");
  scorePanel.addControl(scoreText);
  scoreText.fontSize = 22.5;
  scoreText.paddingTop = "1px";
  scoreText.text = playerScore.toString();
  scoreText.color = "white";
};
export const LocalPlayerUI_VR = (gunMesh, currScene) => {
  let HealthUI = BABYLON.MeshBuilder.CreatePlane(
    "PlayerHealthUI_VR",
    {
      sideOrientation: BABYLON.Mesh.DOUBLESIDE,
    },
    currScene
  );
  HealthUI.isPickable = false;
  HealthUI.parent = gunMesh;
  HealthUI.position = new BABYLON.Vector3(0, -0.5, 0);
  HealthUI.rotation = new BABYLON.Vector3(0, Math.PI, Math.PI);
  HealthUI.scaling = new BABYLON.Vector3(1.25, 0.5, 0.25);
  HealthUI.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

  console.log(HealthUI);
  LocalAdvTex.dispose();
  LocalAdvTex = GUI.AdvancedDynamicTexture.CreateForMesh(
    HealthUI,
    500,
    150,
    false,
    null,
    true
  );

  const healthBarBG = new GUI.Rectangle("PlayerHealthBarBG_VR");
  healthBarBG.background = "White";
  healthBarBG.height = "25%";
  healthBarBG.width = "100%";
  healthBarBG.verticalAlignment = 0;
  healthBarBG.cornerRadius = 20;
  healthBarBG.thickness = 3;
  LocalAdvTex.addControl(healthBarBG);

  const healthBar = new GUI.Rectangle("HealthBar");
  healthBarBG.addControl(healthBar);
  healthBar.horizontalAlignment = 0;
  healthBar.background = "Green";
  healthBar.cornerRadius = 20;

  const scorePanel = new GUI.Rectangle("scorePanel");
  scorePanel.background = "Black";
  scorePanel.alpha = 0.5;
  scorePanel.verticalAlignment = 0;
  scorePanel.horizontalAlignment = 0;
  scorePanel.height = "7.5%";
  scorePanel.width = "7%";
  scorePanel.paddingTopInPixels = 10;
  scorePanel.paddingLeftInPixels = 50;
  scorePanel.cornerRadius = 7.5;
  scorePanel.thickness = 1.5;
  LocalAdvTex.addControl(scorePanel);

  const scoreText = new GUI.TextBlock("ScoreText");
  scorePanel.addControl(scoreText);
  scoreText.fontSize = 22.5;
  scoreText.paddingTop = "1px";
  scoreText.text = playerScore.toString();
  scoreText.color = "white";
};

export const keyboardEvents = (scene) => {
  scene.actionManager = new BABYLON.ActionManager(scene);
  scene.onPointerDown = () => {
    if (!inVr) PlayerShoot(scene, Camera);
  };
};

let MovementPosition = new BABYLON.Vector3.Zero();
let horizontal;
let vertical;
let normalSpeed = 0.04;
let speed = normalSpeed;
let sprintSpeed = 0.07;
let MovementVector;

export const inputController = (
  camera,
  up,
  down,
  left,
  right,
  up2,
  down2,
  left2,
  right2,
  sprint,
  jump,
  scene
) => {
  vertical = up + up2 - down - down2;
  horizontal = right + right2 - left - left2;

  if (sprint != 0 && speed != sprintSpeed) {
    speed = sprintSpeed;
  }
  if (sprint == 0 && speed != normalSpeed) {
    speed = normalSpeed;
  }

  if (jump != 0 && colliderMesh.position.y <= 3.3) {
    colliderMesh.physicsImpostor.applyImpulse(
      colliderMesh.up.scale(10),
      colliderMesh.getAbsolutePosition()
    );
  }

  if (vertical != 0 || horizontal != 0) {
    MovementVector = new BABYLON.Vector3(horizontal, 0, vertical).normalize();

    MovementPosition = new BABYLON.Vector3(
      speed * MovementVector.x * scene.getEngine().getDeltaTime(),
      0,
      speed * MovementVector.z * scene.getEngine().getDeltaTime()
    );
    MovementPosition = BABYLON.Vector3.TransformNormal(
      MovementPosition,
      camera.getWorldMatrix()
    );
    localPlayer.parent.moveWithCollisions(
      new BABYLON.Vector3(MovementPosition.x, 0, MovementPosition.z)
    );
  }
};

export const UpdateHealth = (healthAmount) => {
  if (playerHealth + healthAmount >= 100) {
    playerHealth = 100;
  } else {
    playerHealth += healthAmount;
  }
  console.log(playerHealth);
  const healthBar = LocalAdvTex.getChildren()[0].children[0].children[0];
  healthBar.width = `${playerHealth}%`;
  defaultPipeline.imageProcessing.vignetteCameraFov = 1 - playerHealth / 100;
  if (playerHealth <= 25) {
    healthBar.background = "Red";
    if (playerHealth <= 0) {
      console.log("PLAYER LOST");
      GameOver();
    }
  } else {
    healthBar.background = "Green";
  }
};

export const IncreaseScore = (scoreIncrement) => {
  playerScore += scoreIncrement;
  console.log("Score= " + playerScore);
  const scoreText = LocalAdvTex.getChildren()[0].children[1].children[0];
  scoreText.text = playerScore.toString();
  if (playerScore > 99) {
    scoreText.fontSize = 21;
  }
};
