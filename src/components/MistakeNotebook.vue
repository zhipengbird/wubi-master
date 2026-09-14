<template>
  <div class="mistakes-wrapper">
    <div class="mistakes-header">
      <div>
        <h2 class="title">生字错题本</h2>
        <p class="desc">自动汇总你在打字特训与长文实战中击错的汉字，支持专项重练与错因分析。</p>
      </div>

      <div class="actions" v-if="store.mistakeList.value.length > 0">
        <button class="action-btn primary" @click="drillMistakes">
          <Zap :size="16" />
          <span>错字专项消灭战</span>
        </button>
        <button class="action-btn danger" @click="clearAll">
          <Trash2 :size="16" />
          <span>清空错题本</span>
        </button>
      </div>
    </div>

    <!-- 错题卡片列表 -->
    <div class="cards-grid" v-if="store.mistakeList.value.length > 0">
      <div v-for="item in store.mistakeList.value" :key="item.char" class="mistake-card">
        <div class="card-left">
          <MiZiGe :text="item.char" size="small" />
          <div class="count-badge">错 {{ item.count }} 次</div>
        </div>

        <div class="card-body">
          <div class="code-line">
            <span class="lbl">正确全码：</span>
            <span class="correct-code">{{ item.correctCode }}</span>
          </div>

          <div class="code-line" v-if="item.errorCodes.length">
            <span class="lbl">曾错击为：</span>
            <div class="wrong-tags">
              <span v-for="(wc, i) in item.errorCodes" :key="i" class="wrong-code">
                {{ wc }}
              </span>
            </div>
          </div>

          <div class="roots-line" v-if="item.roots.length">
            <span class="lbl">字根拆解：</span>
            <div class="roots-mizige-strip">
              <MiZiGe 
                v-for="(r, i) in item.roots" 
                :key="i" 
                :text="r" 
                size="mini" 
              />
            </div>
          </div>
        </div>

        <button class="del-btn" @click="deleteItem(item.char)" title="从错题本移出">
          <Check :size="18" />
        </button>
      </div>
    </div>

    <!-- 空白状态 -->
    <div class="empty-box" v-else>
      <div class="empty-icon">🎉</div>
      <div class="empty-title">太棒了，目前没有错题记录！</div>
      <p class="empty-sub">在打字练习或文章实战中，输入错误的字会自动被记录在这里供你复习巩固。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWubiStore } from '../stores/useWubiStore';
import { Zap, Trash2, Check } from 'lucide-vue-next';
import MiZiGe from './MiZiGe.vue';

const store = useWubiStore();

const deleteItem = (char: string) => {
  store.deleteMistake(char);
};

const clearAll = () => {
  if (confirm('确定要清空所有错题记录吗？')) {
    store.resetAllMistakes();
  }
};

const drillMistakes = () => {
  // 切换至打字模块开始特训
  store.setActiveTab('practice');
};
</script>

<style scoped>
.mistakes-wrapper {
  max-width: 960px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.mistakes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  background: var(--card-bg);
  padding: 1.25rem 1.5rem;
  border-radius: 14px;
  border: 1px solid var(--border-color);
}

.title {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-main);
}

.desc {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-top: 4px;
}

.actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
}

.action-btn.primary {
  background: var(--accent);
  color: #fff;
}

.action-btn.danger {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  color: var(--error);
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.mistake-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
}

.card-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 60px;
}

.char {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--text-main);
  line-height: 1;
}

.count-badge {
  font-size: 0.7rem;
  color: #fff;
  background: var(--error);
  padding: 2px 6px;
  border-radius: 999px;
  margin-top: 6px;
  font-weight: 700;
}

.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.code-line {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
}

.lbl {
  color: var(--text-muted);
}

.correct-code {
  font-family: monospace;
  font-weight: 800;
  color: var(--accent);
  font-size: 1rem;
}

.wrong-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.wrong-code {
  font-family: monospace;
  color: var(--error);
  background: rgba(244, 63, 94, 0.1);
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.roots-line {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  margin-top: 4px;
}

.roots-mizige-strip {
  display: flex;
  align-items: center;
  gap: 6px;
}

.roots-text {
  color: var(--text-main);
  font-weight: 600;
}

.del-btn {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
}

.del-btn:hover {
  background: var(--success);
  color: #fff;
  border-color: var(--success);
}

.empty-box {
  background: var(--card-bg);
  border: 1px dashed var(--border-color);
  border-radius: 16px;
  padding: 4rem 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.empty-icon {
  font-size: 3rem;
}

.empty-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-main);
}

.empty-sub {
  font-size: 0.85rem;
  color: var(--text-muted);
  max-width: 420px;
}

.go-practice-btn {
  margin-top: 1rem;
  background: var(--accent);
  color: #fff;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
</style>
