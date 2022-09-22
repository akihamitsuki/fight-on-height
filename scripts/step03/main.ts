// 変数に到達点を保存しよう
// この場合は1人用、または全員で共通

import * as mc from 'mojang-minecraft';

// 最初にオーバーワールドの次元情報を取得しておく（今回の使い方では毎回取得する必要がないので）
const overworld = mc.world.getDimension('overworld');
// 到達した高さを記録する
let maxHeight = 0;
let minHeight = 0;

/**
 * 毎ティック実行される
 */
mc.world.events.tick.subscribe((event) => {
  // 一定時間ごとに到達高度を判定して、状態を表示
  if (event.currentTick % 10 === 0) {
    for (const player of overworld.getPlayers()) {
      setHeight(player);
      showActionBar(player);
    }
  }
});

/**
 * チャットを送信したとき（送信内容が確定する前）
 */
mc.world.events.beforeChat.subscribe((event) => {
  if (event.message === 'reset') {
    for (const player of overworld.getPlayers()) {
      resetHeight(player);
    }
  }
});

/**
 * 現在の高さを取得する
 *
 * @param player
 * @returns
 */
function getCurrentHeight(player: mc.Player) {
  // 1行だけでも、処理が共通なら必ず1つの関数にまとめる
  return Math.floor(player.location.y);
}

/**
 * 高度プロパティを初期化する
 *
 * 初期値は0ではなく、ゲーム開始時点のy座標
 *
 * @param player
 */
function resetHeight(player: mc.Player) {
  const currentHeight = getCurrentHeight(player);
  // それぞれの高さを設定する
  maxHeight = currentHeight;
  minHeight = currentHeight;
}

/**
 * 到達点を設定する
 *
 * @param player
 */
function setHeight(player: mc.Player) {
  const currentHeight = getCurrentHeight(player);
  // 最高到達点は、現在の値と過去の値を比べて高い方を採用する -> Math.max()
  maxHeight = Math.max(currentHeight, maxHeight);
  // 最低到達点は、現在の値と過去の値を比べて低い方を採用する -> Math.min()
  minHeight = Math.min(currentHeight, minHeight);
}

/**
 * アクションバーを表示する
 *
 * @param player
 */
function showActionBar(player: mc.Player) {
  // 得点を計算する
  const score = maxHeight - minHeight;
  // 表示用の文字列を作る
  const text = `${score}pt (${minHeight} ~ ${maxHeight})`;
  try {
    // /titleコマンドで高さを表示する
    player.runCommand(`title @s actionbar ${text}`);
  } catch (error) {
    player.runCommand(`say ${error}`);
  }
}
