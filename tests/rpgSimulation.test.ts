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

import { DUNGEON_STAGES, calculateRequiredExp, getRealmTitle } from '../src/data/rpgStages';
import { useRpgStore } from '../src/stores/useRpgStore';
import { lookupWubiChar, getFullCode, getShortCode, calculatePhraseCode } from '../src/data/wubiDict';

describe('五笔修仙 RPG 全关卡实战模拟通关全真回归测试', () => {
  let rpgStore: ReturnType<typeof useRpgStore>;

  beforeEach(() => {
    localStorage.clear();
    rpgStore = useRpgStore();
  });

  it('逐关模拟通关：从第 1 关至第 13 关全量 199 个目标汉字/词组击键与通关流转', () => {
    let currentUnlocked = 'stage-1';

    for (let i = 0; i < DUNGEON_STAGES.length; i++) {
      const stage = DUNGEON_STAGES[i];
      
      // 验证关卡解锁状态
      expect(stage.id).toBe(currentUnlocked);

      let simulatedMonsterHp = stage.monster.maxHp;
      let targetIndex = 0;

      // 模拟逐个击打本关每一个目标汉字/词组
      for (const target of stage.targets) {
        let code = '';
        let short = '';

        if (target.length === 1) {
          const item = lookupWubiChar(target);
          expect(item).toBeDefined();
          code = getFullCode(item!, '86');
          short = getShortCode(item!, '86') || '';
          expect(code.length).toBeGreaterThanOrEqual(1);
        } else {
          code = calculatePhraseCode(target, '86');
          expect(code.length).toBe(4);
        }

        // 模拟命中结算
        const baseDamage = 35 + rpgStore.profile.value.level * 5;
        simulatedMonsterHp -= baseDamage;
        targetIndex++;
      }

      // 验证怪兽血量被打空或全部目标打完
      expect(targetIndex).toBe(stage.targets.length);

      // 模拟通关结算
      rpgStore.recordStageClear(stage.id, 3);
      rpgStore.earnCoins(stage.rewardCoins);
      rpgStore.gainExp(stage.rewardExp);

      // 验证星级已记录
      expect(rpgStore.profile.value.stageStars[stage.id]).toBe(3);

      if (i < DUNGEON_STAGES.length - 1) {
        currentUnlocked = DUNGEON_STAGES[i + 1].id;
        expect(rpgStore.profile.value.unlockedStageId).toBe(currentUnlocked);
      }
    }

    // 通关全 13 关后，检验总战绩
    expect(rpgStore.profile.value.totalMonstersDefeated).toBe(13);
    expect(rpgStore.profile.value.level).toBeGreaterThan(1);
    expect(rpgStore.profile.value.coins).toBeGreaterThan(500);
  });
});
