// タイマーで終了処理を自動化しよう

import * as mc from 'mojang-minecraft';

// 最初にオーバーワールドの次元情報を取得しておく（今回の使い方では毎回取得する必要がないので）
const overworld = mc.world.getDimension('overworld');
// ゲーム時間の初期値(テスト用なので短い)
const defaultTimerSecond = 20;
// ゲーム中かどうか
let isPlaying = false;
// 残り時間(秒)
let timerSecond = 0;

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
  if (isPlaying) {
    // 一定時間ごとに到達高度を判定して、状態を表示
    if (event.currentTick % 10 === 0) {
      for (const player of overworld.getPlayers()) {
        setHeightProperty(player);
        showActionBar(player);
      }
    }
    // 残り時間が0秒以下になったらゲーム終了
    if (timerSecond <= 0) {
      exitGame();
    }
    // 20ティックごとに残り時間(秒)から1減らす
    // 単位の違いに注意
    if (event.currentTick % 20 === 0) {
      // timerSecond -= 1;
      timerSecond--;
    }
  }
});

/**
 * チャットを送信したとき（送信内容が確定する前）
 */
mc.world.events.beforeChat.subscribe((event) => {
  if (event.message === 'start') {
    startGame();
    event.cancel = true;
  }
  if (event.message === 'end') {
    exitGame();
    event.cancel = true;
  }
});

/**
 * ゲームの開始処理
 */
function startGame() {
  // ゲーム中判定を真にする
  isPlaying = true;

  // 残り時間を設定する
  timerSecond = defaultTimerSecond;

  // プレイヤーごとに繰り返し
  // Array.from(overworld.getPlayers()).map((player) => initializePlayer(player));
  for (const player of overworld.getPlayers()) {
    // プレイヤーの状態を初期化
    initializePlayer(player);
  }
  // ゲームの開始を通知する
  try {
    overworld.runCommand(`title @a title Game Start!`);
  } catch (error) {
    overworld.runCommand(`say ${error}`);
  }
}

/**
 * ゲームの終了処理
 */
function exitGame() {
  // ゲーム中を解除する
  isPlaying = false;
  // ゲームの終了を通知する
  try {
    overworld.runCommand(`title @a title Game Over!`);
  } catch (error) {
    overworld.runCommand(`say ${error}`);
  }
  // 結果を表示する
  showResult();
  // プレイヤーの状態を初期化
  for (const player of overworld.getPlayers()) {
    initializePlayer(player);
  }
}

/**
 * プレイヤーを初期化する
 *
 * @param player
 */
function initializePlayer(player: mc.Player) {
  resetHeightProperty(player);
  try {
    player.runCommand('gamemode survival');
  } catch (error) {
    player.runCommand(`say ${error}`);
  }
  try {
    player.runCommand('clear');
  } catch {}
  try {
    player.runCommand('effect @s instant_health 1 255 true');
  } catch (error) {
    player.runCommand(`say ${error}`);
  }
  try {
    player.runCommand('effect @s saturation 1 255 true');
  } catch (error) {
    player.runCommand(`say ${error}`);
  }
}

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
 * 得点を取得する
 *
 * @param max
 * @param min
 * @returns
 */
function getScore(max: number, min: number) {
  // 得点は最高到達点と最低到達点の差
  return max - min;
}

/**
 * 得点表示用の文章
 *
 * @param max
 * @param min
 * @returns
 */
function getScoreText(max: number, min: number) {
  const score = getScore(max, min);
  return `${score}pt (${min} ~ ${max})`;
}

/**
 * アクションバーを表示する
 *
 * @param player
 */
function showActionBar(player: mc.Player) {
  const height = getHeightProperty(player);
  // /titleコマンドで高さを表示する
  const text = `残り ${timerSecond}秒 / ${getScoreText(height.max, height.min)}`;
  try {
    player.runCommand(`title @s actionbar ${text}`);
  } catch (error) {
    player.runCommand(`say ${error}`);
  }
}

function getResult(playerIterator: mc.PlayerIterator) {
  // Array.from(playerIterator).map((player) => {...})
  // イテレーターをスプレッド構文を使って配列化する(次のように.map()と.sort()を使いたい)
  const players = [...playerIterator];
  // 結果をJSON構造で返す
  const result = players.map((player) => {
    const name = player.nameTag;
    const height = getHeightProperty(player);
    const score = getScore(height.max, height.min);
    const text = getScoreText(height.max, height.min);
    return { name, score, text };
  });

  // テスト用に結果情報を追加
  result.push({
    name: 'Steve',
    score: getScore(60, 57),
    text: getScoreText(60, 57),
  });
  result.push({
    name: 'Alex',
    score: getScore(80, 62),
    text: getScoreText(80, 62),
  });

  return result
    .sort((a, b) => {
      // スコアで並び替えて順位を決める
      return b.score - a.score;
    })
    .map((obj, index) => {
      // スコアが高い順に並び変えているので、indexを+1した値がそのまま順位になる(indexは0から)
      const ranking = index + 1;
      return { ranking, ...obj };
    });
}

/**
 * 結果を表示する
 */
function showResult() {
  // getResult(overworld.getPlayers()).forEach((result, index) => {
  const result = getResult(overworld.getPlayers());
  try {
    overworld.runCommand(`say --- 結果表示 ---`);
    result.forEach((obj) => {
      overworld.runCommand(`say ${obj.ranking}. ${obj.name} ${obj.text}`);
    });
    overworld.runCommand(`say --------------`);
  } catch (error) {
    overworld.runCommand(`say ${error}`);
  }
}
