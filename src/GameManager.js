import { respawnEnemies } from "./EnemyAI";
import { IncreaseScore, LocalAdvTex } from "./Player";

export let currEnemyCount = 0;
let waveCount = 1;

export const enemyCountPlus = () => {
  currEnemyCount++;
  // const enemyCountText = LocalAdvTex.getChildren()[0].children[2].children[0];
  // enemyCountText.text = currEnemyCount.toString();
};
export const enemyCountMinus = () => {
  currEnemyCount--;
  // const enemyCountText = LocalAdvTex.getChildren()[0].children[2].children[0];
  // enemyCountText.text = currEnemyCount.toString();

  if (currEnemyCount < 20) {
    waveCount++;
    if (waveCount <= 15) {
      let enemyType = Math.floor(Math.random() * 2);
      respawnEnemies(50 + waveCount * 2, 100 + waveCount * 2, enemyType);
      IncreaseScore(12);
    } else {
      let enemyType = Math.floor(Math.random() * 2) + 1;
      respawnEnemies(90, 100 + waveCount * 2, enemyType);
      IncreaseScore(16);
    }
  }
};
