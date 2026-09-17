<template>
  <div class="modal-backdrop" v-if="show">
    <div class="modal-card">
      <h2 class="modal-title">🎉 {{ currentBatchLabel ? `${currentBatchLabel} 完成！` : '本轮练习完成！' }}</h2>
      <div class="modal-stats-grid">
        <div class="m-stat">
          <div class="val">{{ stats.wpm }}</div>
          <div class="lbl">打字速度 (WPM)</div>
        </div>
        <div class="m-stat">
          <div class="val">{{ stats.kpm }}</div>
          <div class="lbl">击键速度 (KPM)</div>
        </div>
        <div class="m-stat">
          <div class="val">{{ stats.accuracy }}%</div>
          <div class="lbl">正确率</div>
        </div>
        <div class="m-stat">
          <div class="val">{{ stats.elapsedSeconds }}秒</div>
          <div class="lbl">总耗时</div>
        </div>
      </div>
      <div class="modal-actions">
        <button class="primary-btn" @click="$emit('nextBatch')">
          {{ (currentBatchSize && currentBatchIndex + 1 < totalBatches) ? `下一组 (${currentBatchSize}字)` : '再练一轮' }}
        </button>
        <button class="secondary-btn" @click="$emit('retryBatch')" v-if="currentBatchSize && totalBatches > 1">重练本组</button>
        <button class="secondary-btn" @click="$emit('nextCategory')">下一关卡</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TypingStats } from '../../types/wubi';

defineProps<{
  show: boolean;
  currentBatchLabel: string;
  stats: TypingStats;
  currentBatchSize: number;
  currentBatchIndex: number;
  totalBatches: number;
}>();

defineEmits<{
  (e: 'nextBatch'): void;
  (e: 'retryBatch'): void;
  (e: 'nextCategory'): void;
}>();
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 2rem;
  max-width: 480px;
  width: 90%;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.modal-title {
  font-size: 1.5rem;
  color: var(--text-main);
  margin: 0;
}

.modal-stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.m-stat {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  padding: 1rem;
  border-radius: 10px;
}

.m-stat .val {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--accent);
  font-family: monospace;
}

.m-stat .lbl {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.primary-btn {
  background: var(--accent);
  color: #fff;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.primary-btn:hover {
  opacity: 0.9;
}

.secondary-btn {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.2s;
}

.secondary-btn:hover {
  border-color: var(--accent);
}
</style>
