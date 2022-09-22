// ダイナミックプロパティに到達点を保存しよう

import * as mc from 'mojang-minecraft';

// 最初にオーバーワールドの次元情報を取得しておく（今回の使い方では毎回取得する必要がないので）
const overworld = mc.world.getDimension('overworld');

/**
 * ワールド作成時に実行される
 */
mc.world.events.worldInitialize.subscribe((event) => {
  // ダイナミックプロパティの型を作成
  const playerDef = new mc.DynamicPropertiesDefinition();
  playerDef.defineNumber('tks:maxHeight');
  playerDef.defineNumber('tks:minHeight');
  event.propertyRegistry.registerEntityTypeDynamicProperties(playerDef, mc.MinecraftEntityTypes.player);
});

/**
 * 毎ティック実行される
 */
mc.world.events.tick.subscribe((event) => {
  // 一定時間ごとに到達高度を判定して、状態を表示
  if (event.currentTick % 10 === 0) {
    for (const player of overworld.getPlayers()) {
      setHeightProperty(player);
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
      resetHeightProperty(player);
    }
  }
});

/**
 * 現在の高さを取得する
 *
 * @param player
 * @returns
 */
function getHeight(player: mc.Player) {
  return Math.floor(player.location.y);
}

/**
 * 高度プロパティを初期化する
 *
 * 初期値は0ではなく、ゲーム開始時点のy座標
 *
 * @param player
 */
function resetHeightProperty(player: mc.Player) {
  // そのプレイヤーの現在の高さを取得し、整数に直す
  const current = getHeight(player);
  // それぞれのプロパティを設定する
  player.setDynamicProperty('tks:maxHeight', current);
  player.setDynamicProperty('tks:minHeight', current);
}

/**
 * 到達点を設定する
 *
 * @param player
 */
function setHeightProperty(player: mc.Player) {
  const current = getHeight(player);
  const height = getHeightProperty(player);
  // 最高到達点は、現在の値と過去の値を比べて高い方を採用する -> Math.max()
  player.setDynamicProperty('tks:maxHeight', Math.max(current, height.max));
  // 最低到達点は、現在の値と過去の値を比べて低い方を採用する -> Math.min()
  player.setDynamicProperty('tks:minHeight', Math.min(current, height.min));
}

/**
 * 得点を取得する
 *
 * @param player
 * @returns
 */
function getHeightProperty(player: mc.Player) {
  // ダイナミックプロパティから、それぞれの到達点を取得
  const max = player.getDynamicProperty('tks:maxHeight') as number;
  const min = player.getDynamicProperty('tks:minHeight') as number;
  return { max, min };
}

/**
 * アクションバーを表示する
 *
 * @param player
 */
function showActionBar(player: mc.Player) {
  const height = getHeightProperty(player);
  const score = height.max - height.min;
  // 表示用の文字列を作る
  const text = `${score}pt (${height.min} ~ ${height.max})`;
  try {
    // /titleコマンドで高さを表示する
    player.runCommand(`title @s actionbar ${text}`);
  } catch (error) {
    player.runCommand(`say ${error}`);
  }
}
