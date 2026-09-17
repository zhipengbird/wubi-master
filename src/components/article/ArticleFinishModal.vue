<template>
  <div class="modal-backdrop" v-if="show">
    <div class="modal-dialog finish-card">
      <h3 class="modal-heading">🏆 恭喜完成全篇文章！</h3>
      <p class="modal-sub">《{{ articleTitle }}》篇章打字战报</p>
      <div class="finish-stats-grid">
        <div class="stat-box">
          <div class="num">{{ stats.wpm }}</div>
          <div class="name">每分钟字数 (WPM)</div>
        </div>
        <div class="stat-box">
          <div class="num">{{ stats.kpm }}</div>
          <div class="name">击键速率 (KPM)</div>
        </div>
        <div class="stat-box">
          <div class="num">{{ stats.accuracy }}%</div>
          <div class="name">最终正确率</div>
        </div>
        <div class="stat-box">
          <div class="num">{{ formattedTime }}</div>
          <div class="name">耗时</div>
        </div>
      </div>
      <div class="modal-btns">
        <button class="btn-submit" @click="$emit('restart')">重新练这篇</button>
        <button class="btn-cancel" @click="$emit('next')">换下一篇</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TypingStats } from '../../types/wubi';

defineProps<{
  show: boolean;
  articleTitle: string;
  stats: TypingStats;
  formattedTime: string;
}>();

defineEmits<{
  (e: 'restart'): void;
  (e: 'next'): void;
}>();
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.72);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1.5rem;
  box-sizing: border-box;
}

.modal-dialog {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 2rem;
  max-width: 520px;
  width: 90%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.45);
  animation: modalScaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalScaleUp {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-heading {
  font-size: 1.3rem;
  color: var(--text-main);
  margin: 0;
}

.modal-sub {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin: 0;
}

.finish-stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin: 1rem 0;
}

.stat-box {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  padding: 1rem;
  border-radius: 10px;
  text-align: center;
}

.stat-box .num {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--accent);
  font-family: monospace;
}

.stat-box .name {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.modal-btns {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 0.5rem;
}

.btn-cancel {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel:hover {
  color: var(--text-main);
  border-color: var(--accent);
}

.btn-submit {
  background: var(--accent);
  color: #fff;
  border: none;
  padding: 8px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}

.btn-submit:hover {
  opacity: 0.9;
}
</style>
