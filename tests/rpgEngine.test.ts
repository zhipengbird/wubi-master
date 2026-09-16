import { describe, it, expect, beforeEach } from 'vitest';

const storageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, val: string) => { store[key] = val; },
    clear: () => { store = {}; },
    removeItem: (key: string) => { delete store[key]; }
  };
})();
if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as any).localStorage = storageMock;
}

import { calculateRequiredExp, getRealmTitle, DUNGEON_STAGES, REALM_TITLES } from '../src/data/rpgStages';
import { useRpgStore } from '../src/stores/useRpgStore';

describe('五笔修仙 RPG 核心数值与机制测试', () => {
  let rpgStore: ReturnType<typeof useRpgStore>;

  beforeEach(() => {
    localStorage.clear();
    rpgStore = useRpgStore();
    rpgStore.profile.value = {
      level: 1,
      exp: 0,
      maxExp: 100,
      hp: 100,
      maxHp: 100,
      coins: 50,
      unlockedStageId: 'stage-1',
      stageStars: {},
      totalMonstersDefeated: 0,
      highestCombo: 0,
      inventory: { shield: 1, slow: 1, crit: 1 }
    };
  });

  it('一、经验曲线与等级提升测试', () => {
    expect(calculateRequiredExp(1)).toBe(100);
    expect(calculateRequiredExp(2)).toBeGreaterThan(100);

    // 获得经验未达上限时不升级
    const leveled1 = rpgStore.gainExp(50);
    expect(leveled1).toBe(false);
    expect(rpgStore.profile.value.level).toBe(1);
    expect(rpgStore.profile.value.exp).toBe(50);

    // 突破上限时触发升级
    const leveled2 = rpgStore.gainExp(60); // 总计 110 exp，溢出 10
    expect(leveled2).toBe(true);
    expect(rpgStore.profile.value.level).toBe(2);
    expect(rpgStore.profile.value.exp).toBe(10);
    expect(rpgStore.profile.value.maxHp).toBeGreaterThan(100);
  });

  it('二、修仙境界称号流转验证', () => {
    expect(getRealmTitle(1).tier).toBe('scholar');
    expect(getRealmTitle(9).tier).toBe('scholar');
    expect(getRealmTitle(10).tier).toBe('ranger');
    expect(getRealmTitle(20).tier).toBe('swordsman');
    expect(getRealmTitle(30).tier).toBe('grandmaster');
    expect(getRealmTitle(45).tier).toBe('celestial');
  });

  it('三、关卡推进与星级评定测试', () => {
    expect(rpgStore.profile.value.unlockedStageId).toBe('stage-1');

    // 通关第 1 关并获得 3 星
    rpgStore.recordStageClear('stage-1', 3);
    expect(rpgStore.profile.value.stageStars['stage-1']).toBe(3);
    expect(rpgStore.profile.value.totalMonstersDefeated).toBe(1);
    expect(rpgStore.profile.value.unlockedStageId).toBe('stage-2');

    // 重复通关获得更低星级时不降级
    rpgStore.recordStageClear('stage-1', 2);
    expect(rpgStore.profile.value.stageStars['stage-1']).toBe(3);
  });

  it('四、法宝商店购买与消耗测试', () => {
    rpgStore.profile.value.coins = 100;
    // 购买护体金钟罩 (cost: 50)
    const bought = rpgStore.buyItem('shield');
    expect(bought).toBe(true);
    expect(rpgStore.profile.value.coins).toBe(50);
    expect(rpgStore.profile.value.inventory['shield']).toBe(2);

    // 金币不足时购买失败
    rpgStore.profile.value.coins = 10;
    const boughtFail = rpgStore.buyItem('shield');
    expect(boughtFail).toBe(false);

    // 战斗中使用道具
    const consumed = rpgStore.consumeItem('shield');
    expect(consumed).toBe(true);
    expect(rpgStore.profile.value.inventory['shield']).toBe(1);
  });

  it('五、心魔秘境动态副本生成测试', () => {
    const customMistakes = ['馨', '设', '投'];
    const nightmare = rpgStore.createNightmareStage(customMistakes);
    expect(nightmare.id).toBe('stage-nightmare');
    expect(nightmare.targets).toEqual(customMistakes);
    expect(nightmare.monster.name).toContain('心魔');
    expect(nightmare.monster.maxHp).toBeGreaterThan(200);
  });

  it('六、三大卷关卡结构与怪兽数值健全性测试', () => {
    expect(DUNGEON_STAGES.length).toBeGreaterThanOrEqual(13);
    for (const stage of DUNGEON_STAGES) {
      expect(stage.targets.length).toBeGreaterThan(0);
      expect(stage.monster.maxHp).toBeGreaterThan(0);
      expect(stage.monster.attackIntervalMs).toBeGreaterThanOrEqual(2000);
      expect(stage.monster.attackPower).toBeGreaterThan(0);
      expect(stage.rewardExp).toBeGreaterThan(0);
    }
  });
});
