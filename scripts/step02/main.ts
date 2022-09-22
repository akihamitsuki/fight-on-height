// 高さの表示を自動化しよう

import * as mc from 'mojang-minecraft';

// 最初にオーバーワールドの次元情報を取得しておく（今回の使い方では毎回取得する必要がないので）
const overworld = mc.world.getDimension('overworld');

/**
 * 毎ティック実行される
 */
mc.world.events.tick.subscribe((event) => {
  // 一定時間ごとに到達高度を判定して、状態を表示
  if (event.currentTick % 10 === 0) {
    // オーバーワールドにいるプレイヤーを取得する
    const players = overworld.getPlayers();
    // プレイヤーごとに繰り返し
    // 開発時には自分一人しかいないが、複数人に増えてもエラーがでないような処理にしている
    for (const player of players) {
      // 関数を呼び出し
      showActionBar(player);
    }
  }
});

/**
 * チャットを送信したとき（送信内容が確定する前）
 */
// mc.world.events.beforeChat.subscribe((event) => {
// });

/**
 * アクションバーを表示する
 *
 * @param player
 */
function showActionBar(player: mc.Player) {
  // 高さを整数にして取得
  const height = Math.floor(player.location.y);
  // 表示用の文字列を作る
  const text = `現在の高さは ${height} です。`;
  try {
    // /titleコマンドで高さを表示する
    player.runCommand(`title @s actionbar ${text}`);
  } catch (error) {
    player.runCommand(`say ${error}`);
  }
}
