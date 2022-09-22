import * as mc from 'mojang-minecraft';
import { initializePlayer, getResult } from './player';

const overworld = mc.world.getDimension('overworld');
// ゲーム時間の初期値(テスト用なので短い)
const defaultTimerSecond = 20;

/**
 * ゲームの開始処理
 */
export function startGame() {
  // ゲーム中判定を真にする
  mc.world.setDynamicProperty('tks:isPlaying', true);
  // 残り時間を設定する
  mc.world.setDynamicProperty('tks:timerSecond', defaultTimerSecond);

  // プレイヤーごとに繰り返し
  // Array.from(overworld.getPlayers()).map((player) => initializePlayer(player));
  for (const player of overworld.getPlayers()) {
    // プレイヤーの状態を初期化
    initializePlayer(player);
  }
  // ゲームの開始を通知する
  try {
    overworld.runCommand(`title @a title Game Start!`);
  } catch (e) {
    overworld.runCommand(`say ${e}`);
  }
}

/**
 * ゲームの終了処理
 */
export function exitGame() {
  // ゲーム中を解除する
  mc.world.setDynamicProperty('tks:isPlaying', false);
  // ゲームの終了を通知する
  try {
    overworld.runCommand(`title @a title Game Over!`);
  } catch (e) {
    overworld.runCommand(`say ${e}`);
  }
  // 結果を表示する
  showResult();
  // プレイヤーの状態を初期化
  for (const player of overworld.getPlayers()) {
    initializePlayer(player);
  }
}

/**
 * 結果を表示する
 */
function showResult() {
  try {
    overworld.runCommand(`say --- 結果表示 ---`);
    getResult(overworld.getPlayers()).forEach((obj) => {
      overworld.runCommand(`say ${obj.ranking}. ${obj.name} ${obj.text}`);
    });
    overworld.runCommand(`say --------------`);
  } catch (e) {
    overworld.runCommand(`say ${e}`);
  }
}
