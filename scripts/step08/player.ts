import * as mc from 'mojang-minecraft';

/**
 * プレイヤーを初期化する
 *
 * @param player
 */
export function initializePlayer(player: mc.Player) {
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
 * 到達点を設定する
 *
 * @param player
 */
export function setHeightProperty(player: mc.Player) {
  const current = getHeight(player);
  const height = getHeightProperty(player);
  // 最高到達点は、現在の値と過去の値を比べて高い方を採用する -> Math.max()
  player.setDynamicProperty('tks:maxHeight', Math.max(current, height.max));
  // 最低到達点は、現在の値と過去の値を比べて低い方を採用する -> Math.min()
  player.setDynamicProperty('tks:minHeight', Math.min(current, height.min));
}

/**
 * アクションバーを表示する
 *
 * @param player
 */
export function showActionBar(player: mc.Player, timerSecond: number) {
  const height = getHeightProperty(player);
  // /titleコマンドで高さを表示する
  const text = `残り ${timerSecond}秒 / ${getScoreText(height.max, height.min)}`;
  try {
    player.runCommand(`title @s actionbar ${text}`);
  } catch (e) {
    player.runCommand(`say ${e}`);
  }
}

export function getResult(playerIterator: mc.PlayerIterator) {
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

// private

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
  const current = getHeight(player);
  // それぞれのプロパティを設定する
  player.setDynamicProperty('tks:maxHeight', current);
  player.setDynamicProperty('tks:minHeight', current);
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
