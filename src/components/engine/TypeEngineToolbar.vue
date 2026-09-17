<template>
  <div class="engine-toolbar">
    <!-- 第一层：关卡练习分类与词组子分类 -->
    <div class="toolbar-row category-row">
      <div class="category-selector">
        <button
          v-for="cat in categoryList"
          :key="cat.id"
          class="cat-btn"
          :class="{ active: currentCategory === cat.id }"
          @click="$emit('selectCategory', cat.id)"
        >
          {{ cat.name }}
        </button>
      </div>

      <!-- 词组特训子分类筛选 (仅在 phrase 分类下展示) -->
      <div class="category-selector phrase-sub-selector" v-if="currentCategory === 'phrase'">
        <button
          v-for="sub in phraseSubOptions"
          :key="sub.id"
          class="cat-btn"
          :class="{ active: phraseFilter === sub.id }"
          @click="$emit('setPhraseFilter', sub.id)"
        >
          {{ sub.name }}
        </button>
      </div>
    </div>

    <!-- 第二层：练习偏好、出字方式、组量与辅助开关 -->
    <div class="toolbar-row controls-row">
      <div class="controls-left">
        <!-- 打字判定模式 -->
        <div class="mode-selector">
          <button
            v-for="m in modeList"
            :key="m.id"
            class="mode-btn"
            :class="{ active: inputMode === m.id }"
            @click="$emit('changeInputMode', m.id)"
          >
            <component :is="m.icon" :size="15" />
            <span>{{ m.name }}</span>
          </button>
        </div>

        <!-- 出字方式：打对即走(无需空格) vs 空格出字 -->
        <div class="commit-selector">
          <button
            class="mode-btn"
            :class="{ active: commitMode === 'auto' }"
            @click="$emit('setCommitMode', 'auto')"
            title="无需按空格，编码打对即自动进入下一个字"
          >
            <span>⚡ 自动出字</span>
          </button>
          <button
            class="mode-btn"
            :class="{ active: commitMode === 'space' }"
            @click="$emit('setCommitMode', 'space')"
            title="敲空格键出字"
          >
            <span>␣ 空格出字</span>
          </button>
        </div>
      </div>

      <div class="controls-right">
        <!-- 每组字数选择：防疲劳分批练习 -->
        <div class="batch-selector" title="设置每组练习字数，分批冲关更轻松">
          <span class="batch-lbl">组量:</span>
          <button
            v-for="b in batchSizeOptions"
            :key="b.value"
            class="batch-btn"
            :class="{ active: currentBatchSize === b.value }"
            @click="$emit('setBatchSize', b.value)"
          >
            {{ b.label }}
          </button>
        </div>

        <div class="toolbar-divider"></div>

        <!-- 辅助提示开关与米字格开关 -->
        <div class="hints-toggle">
          <label class="toggle-label" title="开启/关闭书法米字格字帖模式">
            <input
              type="checkbox"
              :checked="useMiZiGe"
              @change="$emit('update:useMiZiGe', ($event.target as HTMLInputElement).checked)"
            />
            <span>米字格</span>
          </label>
          <label class="toggle-label" title="开启/关闭拆字字根与编码提示">
            <input
              type="checkbox"
              :checked="showHints"
              @change="$emit('update:showHints', ($event.target as HTMLInputElement).checked)"
            />
            <span>拆解提示</span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue';
import type { InputMode } from '../../types/wubi';

export interface CategoryOption {
  id: string;
  name: string;
}

export interface PhraseSubOption {
  id: string;
  name: string;
}

export interface ModeOption {
  id: InputMode;
  name: string;
  icon: Component;
}

export interface BatchOption {
  label: string;
  value: number;
}

defineProps<{
  categoryList: CategoryOption[];
  currentCategory: string;
  phraseSubOptions: PhraseSubOption[];
  phraseFilter: string;
  modeList: ModeOption[];
  inputMode: InputMode;
  commitMode: 'auto' | 'space';
  batchSizeOptions: BatchOption[];
  currentBatchSize: number;
  useMiZiGe: boolean;
  showHints: boolean;
}>();

defineEmits<{
  (e: 'selectCategory', id: string): void;
  (e: 'setPhraseFilter', id: string): void;
  (e: 'changeInputMode', mode: InputMode): void;
  (e: 'setCommitMode', mode: 'auto' | 'space'): void;
  (e: 'setBatchSize', size: number): void;
  (e: 'update:useMiZiGe', val: boolean): void;
  (e: 'update:showHints', val: boolean): void;
}>();
</script>

<style scoped>
.engine-toolbar {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: var(--card-bg);
  padding: 0.85rem 1.25rem;
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.toolbar-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.category-row {
  justify-content: flex-start;
  gap: 0.6rem;
  overflow-x: auto;
  padding-bottom: 2px;
}

.controls-row {
  padding-top: 0.65rem;
  border-top: 1px solid var(--border-color);
}

.controls-left, .controls-right {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex-wrap: wrap;
}

.toolbar-divider {
  width: 1px;
  height: 20px;
  background: var(--border-color);
  margin: 0 2px;
}

.mode-selector, .commit-selector, .category-selector, .batch-selector {
  display: flex;
  align-items: center;
  gap: 4px;
  background: var(--bg-primary);
  padding: 3px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  white-space: nowrap;
}

.batch-lbl {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 500;
  padding: 0 4px;
  user-select: none;
}

.mode-btn, .cat-btn, .batch-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.batch-btn {
  padding: 4px 8px;
  font-size: 0.75rem;
}

.mode-btn.active, .cat-btn.active, .batch-btn.active {
  background: var(--accent);
  color: var(--accent-text, #ffffff);
  font-weight: 600;
}

.phrase-sub-selector {
  border-left: 2px solid var(--accent);
  margin-left: 2px;
}

.hints-toggle {
  display: flex;
  align-items: center;
  gap: 12px;
  white-space: nowrap;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: var(--text-muted);
  cursor: pointer;
}
</style>
