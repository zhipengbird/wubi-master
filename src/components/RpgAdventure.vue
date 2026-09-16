<template>
  <div class="rpg-container">
    <!-- 顶部修仙者 HUD 状态栏 -->
    <header class="rpg-hud">
      <div class="hud-left">
        <button 
          v-if="currentStage" 
          class="hud-btn back-btn"
          @click="exitBattle"
          title="返回关卡地图"
        >
          <span class="btn-icon">🗺️</span>
          <span class="btn-text">关卡地图</span>
        </button>

        <div class="player-realm-badge" :style="{ '--realm-color': currentRealm.color }">
          <span class="realm-icon">{{ currentRealm.badge }}</span>
          <div class="realm-info">
            <div class="realm-name">{{ currentRealm.name }}</div>
            <div class="player-level">Lv.{{ profile.level }} 修仙者</div>
          </div>
        </div>
      </div>

      <div class="hud-center">
        <!-- 经验值进度条 -->
        <div class="exp-bar-wrapper">
          <div class="bar-labels">
            <span class="bar-title">修为经验 (EXP)</span>
            <span class="bar-val">{{ profile.exp }} / {{ profile.maxExp }}</span>
          </div>
          <div class="bar-track">
            <div 
              class="bar-fill exp-fill"
              :style="{ width: `${Math.min(100, (profile.exp / profile.maxExp) * 100)}%` }"
            ></div>
          </div>
        </div>
      </div>

      <div class="hud-right">
        <!-- 金币资产 -->
        <div class="coin-badge" title="修为铜钱：通关副本掉落，可在藏宝阁购买法宝">
          <span class="coin-icon">🪙</span>
          <span class="coin-amount">{{ profile.coins }}</span>
        </div>

        <!-- 藏宝阁 / 道具背包按钮 -->
        <button class="hud-btn shop-btn" @click="showShop = true">
          <span class="btn-icon">🎒</span>
          <span class="btn-text">藏宝阁 ({{ totalItemCount }})</span>
        </button>
      </div>
    </header>

    <!-- ================= 视图 A：关卡选择大地图 ================= -->
    <main v-if="!currentStage" class="stage-map-view">
      <!-- 境界与大卷导航 Tab -->
      <div class="volume-tabs">
        <button
          v-for="vol in volumeList"
          :key="vol.id"
          class="volume-tab-btn"
          :class="{ active: activeVolume === vol.id }"
          @click="activeVolume = vol.id"
        >
          <span class="vol-icon">{{ vol.icon }}</span>
          <span class="vol-title">{{ vol.title }}</span>
          <span class="vol-tag">{{ vol.tag }}</span>
        </button>
      </div>

      <!-- 关卡卡片网格 -->
      <div class="stages-grid">
        <div
          v-for="(stage, idx) in displayedStages"
          :key="stage.id"
          class="stage-card"
          :class="{
            'is-locked': isStageLocked(stage),
            'is-cleared': getStageStars(stage.id) > 0,
            'is-current': stage.id === profile.unlockedStageId
          }"
        >
          <div class="stage-card-header">
            <span class="stage-category-pill">{{ stage.volumeTitle }}</span>
            <div class="stage-stars" v-if="getStageStars(stage.id) > 0">
              <span v-for="s in 3" :key="s" class="star" :class="{ filled: s <= getStageStars(stage.id) }">⭐</span>
            </div>
            <div class="stage-stars empty-stars" v-else>
              <span class="status-text">{{ isStageLocked(stage) ? '未解锁' : '待挑战' }}</span>
            </div>
          </div>

          <div class="monster-preview">
            <div class="monster-avatar" :style="{ borderColor: stage.monster.themeColor }">
              {{ stage.monster.avatar }}
            </div>
            <div class="monster-details">
              <h3 class="monster-name">{{ stage.monster.name }}</h3>
              <p class="monster-title">{{ stage.monster.title }}</p>
              <div class="monster-hp-tag">🩸 生命值: {{ stage.monster.maxHp }}</div>
            </div>
          </div>

          <div class="stage-info">
            <h4 class="stage-title">{{ stage.title }}</h4>
            <p class="stage-subtitle">{{ stage.subtitle }}</p>
          </div>

          <div class="stage-rewards">
            <span class="reward-pill exp">经验 +{{ stage.rewardExp }}</span>
            <span class="reward-pill coins">铜钱 +{{ stage.rewardCoins }}</span>
          </div>

          <div class="stage-action">
            <template v-if="!isStageLocked(stage)">
              <div class="stage-play-actions" v-if="getStageStars(stage.id) > 0">
                <button
                  class="battle-start-btn mode-btn shuffle-mode"
                  @click="startBattle(stage, 'shuffled')"
                  title="随机乱序出字，每次重玩充满新鲜感"
                >
                  🎲 乱序破阵
                </button>
                <button
                  class="battle-start-btn mode-btn normal-mode"
                  @click="startBattle(stage, 'sequential')"
                  title="按字根区位顺序复习"
                >
                  📖 循序复习
                </button>
              </div>
              <button
                v-else
                class="battle-start-btn"
                @click="startBattle(stage, 'sequential')"
              >
                ⚔️ 出剑讨伐
              </button>
            </template>
            <div v-else class="locked-hint">
              🔒 需先击败前一关守卫
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- ================= 视图 B：战斗试炼场 ================= -->
    <main v-else class="battle-arena-view" @click="focusHiddenInput">
      <!-- 隐藏原生输入框（捕获物理键盘与输入法） -->
      <input
        ref="hiddenInputRef"
        type="text"
        class="rpg-hidden-input"
        v-model="rawInput"
        @compositionstart="onCompositionStart"
        @compositionupdate="onCompositionUpdate"
        @compositionend="onCompositionEnd"
        @input="onNativeInput"
        @keydown="onKeyDown"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
      />

      <!-- 漂浮伤害数字容器 -->
      <div class="floating-numbers-container">
        <transition-group name="float-dmg">
          <div
            v-for="dmg in floatingDamages"
            :key="dmg.id"
            class="floating-dmg"
            :class="{ 
              crit: dmg.isCrit, 
              player: dmg.isPlayerDamage 
            }"
            :style="{ left: `${dmg.x}%`, top: `${dmg.y}%` }"
          >
            {{ dmg.text }}
          </div>
        </transition-group>
      </div>

      <!-- 战斗顶部：怪兽卡片与攻击进度 -->
      <div class="battle-top-section">
        <div 
          class="monster-battle-card"
          :class="{ 
            'is-hit': isMonsterHit, 
            'is-attacking': isMonsterAttacking 
          }"
        >
          <div class="monster-stage-tag">
            <span class="stage-tag-title">{{ currentStage.title }}</span>
            <span class="mode-tag-pill" v-if="playMode === 'shuffled'">🎲 乱序破阵</span>
            <span class="mode-tag-pill" v-else>📖 循序练功</span>
            <span class="enrage-badge" v-if="isMonsterEnraged">🔥 狂暴状态！</span>
          </div>
          
          <div class="monster-body">
            <div class="monster-boss-avatar" :style="{ borderColor: currentStage.monster.themeColor }">
              <span class="avatar-emoji">{{ currentStage.monster.avatar }}</span>
              <div v-if="activeItems.slow" class="slow-debuff-pill">⏳ 减速中</div>
            </div>

            <div class="monster-meta">
              <div class="monster-name-row">
                <span class="boss-name">{{ currentStage.monster.name }}</span>
                <span class="boss-title">{{ currentStage.monster.title }}</span>
              </div>

              <!-- 怪兽生命值条 -->
              <div class="bar-wrapper monster-hp-wrapper">
                <div class="bar-labels">
                  <span class="bar-title">怪兽气血 (HP)</span>
                  <span class="bar-val">{{ monsterHp }} / {{ currentStage.monster.maxHp }}</span>
                </div>
                <div class="bar-track">
                  <div 
                    class="bar-fill monster-fill"
                    :style="{ width: `${Math.max(0, (monsterHp / currentStage.monster.maxHp) * 100)}%` }"
                  ></div>
                </div>
              </div>

              <!-- 怪兽攻击蓄力条 (ATB) -->
              <div class="bar-wrapper atb-wrapper">
                <div class="bar-labels">
                  <span class="bar-title">怪兽出招倒计时</span>
                  <span class="bar-val">{{ (monsterAtbRemaining / 1000).toFixed(1) }}s</span>
                </div>
                <div class="bar-track atb-track">
                  <div 
                    class="bar-fill atb-fill"
                    :style="{ width: `${Math.min(100, (1 - monsterAtbRemaining / currentMonsterAttackInterval) * 100)}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- 怪兽叫阵台词气泡 -->
          <div class="monster-dialogue-bubble">
            <span class="bubble-tail"></span>
            💬 {{ currentStage.monster.quote }}
          </div>
        </div>
      </div>

      <!-- 战斗中部：连击、当前目标汉字与输入卡槽 -->
      <div class="battle-middle-section">
        <!-- 连击 Combo 徽章 -->
        <div class="combo-meter" v-if="combo >= 2">
          <span class="combo-fire">🔥</span>
          <span class="combo-count">{{ combo }} COMBO!</span>
          <span class="combo-crit-tag" v-if="combo >= 5">{{ (currentDamageMultiplier).toFixed(1) }}x 暴击</span>
        </div>

        <!-- 灵气蓄能与【万剑归宗】大招 -->
        <div class="ultimate-skill-bar">
          <div class="energy-track-container">
            <div class="energy-header">
              <span class="energy-title">⚡ 飞剑灵气</span>
              <span class="energy-pct">{{ playerEnergy }}%</span>
            </div>
            <div class="energy-track">
              <div class="energy-fill" :style="{ width: `${playerEnergy}%` }"></div>
            </div>
          </div>
          <button
            class="ultimate-btn"
            :class="{ ready: playerEnergy >= 100 }"
            :disabled="playerEnergy < 100"
            @click="castUltimateSword"
            title="灵气满蓄后直接斩灭当前目标，重创怪兽并定身 5 秒！快捷键：Tab"
          >
            <span class="sword-icon">🗡️</span>
            <span class="sword-text">{{ playerEnergy >= 100 ? '万剑归宗！(Tab)' : '万剑蓄能中' }}</span>
          </button>
        </div>

        <!-- 击杀进度 -->
        <div class="kill-progress-pill">
          ⚔️ 本关讨伐进度：{{ currentTargetIndex + 1 }} / {{ totalTargets }}
        </div>

        <!-- 目标字展示核心卡片 -->
        <div class="target-focus-card">
          <div class="target-character-display">
            {{ currentTargetText }}
          </div>

          <!-- 拆字与编码提示 -->
          <div class="target-hints-box">
            <div class="hint-roots" v-if="currentTargetRoots && currentTargetRoots.length > 0">
              <span class="hint-label">字根拆解：</span>
              <span class="root-tag" v-for="(r, idx) in currentTargetRoots" :key="idx">{{ r }}</span>
            </div>
            <div class="hint-code">
              <span class="hint-label">全码：</span>
              <span class="code-pill">{{ currentTargetCodes.full }}</span>
              <template v-if="currentTargetCodes.shorts.length > 0">
                <span class="hint-label short-prefix">简码：</span>
                <span class="short-pill" v-for="sc in currentTargetCodes.shorts" :key="sc">{{ sc }}</span>
              </template>
            </div>
            <div class="hint-tip-row">
              💡 玩法提示：直敲全码或简码均可秒速出字换字，亦可敲击空格破阵！
            </div>
          </div>

          <!-- 输入卡槽回显 -->
          <div class="key-slots-container">
            <div
              v-for="(slot, idx) in 4"
              :key="idx"
              class="key-slot"
              :class="{
                filled: inputKeys[idx],
                active: inputKeys.length === idx,
                error: isInputError
              }"
            >
              {{ inputKeys[idx] || '' }}
            </div>
          </div>

          <!-- 正在组字中的字母提示 (针对输入法打字) -->
          <div class="composing-echo" v-if="composingText">
            ⌨️ 正在组字: <span class="composing-letters">{{ composingText }}</span> (按空格上屏)
          </div>
        </div>
      </div>

      <!-- 战斗底部：玩家生命值与法宝快捷使用栏 -->
      <div class="battle-bottom-section">
        <div class="player-combat-status">
          <div class="bar-wrapper player-hp-wrapper">
            <div class="bar-labels">
              <span class="bar-title">
                ❤️ 修仙真元 (HP)
                <span v-if="activeItems.shield" class="shield-tag">🛡️ 金钟护体</span>
              </span>
              <span class="bar-val">{{ profile.hp }} / {{ profile.maxHp }}</span>
            </div>
            <div class="bar-track player-track">
              <div 
                class="bar-fill player-fill"
                :style="{ width: `${Math.max(0, (profile.hp / profile.maxHp) * 100)}%` }"
              ></div>
            </div>
          </div>
        </div>

        <!-- 快捷法宝使用栏 -->
        <div class="combat-items-bar">
          <button
            class="combat-item-btn"
            :disabled="!hasItem('shield') || activeItems.shield"
            @click="useBattleItem('shield')"
            title="免疫 1 次掉血"
          >
            <span class="item-icon">🛡️</span>
            <span class="item-name">金钟罩 ({{ getItemCount('shield') }})</span>
          </button>

          <button
            class="combat-item-btn"
            :disabled="!hasItem('slow') || activeItems.slow"
            @click="useBattleItem('slow')"
            title="怪兽倒计时减慢 50%"
          >
            <span class="item-icon">⏳</span>
            <span class="item-name">定身符 ({{ getItemCount('slow') }})</span>
          </button>

          <button
            class="combat-item-btn"
            :disabled="!hasItem('crit') || activeItems.critRounds > 0"
            @click="useBattleItem('crit')"
            title="下 5 次必定暴击"
          >
            <span class="item-icon">⚡</span>
            <span class="item-name">
              暴击丹 ({{ getItemCount('crit') }})
              <small v-if="activeItems.critRounds > 0">[{{ activeItems.critRounds }}次]</small>
            </span>
          </button>

          <button class="toggle-kb-btn" @click="showVirtualKb = !showVirtualKb">
            ⌨️ {{ showVirtualKb ? '隐藏虚拟键盘' : '显示指法键盘' }}
          </button>
        </div>

        <!-- 嵌入指法指导虚拟键盘 -->
        <div class="virtual-kb-dock" v-if="showVirtualKb">
          <VirtualKeyboard :active-key="nextExpectedKey" />
        </div>
      </div>
    </main>

    <!-- ================= 弹窗 A：藏宝阁法宝商店 ================= -->
    <div class="rpg-modal-backdrop" v-if="showShop" @click.self="showShop = false">
      <div class="rpg-modal-card shop-modal">
        <div class="modal-header">
          <h3 class="modal-title">🎒 藏宝阁 · 法宝密市</h3>
          <button class="modal-close-btn" @click="showShop = false">✕</button>
        </div>

        <div class="modal-body">
          <div class="shop-coin-balance">
            <span>当前持有修为铜钱：</span>
            <span class="coins-highlight">🪙 {{ profile.coins }}</span>
          </div>

          <div class="shop-items-list">
            <div v-for="item in items" :key="item.id" class="shop-item-row">
              <div class="item-info-col">
                <span class="item-big-icon">{{ item.icon }}</span>
                <div>
                  <h4 class="item-title">{{ item.name }} <span class="owned-tag">已拥有: {{ item.owned }}</span></h4>
                  <p class="item-desc">{{ item.description }}</p>
                </div>
              </div>
              <div class="item-buy-col">
                <button
                  class="buy-btn"
                  :disabled="profile.coins < item.cost"
                  @click="onBuyItem(item.id)"
                >
                  🪙 {{ item.cost }} 购买
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-confirm" @click="showShop = false">离开藏宝阁</button>
        </div>
      </div>
    </div>

    <!-- ================= 弹窗 B：大捷胜利结算 ================= -->
    <div class="rpg-modal-backdrop" v-if="showVictoryModal">
      <div class="rpg-modal-card victory-modal">
        <div class="modal-icon-banner">🏆</div>
        <h2 class="victory-title">斩妖除魔 · 大获全胜！</h2>
        <p class="victory-subtitle">恭喜道友成功击溃【{{ currentStage?.monster.name }}】！</p>

        <div class="stars-awarded">
          <span v-for="s in 3" :key="s" class="big-star" :class="{ earned: s <= earnedStars }">⭐</span>
        </div>

        <div class="rewards-summary-box">
          <div class="reward-row">
            <span>🎉 获得修为经验：</span>
            <span class="exp-val">+{{ currentStage?.rewardExp }} EXP</span>
          </div>
          <div class="reward-row">
            <span>🪙 获得修为铜钱：</span>
            <span class="coin-val">+{{ currentStage?.rewardCoins }} 铜钱</span>
          </div>
          <div class="reward-row" v-if="didLevelUpInBattle">
            <span class="lvl-up-tag">⚡ 境界突破！当前等级提升至 Lv.{{ profile.level }}！</span>
          </div>

          <!-- 斩妖奇遇宝箱 -->
          <div class="loot-chest-container">
            <div class="chest-banner-title">🎁 斩妖奇遇秘宝</div>
            <div v-if="!isChestOpened" class="chest-box unopened" @click="openChest" title="点击开启奇遇宝箱">
              <span class="chest-icon-bounce">📦</span>
              <span class="chest-hint">点击开启随机掉落法宝或铜钱！</span>
            </div>
            <div v-else class="chest-opened-result animate-pop">
              <span class="chest-reward-icon">{{ chestReward?.icon }}</span>
              <div class="chest-reward-desc">
                <span class="chest-reward-name">{{ chestReward?.name }}</span>
                <span class="chest-reward-val">+{{ chestReward?.count }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="victory-actions">
          <button class="btn-secondary" @click="exitBattle">返回关卡地图</button>
          <button class="btn-secondary" @click="restartCurrentBattle('shuffled')" title="乱序再战，随机出字">🎲 乱序再战</button>
          <button class="btn-secondary" @click="restartCurrentBattle('sequential')" title="循序温习原顺序">📖 循序再战</button>
          <button class="btn-primary next-stage-btn" v-if="nextStage" @click="goToNextStage">进入下一关 ⚔️</button>
        </div>
      </div>
    </div>

    <!-- ================= 弹窗 C：战败重整提示 ================= -->
    <div class="rpg-modal-backdrop" v-if="showDefeatModal">
      <div class="rpg-modal-card defeat-modal">
        <div class="modal-icon-banner">💀</div>
        <h2 class="defeat-title">力战不支 · 道心受挫</h2>
        <p class="defeat-subtitle">胜败乃兵家常事，少侠且回山修整，参悟字根再来一战！</p>

        <div class="defeat-tip-box" v-if="currentStage">
          {{ currentStage.tipSnippet }}
        </div>

        <div class="defeat-actions">
          <button class="btn-secondary" @click="exitBattle">返回修整</button>
          <button class="btn-primary" @click="restartCurrentBattle">满血重战</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import confetti from 'canvas-confetti';
import { useWubiStore } from '../stores/useWubiStore';
import { useRpgStore } from '../stores/useRpgStore';
import { DUNGEON_STAGES, type DungeonStage, type RpgItem } from '../data/rpgStages';
import type { FloatingDamage } from '../types/rpg';
import { lookupWubiChar, getFullCode, getShortCode, calculatePhraseCode, getRoots, getAllValidCodes } from '../data/wubiDict';
import { soundPlayer } from '../utils/audio';
import VirtualKeyboard from './VirtualKeyboard.vue';

const store = useWubiStore();
const rpgStore = useRpgStore();

const profile = rpgStore.profile;
const currentRealm = rpgStore.currentRealm;
const items = rpgStore.items;

// 卷导航与过滤
const activeVolume = ref<number>(1);
const volumeList = [
  { id: 1, title: '卷一 · 字根觉醒', tag: '零基础', icon: '🌱' },
  { id: 2, title: '卷二 · 拆字破阵', tag: '进阶中', icon: '⚔️' },
  { id: 3, title: '卷三 · 词海飞升', tag: '提速期', icon: '👑' },
  { id: 4, title: '秘境 · 心魔试炼', tag: '错题复仇', icon: '👿' }
];

// 动态心魔副本关卡
const nightmareStage = ref<DungeonStage>(
  rpgStore.createNightmareStage(store.mistakeList.value.map(m => m.char))
);

const allStages = computed<DungeonStage[]>(() => {
  return [...DUNGEON_STAGES, nightmareStage.value];
});

const displayedStages = computed<DungeonStage[]>(() => {
  return allStages.value.filter(s => s.volume === activeVolume.value);
});

const totalItemCount = computed(() => {
  return Object.values(profile.value.inventory).reduce((acc, c) => acc + c, 0);
});

// 关卡解锁与星级状态
const isStageLocked = (stage: DungeonStage): boolean => {
  if (stage.id === 'stage-1' || stage.id === 'stage-nightmare') return false;
  const idx = DUNGEON_STAGES.findIndex(s => s.id === stage.id);
  if (idx <= 0) return false;
  const prevStage = DUNGEON_STAGES[idx - 1];
  return ((profile.value.stageStars || {})[prevStage.id] || 0) <= 0;
};

const getStageStars = (stageId: string): number => {
  return (profile.value.stageStars || {})[stageId] || 0;
};

// 战斗核心状态
const currentStage = ref<DungeonStage | null>(null);
const playMode = ref<'sequential' | 'shuffled'>('sequential');
const activeStageTargets = ref<string[]>([]);
const totalTargets = computed(() => activeStageTargets.value.length || currentStage.value?.targets.length || 0);

const monsterHp = ref<number>(100);
const monsterAtbRemaining = ref<number>(5000);
const currentMonsterAttackInterval = ref<number>(5000);
const currentTargetIndex = ref<number>(0);

// 玩家飞剑灵气蓄力槽 (0-100%)
const playerEnergy = ref<number>(0);

// 怪兽低血量狂暴机制 (<= 35% HP 时进入狂暴，攻速提升 30%)
const isMonsterEnraged = computed(() => {
  if (!currentStage.value) return false;
  return (monsterHp.value / currentStage.value.monster.maxHp) <= 0.35;
});

// 奇遇宝箱状态
const isChestOpened = ref<boolean>(false);
const chestReward = ref<{ type: 'coins' | 'item'; name: string; icon: string; count: number } | null>(null);

const combo = ref<number>(0);
const isMonsterHit = ref<boolean>(false);
const isMonsterAttacking = ref<boolean>(false);
const isInputError = ref<boolean>(false);
const floatingDamages = ref<FloatingDamage[]>([]);
let damageIdCounter = 0;

// 正在激活的法宝
const activeItems = ref({
  shield: false,
  slow: false,
  critRounds: 0
});

// 弹窗状态
const showShop = ref<boolean>(false);
const showVictoryModal = ref<boolean>(false);
const showDefeatModal = ref<boolean>(false);
const earnedStars = ref<number>(3);
const didLevelUpInBattle = ref<boolean>(false);
const showVirtualKb = ref<boolean>(true);

// 输入捕获与组字
const hiddenInputRef = ref<HTMLInputElement | null>(null);
const rawInput = ref<string>('');
const isComposing = ref<boolean>(false);
const composingText = ref<string>('');
const inputKeys = ref<string[]>([]);

let atbTimer: any = null;

const currentTargetText = computed<string>(() => {
  if (!currentStage.value) return '';
  const list = activeStageTargets.value.length ? activeStageTargets.value : currentStage.value.targets;
  return list[currentTargetIndex.value] || '';
});

// 洗牌算法
const shuffleArray = <T>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// 计算当前目标的所有合法编码（全码与简码集合，简码全码双轨支持）
const currentTargetCodes = computed(() => {
  return getAllValidCodes(currentTargetText.value, store.version.value);
});

const currentTargetCode = computed(() => currentTargetCodes.value.full);
const currentTargetShortCodes = computed(() => currentTargetCodes.value.shorts);
const currentTargetRoots = computed<string[]>(() => {
  const text = currentTargetText.value;
  if (!text || text.length > 1) return [];
  const item = lookupWubiChar(text);
  return item ? (getRoots(item, store.version.value) || []) : [];
});

const nextExpectedKey = computed<string | null>(() => {
  const code = currentTargetCode.value;
  if (!code) return null;
  const currentLen = inputKeys.value.length;
  if (currentLen < code.length) {
    return code[currentLen];
  }
  return null;
});

const currentDamageMultiplier = computed<number>(() => {
  let mult = 1.0;
  if (combo.value >= 15) mult = 2.5;
  else if (combo.value >= 10) mult = 2.0;
  else if (combo.value >= 5) mult = 1.5;

  if (activeItems.value.critRounds > 0) {
    mult *= 2.0;
  }
  return mult;
});

// 聚焦隐藏输入框
const focusHiddenInput = () => {
  hiddenInputRef.value?.focus();
};

// 开启战斗
const startBattle = (stage: DungeonStage, mode: 'sequential' | 'shuffled' = 'sequential') => {
  currentStage.value = stage;
  playMode.value = mode;

  // 若选择乱序破阵，随机洗牌关卡字库，保证每次重玩充满新鲜感
  if (mode === 'shuffled') {
    activeStageTargets.value = shuffleArray(stage.targets);
  } else {
    activeStageTargets.value = [...stage.targets];
  }

  monsterHp.value = stage.monster.maxHp;
  currentMonsterAttackInterval.value = stage.monster.attackIntervalMs;
  monsterAtbRemaining.value = stage.monster.attackIntervalMs;
  currentTargetIndex.value = 0;
  combo.value = 0;
  playerEnergy.value = 0;
  isChestOpened.value = false;
  chestReward.value = null;
  inputKeys.value = [];
  rawInput.value = '';
  composingText.value = '';
  floatingDamages.value = [];
  showVictoryModal.value = false;
  showDefeatModal.value = false;
  didLevelUpInBattle.value = false;

  // 初始化法宝状态
  activeItems.value = {
    shield: profile.value.level >= 30, // 元婴期自带 1 次护体
    slow: false,
    critRounds: 0
  };

  rpgStore.resetHp();
  startAtbTicker();

  nextTick(() => {
    focusHiddenInput();
  });
};

const restartCurrentBattle = (mode?: 'sequential' | 'shuffled') => {
  if (currentStage.value) {
    startBattle(currentStage.value, mode || playMode.value);
  }
};

// 释放终极大招：【万剑归宗】
const castUltimateSword = () => {
  if (playerEnergy.value < 100 || !currentStage.value) return;
  playerEnergy.value = 0;

  // 剑阵特效：怪兽定身 5 秒，ATB 增加 5000ms
  monsterAtbRemaining.value += 5000;
  activeItems.value.slow = true;
  setTimeout(() => {
    activeItems.value.slow = false;
  }, 5000);

  // 终极斩击伤害
  const ultDmg = Math.ceil(currentStage.value.monster.maxHp * 0.4);
  monsterHp.value = Math.max(0, monsterHp.value - ultDmg);

  isMonsterHit.value = true;
  setTimeout(() => { isMonsterHit.value = false; }, 300);

  spawnDamage(`⚡ 万剑归宗！-${ultDmg} CRIT!`, true, false, 50, 20);
  soundPlayer.playKey(store.audio.value, true, false);

  // 剑气华丽全屏彩带
  confetti({
    particleCount: 80,
    spread: 90,
    origin: { y: 0.5 }
  });

  // 斩灭当前目标，直接挺进下一字
  inputKeys.value = [];
  rawInput.value = '';
  composingText.value = '';

  const total = totalTargets.value;
  if (currentTargetIndex.value < total - 1) {
    currentTargetIndex.value += 1;
  } else {
    monsterHp.value = 0;
    handleVictory();
  }
};

// 开启奇遇宝箱
const openChest = () => {
  if (isChestOpened.value) return;
  isChestOpened.value = true;

  // 50% 概率掉落额外铜钱，50% 概率掉落法宝
  const isItemDrop = Math.random() < 0.5;
  if (isItemDrop) {
    const candidateItems = [
      { id: 'shield', name: '金钟罩', icon: '🛡️' },
      { id: 'slow', name: '定身符', icon: '⏳' },
      { id: 'crit', name: '暴击丹', icon: '⚡' }
    ];
    const picked = candidateItems[Math.floor(Math.random() * candidateItems.length)];
    rpgStore.rewardItem(picked.id, 1);
    chestReward.value = {
      type: 'item',
      name: picked.name,
      icon: picked.icon,
      count: 1
    };
  } else {
    const coinBonus = Math.floor(Math.random() * 60) + 40; // 40~100 铜钱
    rpgStore.earnCoins(coinBonus);
    chestReward.value = {
      type: 'coins',
      name: '修为铜钱',
      icon: '🪙',
      count: coinBonus
    };
  }

  soundPlayer.playKey(store.audio.value, true, false);
};

const nextStage = computed<DungeonStage | null>(() => {
  if (!currentStage.value) return null;
  const idx = DUNGEON_STAGES.findIndex(s => s.id === currentStage.value!.id);
  if (idx >= 0 && idx < DUNGEON_STAGES.length - 1) {
    return DUNGEON_STAGES[idx + 1];
  }
  return null;
});

const goToNextStage = () => {
  if (nextStage.value) {
    activeVolume.value = nextStage.value.volume;
    startBattle(nextStage.value);
  } else {
    exitBattle();
  }
};

const exitBattle = () => {
  stopAtbTicker();
  currentStage.value = null;
  showVictoryModal.value = false;
  showDefeatModal.value = false;
};

// ATB 怪兽攻击计时器
const startAtbTicker = () => {
  stopAtbTicker();
  const tickInterval = 100;
  atbTimer = setInterval(() => {
    if (!currentStage.value || showVictoryModal.value || showDefeatModal.value) return;

    let timeDecay = activeItems.value.slow ? tickInterval * 0.5 : tickInterval;
    // 怪兽狂暴阶段攻速提升 30%
    if (isMonsterEnraged.value) {
      timeDecay *= 1.3;
    }
    monsterAtbRemaining.value -= timeDecay;

    if (monsterAtbRemaining.value <= 0) {
      // 怪兽发起反击！
      triggerMonsterAttack();
      monsterAtbRemaining.value = currentMonsterAttackInterval.value;
    }
  }, tickInterval);
};

const stopAtbTicker = () => {
  if (atbTimer) {
    clearInterval(atbTimer);
    atbTimer = null;
  }
};

// 怪兽攻击结算
const triggerMonsterAttack = () => {
  if (!currentStage.value) return;

  isMonsterAttacking.value = true;
  setTimeout(() => { isMonsterAttacking.value = false; }, 300);

  if (activeItems.value.shield) {
    // 金钟罩抵挡伤害
    activeItems.value.shield = false;
    spawnDamage('🛡️ 抵挡！', false, true, 50, 40);
    soundPlayer.playKey(store.audio.value, true, false);
    return;
  }

  const damage = currentStage.value.monster.attackPower;
  profile.value.hp = Math.max(0, profile.value.hp - damage);
  combo.value = 0; // 受击清空连击

  spawnDamage(`-${damage}`, false, true, 50, 45);
  soundPlayer.playKey(store.audio.value, false, true);

  if (profile.value.hp <= 0) {
    // 战败
    handleDefeat();
  }
};

// 产生飘字伤害数字
const spawnDamage = (text: string, isCrit: boolean, isPlayerDamage: boolean, x = 50, y = 30) => {
  const id = ++damageIdCounter;
  const jitterX = x + (Math.random() * 10 - 5);
  const jitterY = y + (Math.random() * 6 - 3);
  floatingDamages.value.push({
    id,
    text,
    isCrit,
    isPlayerDamage,
    x: jitterX,
    y: jitterY
  });

  setTimeout(() => {
    floatingDamages.value = floatingDamages.value.filter(d => d.id !== id);
  }, 1000);
};

// 处理玩家有效命中与伤害
const onPlayerHit = (matchedLetters: number) => {
  if (!currentStage.value) return;

  combo.value += 1;
  rpgStore.updateHighestCombo(combo.value);

  // 积攒万剑归宗灵气 (常规命中 +10%，暴击 +20%)
  const isCrit = combo.value >= 5 || activeItems.value.critRounds > 0;
  if (activeItems.value.critRounds > 0) {
    activeItems.value.critRounds -= 1;
  }
  playerEnergy.value = Math.min(100, playerEnergy.value + (isCrit ? 20 : 10));

  // 基础伤害计算：按本关总目标数平滑扣减怪物生命值，保证完整打完关卡丰富内容
  const total = totalTargets.value;
  const damagePerTarget = Math.ceil(currentStage.value.monster.maxHp / total);
  const actualDamage = Math.floor(damagePerTarget * currentDamageMultiplier.value);

  monsterHp.value = Math.max(0, monsterHp.value - actualDamage);

  // 击中怪兽受击动效
  isMonsterHit.value = true;
  setTimeout(() => { isMonsterHit.value = false; }, 200);

  spawnDamage(
    isCrit ? `-${actualDamage} CRIT!` : `-${actualDamage}`,
    isCrit,
    false,
    50,
    25
  );

  soundPlayer.playKey(store.audio.value, true, false);

  // 清空输入缓冲区
  inputKeys.value = [];
  rawInput.value = '';
  composingText.value = '';

  // 推进到下一个目标，打完本关全部字后决出胜利
  if (currentTargetIndex.value < total - 1) {
    currentTargetIndex.value += 1;
  } else {
    // 全部目标顺利击破，怪兽彻底阵亡
    monsterHp.value = 0;
    handleVictory();
  }
};

const onPlayerError = () => {
  isInputError.value = true;
  setTimeout(() => { isInputError.value = false; }, 300);

  combo.value = 0; // 打错清零连击

  // 记录错题至数据库
  const char = currentTargetText.value;
  if (char && char.length === 1) {
    store.recordMistake(
      char,
      inputKeys.value.join(''),
      currentTargetCode.value,
      currentTargetRoots.value
    );
  }

  soundPlayer.playKey(store.audio.value, false, true);

  // 若无金钟罩则扣除 5 点真元
  if (!activeItems.value.shield) {
    profile.value.hp = Math.max(0, profile.value.hp - 5);
    spawnDamage('-5 走火入魔', false, true, 50, 45);
    if (profile.value.hp <= 0) {
      handleDefeat();
    }
  } else {
    activeItems.value.shield = false;
    spawnDamage('🛡️ 金钟护体免伤！', false, true, 50, 45);
  }

  inputKeys.value = [];
  rawInput.value = '';
  composingText.value = '';
};

// 胜利结算
const handleVictory = () => {
  stopAtbTicker();
  if (!currentStage.value) return;

  // 评定星级：满血3星，>50%血量2星，否则1星
  const hpRatio = profile.value.hp / profile.value.maxHp;
  earnedStars.value = hpRatio >= 0.85 ? 3 : hpRatio >= 0.4 ? 2 : 1;

  rpgStore.recordStageClear(currentStage.value.id, earnedStars.value);
  rpgStore.earnCoins(currentStage.value.rewardCoins);
  const leveled = rpgStore.gainExp(currentStage.value.rewardExp);
  didLevelUpInBattle.value = leveled;

  showVictoryModal.value = true;

  // 喷洒胜利金色彩带
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
};

// 战败结算
const handleDefeat = () => {
  stopAtbTicker();
  showDefeatModal.value = true;
};

let lastImeCommitTime = 0;

// 键盘事件处理
const onKeyDown = (e: KeyboardEvent) => {
  if (isComposing.value) return;

  if (e.key === 'Tab') {
    e.preventDefault();
    if (playerEnergy.value >= 100) {
      castUltimateSword();
    }
    return;
  }

  if (e.key === 'Backspace') {
    if (inputKeys.value.length > 0) {
      inputKeys.value.pop();
    }
    return;
  }

  if (e.key === ' ' || e.key === 'Spacebar') {
    e.preventDefault();
    if (inputKeys.value.length === 0) {
      return;
    }
    // 防抖：若刚在 250ms 内完成输入法选字上屏，该空格属于输入法确认键，忽略之
    if (Date.now() - lastImeCommitTime < 250) {
      return;
    }
    checkAndCommit();
    return;
  }

  if (/^[a-zA-Z]$/.test(e.key)) {
    const key = e.key.toUpperCase();
    if (inputKeys.value.length < 4) {
      inputKeys.value.push(key);
      // 若正好达到全码或简码长度，自动比对
      checkAutoCommit();
    }
  }
};

let autoCommitTimer: any = null;

const checkAutoCommit = () => {
  if (autoCommitTimer) {
    clearTimeout(autoCommitTimer);
    autoCommitTimer = null;
  }

  const typed = inputKeys.value.join('');
  const codes = currentTargetCodes.value;

  // 1. 敲满全码直接瞬间命中（0 延迟盲打，免敲空格）
  if (typed === codes.full) {
    onPlayerHit(typed.length);
    return;
  }

  // 2. 敲满 4 码且不匹配任何合法编码（全码或已知简码）-> 立即报错走火入魔
  if (typed.length === 4 && !codes.all.includes(typed)) {
    onPlayerError();
    return;
  }

  // 3. 匹配任一合法简码（一简、二简、三简、键名二简等）
  if (codes.shorts.includes(typed)) {
    // 一级简码关卡（一键一字），0 延迟即刻出字
    if (currentStage.value?.id === 'stage-6' || typed.length === codes.full.length) {
      onPlayerHit(typed.length);
      return;
    }

    // 其他关卡简码：等待 120ms 防抖
    // 若玩家停手（如输入 SS 后等待换字），120ms 后秒速自动出字破阵！
    // 若玩家继续敲全码（如 SSSS），后续击键将取消定时器，绝不切断全码流转！
    autoCommitTimer = setTimeout(() => {
      if (inputKeys.value.join('') === typed && codes.shorts.includes(typed)) {
        onPlayerHit(typed.length);
      }
    }, 120);
  }
};

const checkAndCommit = () => {
  if (autoCommitTimer) {
    clearTimeout(autoCommitTimer);
    autoCommitTimer = null;
  }

  const typed = inputKeys.value.join('');
  if (!typed) return;
  const codes = currentTargetCodes.value;

  // 敲简码或全码后按空格，只要属于合法编码集（全码、一简、二简、三简），直接判定破阵！
  if (codes.all.includes(typed)) {
    onPlayerHit(typed.length);
  } else {
    onPlayerError();
  }
};

// 输入法 Composition 支持
const onCompositionStart = () => {
  isComposing.value = true;
};

const onCompositionUpdate = (e: CompositionEvent) => {
  composingText.value = (e.data || '').toUpperCase();
};

const onCompositionEnd = (e: CompositionEvent) => {
  isComposing.value = false;
  const committedText = e.data || '';
  composingText.value = '';
  rawInput.value = '';
  lastImeCommitTime = Date.now();

  if (committedText.includes(currentTargetText.value)) {
    onPlayerHit(4);
  } else if (committedText.trim() !== '') {
    onPlayerError();
  }
};

const onNativeInput = (e: Event) => {
  if (isComposing.value) return;
  // 防抖：避免 compositionend 紧随其后的 input 重复触发
  if (Date.now() - lastImeCommitTime < 80) return;
  const target = e.target as HTMLInputElement;
  const val = target.value.trim();
  if (val && val.includes(currentTargetText.value)) {
    onPlayerHit(4);
    rawInput.value = '';
  }
};

// 战斗中法宝使用
const hasItem = (itemId: string): boolean => {
  return (profile.value.inventory[itemId] || 0) > 0;
};

const getItemCount = (itemId: string): number => {
  return profile.value.inventory[itemId] || 0;
};

const useBattleItem = (itemId: string) => {
  if (!rpgStore.consumeItem(itemId)) return;

  if (itemId === 'shield') {
    activeItems.value.shield = true;
    spawnDamage('🛡️ 金钟罩开启！', false, true, 50, 40);
  } else if (itemId === 'slow') {
    activeItems.value.slow = true;
    spawnDamage('⏳ 定身符生效！', false, false, 50, 30);
  } else if (itemId === 'crit') {
    activeItems.value.critRounds += 5;
    spawnDamage('⚡ 暴击丹催动！', true, false, 50, 30);
  }
  soundPlayer.playKey(store.audio.value, true, false);
};

const onBuyItem = (itemId: string) => {
  if (rpgStore.buyItem(itemId)) {
    soundPlayer.playKey(store.audio.value, true, false);
  }
};

onMounted(() => {
  // 预热错题秘境
  nightmareStage.value = rpgStore.createNightmareStage(store.mistakeList.value.map(m => m.char));
});

onUnmounted(() => {
  stopAtbTicker();
});
</script>

<style scoped>
.rpg-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", sans-serif;
  color: var(--text-color, #e2e8f0);
}

/* 顶部 HUD */
.rpg-hud {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  background: var(--card-bg, #1e293b);
  border: 1px solid var(--border-color, #334155);
  border-radius: 12px;
  padding: 0.85rem 1.25rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.hud-left, .hud-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.hud-center {
  flex: 1;
  max-width: 360px;
}

.hud-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.85rem;
  border-radius: 8px;
  border: 1px solid var(--border-color, #475569);
  background: var(--bg-hover, #334155);
  color: var(--text-color, #f8fafc);
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.hud-btn:hover {
  transform: translateY(-2px);
  border-color: #38bdf8;
  box-shadow: 0 4px 12px rgba(56, 189, 248, 0.25);
}

.player-realm-badge {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.4rem 0.85rem;
  border-radius: 8px;
  background: rgba(56, 189, 248, 0.08);
  border: 1px solid var(--realm-color, #38bdf8);
}

.realm-icon {
  font-size: 1.4rem;
}

.realm-name {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--realm-color, #38bdf8);
}

.player-level {
  font-size: 0.8rem;
  color: #94a3b8;
}

.coin-badge {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.45rem 0.75rem;
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.4);
  border-radius: 8px;
  font-weight: 700;
  color: #fbbf24;
}

/* 经验条 & 血条通用 */
.bar-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.bar-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #94a3b8;
}

.bar-track {
  height: 10px;
  background: rgba(0, 0, 0, 0.35);
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.bar-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.exp-fill {
  background: linear-gradient(90deg, #38bdf8, #818cf8);
}

.monster-fill {
  background: linear-gradient(90deg, #ef4444, #f97316);
}

.atb-track {
  height: 6px;
}

.atb-fill {
  background: linear-gradient(90deg, #fbbf24, #f59e0b);
}

.player-fill {
  background: linear-gradient(90deg, #10b981, #34d399);
}

/* 关卡地图视图 */
.volume-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.volume-tab-btn {
  flex: 1;
  min-width: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.85rem 1rem;
  border-radius: 12px;
  background: var(--card-bg, #1e293b);
  border: 1px solid var(--border-color, #334155);
  color: var(--text-color, #cbd5e1);
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s ease;
}

.volume-tab-btn.active {
  background: rgba(56, 189, 248, 0.12);
  border-color: #38bdf8;
  color: #38bdf8;
  box-shadow: 0 4px 16px rgba(56, 189, 248, 0.2);
}

.vol-tag {
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.08);
}

.stages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.stage-card {
  background: var(--card-bg, #1e293b);
  border: 1px solid var(--border-color, #334155);
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
  transition: all 0.25s ease;
}

.stage-card:hover:not(.is-locked) {
  transform: translateY(-4px);
  border-color: #38bdf8;
  box-shadow: 0 10px 24px rgba(56, 189, 248, 0.2);
}

.stage-card.is-locked {
  opacity: 0.55;
  filter: grayscale(0.6);
}

.stage-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stage-category-pill {
  font-size: 0.75rem;
  font-weight: 700;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
}

.monster-preview {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.2);
}

.monster-avatar {
  font-size: 2.5rem;
  width: 54px;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  border: 2px solid #38bdf8;
  background: rgba(255, 255, 255, 0.05);
}

.monster-name {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 0.2rem 0;
}

.monster-title {
  font-size: 0.8rem;
  color: #94a3b8;
  margin: 0;
}

.monster-hp-tag {
  font-size: 0.75rem;
  color: #ef4444;
  font-weight: 600;
  margin-top: 0.2rem;
}

.stage-title {
  font-size: 1.05rem;
  font-weight: 700;
  margin: 0 0 0.35rem 0;
}

.stage-subtitle {
  font-size: 0.85rem;
  color: #94a3b8;
  margin: 0;
  line-height: 1.4;
}

.stage-rewards {
  display: flex;
  gap: 0.5rem;
}

.reward-pill {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
}

.reward-pill.exp {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
}

.reward-pill.coins {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
}

.battle-start-btn {
  width: 100%;
  padding: 0.75rem;
  border-radius: 10px;
  background: linear-gradient(135deg, #0284c7, #2563eb);
  color: #ffffff;
  border: none;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.battle-start-btn:hover {
  filter: brightness(1.15);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.4);
}

.stage-play-actions {
  display: flex;
  gap: 0.5rem;
  width: 100%;
}

.mode-btn {
  flex: 1;
  padding: 0.65rem 0.5rem;
  font-size: 0.85rem;
}

.mode-btn.shuffle-mode {
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
}

.mode-btn.normal-mode {
  background: linear-gradient(135deg, #0284c7, #2563eb);
}

.locked-hint {
  text-align: center;
  font-size: 0.85rem;
  color: #64748b;
  padding: 0.5rem;
}

/* ================= 战斗场景 ================= */
.battle-arena-view {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  min-height: 600px;
  outline: none;
}

.rpg-hidden-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

/* 漂浮伤害数字 */
.floating-numbers-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 100;
}

.floating-dmg {
  position: absolute;
  font-weight: 900;
  font-size: 2rem;
  color: #38bdf8;
  text-shadow: 0 0 12px rgba(56, 189, 248, 0.8), 0 2px 4px rgba(0, 0, 0, 0.8);
  transform: translate(-50%, -50%);
  animation: floatUp 0.8s ease-out forwards;
}

.floating-dmg.crit {
  color: #fbbf24;
  font-size: 2.8rem;
  text-shadow: 0 0 16px rgba(251, 191, 36, 0.9), 0 2px 6px rgba(0, 0, 0, 0.9);
}

.floating-dmg.player {
  color: #ef4444;
  font-size: 2rem;
  text-shadow: 0 0 12px rgba(239, 68, 68, 0.8);
}

@keyframes floatUp {
  0% { opacity: 1; transform: translate(-50%, 0) scale(0.8); }
  50% { transform: translate(-50%, -30px) scale(1.2); }
  100% { opacity: 0; transform: translate(-50%, -60px) scale(1); }
}

/* 怪兽战斗卡片 */
.monster-battle-card {
  background: var(--card-bg, #1e293b);
  border: 2px solid var(--border-color, #334155);
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
  position: relative;
  transition: all 0.2s ease;
}

.monster-battle-card.is-hit {
  animation: shakeHit 0.2s ease;
  border-color: #ef4444;
}

.monster-battle-card.is-attacking {
  transform: scale(1.03);
  box-shadow: 0 0 25px rgba(239, 68, 68, 0.6);
}

@keyframes shakeHit {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-6px) rotate(-1deg); }
  75% { transform: translateX(6px) rotate(1deg); }
}

.monster-stage-tag {
  position: absolute;
  top: -12px;
  left: 20px;
  background: #38bdf8;
  color: #0f172a;
  font-size: 0.8rem;
  font-weight: 800;
  padding: 2px 10px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.mode-tag-pill {
  background: rgba(139, 92, 246, 0.4);
  color: #e9d5ff;
  border: 1px solid rgba(139, 92, 246, 0.6);
  font-size: 0.7rem;
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 700;
}

.enrage-badge {
  background: rgba(239, 68, 68, 0.3);
  color: #fecaca;
  border: 1px solid #ef4444;
  font-size: 0.7rem;
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 800;
  animation: pulseEnrage 0.8s infinite alternate;
}

@keyframes pulseEnrage {
  0% { transform: scale(1); filter: drop-shadow(0 0 2px rgba(239, 68, 68, 0.6)); }
  100% { transform: scale(1.05); filter: drop-shadow(0 0 8px rgba(239, 68, 68, 0.9)); }
}

.monster-body {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.monster-boss-avatar {
  font-size: 4rem;
  width: 90px;
  height: 90px;
  border-radius: 20px;
  border: 3px solid #38bdf8;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.slow-debuff-pill {
  position: absolute;
  bottom: -8px;
  background: #fbbf24;
  color: #0f172a;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 4px;
}

.monster-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.monster-name-row {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
}

.boss-name {
  font-size: 1.6rem;
  font-weight: 900;
}

.boss-title {
  font-size: 0.9rem;
  color: #94a3b8;
}

.monster-dialogue-bubble {
  margin-top: 1rem;
  padding: 0.6rem 1rem;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 8px;
  font-style: italic;
  font-size: 0.9rem;
  color: #cbd5e1;
}

/* 战斗中部核心 */
.battle-middle-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.combo-meter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(90deg, rgba(239, 68, 68, 0.2), rgba(245, 158, 11, 0.2));
  border: 1px solid #f59e0b;
  padding: 0.4rem 1.25rem;
  border-radius: 30px;
  animation: pulse 1s infinite alternate;
}

.combo-fire {
  font-size: 1.4rem;
}

.combo-count {
  font-size: 1.25rem;
  font-weight: 900;
  color: #fbbf24;
}

.combo-crit-tag {
  background: #ef4444;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
}

/* 终极剑气蓄能槽 */
.ultimate-skill-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  max-width: 580px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid var(--border-color, #334155);
  border-radius: 14px;
  padding: 0.75rem 1rem;
  box-sizing: border-box;
}

.energy-track-container {
  flex: 1;
}

.energy-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  font-weight: 700;
  color: #94a3b8;
  margin-bottom: 0.35rem;
}

.energy-pct {
  color: #38bdf8;
  font-weight: 800;
}

.energy-track {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  overflow: hidden;
}

.energy-fill {
  height: 100%;
  background: linear-gradient(90deg, #38bdf8, #818cf8, #c084fc);
  transition: width 0.25s ease;
}

.ultimate-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.85rem;
  border-radius: 8px;
  border: 1px solid #475569;
  background: #1e293b;
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 800;
  cursor: not-allowed;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.ultimate-btn.ready {
  background: linear-gradient(135deg, #ec4899, #f59e0b);
  border-color: #f59e0b;
  color: #ffffff;
  cursor: pointer;
  box-shadow: 0 0 16px rgba(245, 158, 11, 0.6);
  animation: pulseReady 1.2s infinite alternate;
}

@keyframes pulseReady {
  0% { transform: scale(1); }
  100% { transform: scale(1.04); }
}

.kill-progress-pill {
  font-size: 0.85rem;
  font-weight: 700;
  color: #94a3b8;
}

.target-focus-card {
  width: 100%;
  max-width: 580px;
  background: var(--card-bg, #1e293b);
  border: 2px solid var(--border-color, #334155);
  border-radius: 24px;
  padding: 2.5rem 2rem;
  text-align: center;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.4);
}

.target-character-display {
  font-size: 4.5rem;
  font-weight: 900;
  font-family: 'Kaiti SC', 'STKaiti', serif;
  color: #f8fafc;
  text-shadow: 0 4px 16px rgba(56, 189, 248, 0.4);
  margin-bottom: 1rem;
  letter-spacing: 4px;
}

.target-hints-box {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.hint-roots {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.root-tag {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  border-radius: 4px;
  padding: 2px 6px;
  font-weight: 700;
}

.hint-code {
  font-size: 0.9rem;
  color: #94a3b8;
}

.code-pill {
  font-family: monospace;
  font-weight: 800;
  color: #10b981;
  background: rgba(16, 185, 129, 0.15);
  padding: 2px 8px;
  border-radius: 4px;
  margin-right: 0.5rem;
}

.short-pill {
  font-family: monospace;
  font-weight: 800;
  color: #fbbf24;
  background: rgba(251, 191, 36, 0.15);
  padding: 2px 8px;
  border-radius: 4px;
  margin-right: 4px;
}

.short-prefix {
  margin-left: 0.65rem;
}

.hint-tip-row {
  font-size: 0.8rem;
  color: #94a3b8;
  margin-top: 0.35rem;
}

.key-slots-container {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
}

.key-slot {
  width: 54px;
  height: 54px;
  border-radius: 12px;
  border: 2px solid var(--border-color, #475569);
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  font-weight: 900;
  font-family: monospace;
  color: #38bdf8;
  transition: all 0.15s ease;
}

.key-slot.active {
  border-color: #38bdf8;
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.5);
  transform: translateY(-2px);
}

.key-slot.filled {
  background: rgba(56, 189, 248, 0.15);
  border-color: #38bdf8;
}

.key-slot.error {
  border-color: #ef4444;
  color: #ef4444;
  animation: shake 0.2s;
}

.composing-echo {
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #94a3b8;
}

.composing-letters {
  color: #fbbf24;
  font-weight: 800;
  font-family: monospace;
}

/* 战斗底部 */
.battle-bottom-section {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.player-combat-status {
  max-width: 580px;
  margin: 0 auto;
  width: 100%;
}

.shield-tag {
  background: #fbbf24;
  color: #0f172a;
  font-size: 0.7rem;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 4px;
  margin-left: 0.5rem;
}

.combat-items-bar {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.combat-item-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.1rem;
  border-radius: 10px;
  background: var(--card-bg, #1e293b);
  border: 1px solid var(--border-color, #475569);
  color: var(--text-color, #f8fafc);
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.combat-item-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  border-color: #fbbf24;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
}

.combat-item-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.toggle-kb-btn {
  padding: 0.6rem 1.1rem;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border-color, #475569);
  color: #94a3b8;
  font-size: 0.85rem;
  cursor: pointer;
}

/* 弹窗通用 */
.rpg-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 1rem;
}

.rpg-modal-card {
  background: var(--card-bg, #1e293b);
  border: 2px solid var(--border-color, #334155);
  border-radius: 24px;
  width: 100%;
  max-width: 500px;
  padding: 2rem;
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.6);
  text-align: center;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-title {
  font-size: 1.3rem;
  margin: 0;
}

.modal-close-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 1.2rem;
  cursor: pointer;
}

.shop-coin-balance {
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.3);
  padding: 0.75rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}

.coins-highlight {
  font-weight: 800;
  color: #fbbf24;
}

.shop-items-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-align: left;
}

.shop-item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.85rem;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--border-color, #334155);
}

.item-info-col {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.item-big-icon {
  font-size: 2rem;
}

.item-title {
  margin: 0 0 0.2rem 0;
  font-size: 1rem;
}

.owned-tag {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: normal;
}

.item-desc {
  margin: 0;
  font-size: 0.8rem;
  color: #94a3b8;
}

.buy-btn {
  padding: 0.5rem 0.85rem;
  border-radius: 8px;
  background: #f59e0b;
  color: #0f172a;
  border: none;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
}

.buy-btn:hover:not(:disabled) {
  filter: brightness(1.15);
}

.buy-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.modal-footer {
  margin-top: 1.5rem;
}

.btn-confirm {
  width: 100%;
  padding: 0.75rem;
  border-radius: 10px;
  background: #334155;
  color: #ffffff;
  border: none;
  font-weight: 700;
  cursor: pointer;
}

/* 结算弹窗 */
.modal-icon-banner {
  font-size: 4rem;
  margin-bottom: 0.5rem;
}

.victory-title {
  font-size: 1.8rem;
  font-weight: 900;
  color: #fbbf24;
  margin: 0 0 0.5rem 0;
}

.victory-subtitle {
  color: #94a3b8;
  margin: 0 0 1.5rem 0;
}

.stars-awarded {
  font-size: 2.8rem;
  margin-bottom: 1.5rem;
}

.big-star {
  opacity: 0.25;
  transition: all 0.3s ease;
}

.big-star.earned {
  opacity: 1;
  filter: drop-shadow(0 0 12px rgba(251, 191, 36, 0.8));
}

.rewards-summary-box {
  background: rgba(0, 0, 0, 0.25);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-bottom: 1.5rem;
  text-align: left;
}

.reward-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
}

.exp-val {
  color: #38bdf8;
  font-weight: 800;
}

.coin-val {
  color: #fbbf24;
  font-weight: 800;
}

.lvl-up-tag {
  color: #f43f5e;
  font-weight: 800;
  text-align: center;
  width: 100%;
}

/* 奇遇秘宝箱 */
.loot-chest-container {
  margin-top: 0.85rem;
  padding-top: 0.85rem;
  border-top: 1px dashed rgba(255, 255, 255, 0.15);
  text-align: center;
}

.chest-banner-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: #fbbf24;
  margin-bottom: 0.5rem;
}

.chest-box.unopened {
  background: rgba(251, 191, 36, 0.1);
  border: 1px dashed #fbbf24;
  border-radius: 10px;
  padding: 0.75rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.2s ease;
}

.chest-box.unopened:hover {
  background: rgba(251, 191, 36, 0.2);
  transform: translateY(-2px);
}

.chest-icon-bounce {
  font-size: 2rem;
  animation: chestBounce 1s infinite alternate ease-in-out;
}

@keyframes chestBounce {
  0% { transform: translateY(0); }
  100% { transform: translateY(-6px); }
}

.chest-hint {
  font-size: 0.8rem;
  color: #cbd5e1;
}

.chest-opened-result {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid #10b981;
  border-radius: 10px;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.animate-pop {
  animation: popIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes popIn {
  0% { transform: scale(0.6); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.chest-reward-icon {
  font-size: 2rem;
}

.chest-reward-desc {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.chest-reward-name {
  font-size: 0.95rem;
  font-weight: 800;
  color: #ffffff;
}

.chest-reward-val {
  font-size: 0.85rem;
  font-weight: 700;
  color: #10b981;
}

.victory-actions, .defeat-actions {
  display: flex;
  gap: 1rem;
}

.btn-primary, .btn-secondary {
  flex: 1;
  padding: 0.85rem;
  border-radius: 12px;
  font-weight: 800;
  font-size: 1rem;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #0284c7, #2563eb);
  color: #ffffff;
}

.btn-secondary {
  background: #334155;
  color: #cbd5e1;
}

.defeat-title {
  font-size: 1.8rem;
  font-weight: 900;
  color: #ef4444;
  margin: 0 0 0.5rem 0;
}

.defeat-subtitle {
  color: #94a3b8;
  margin: 0 0 1.5rem 0;
}

.defeat-tip-box {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  padding: 0.85rem;
  border-radius: 10px;
  font-size: 0.9rem;
  color: #fca5a5;
  margin-bottom: 1.5rem;
  text-align: left;
}

@media (max-width: 768px) {
  .rpg-hud {
    flex-direction: column;
    align-items: stretch;
  }
  .target-character-display {
    font-size: 3.2rem;
  }
  .key-slot {
    width: 44px;
    height: 44px;
    font-size: 1.3rem;
  }
}
</style>
