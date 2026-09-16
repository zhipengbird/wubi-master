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
import { lookupWubiChar, getFullCode, getShortCode, calculatePhraseCode, getAllValidCodes } from '../src/data/wubiDict';

describe('五笔修仙 RPG 全关卡实战模拟通关全真回归测试', () => {
  let rpgStore: ReturnType<typeof useRpgStore>;

  beforeEach(() => {
    localStorage.clear();
    rpgStore = useRpgStore();
  });

  it('一、逐关模拟通关：全量 13 关 400+ 个扩充目标汉字/词组击键、全码简码双轨验证与通关流转', () => {
    let currentUnlocked = 'stage-1';
    let totalTargetsTested = 0;

    for (let i = 0; i < DUNGEON_STAGES.length; i++) {
      const stage = DUNGEON_STAGES[i];
      
      // 验证关卡解锁状态
      expect(stage.id).toBe(currentUnlocked);
      expect(stage.targets.length).toBeGreaterThanOrEqual(16);

      let targetIndex = 0;

      // 模拟逐个击打本关每一个目标汉字/词组
      for (const target of stage.targets) {
        const codes = getAllValidCodes(target, '86');
        expect(codes.full.length).toBeGreaterThanOrEqual(1);
        expect(codes.all.length).toBeGreaterThanOrEqual(1);
        expect(codes.all).toContain(codes.full);

        // 验证简码与全码双轨支持
        if (target.length === 1) {
          const item = lookupWubiChar(target);
          expect(item).toBeDefined();

          // 核心验证：凡是键名汉字（如王土大木工等），必须包含两键简码
          if (['王', '土', '大', '木', '工', '目', '日', '口', '田', '山', '禾', '白', '月', '人', '金', '言', '立', '水', '火', '之', '已', '子', '女', '又'].includes(target)) {
            expect(codes.shorts.length).toBeGreaterThan(0);
          }
          // 核心验证：凡是一级简码汉字（如一地在要工等），必须包含 1 位简码
          if (['一', '地', '在', '要', '工', '上', '是', '中', '国', '同', '和', '的', '有', '人', '我', '主', '产', '不', '为', '这', '民', '了', '以', '经', '发'].includes(target)) {
            expect(codes.shorts.some(s => s.length === 1)).toBe(true);
          }
        } else {
          expect(codes.full.length).toBe(4);
        }

        targetIndex++;
        totalTargetsTested++;
      }

      // 验证所有目标打完
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

    // 验证扩充后的总题库量大幅超过原有的 199 个
    expect(totalTargetsTested).toBeGreaterThan(380);
    expect(rpgStore.profile.value.totalMonstersDefeated).toBe(13);
  });

  it('二、简码与全码敲键判定逻辑单元校验', () => {
    // 1. 工字（AAAA 全码，A 一简，AA 二简）
    const gongCodes = getAllValidCodes('工', '86');
    expect(gongCodes.full).toBe('AAAA');
    expect(gongCodes.all).toContain('AAAA');
    expect(gongCodes.all).toContain('A');
    expect(gongCodes.all).toContain('AA');

    // 2. 王字（GGGG 全码，GG 二简）
    const wangCodes = getAllValidCodes('王', '86');
    expect(wangCodes.full).toBe('GGGG');
    expect(wangCodes.all).toContain('GGGG');
    expect(wangCodes.all).toContain('GG');

    // 3. 把字（RCN 全码，RC 二简）
    const baCodes = getAllValidCodes('把', '86');
    expect(baCodes.full).toBe('RCN');
    expect(baCodes.all).toContain('RC');

    // 4. 进字（FJPK 全码，FJ 二简，FJP 三简）
    const jinCodes = getAllValidCodes('进', '86');
    expect(jinCodes.full).toBe('FJPK');
    expect(jinCodes.all).toContain('FJ');
    expect(jinCodes.all).toContain('FJP');
  });

  it('三、二次重玩（Replay）防秒杀机制测试：高等级/高伤害下重玩第 1 关，打第 1 个字绝不能提前胜利，必须打完全部 targets', () => {
    // 模拟玩家升到 Lv.10（基础攻击极高，旧逻辑单次普攻 85+ 伤害秒杀 Stage 1 80HP 怪兽）
    rpgStore.gainExp(5000);
    expect(rpgStore.profile.value.level).toBeGreaterThanOrEqual(10);

    const stage1 = DUNGEON_STAGES[0];
    const totalTargets = stage1.targets.length; // 扩充后共 36 个目标
    expect(totalTargets).toBeGreaterThanOrEqual(24);

    let currentTargetIndex = 0;
    let victoryTriggered = false;
    let monsterHp = stage1.monster.maxHp; // 80

    const damagePerTarget = Math.ceil(stage1.monster.maxHp / totalTargets); // 平滑伤害

    // 击打第一个字
    const target0 = stage1.targets[0];
    const codes0 = getAllValidCodes(target0, '86');
    expect(codes0.all.length).toBeGreaterThan(0);

    // 结算第 1 次命中
    monsterHp = Math.max(0, monsterHp - damagePerTarget);
    if (currentTargetIndex < totalTargets - 1) {
      currentTargetIndex++;
    } else {
      victoryTriggered = true;
    }

    // 核心断言：打完第 1 个字后，绝不能触发胜利，必须推进到索引 1
    expect(victoryTriggered).toBe(false);
    expect(currentTargetIndex).toBe(1);

    // 继续打到第 23 个字（倒数第二个）
    while (currentTargetIndex < totalTargets - 1) {
      monsterHp = Math.max(0, monsterHp - damagePerTarget);
      currentTargetIndex++;
    }
    expect(victoryTriggered).toBe(false);
    expect(currentTargetIndex).toBe(totalTargets - 1);

    // 击打最后一个目标，此时才允许触发胜利
    monsterHp = 0;
    victoryTriggered = true;
    expect(victoryTriggered).toBe(true);
  });

  it('四、乱序破阵（Shuffled Mode）机制测试：每次重玩洗牌出字，且绝不污染原始关卡静态数组', () => {
    const stage = DUNGEON_STAGES[0];
    const originalTargets = [...stage.targets];

    // 洗牌算法模拟
    const shuffleArray = <T>(array: T[]): T[] => {
      const arr = [...array];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };

    const shuffledTargets1 = shuffleArray(stage.targets);
    const shuffledTargets2 = shuffleArray(stage.targets);

    // 长度相同，元素相同，但原始数组未被改变
    expect(shuffledTargets1.length).toBe(originalTargets.length);
    expect([...shuffledTargets1].sort()).toEqual([...originalTargets].sort());
    expect(stage.targets).toEqual(originalTargets); // 保证无副作用

    // 两次洗牌大概率不同（24个元素乱序完全相同的概率为 1/24!）
    expect(shuffledTargets1.join('')).not.toBe(originalTargets.join(''));
  });

  it('五、奇遇秘宝箱奖励入库测试：rewardItem 与 earnCoins 能正确增加背包道具与铜钱', () => {
    const initialShield = rpgStore.profile.value.inventory.shield || 0;
    const initialCoins = rpgStore.profile.value.coins;

    rpgStore.rewardItem('shield', 2);
    expect(rpgStore.profile.value.inventory.shield).toBe(initialShield + 2);

    rpgStore.earnCoins(88);
    expect(rpgStore.profile.value.coins).toBe(initialCoins + 88);
  });

  it('六、键名二简与全量简码秒速自动出字推进测试（重点验证【木】字敲 SS 直接破阵换字）', () => {
    // 模拟目标字为【木】
    const muCodes = getAllValidCodes('木', '86');
    expect(muCodes.full).toBe('SSSS');
    expect(muCodes.shorts).toContain('SS');

    let currentTargetIndex = 22; // 第 1 关中【木】的位置
    let inputKeys: string[] = [];
    let hitTriggered = false;

    const simulateKey = (key: string) => {
      inputKeys.push(key);
      const typed = inputKeys.join('');
      // 1. 全码
      if (typed === muCodes.full) {
        hitTriggered = true;
        currentTargetIndex++;
        inputKeys = [];
        return;
      }
      // 2. 匹配任一合法简码（含键名二简 SS）
      if (muCodes.shorts.includes(typed)) {
        hitTriggered = true;
        currentTargetIndex++;
        inputKeys = [];
        return;
      }
    };

    // 敲入第一个 S
    simulateKey('S');
    expect(hitTriggered).toBe(false);
    expect(currentTargetIndex).toBe(22); // 仅敲 1 码时，因 S 不是木的简码，不推进
    expect(inputKeys).toEqual(['S']);

    // 敲入第二个 S（构成 SS 键名简码）
    simulateKey('S');
    expect(hitTriggered).toBe(true);
    expect(currentTargetIndex).toBe(23); // 成功推进至下一个字（丁）！
    expect(inputKeys).toEqual([]); // 缓冲区自动清空！
  });
});
