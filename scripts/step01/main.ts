// プレイヤーのいる高さ(y座標)を取得して表示しよう

import * as mc from 'mojang-minecraft';

/**
 * チャットを送信したとき（送信内容が確定する前）
 */
mc.world.events.beforeChat.subscribe((event) => {
  // チャット欄から送信した内容が「height」のとき
  if (event.message === 'height') {
    // // イベントの送信者をプレイヤーとして取得する
    // const player = event.sender;
    // // プレイヤーから位置情報を取得する
    // const location = player.location;
    // // 位置情報から高さを取得する(この時点では少数)
    // const y = location.y;
    // // 高さを整数に直す
    // const height = Math.floor(y);

    // 上の処理を1行で書いた場合（こちらの方が良い）
    const height = Math.floor(event.sender.location.y);
    // /sayコマンドで表示する内容
    const text = `現在の高さは ${height} です。`;
    // runCommand()はtry..catch文で囲む
    try {
      // /sayコマンドを実行
      event.sender.runCommand(`say ${text}`);
    } catch (error) {
      event.sender.runCommand(`say ${error}`);
    }
    // 送信したメッセージは表示しない
    event.cancel = true;
  }
});
