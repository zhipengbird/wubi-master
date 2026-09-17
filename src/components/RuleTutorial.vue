<template>
  <div class="rules-wrapper">
    <!-- 顶部导学模块导航 -->
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
      <!-- 规则头部总览 -->
      <div class="rule-header">
        <div class="header-left">
          <span class="header-badge">{{ activeRule.badge }}</span>
          <h2 class="header-title">{{ activeRule.title }}</h2>
          <p class="header-summary">{{ activeRule.summary }}</p>
        </div>
      </div>

      <!-- ================= 针对【汉字拆分四项基本原则】的趣味互动模块 ================= -->
      <RuleSplitPrinciples v-if="activeRule.id === 'split-principles'" />

      <!-- ================= 模块 2：字根五区与键位规律 ================= -->
      <div v-else-if="activeRule.id === 'roots-zone'" class="roots-gamified-container">
        <!-- 五区分组切换标签 -->
        <div class="zone-selector-bar">
          <button
            v-for="z in ZONES_DETAILED"
            :key="z.zone"
            class="zone-select-btn"
            :class="{ active: currentSelectedZone === z.zone }"
            :style="{ '--zone-theme': z.color }"
            @click="currentSelectedZone = z.zone"
          >
            <span class="zone-badge">{{ z.name }}</span>
            <span class="zone-stroke">{{ z.stroke }}</span>
          </button>
        </div>

        <!-- 选中的区位全景卡 -->
        <div class="zone-detail-card" v-if="activeZoneInfo" :style="{ '--zone-theme': activeZoneInfo.color }">
          <div class="zone-card-top">
            <div class="zone-hero-badge">
              <span class="hero-icon">🛡️</span>
              <div class="hero-text-box">
                <h3 class="hero-title">{{ activeZoneInfo.name }}（{{ activeZoneInfo.stroke }}）</h3>
                <div class="hero-motto">{{ activeZoneInfo.mnemonicHero }}</div>
              </div>
            </div>
            <div class="zone-keys-pills">
              包含按键：<strong>{{ activeZoneInfo.keys }}</strong>
            </div>
          </div>

          <!-- 该区各键位深度助记卡片 -->
          <div class="zone-keys-grid">
            <div
              v-for="k in activeZoneInfo.keysDetail"
              :key="k.key"
              class="zone-key-card"
            >
              <div class="key-head">
                <div class="key-pill">{{ k.key }}</div>
                <div class="key-meta">
                  <span class="key-name">键名字：<strong>{{ k.keyName }}</strong></span>
                  <span class="key-code">区位码：{{ k.code }}</span>
                </div>
              </div>

              <!-- 口诀与字根 -->
              <div class="key-mnemonic-box">
                <div class="key-mnemonic">🎵 <strong>助记口诀：</strong>{{ k.mnemonic }}</div>
                <div class="key-roots-tags">
                  <span v-for="(r, ri) in k.roots" :key="ri" class="root-chip">{{ r }}</span>
                </div>
              </div>

              <div class="key-tips-text">💡 {{ k.tips }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ================= 模块 3：末笔交叉识别码全解 ================= -->
      <div v-else-if="activeRule.id === 'recognition-code'" class="recog-gamified-container">
        <!-- 核心交互推导板 -->
        <div class="interactive-matrix-section">
          <div class="matrix-header-row">
            <div>
              <h3 class="matrix-title">🎮 末笔交叉识别码互动推导板</h3>
              <p class="matrix-tip">点击选择汉字的【末笔画】和【字型结构】，即时推导五笔识别码键位！</p>
            </div>
            <div class="matrix-formula-pill">
              识别码 = 末笔画所在区(1-5) + 字型结构所在位(1-3)
            </div>
          </div>

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

        <!-- 识别码高难特例与避坑排雷 -->
        <div class="recog-pitfalls-box">
          <div class="pitfalls-title">⚠️ 识别码高阶“深坑”特例排雷（90% 初学者必错）</div>
          <div class="pitfalls-grid">
            <div v-for="(p, pi) in RECOG_PITFALL_LIST" :key="pi" class="pitfall-card">
              <div class="pitfall-top">
                <MiZiGe :text="p.char" size="medium" />
                <div class="pitfall-meta">
                  <div class="pitfall-char">{{ p.char }} ({{ p.pinyin }})</div>
                  <div class="pitfall-type">结构：{{ p.typeDesc }}</div>
                  <div class="pitfall-last">末笔判定：<strong>{{ p.lastStroke }}</strong></div>
                </div>
                <div class="pitfall-code-tag">识别码: {{ p.recogCode }}</div>
              </div>
              <div class="pitfall-analysis">{{ p.analysis }}</div>
              <div class="pitfall-formula">公式：<strong>{{ p.formula }}</strong></div>
              <div class="pitfall-alert">{{ p.alert }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ================= 模块 4：简码打法与极速提速秘诀 ================= -->
      <div v-else-if="activeRule.id === 'short-codes'" class="short-codes-gamified-container">
        <!-- 简码提速大作战三阶梯 -->
        <div class="speed-strategies-grid">
          <div
            v-for="strat in SHORT_CODE_STRATEGIES"
            :key="strat.type"
            class="strategy-card"
          >
            <div class="strat-header">
              <span class="strat-badge">{{ strat.speedMultiplier }}</span>
              <h3 class="strat-title">{{ strat.title }}</h3>
            </div>
            <div class="strat-rule">📜 <strong>规则：</strong>{{ strat.rule }}</div>
            <div class="strat-trick">⚡ <strong>提速窍门：</strong>{{ strat.trick }}</div>

            <div class="strat-examples">
              <div class="strat-ex-title">实战范例与击键对比：</div>
              <div class="strat-ex-list">
                <div v-for="ex in strat.examples" :key="ex.word" class="strat-ex-item">
                  <MiZiGe :text="ex.word" size="small" />
                  <div class="strat-ex-info">
                    <span class="strat-code">{{ ex.code }}</span>
                    <span class="strat-saved">{{ ex.strokeSaved }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 25 个一级简码金刚卡盘 -->
        <div class="level1-deck-box">
          <div class="deck-header">
            <h3 class="deck-title">🏆 25 个一级简码·全键盘飞天顺口溜</h3>
            <p class="deck-sub">牢记此 25 字，敲 1 个字母加空格，提速 75% 的极速飞跃！</p>
          </div>
          <div class="level1-chars-grid">
            <div
              v-for="item in LEVEL_1_CHARS"
              :key="item.char"
              class="l1-card"
            >
              <span class="l1-key">{{ item.short86 }}</span>
              <span class="l1-char">{{ item.char }}</span>
              <span class="l1-code-sub">{{ item.code86 }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ================= 模块 5：词组编码取码规则 ================= -->
      <div v-else-if="activeRule.id === 'phrase-rules'" class="phrase-gamified-container">
        <!-- 四大词组公式卡片 -->
        <div class="phrase-formulas-grid">
          <div
            v-for="pf in PHRASE_FORMULAS"
            :key="pf.type"
            class="phrase-card"
          >
            <div class="phrase-card-head">
              <span class="phrase-type-pill">{{ pf.type }}</span>
              <span class="phrase-formula-text">{{ pf.formula }}</span>
            </div>
            <h3 class="phrase-name">{{ pf.name }}</h3>
            <div class="phrase-motto">💡 {{ pf.motto }}</div>

            <!-- 范例直观拆解 -->
            <div class="phrase-demo-box">
              <div class="demo-phrase">{{ pf.demo.phrase }}</div>
              <div class="demo-split">{{ pf.demo.split }}</div>
              <div class="demo-final">
                最终编码：<strong>{{ pf.demo.finalCode }}</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- 互动词组拆解模拟器 -->
        <div class="phrase-simulator-box">
          <div class="sim-header">
            <h3 class="sim-title">⚡ 词组取码实时拆解模拟器</h3>
            <p class="sim-desc">输入任意 2 到 8 字的中文词汇，观察各字如何各司其职取码拼装成 4 码！</p>
          </div>

          <div class="sim-input-row">
            <input
              type="text"
              v-model="simPhraseInput"
              placeholder="输入词组，如：人工智能、五笔字型..."
              class="sim-input"
            />
            <div class="sim-quick-tags">
              <button
                v-for="p in quickSimPhrases"
                :key="p"
                class="sim-tag-btn"
                :class="{ active: simPhraseInput === p }"
                @click="simPhraseInput = p"
              >
                {{ p }}
              </button>
            </div>
          </div>

          <!-- 模拟器解析结果 -->
          <div class="sim-result-stage" v-if="simPhraseBreakdown">
            <div class="sim-summary-head">
              <span class="sim-rule-tag">{{ simPhraseBreakdown.ruleName }}</span>
              <span class="sim-rule-desc">{{ simPhraseBreakdown.ruleDesc }}</span>
            </div>

            <!-- 词组中每个字的贡献流 -->
            <div class="sim-chars-flow">
              <div
                v-for="step in simPhraseBreakdown.steps"
                :key="step.index"
                class="sim-char-step-card"
              >
                <div class="step-idx-badge">第 {{ step.index }} 字</div>
                <MiZiGe :text="step.char" size="medium" />
                <div class="step-contribution">
                  贡献编码：<strong class="contr-keys">{{ step.keys }}</strong>
                </div>
                <div class="step-rule-desc">{{ step.desc }} (全码: {{ step.charFullCode }})</div>
              </div>
            </div>

            <div class="sim-final-banner">
              整词四位编码：<span class="sim-final-code">{{ simPhraseBreakdown.code }}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  WUBI_RULES,
  RECOGNITION_MATRIX,
  ZONES_DETAILED,
  RECOG_PITFALL_LIST,
  SHORT_CODE_STRATEGIES,
  PHRASE_FORMULAS
} from '../data/rules';
import {
  LEVEL_1_CHARS,
  getPhraseBreakdown
} from '../data/wubiDict';
import MiZiGe from './MiZiGe.vue';
import RuleSplitPrinciples from './rules/RuleSplitPrinciples.vue';

const currentRuleId = ref<string>('split-principles');

const activeRule = computed(() => {
  return WUBI_RULES.find(r => r.id === currentRuleId.value);
});

// ================= 模块 2：字根五区状态 =================
const currentSelectedZone = ref<number>(1);
const activeZoneInfo = computed(() => {
  return ZONES_DETAILED.find(z => z.zone === currentSelectedZone.value) || ZONES_DETAILED[0];
});

// ================= 模块 3：识别码推导板状态 =================
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

// ================= 模块 5：词组取码模拟器状态 =================
const quickSimPhrases = ['中国', '计算机', '一心一意', '中华人民共和国', '五笔输入', '人工智能'];
const simPhraseInput = ref<string>('计算机');

const simPhraseBreakdown = computed(() => {
  if (!simPhraseInput.value || !simPhraseInput.value.trim()) return null;
  return getPhraseBreakdown(simPhraseInput.value.trim(), '86');
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
  color: var(--accent-text, #ffffff);
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


/* ================= 模块 2：字根五区专属样式 ================= */
.roots-gamified-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.zone-selector-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 0.75rem;
}

.zone-select-btn {
  background: var(--bg-primary);
  border: 1.5px solid var(--border-color);
  padding: 0.85rem 1rem;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.zone-select-btn:hover {
  border-color: var(--zone-theme);
  transform: translateY(-2px);
}

.zone-select-btn.active {
  background: var(--card-bg);
  border-color: var(--zone-theme);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.zone-badge {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--zone-theme);
}

.zone-stroke {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.zone-detail-card {
  background: var(--bg-primary);
  border: 1.5px solid var(--border-color);
  border-top: 4px solid var(--zone-theme);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.zone-card-top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px dashed var(--border-color);
  padding-bottom: 1rem;
}

.zone-hero-badge {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.hero-icon {
  font-size: 2.2rem;
  background: var(--card-bg);
  padding: 8px;
  border-radius: 12px;
}

.hero-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-main);
  margin: 0;
}

.hero-motto {
  font-size: 0.88rem;
  color: var(--zone-theme);
  font-weight: 600;
  margin-top: 2px;
}

.zone-keys-pills {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.85rem;
  color: var(--text-main);
}

.zone-keys-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.zone-key-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: all 0.2s;
}

.zone-key-card:hover {
  border-color: var(--zone-theme);
  transform: translateY(-2px);
}

.key-head {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.key-pill {
  font-family: monospace;
  font-size: 1.5rem;
  font-weight: 900;
  color: #fff;
  background: var(--zone-theme);
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.key-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.key-name {
  font-size: 0.95rem;
  color: var(--text-main);
}

.key-code {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.key-mnemonic-box {
  background: var(--bg-primary);
  border-radius: 8px;
  padding: 0.6rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.key-mnemonic {
  font-size: 0.85rem;
  color: var(--text-main);
  line-height: 1.4;
}

.key-roots-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.key-tips-text {
  font-size: 0.8rem;
  color: var(--text-muted);
  line-height: 1.4;
}

/* ================= 模块 3：识别码专属样式 ================= */
.recog-gamified-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.matrix-header-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px dashed var(--border-color);
  padding-bottom: 0.75rem;
  margin-bottom: 0.5rem;
}

.matrix-formula-pill {
  background: var(--accent-subtle);
  color: var(--accent);
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 700;
}

.recog-pitfalls-box {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.pitfalls-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: #ef4444;
}

.pitfalls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 1.25rem;
}

.pitfall-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-left: 4px solid #ef4444;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.pitfall-top {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  justify-content: space-between;
}

.pitfall-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.pitfall-char {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text-main);
}

.pitfall-type, .pitfall-last {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.pitfall-code-tag {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  font-weight: 800;
  font-family: monospace;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.85rem;
}

.pitfall-analysis {
  font-size: 0.85rem;
  color: var(--text-main);
  line-height: 1.5;
}

.pitfall-formula {
  font-size: 0.82rem;
  color: var(--accent);
  background: var(--bg-primary);
  padding: 4px 8px;
  border-radius: 6px;
}

.pitfall-alert {
  font-size: 0.8rem;
  color: #f59e0b;
  font-weight: 600;
}

/* ================= 模块 4：简码专属样式 ================= */
.short-codes-gamified-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.speed-strategies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.25rem;
}

.strategy-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  transition: all 0.2s;
}

.strategy-card:hover {
  transform: translateY(-2px);
  border-color: var(--accent);
}

.strat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.strat-badge {
  background: rgba(34, 197, 94, 0.15);
  color: #16a34a;
  font-weight: 800;
  font-size: 0.75rem;
  padding: 3px 8px;
  border-radius: 6px;
}

.strat-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text-main);
  margin: 0;
}

.strat-rule, .strat-trick {
  font-size: 0.85rem;
  line-height: 1.4;
  color: var(--text-main);
}

.strat-trick {
  color: var(--accent);
}

.strat-examples {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border-top: 1px dashed var(--border-color);
  padding-top: 0.75rem;
}

.strat-ex-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
}

.strat-ex-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.strat-ex-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--card-bg);
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.strat-ex-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.strat-code {
  font-family: monospace;
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--accent);
}

.strat-saved {
  font-size: 0.75rem;
  color: #16a34a;
}

.level1-deck-box {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.deck-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--text-main);
  margin: 0;
}

.deck-sub {
  font-size: 0.88rem;
  color: var(--text-muted);
  margin-top: 4px;
}

.level1-chars-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 0.6rem;
}

.l1-card {
  background: var(--card-bg);
  border: 1.5px solid var(--border-color);
  border-radius: 10px;
  padding: 0.6rem 0.4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  transition: all 0.2s;
}

.l1-card:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
  background: var(--accent-subtle);
}

.l1-key {
  font-family: monospace;
  font-weight: 900;
  font-size: 1.1rem;
  color: var(--accent);
}

.l1-char {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--text-main);
}

.l1-code-sub {
  font-size: 0.65rem;
  color: var(--text-muted);
  font-family: monospace;
}

/* ================= 模块 5：词组规则专属样式 ================= */
.phrase-gamified-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.phrase-formulas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}

.phrase-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: all 0.2s;
}

.phrase-card:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
}

.phrase-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.phrase-type-pill {
  background: var(--accent-subtle);
  color: var(--accent);
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
}

.phrase-formula-text {
  font-family: monospace;
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--success, #10b981);
}

.phrase-name {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text-main);
  margin: 0;
}

.phrase-motto {
  font-size: 0.82rem;
  color: var(--text-muted);
  line-height: 1.4;
}

.phrase-demo-box {
  background: var(--card-bg);
  border-radius: 8px;
  padding: 0.6rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.demo-phrase {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-main);
}

.demo-split {
  font-size: 0.78rem;
  color: var(--text-muted);
}

.demo-final {
  font-size: 0.85rem;
  color: var(--text-main);
}

.demo-final strong {
  font-family: monospace;
  color: var(--accent);
}

.phrase-simulator-box {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.sim-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--text-main);
  margin: 0;
}

.sim-desc {
  font-size: 0.88rem;
  color: var(--text-muted);
  margin-top: 4px;
}

.sim-input-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

.sim-input {
  flex: 1;
  min-width: 220px;
  height: 44px;
  padding: 0 1rem;
  background: var(--card-bg);
  border: 1.5px solid var(--border-color);
  border-radius: 10px;
  color: var(--text-main);
  font-size: 1.05rem;
  outline: none;
}

.sim-input:focus {
  border-color: var(--accent);
}

.sim-quick-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.sim-tag-btn {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.88rem;
  color: var(--text-main);
  cursor: pointer;
  transition: all 0.2s;
}

.sim-tag-btn:hover {
  border-color: var(--accent);
}

.sim-tag-btn.active {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}

.sim-result-stage {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.sim-summary-head {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.sim-rule-tag {
  background: var(--accent-subtle);
  color: var(--accent);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 700;
}

.sim-rule-desc {
  font-size: 0.88rem;
  color: var(--text-muted);
}

.sim-chars-flow {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.sim-char-step-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  flex: 1;
  min-width: 140px;
}

.step-idx-badge {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 600;
}

.step-contribution {
  font-size: 0.85rem;
  color: var(--text-main);
}

.contr-keys {
  font-family: monospace;
  font-size: 1.1rem;
  color: var(--accent);
}

.step-rule-desc {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-align: center;
}

.sim-final-banner {
  background: var(--bg-primary);
  border: 1.5px solid var(--accent);
  border-radius: 10px;
  padding: 0.85rem 1.25rem;
  font-size: 1rem;
  color: var(--text-main);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.sim-final-code {
  font-family: monospace;
  font-size: 1.6rem;
  font-weight: 900;
  color: var(--accent);
  letter-spacing: 2px;
}
</style>

