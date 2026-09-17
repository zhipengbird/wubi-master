<template>
  <div class="modal-backdrop" v-if="show" @click.self="$emit('close')">
    <div class="modal-dialog library-modal-dialog">
      <div class="library-header">
        <div class="lib-title-wrap">
          <h3 class="modal-heading">📚 五笔长文实战题库大全</h3>
          <span class="lib-counter">共 {{ articleList.length }} 篇</span>
        </div>
        <button class="lib-close-btn" @click="$emit('close')">
          <X :size="20" />
        </button>
      </div>

      <!-- 题材分类过滤器 -->
      <div class="library-filter-tabs">
        <button
          class="lib-tab-btn"
          :class="{ active: selectedCategoryTab === 'all' }"
          @click="selectedCategoryTab = 'all'"
        >
          全部题材 ({{ articleList.length }})
        </button>
        <button
          v-for="cat in availableCategories"
          :key="cat"
          class="lib-tab-btn"
          :class="{ active: selectedCategoryTab === cat }"
          @click="selectedCategoryTab = cat"
        >
          {{ cat }} ({{ articleList.filter(a => a.categoryName === cat).length }})
        </button>
      </div>

      <!-- 文章卡片网格 -->
      <div class="library-cards-scroll">
        <div
          v-for="art in filteredArticleList"
          :key="art.id"
          class="lib-card-item"
          :class="{ active: art.id === currentArticleId }"
          @click="$emit('select', art)"
        >
          <div class="lib-card-top">
            <span class="lib-card-badge">{{ art.categoryName }}</span>
            <span class="lib-card-length">{{ art.charCount }} 字</span>
          </div>
          <h4 class="lib-card-title">{{ art.title }}</h4>
          <div class="lib-card-author">作者：{{ art.author }}</div>
          <p class="lib-card-desc">{{ art.description }}</p>
          <div class="lib-card-footer">
            <span class="lib-enter-hint" v-if="art.id === currentArticleId">练习中...</span>
            <span class="lib-enter-btn" v-else>立即练习 ➔</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { X } from 'lucide-vue-next';
import type { ArticleTopic } from '../../types/wubi';

const props = defineProps<{
  show: boolean;
  articleList: ArticleTopic[];
  currentArticleId: string;
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'select', article: ArticleTopic): void;
}>();

const selectedCategoryTab = ref<string>('all');

const availableCategories = computed(() => {
  const set = new Set<string>();
  props.articleList.forEach((a) => {
    if (a.categoryName) set.add(a.categoryName);
  });
  return Array.from(set);
});

const filteredArticleList = computed(() => {
  if (selectedCategoryTab.value === 'all') {
    return props.articleList;
  }
  return props.articleList.filter((a) => a.categoryName === selectedCategoryTab.value);
});
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

.library-modal-dialog {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 2rem;
  max-width: 820px;
  width: 95%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
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

.library-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.75rem;
}

.lib-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.modal-heading {
  font-size: 1.3rem;
  color: var(--text-main);
  margin: 0;
}

.lib-counter {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--accent);
  background: rgba(99, 102, 241, 0.12);
  padding: 2px 8px;
  border-radius: 12px;
}

.lib-close-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lib-close-btn:hover {
  color: var(--text-main);
  background: var(--bg-primary);
}

.library-filter-tabs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.lib-tab-btn {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.lib-tab-btn:hover {
  color: var(--text-main);
  border-color: var(--accent);
}

.lib-tab-btn.active {
  background: var(--accent);
  color: var(--accent-text, #ffffff);
  border-color: var(--accent);
}

.library-cards-scroll {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
  overflow-y: auto;
  max-height: 55vh;
  padding: 4px 4px 12px 2px;
}

.lib-card-item {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.lib-card-item:hover {
  transform: translateY(-2px);
  border-color: var(--accent);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.lib-card-item.active {
  border-color: var(--accent);
  background: rgba(99, 102, 241, 0.06);
}

.lib-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.lib-card-badge {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--accent);
  background: rgba(99, 102, 241, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
}

.lib-card-length {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-family: monospace;
}

.lib-card-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
}

.lib-card-author {
  font-size: 0.76rem;
  color: var(--text-muted);
}

.lib-card-desc {
  font-size: 0.8rem;
  color: var(--text-muted);
  line-height: 1.4;
  margin: 0;
  flex: 1;
}

.lib-card-footer {
  margin-top: 0.5rem;
  display: flex;
  justify-content: flex-end;
}

.lib-enter-hint {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--accent);
}

.lib-enter-btn {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--accent);
}
</style>
