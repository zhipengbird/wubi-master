<template>
  <div class="rpg-modal-backdrop" v-if="show" @click.self="$emit('close')">
    <div class="rpg-modal-card shop-modal">
      <div class="modal-header">
        <h3 class="modal-title">🎒 藏宝阁 · 法宝密市</h3>
        <button class="modal-close-btn" @click="$emit('close')">✕</button>
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
        <button class="btn-confirm" @click="$emit('close')">离开藏宝阁</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWubiStore } from '../../stores/useWubiStore';
import { useRpgStore } from '../../stores/useRpgStore';
import { soundPlayer } from '../../utils/audio';

defineProps<{
  show: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
}>();

const store = useWubiStore();
const rpgStore = useRpgStore();
const profile = rpgStore.profile;
const items = rpgStore.items;

const onBuyItem = (itemId: string) => {
  if (rpgStore.buyItem(itemId)) {
    soundPlayer.playKey(store.audio.value, true, false);
  }
};
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

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-title {
  font-size: 1.3rem;
  margin: 0;
  color: var(--text-main);
}

.modal-close-btn {
  background: transparent;
  border: none;
  color: var(--text-muted, #94a3b8);
  font-size: 1.2rem;
  cursor: pointer;
}

.shop-coin-balance {
  background: rgba(180, 83, 9, 0.1);
  border: 1px solid rgba(180, 83, 9, 0.25);
  padding: 0.75rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
  color: var(--text-main);
}

.coins-highlight {
  font-weight: 800;
  color: var(--warning, #fbbf24);
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
  background: var(--bg-secondary, rgba(0, 0, 0, 0.2));
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
  color: var(--text-main);
}

.owned-tag {
  font-size: 0.75rem;
  color: var(--text-muted, #94a3b8);
  font-weight: normal;
}

.item-desc {
  margin: 0;
  font-size: 0.8rem;
  color: var(--text-muted, #94a3b8);
}

.item-buy-col {
  margin-left: 1rem;
}

.buy-btn {
  padding: 0.5rem 0.85rem;
  border-radius: 8px;
  background: var(--warning, #f59e0b);
  color: #ffffff;
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
  border-radius: 12px;
  background: var(--bg-secondary, #334155);
  color: var(--text-main, #ffffff);
  border: 1px solid var(--border-color, transparent);
  font-weight: 700;
  cursor: pointer;
}
</style>
