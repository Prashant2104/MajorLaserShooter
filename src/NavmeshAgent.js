import * as Recast from "./recast.js";
import * as BABYLON from "babylonjs";
import { localPlayer } from "./Player.js";
import { followDist, LoadEnemy, shootDist } from "./EnemyAI";
import { enemySpawnPoint } from "./script.js";

export let navigationPlugin;
export let playerAgentIdx = 0;
export let crowd;
export let AgentIndex = 0;
let PlayerPos = null;
let scene = null;

export const loadNavmesh = async (url, currentScene) => {
  if (navigationPlugin == null) {
    let recast = await new Recast();
    navigationPlugin = new BABYLON.RecastJSPlugin(recast);
  }
  scene = currentScene;
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const navmeshData = new Uint8Array(arrayBuffer);
  //Decoding
  navigationPlugin.buildFromNavmeshData(navmeshData);

  //DebugNavmesh
  let navmeshdebug = navigationPlugin.createDebugNavMesh(scene);
  let matdebug = new BABYLON.StandardMaterial("matdebug", scene);
  // matdebug.diffuseColor = new BABYLON.Color3(0.1, 0.2, 1);
  matdebug.alpha = 0;
  navmeshdebug.material = matdebug;

  navmeshdebug.isPickable = false;
  navmeshdebug.physicsImpostor = new BABYLON.PhysicsImpostor(
    navmeshdebug,
    BABYLON.PhysicsImpostor.BoxImpostor,
    { mass: 0, restitution: 0, friction: 1 },
    scene
  );

  //Creating crowd
  crowd = navigationPlugin.createCrowd(1000, 10, scene);

  //Creating local player as agent
  // CreatePlayerAgent();

  //Creating Enemy as agent
  // LoadEnemy(scene, localPlayer.parent);
  // CreateEnemyAgent();
};
export const CreatePlayerAgent = () => {
  let transform = new BABYLON.TransformNode("PlayerAgent");
  // let agentCube = BABYLON.MeshBuilder.CreateBox("player", scene);
  // agentCube.position.y += 0.2;
  // agentCube.parent = transform;
  // agentCube.isVisible = false;
  PlayerPos = new BABYLON.Vector3(
    localPlayer.parent.position.x,
    0.03,
    localPlayer.parent.position.z
  );
  let agentParams = {
    radius: 30,
    height: 0.5,
    maxAcceleration: 5.0,
    maxSpeed: 5.0,
    collisionQueryRange: 0,
    pathOptimizationRange: 0.1,
    separationWeight: 1.0,
  };
  // console.log(PlayerPos);
  crowd.addAgent(PlayerPos, agentParams, transform);
  //Follow Player
  scene.registerBeforeRender(() => {
    if (localPlayer) {
      FollowPlayer(
        new BABYLON.Vector3(
          localPlayer.parent.position.x,
          0.03,
          localPlayer.parent.position.z
        )
      );
    }
  });
};

export const CreateEnemyAgent = (enemyInstance) => {
  let r;
  let randomSpawnPoint;

  while (true) {
    r = Math.floor(Math.random() * 20);
    randomSpawnPoint = enemySpawnPoint.getChildren()[r];
    if (randomSpawnPoint.metadata.enemySpawnCount >= 3) {
      // console.log(randomSpawnPoint.metadata.enemySpawnCount);
      // console.log("spawnpoint full: " + randomSpoawnPoint.name);
      continue;
    } else {
      break;
    }
  }

  let randSpawnPos = randomSpawnPoint.position;
  randomSpawnPoint.metadata.enemySpawnCount++;
  let transform = new BABYLON.TransformNode(enemyInstance.name + "_AI_Agent");

  // enemyInstance.metadata = { spawnPoint: randomSpawnPoint.metadata };
  enemyInstance.parent = transform;
  enemyInstance.position.y = 1 + Math.random() * 7 + 5;
  // console.log(enemyInstance);

  transform.metadata = {
    canShoot: false,
    spawnPoint: randomSpawnPoint.metadata.enemySpawnCount,
  };
  // transform.metadata = { spawnPos: transform.getAbsolutePosition() };
  let randomPos = navigationPlugin.getRandomPointAround(
    new BABYLON.Vector3(randSpawnPos.x, 0.03, randSpawnPos.z),
    10
  );
  if (randomPos.x == 0 && randomPos.z == 0) {
    randomPos = new BABYLON.Vector3(randSpawnPos.x, 0.03, randSpawnPos.z);
    // console.log("Zero pe spawn");
  }
  // console.log("randomPos: " + randomPos);
  let agentParams = {
    radius: 2,
    height: 0.5,
    maxAcceleration: 25,
    maxSpeed: 20,
    collisionQueryRange: 40,
    pathOptimizationRange: 0.1,
    separationWeight: 1.0,
  };
  crowd.addAgent(randomPos, agentParams, transform);
  // console.log("enemy");
};

export const FollowPlayer = (PlayerPos) => {
  let agents = crowd.getAgents();
  let i;
  for (i = 1; i < agents.length; i++) {
    let distVec = BABYLON.Vector3.Distance(
      PlayerPos,
      crowd.getAgentPosition(agents[i])
    );
    if (distVec <= followDist) {
      crowd.agentGoto(agents[i], navigationPlugin.getClosestPoint(PlayerPos));
      crowd.transforms[i].lookAt(PlayerPos, 0, 0, 0);
      if (distVec <= shootDist) {
        crowd.transforms[i].metadata.canShoot = true;
      } else {
        crowd.transforms[i].metadata.canShoot = false;
      }
    }
    //  else {
    //   crowd.agentGoto(
    //     agents[i],
    //     navigationPlugin.getClosestPoint(crowd.transforms[i].metadata.spawnPos)
    //   );
    // }
  }
  crowd.agentTeleport(
    playerAgentIdx,
    navigationPlugin.getClosestPoint(PlayerPos)
  );
};
