<template>
  <div v-if="gameState === 'finished' || gameState === 'failed'" class="chase-modal-wrapper">
    <!-- 胜利结算状态 -->
    <div class="overlay-card victory" v-if="gameState === 'finished'">
      <div class="modal-icon">🏆</div>
      <h3 class="modal-title win">大获全胜！成功甩开对手！</h3>
      <p class="modal-desc">
        你以 <strong>{{ playerWpm }} WPM</strong> 的极速率先冲过终点！领先暗影猎手 <strong>{{ (targetCount - aiCharProgress).toFixed(1) }}</strong> 个字身！
      </p>
      <div class="result-stats-grid">
        <div class="res-stat-item">
          <span class="r-label">平均手速</span>
          <span class="r-val">{{ playerWpm }} WPM</span>
        </div>
        <div class="res-stat-item">
          <span class="r-label">准确率</span>
          <span class="r-val">{{ accuracy }}%</span>
        </div>
        <div class="res-stat-item">
          <span class="r-label">最高连击</span>
          <span class="r-val">{{ maxCombo }} 🔥</span>
        </div>
        <div class="res-stat-item">
          <span class="r-label">总计用时</span>
          <span class="r-val">{{ formattedTime }}</span>
        </div>
      </div>
      <div class="modal-actions">
        <button class="start-btn" @click="$emit('restart')">🔄 再来一局</button>
        <button class="start-btn secondary" @click="$emit('increaseDifficulty')">🔥 挑战更高航速</button>
      </div>
    </div>

    <!-- 失败被追上结算状态 -->
    <div class="overlay-card defeat" v-else-if="gameState === 'failed'">
      <div class="modal-icon">💥</div>
      <h3 class="modal-title lose">被暗影猎手超越拦截！</h3>
      <p class="modal-desc">
        暗影猎手率先撞线！你在第 <strong>{{ playerIndex }}</strong> / {{ targetCount }} 字遗憾告负。<br />
        别灰心，稳住心态，记住简码少击键，再次挑战吧！
      </p>
      <div class="result-stats-grid">
        <div class="res-stat-item">
          <span class="r-label">最终完成度</span>
          <span class="r-val">{{ Math.round((playerIndex / targetCount) * 100) }}%</span>
        </div>
        <div class="res-stat-item">
          <span class="r-label">当前速度</span>
          <span class="r-val">{{ playerWpm }} WPM</span>
        </div>
        <div class="res-stat-item">
          <span class="r-label">对手速度</span>
          <span class="r-val">{{ aiWpm }} WPM</span>
        </div>
      </div>
      <div class="modal-actions">
        <button class="start-btn" @click="$emit('restart')">🔄 重整旗鼓，再次挑战</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  gameState: 'idle' | 'running' | 'finished' | 'failed';
  playerWpm: number;
  accuracy: number;
  maxCombo: number;
  formattedTime: string;
  targetCount: number;
  aiCharProgress: number;
  playerIndex: number;
  aiWpm: number;
}>();

defineEmits<{
  (e: 'restart'): void;
  (e: 'increaseDifficulty'): void;
}>();
</script>

<style scoped>
.chase-modal-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.overlay-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 2.5rem;
  max-width: 540px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.25rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes popIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

.modal-icon {
  font-size: 3.5rem;
}

.modal-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--text-main);
  margin: 0;
}

.modal-title.win {
  color: #22c55e;
}

.modal-title.lose {
  color: #ef4444;
}

.modal-desc {
  font-size: 0.95rem;
  color: var(--text-muted);
  line-height: 1.6;
  margin: 0;
}

.result-stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  width: 100%;
  background: var(--bg-primary);
  padding: 1.25rem;
  border-radius: 14px;
  border: 1px solid var(--border-color);
}

.res-stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.r-label {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.r-val {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--text-main);
  font-family: monospace;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  width: 100%;
  justify-content: center;
}

.start-btn {
  background: var(--accent);
  color: var(--bg-primary);
  border: none;
  padding: 0.85rem 2.2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 16px var(--accent-subtle);
}

.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--accent-subtle);
}

.start-btn.secondary {
  background: var(--bg-primary);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  box-shadow: none;
}
</style>
