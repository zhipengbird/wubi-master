import { ref, computed } from 'vue';
import type { PlayerProfile, DungeonStage, RpgItem } from '../types/rpg';
import { DUNGEON_STAGES, REALM_TITLES, RPG_ITEMS, getRealmTitle, calculateRequiredExp } from '../data/rpgStages';

const STORAGE_KEY = 'wubi_rpg_profile_v1';

const defaultProfile: PlayerProfile = {
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
  inventory: {
    shield: 1,
    slow: 1,
    crit: 1
  }
};

function loadSavedProfile(): PlayerProfile {
  if (typeof window === 'undefined') return { ...defaultProfile };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultProfile };
    const parsed = JSON.parse(raw);
    return {
      ...defaultProfile,
      ...parsed,
      inventory: {
        ...defaultProfile.inventory,
        ...(parsed.inventory || {})
      },
      stageStars: parsed.stageStars || {}
    };
  } catch {
    return { ...defaultProfile };
  }
}

// 全局单例状态
const profile = ref<PlayerProfile>(loadSavedProfile());
const lastLevelUp = ref<number | null>(null);

export function useRpgStore() {
  const currentRealm = computed(() => getRealmTitle(profile.value.level));

  const items = computed<RpgItem[]>(() => {
    return RPG_ITEMS.map(it => ({
      ...it,
      owned: profile.value.inventory[it.id] || 0
    }));
  });

  const save = () => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile.value));
    } catch (e) {
      console.warn('[useRpgStore] 保存角色存档失败:', e);
    }
  };

  const gainExp = (amount: number): boolean => {
    profile.value.exp += amount;
    let didLevelUp = false;

    while (profile.value.exp >= profile.value.maxExp) {
      profile.value.exp -= profile.value.maxExp;
      profile.value.level += 1;
      profile.value.maxExp = calculateRequiredExp(profile.value.level);
      // 升级提升基础最大生命值，并回满血量
      profile.value.maxHp = 100 + (profile.value.level - 1) * 15;
      profile.value.hp = profile.value.maxHp;
      didLevelUp = true;
    }

    if (didLevelUp) {
      lastLevelUp.value = profile.value.level;
    }
    save();
    return didLevelUp;
  };

  const earnCoins = (amount: number) => {
    profile.value.coins += amount;
    save();
  };

  const buyItem = (itemId: string): boolean => {
    const item = RPG_ITEMS.find(i => i.id === itemId);
    if (!item) return false;
    if (profile.value.coins < item.cost) return false;

    profile.value.coins -= item.cost;
    profile.value.inventory[itemId] = (profile.value.inventory[itemId] || 0) + 1;
    save();
    return true;
  };

  const consumeItem = (itemId: string): boolean => {
    if ((profile.value.inventory[itemId] || 0) <= 0) return false;
    profile.value.inventory[itemId] -= 1;
    save();
    return true;
  };

  const recordStageClear = (stageId: string, stars: number) => {
    // 记录关卡最高星级
    const currentStars = profile.value.stageStars[stageId] || 0;
    if (stars > currentStars) {
      profile.value.stageStars[stageId] = stars;
    }

    profile.value.totalMonstersDefeated += 1;

    // 解锁下一关
    const currentIndex = DUNGEON_STAGES.findIndex(s => s.id === stageId);
    if (currentIndex >= 0 && currentIndex < DUNGEON_STAGES.length - 1) {
      const nextStage = DUNGEON_STAGES[currentIndex + 1];
      const nextIndex = DUNGEON_STAGES.findIndex(s => s.id === profile.value.unlockedStageId);
      if (currentIndex + 1 > nextIndex) {
        profile.value.unlockedStageId = nextStage.id;
      }
    }
    save();
  };

  const updateHighestCombo = (combo: number) => {
    if (combo > profile.value.highestCombo) {
      profile.value.highestCombo = combo;
      save();
    }
  };

  const resetHp = () => {
    profile.value.hp = profile.value.maxHp;
  };

  // 生成心魔秘境动态副本
  const createNightmareStage = (mistakeChars: string[]): DungeonStage => {
    const targetPool = mistakeChars && mistakeChars.length > 0
      ? mistakeChars.slice(0, 20)
      : ['生', '午', '卡', '未', '严', '昼', '各', '少']; // 默认典型易错字

    return {
      id: 'stage-nightmare',
      volume: 4,
      volumeTitle: '特别秘境 · 心魔试炼',
      title: '心魔秘境 · 错题复仇之战',
      subtitle: '直面平生击错最多的生字与字根，斩除心障，道心圆满！',
      category: 'nightmare',
      recommendedRealm: '专属复仇副本',
      monster: {
        id: 'm-nightmare-beast',
        name: '混沌心魔化身',
        title: '执念与错字具象之魔',
        avatar: '👿',
        maxHp: 200 + targetPool.length * 20,
        attackIntervalMs: 4000,
        attackPower: 25,
        quote: '“我就是你平时每一次按错的键位所化！今日你能斩断我么？！”',
        themeColor: '#7c3aed'
      },
      targets: targetPool,
      requiredExp: 0,
      rewardExp: 350,
      rewardCoins: 150,
      tipSnippet: '💡 心魔秘诀：此战全部由你的个人错题组成，攻克后可彻底洗清易错字！'
    };
  };

  return {
    profile,
    currentRealm,
    items,
    lastLevelUp,
    gainExp,
    earnCoins,
    buyItem,
    consumeItem,
    recordStageClear,
    updateHighestCombo,
    resetHp,
    createNightmareStage,
    save
  };
}
