import * as BABYLON from "babylonjs";
import { EnemyAudioClone } from "./Audio";
import { EnemyShoot, HealthBar } from "./EnemyAI";
import { enemyCountPlus } from "./GameManager";
import { CreateEnemyAgent } from "./NavmeshAgent";

let i1 = 0;
export const InstansiateEnemies = (
  enemySpawnCount,
  enemySpawnHealth,
  container
) => {
  setTimeout(() => {
    // console.log(i1);

    let enemyInstance;
    let enemyRoot;

    enemyInstance = container.instantiateModelsToScene();
    enemyInstance.rootNodes[0].name = "Enemy_" + i1;

    enemyInstance.rootNodes[0].position = new BABYLON.Vector3.Zero();
    enemyInstance.rootNodes[0].rotation = new BABYLON.Vector3.Zero();
    enemyInstance.rootNodes[0].scaling = new BABYLON.Vector3(5, 5, 5);

    CreateEnemyAgent(enemyInstance.rootNodes[0]);
    enemyRoot = enemyInstance.rootNodes[0].parent;

    let enemyHitPoint =
      enemyInstance.rootNodes[0].getChildMeshes()[
        enemyInstance.rootNodes[0].getChildMeshes().length - 1
      ];
    enemyHitPoint.name = "Enemy_" + i1 + "_HitTarget";
    enemyHitPoint.metadata = {
      enemyMetadata: [enemySpawnHealth, enemySpawnHealth],
    };
    HealthBar(enemyHitPoint);

    for (let group of enemyInstance.animationGroups) {
      group.play(true);
    }
    enemyCountPlus();
    EnemyAudioClone(enemyHitPoint);

    EnemyShoot(enemyInstance.rootNodes[0]);
    i1++;
    if (i1 < enemySpawnCount) {
      InstansiateEnemies(enemySpawnCount, enemySpawnHealth, container);
    } else {
      i1 = 0;
    }
  }, 10);
};
