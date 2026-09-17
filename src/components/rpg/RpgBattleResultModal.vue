<template>
  <div>
    <!-- ================= 弹窗 B：大捷胜利结算 ================= -->
    <div class="rpg-modal-backdrop" v-if="showVictory">
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
            <span class="lvl-up-tag">⚡ 境界突破！当前等级提升至 Lv.{{ profileLevel }}！</span>
          </div>

          <!-- 斩妖奇遇宝箱 -->
          <div class="loot-chest-container">
            <div class="chest-banner-title">🎁 斩妖奇遇秘宝</div>
            <div v-if="!isChestOpened" class="chest-box unopened" @click="$emit('openChest')" title="点击开启奇遇宝箱">
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
          <button class="btn-secondary" @click="$emit('exit')">返回关卡地图</button>
          <button class="btn-secondary" @click="$emit('restart', 'shuffled')" title="乱序再战，随机出字">🎲 乱序再战</button>
          <button class="btn-secondary" @click="$emit('restart', 'sequential')" title="循序温习原顺序">📖 循序再战</button>
          <button class="btn-primary next-stage-btn" v-if="nextStage" @click="$emit('next')">进入下一关 ⚔️</button>
        </div>
      </div>
    </div>

    <!-- ================= 弹窗 C：战败重整提示 ================= -->
    <div class="rpg-modal-backdrop" v-if="showDefeat">
      <div class="rpg-modal-card defeat-modal">
        <div class="modal-icon-banner">💀</div>
        <h2 class="defeat-title">力战不支 · 道心受挫</h2>
        <p class="defeat-subtitle">胜败乃兵家常事，少侠且回山修整，参悟字根再来一战！</p>

        <div class="defeat-tip-box" v-if="currentStage">
          {{ currentStage.tipSnippet }}
        </div>

        <div class="defeat-actions">
          <button class="btn-secondary" @click="$emit('exit')">返回修整</button>
          <button class="btn-primary" @click="$emit('restart')">满血重战</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DungeonStage } from '../../types/rpg';

defineProps<{
  showVictory: boolean;
  showDefeat: boolean;
  currentStage: DungeonStage | null;
  nextStage: DungeonStage | null;
  earnedStars: number;
  didLevelUpInBattle: boolean;
  isChestOpened: boolean;
  chestReward: { type: string; name: string; icon: string; count: number } | null;
  profileLevel: number;
}>();

defineEmits<{
  (e: 'openChest'): void;
  (e: 'exit'): void;
  (e: 'restart', mode?: 'sequential' | 'shuffled'): void;
  (e: 'next'): void;
}>();
</script>

<style scoped>
.rpg-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.rpg-modal-card {
  background: var(--card-bg, #1e293b);
  border: 2px solid var(--border-color, #334155);
  border-radius: 24px;
  width: 100%;
  max-width: 500px;
  padding: 2rem;
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.4);
  text-align: center;
  color: var(--text-main);
}

.modal-icon-banner {
  font-size: 3.5rem;
  margin-bottom: 0.5rem;
}

.victory-title {
  font-size: 1.8rem;
  font-weight: 900;
  color: var(--warning, #fbbf24);
  margin: 0 0 0.5rem 0;
}

.victory-subtitle {
  color: var(--text-muted, #94a3b8);
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
  background: var(--bg-secondary, rgba(0, 0, 0, 0.25));
  border: 1px solid var(--border-color, transparent);
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
  color: var(--text-main);
}

.exp-val {
  color: var(--accent, #38bdf8);
  font-weight: 800;
}

.coin-val {
  color: var(--warning, #fbbf24);
  font-weight: 800;
}

.lvl-up-tag {
  color: #f43f5e;
  font-weight: 800;
  text-align: center;
  width: 100%;
}

.loot-chest-container {
  margin-top: 0.85rem;
  padding-top: 0.85rem;
  border-top: 1px dashed var(--border-color, rgba(255, 255, 255, 0.15));
  text-align: center;
}

.chest-banner-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--warning, #fbbf24);
  margin-bottom: 0.5rem;
}

.chest-box.unopened {
  background: rgba(180, 83, 9, 0.08);
  border: 1px dashed var(--warning, #fbbf24);
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
  background: rgba(180, 83, 9, 0.15);
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
  color: var(--text-muted, #cbd5e1);
}

.chest-opened-result {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid var(--success, #10b981);
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
  color: var(--text-main, #ffffff);
}

.chest-reward-val {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--success, #10b981);
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
  background: var(--bg-secondary, #334155);
  color: var(--text-main, #cbd5e1);
  border: 1px solid var(--border-color, transparent);
}

.defeat-title {
  font-size: 1.8rem;
  font-weight: 900;
  color: #ef4444;
  margin: 0 0 0.5rem 0;
}

.defeat-subtitle {
  color: var(--text-muted, #94a3b8);
  margin: 0 0 1.5rem 0;
}

.defeat-tip-box {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  padding: 0.85rem;
  border-radius: 10px;
  font-size: 0.9rem;
  color: #ef4444;
  margin-bottom: 1.5rem;
  text-align: left;
}
</style>
