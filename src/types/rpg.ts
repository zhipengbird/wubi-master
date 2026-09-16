// 五笔打怪升级成长体系 (Wubi RPG) 核心数据定义

export type RealmTier = 
  | 'scholar'     // 练气期 · 见习书童 (Lv.1 - Lv.9)
  | 'ranger'      // 筑基期 · 识码游侠 (Lv.10 - Lv.19)
  | 'swordsman'   // 结丹期 · 破阵剑修 (Lv.20 - Lv.29)
  | 'grandmaster' // 元婴期 · 词海宗师 (Lv.30 - Lv.39)
  | 'celestial';  // 化神期 · 盲打键仙 (Lv.40+)

export interface RealmTitle {
  tier: RealmTier;
  name: string;
  minLevel: number;
  badge: string;
  color: string;
  buffDescription: string;
}

export interface Monster {
  id: string;
  name: string;
  title: string;
  avatar: string; // Emoji 或者徽标
  maxHp: number;
  attackIntervalMs: number; // 攻击倒计时频率（毫秒）
  attackPower: number;      // 每次超时反击造成的伤害
  quote: string;            // 怪物登场/叫阵台词
  themeColor: string;
}

export type StageCategory = 'roots' | 'breakdown' | 'phrases' | 'nightmare';

export interface DungeonStage {
  id: string;
  volume: number; // 第几卷 (1: 字根觉醒, 2: 拆字破阵, 3: 词海飞升, 4: 心魔秘境)
  volumeTitle: string;
  title: string;
  subtitle: string;
  category: StageCategory;
  recommendedRealm: string;
  monster: Monster;
  targets: string[]; // 本关需要击败打出的字/词组列表
  requiredExp: number;
  rewardExp: number;
  rewardCoins: number;
  tipSnippet: string; // 本关修仙秘籍/口诀提示
}

export interface RpgItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  cost: number;
  owned: number;
  effectType: 'shield' | 'slow' | 'crit';
}

export interface PlayerProfile {
  level: number;
  exp: number;
  maxExp: number;
  hp: number;
  maxHp: number;
  coins: number;
  unlockedStageId: string;
  stageStars: Record<string, number>; // 关卡ID -> 星级 (1~3星)
  totalMonstersDefeated: number;
  highestCombo: number;
  inventory: Record<string, number>; // itemId -> 拥有数量
}

export interface FloatingDamage {
  id: number;
  text: string;
  isCrit: boolean;
  isPlayerDamage: boolean; // 是否是玩家受击
  x: number;
  y: number;
}
