// タイマーで終了処理を自動化しよう

import * as mc from 'mojang-minecraft';
import { startGame, exitGame } from './game';
import { setHeightProperty, showActionBar } from './player';

// 最初にオーバーワールドの次元情報を取得しておく（今回の使い方では毎回取得する必要がないので）
const overworld = mc.world.getDimension('overworld');

/**
 * ワールド作成時に実行される
 */
mc.world.events.worldInitialize.subscribe((event) => {
  // ワールドのダイナミックプロパティの型を作成
  const worldDef = new mc.DynamicPropertiesDefinition();
  worldDef.defineBoolean('tks:isPlaying');
  worldDef.defineNumber('tks:timerSecond');
  event.propertyRegistry.registerWorldDynamicProperties(worldDef);
  // 初期値を設定
  mc.world.setDynamicProperty('tks:isPlaying', false);
  mc.world.setDynamicProperty('tks:timerSecond', 0);
  // プレイヤーのダイナミックプロパティの型を作成
  const playerDef = new mc.DynamicPropertiesDefinition();
  playerDef.defineNumber('tks:maxHeight');
  playerDef.defineNumber('tks:minHeight');
  event.propertyRegistry.registerEntityTypeDynamicProperties(playerDef, mc.MinecraftEntityTypes.player);
});

/**
 * 毎ティック実行される
 */
mc.world.events.tick.subscribe((event) => {
  const isPlaying = mc.world.getDynamicProperty('tks:isPlaying') as boolean;
  if (isPlaying) {
    let timerSecond = mc.world.getDynamicProperty('tks:timerSecond') as number;
    // 一定時間ごとに到達高度を判定して、状態を表示
    if (event.currentTick % 10 === 0) {
      for (const player of overworld.getPlayers()) {
        setHeightProperty(player);
        showActionBar(player, timerSecond);
      }
    }
    // 残り時間が0秒以下になったらゲーム終了
    if (timerSecond <= 0) {
      exitGame();
    }
    // 20ティックごとに残り時間(秒)から1減らす
    // ティックと秒で単位の違いに注意
    if (event.currentTick % 20 === 0) {
      // --timerSecond: --を先に付けると、-1した後に保存する
      // timerSecond--: --を後に付けると、保存した後に-1する
      mc.world.setDynamicProperty('tks:timerSecond', --timerSecond);
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
