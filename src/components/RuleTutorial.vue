<template>
  <div class="rules-wrapper">
    <!-- 顶部导学标签 -->
    <div class="rules-tabs">
      <button
        v-for="rule in WUBI_RULES"
        :key="rule.id"
        class="rule-tab-btn"
        :class="{ active: currentRuleId === rule.id }"
        @click="currentRuleId = rule.id"
      >
        <span class="tab-badge">{{ rule.badge }}</span>
        <span class="tab-title">{{ rule.title }}</span>
      </button>
    </div>

    <!-- 规则主体内容展示 -->
    <div class="rule-body" v-if="activeRule">
      <div class="rule-header">
        <span class="header-badge">{{ activeRule.badge }}</span>
        <h2 class="header-title">{{ activeRule.title }}</h2>
        <p class="header-summary">{{ activeRule.summary }}</p>
      </div>

      <div class="rule-content-list">
        <div v-for="(item, idx) in activeRule.content" :key="idx" class="content-item">
          {{ item }}
        </div>
      </div>

      <!-- 范例拆解卡片 -->
      <div class="examples-grid" v-if="activeRule.examples && activeRule.examples.length">
        <div v-for="(ex, i) in activeRule.examples" :key="i" class="example-card">
          <div class="ex-char">{{ ex.word }}</div>
          <div class="ex-code">{{ ex.code }}</div>
          <div class="ex-desc">{{ ex.analysis }}</div>
        </div>
      </div>

      <!-- 专属互动工具：末笔交叉识别码 5x3 交互推导板 -->
      <div class="interactive-matrix-section" v-if="activeRule.id === 'recognition-code'">
        <h3 class="matrix-title">🎮 末笔交叉识别码互动推导板</h3>
        <p class="matrix-tip">点击选择汉字的【末笔画】和【字型结构】，右侧将立即推导出对应的五笔识别码键位！</p>

        <div class="matrix-builder">
          <!-- 步骤一：选择末笔画 -->
          <div class="step-box">
            <span class="step-label">第一步：选择汉字最后一笔</span>
            <div class="step-btns">
              <button
                v-for="s in strokes"
                :key="s.id"
                class="step-btn"
                :class="{ active: selectedStroke === s.id }"
                @click="selectedStroke = s.id"
              >
                {{ s.name }} ({{ s.id }}区)
              </button>
            </div>
          </div>

          <!-- 步骤二：选择字型结构 -->
          <div class="step-box">
            <span class="step-label">第二步：选择汉字字型结构</span>
            <div class="step-btns">
              <button
                v-for="t in structures"
                :key="t.id"
                class="step-btn"
                :class="{ active: selectedStructure === t.id }"
                @click="selectedStructure = t.id"
              >
                {{ t.name }} ({{ t.id }}位)
              </button>
            </div>
          </div>

          <!-- 推导结论卡片 -->
          <div class="result-box">
            <div class="res-title">识别码推导结果</div>
            <div class="res-key">{{ derivedCode.key }}</div>
            <div class="res-detail">
              区位码：<strong>{{ derivedCode.code }}</strong> | 对应键位：<strong>{{ derivedCode.key }} 键</strong>
            </div>
          </div>
        </div>

        <!-- 5x3 完整速查矩阵表 -->
        <div class="table-container">
          <table class="matrix-table">
            <thead>
              <tr>
                <th>末笔笔画</th>
                <th>1型（左右型）</th>
                <th>2型（上下型）</th>
                <th>3型（杂合型）</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in RECOGNITION_MATRIX" :key="row.strokeIndex">
                <td class="row-head">{{ row.strokeName }}</td>
                <td
                  v-for="col in row.types"
                  :key="col.type"
                  :class="{ highlight: selectedStroke === row.strokeIndex && selectedStructure === col.type }"
                >
                  <span class="key-tag">{{ col.key }}</span>
                  <span class="code-tag">{{ col.code }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { WUBI_RULES, RECOGNITION_MATRIX } from '../data/rules';

const currentRuleId = ref<string>('roots-zone');

const activeRule = computed(() => {
  return WUBI_RULES.find(r => r.id === currentRuleId.value);
});

// 交互推导板状态
const selectedStroke = ref<number>(1); // 1-5
const selectedStructure = ref<number>(1); // 1-3

const strokes = [
  { id: 1, name: '一 (横/提)' },
  { id: 2, name: '丨 (竖/竖钩)' },
  { id: 3, name: '丿 (撇)' },
  { id: 4, name: '丶 (捺/点)' },
  { id: 5, name: '𠃍 (折)' },
];

const structures = [
  { id: 1, name: '左右结构' },
  { id: 2, name: '上下结构' },
  { id: 3, name: '杂合/包围/独体' },
];

const derivedCode = computed(() => {
  const row = RECOGNITION_MATRIX.find(r => r.strokeIndex === selectedStroke.value);
  if (!row) return { key: 'G', code: '11' };
  const col = row.types.find(t => t.type === selectedStructure.value);
  return col || { key: 'G', code: '11' };
});
</script>

<style scoped>
.rules-wrapper {
  max-width: 1080px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.rules-tabs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 0.75rem;
}

.rule-tab-btn {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  padding: 0.75rem 1rem;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.rule-tab-btn:hover {
  border-color: var(--accent);
}

.rule-tab-btn.active {
  background: var(--accent-subtle);
  border-color: var(--accent);
}

.tab-badge {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--accent);
}

.tab-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-main);
}

.rule-body {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.rule-header {
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 1rem;
}

.header-badge {
  color: var(--accent);
  font-size: 0.8rem;
  font-weight: 700;
}

.header-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--text-main);
  margin-top: 4px;
}

.header-summary {
  color: var(--text-muted);
  font-size: 0.95rem;
  margin-top: 6px;
}

.rule-content-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.content-item {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--text-main);
  background: var(--bg-primary);
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  border-left: 4px solid var(--accent);
}

.examples-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}

.example-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
}

.ex-char {
  font-size: 2.2rem;
  font-weight: 800;
  color: var(--text-main);
}

.ex-code {
  font-family: monospace;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--accent);
  background: var(--accent-subtle);
  padding: 2px 8px;
  border-radius: 6px;
}

.ex-desc {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.interactive-matrix-section {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.matrix-title {
  font-size: 1.2rem;
  color: var(--text-main);
}

.matrix-tip {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.matrix-builder {
  display: grid;
  grid-template-columns: 1fr 1fr 1.2fr;
  gap: 1rem;
  align-items: center;
}

.step-box {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.step-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-main);
}

.step-btns {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.step-btn {
  padding: 6px 12px;
  border-radius: 6px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  font-size: 0.85rem;
  cursor: pointer;
  text-align: left;
}

.step-btn.active {
  background: var(--accent);
  color: #fff;
  font-weight: 600;
  border-color: var(--accent);
}

.result-box {
  background: var(--card-bg);
  border: 2px solid var(--accent);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
}

.res-title {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.res-key {
  font-size: 3.5rem;
  font-weight: 800;
  color: var(--accent);
  line-height: 1;
}

.res-detail {
  font-size: 0.85rem;
  color: var(--text-main);
}

.matrix-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.matrix-table th, .matrix-table td {
  border: 1px solid var(--border-color);
  padding: 10px;
  text-align: center;
}

.matrix-table th {
  background: var(--bg-secondary);
  color: var(--text-main);
  font-size: 0.85rem;
}

.row-head {
  font-weight: 600;
  color: var(--text-main);
}

.matrix-table td.highlight {
  background: var(--accent-subtle);
  border-color: var(--accent);
}

.key-tag {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--accent);
  margin-right: 4px;
}

.code-tag {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-family: monospace;
}

@media (max-width: 768px) {
  .matrix-builder {
    grid-template-columns: 1fr;
  }
}
</style>
