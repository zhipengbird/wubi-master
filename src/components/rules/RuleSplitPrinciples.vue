<template>
  <div class="principles-gamified-container">
    <!-- 趣味子导航栏 -->
    <div class="sub-nav-tabs">
      <button
        class="sub-tab-btn"
        :class="{ active: activeSplitTab === 'visual-guide' }"
        @click="activeSplitTab = 'visual-guide'"
      >
        🎨 四大原则图解
      </button>
      <button
        class="sub-tab-btn"
        :class="{ active: activeSplitTab === 'pk-arena' }"
        @click="activeSplitTab = 'pk-arena'"
      >
        ⚔️ 避坑大PK (正拆 vs 误拆)
      </button>
      <button
        class="sub-tab-btn"
        :class="{ active: activeSplitTab === 'quiz-game' }"
        @click="activeSplitTab = 'quiz-game'"
      >
        🎮 拆字闯关挑战
      </button>
      <button
        class="sub-tab-btn"
        :class="{ active: activeSplitTab === 'lab-dissect' }"
        @click="activeSplitTab = 'lab-dissect'"
      >
        🔬 拆字实验室
      </button>
    </div>

    <!-- 1. 四大法则图解与拟人化口诀 -->
    <div v-if="activeSplitTab === 'visual-guide'" class="split-tab-content">
      <div class="principles-grid">
        <div
          v-for="p in SPLIT_PRINCIPLES_DETAILED"
          :key="p.id"
          class="principle-card"
        >
          <div class="p-card-header">
            <span class="p-icon">{{ p.icon }}</span>
            <div>
              <h3 class="p-title">{{ p.title }}</h3>
              <div class="p-subtitle">{{ p.subtitle }}</div>
            </div>
          </div>

          <!-- 趣味口诀与比喻 -->
          <div class="p-formula-box">
            <div class="p-formula">🗣️ <strong>口诀：</strong>{{ p.formula }}</div>
            <div class="p-analogy">💡 <strong>妙趣比喻：</strong>{{ p.analogy }}</div>
          </div>

          <div class="p-priority">
            <span class="priority-tag">法则地位</span>
            <span class="priority-text">{{ p.priority }}</span>
          </div>

          <!-- 典型字示例剖析 -->
          <div class="p-examples">
            <div class="p-ex-title">典型字图解演示：</div>
            <div class="p-ex-list">
              <div v-for="ex in p.examples" :key="ex.char" class="p-ex-item">
                <div class="p-ex-top">
                  <MiZiGe :text="ex.char" size="small" />
                  <div class="p-ex-info">
                    <div class="p-ex-code">
                      全码: <strong>{{ ex.code }}</strong>
                    </div>
                    <div class="p-ex-reason">{{ ex.reason }}</div>
                  </div>
                </div>
                <div class="p-ex-roots">
                  字根拆解：
                  <span v-for="(r, ri) in ex.roots" :key="ri" class="root-chip">{{ r }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. 避坑大PK (正拆 vs 误拆对决卡片) -->
    <div v-if="activeSplitTab === 'pk-arena'" class="split-tab-content">
      <div class="pk-banner">
        <div class="pk-banner-title">⚡ 为什么这样拆不对？—— 拆字易错排雷排行榜</div>
        <div class="pk-banner-desc">
          五笔学习中最让人挠头的往往不是记不住字根，而是“面对一个汉字不知道字根从哪切”。点击卡片深度揭秘经典坑点！
        </div>
      </div>

      <div class="pk-grid">
        <div
          v-for="(item, pki) in TRICKY_SPLIT_PK_LIST"
          :key="pki"
          class="pk-card"
        >
          <div class="pk-header">
            <div class="pk-char-box">
              <MiZiGe :text="item.char" size="medium" />
              <div class="pk-char-meta">
                <span class="pk-char-text">{{ item.char }}</span>
                <span class="pk-pinyin">({{ item.pinyin }})</span>
                <span class="pk-difficulty">难度: {{ item.difficulty }}</span>
              </div>
            </div>
            <div class="pk-title-tag">{{ item.title }}</div>
          </div>

          <!-- 对决对比栏 -->
          <div class="pk-vs-row">
            <!-- 正确拆法 -->
            <div class="pk-side correct-side">
              <div class="side-badge badge-green">✅ 正确拆法</div>
              <div class="side-roots">
                <span v-for="(cr, cri) in item.correctRoots" :key="cri" class="pk-root-pill green">
                  {{ cr }}
                </span>
              </div>
              <div class="side-code">{{ item.correctCode }}</div>
            </div>

            <div class="pk-vs-divider">VS</div>

            <!-- 常见误拆 -->
            <div class="pk-side wrong-side">
              <div class="side-badge badge-red">❌ 易错误拆</div>
              <div class="side-roots">
                <span v-for="(wr, wri) in item.wrongRoots" :key="wri" class="pk-root-pill red">
                  {{ wr }}
                </span>
              </div>
              <div class="side-code strike">{{ item.wrongCode }}</div>
            </div>
          </div>

          <!-- 解析判定 -->
          <div class="pk-reason-box">
            <div class="pk-principle-applied">
              🎯 <strong>准则归属：</strong>{{ item.principle }}
            </div>
            <div class="pk-why-wrong">
              🤔 <strong>为何误拆：</strong>{{ item.whyWrong }}
            </div>
            <div class="pk-tip">
              💡 <strong>破局妙招：</strong>{{ item.tip }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. 拆字闯关挑战小游戏 -->
    <div v-if="activeSplitTab === 'quiz-game'" class="split-tab-content">
      <div class="quiz-container">
        <div class="quiz-status-bar">
          <div class="quiz-progress-text">
            第 <strong>{{ currentQuizIndex + 1 }}</strong> / {{ SPLIT_QUIZ_QUESTIONS.length }} 关
          </div>
          <div class="quiz-score-badge">
            得分：<span class="score-num">{{ quizScore }}</span> 钻 💎
          </div>
        </div>

        <!-- 当前关卡卡片 -->
        <div class="quiz-card" v-if="currentQuiz">
          <div class="quiz-char-header">
            <MiZiGe :text="currentQuiz.char" size="large" />
            <div class="quiz-q-info">
              <span class="quiz-principle-badge">{{ currentQuiz.principleTag }}</span>
              <h3 class="quiz-question">{{ currentQuiz.question }}</h3>
            </div>
          </div>

          <!-- 选项列表 -->
          <div class="quiz-options">
            <button
              v-for="(opt, oi) in currentQuiz.options"
              :key="oi"
              class="quiz-opt-btn"
              :class="{
                'selected': selectedOptionIndex === oi,
                'is-correct': selectedOptionIndex !== null && opt.isCorrect,
                'is-wrong': selectedOptionIndex === oi && !opt.isCorrect
              }"
              :disabled="selectedOptionIndex !== null"
              @click="handleSelectQuizOption(oi)"
            >
              <div class="opt-label">{{ opt.label }}</div>
              <div class="opt-roots">
                <span v-for="(r, ri) in opt.roots" :key="ri" class="root-chip">{{ r }}</span>
                <span class="opt-code">编码: {{ opt.code }}</span>
              </div>
            </button>
          </div>

          <!-- 选后即时反馈解析 -->
          <div v-if="selectedOptionIndex !== null" class="quiz-feedback-box" :class="{ success: isCurrentCorrect, fail: !isCurrentCorrect }">
            <div class="feedback-head">
              {{ isCurrentCorrect ? '🎉 恭喜回答正确！' : '😅 哎呀，掉进陷阱啦！' }}
            </div>
            <div class="feedback-text">
              {{ currentQuiz.options[selectedOptionIndex].feedback }}
            </div>
            <div class="feedback-exp">
              <strong>权威解析：</strong>{{ currentQuiz.explanation }}
            </div>

            <div class="quiz-action-bar">
              <button
                v-if="currentQuizIndex < SPLIT_QUIZ_QUESTIONS.length - 1"
                class="quiz-next-btn"
                @click="handleNextQuiz"
              >
                下一关 ➡️
              </button>
              <button
                v-else
                class="quiz-next-btn restart"
                @click="handleRestartQuiz"
              >
                再挑战一次 🔄
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 4. 交互式拆字实验室 (探索任意字) -->
    <div v-if="activeSplitTab === 'lab-dissect'" class="split-tab-content">
      <div class="lab-container">
        <div class="lab-intro">
          <div class="lab-intro-title">🔬 拆字微观实验室</div>
          <p class="lab-intro-desc">
            输入任意汉字或点击快捷候选，观察汉字如何在米字格中被解构成独立字根，并自动推导其编码与识别码！
          </p>
        </div>

        <!-- 输入与快捷选字 -->
        <div class="lab-controls">
          <div class="lab-input-group">
            <input
              type="text"
              v-model="labCharInput"
              maxlength="1"
              placeholder="输单字"
              class="lab-char-input"
              @input="handleLabInput"
            />
            <span class="lab-input-hint">输入或点选右侧经典字：</span>
          </div>
          <div class="lab-quick-tags">
            <button
              v-for="c in quickLabChars"
              :key="c"
              class="lab-tag-btn"
              :class="{ active: labCurrentChar === c }"
              @click="selectLabChar(c)"
            >
              {{ c }}
            </button>
          </div>
        </div>

        <!-- 动态拆字与显微镜展示 -->
        <div class="lab-stage" v-if="labCharData">
          <div class="lab-dissect-view">
            <!-- 原字米字格展示 -->
            <div class="stage-block orig-char">
              <div class="block-label">目标全字</div>
              <MiZiGe :text="labCharData.char" size="large" />
              <div class="char-pinyin">{{ labCharData.pinyin || '—' }}</div>
            </div>

            <div class="stage-arrow">➔ 拆解为</div>

            <!-- 拆解部件阵列 -->
            <div class="stage-block roots-breakdown">
              <div class="block-label">拆出字根序列 (从左至右)</div>
              <div class="roots-flow">
                <div
                  v-for="(r, ri) in labBreakdown.roots"
                  :key="ri"
                  class="root-stage-item"
                >
                  <span class="root-seq-num">第{{ ri + 1 }}码</span>
                  <MiZiGe :text="r" size="medium" />
                  <span class="root-key-badge">{{ labFullCode[ri] || '?' }} 键</span>
                </div>
              </div>
            </div>

            <!-- 末笔识别码（若有） -->
            <div class="stage-block recog-block" v-if="labBreakdown.recognitionCode">
              <div class="block-label">末笔识别码</div>
              <div class="recog-box">
                <span class="recog-key">{{ labBreakdown.recognitionCode }}</span>
                <span class="recog-desc">字根不足4个追加</span>
              </div>
            </div>
          </div>

          <!-- 实验室结论解读 -->
          <div class="lab-analysis-footer">
            <div class="lab-full-code-row">
              全码输出：<span class="final-code">{{ labFullCode }}</span>
              <span class="short-code-tag" v-if="labShortCode && labShortCode !== labFullCode">
                一/二级简码：{{ labShortCode }}
              </span>
            </div>
            <div class="lab-formula-summary">
              拆字逻辑公式：
              <strong>{{ labBreakdown.roots.join(' + ') }}</strong>
              <span v-if="labBreakdown.recognitionCode">
                + [末笔识别码: {{ labBreakdown.recognitionCode }}]
              </span>
              = <strong>{{ labFullCode }}</strong>
            </div>
          </div>
        </div>

        <div v-else class="lab-empty">
          未在当前五笔词库中查到该字，请输入常用简体汉字。
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import MiZiGe from '../MiZiGe.vue';
import {
  SPLIT_PRINCIPLES_DETAILED,
  TRICKY_SPLIT_PK_LIST,
  SPLIT_QUIZ_QUESTIONS
} from '../../data/rules';
import {
  lookupWubiChar,
  getFullCode,
  getShortCode,
  getCharBreakdown
} from '../../data/wubiDict';

// 拆字法则的趣味子标签: 'visual-guide' | 'pk-arena' | 'quiz-game' | 'lab-dissect'
const activeSplitTab = ref<'visual-guide' | 'pk-arena' | 'quiz-game' | 'lab-dissect'>('visual-guide');

// 拆字闯关 Quiz 状态
const currentQuizIndex = ref<number>(0);
const selectedOptionIndex = ref<number | null>(null);
const quizScore = ref<number>(0);

const currentQuiz = computed(() => {
  return SPLIT_QUIZ_QUESTIONS[currentQuizIndex.value];
});

const isCurrentCorrect = computed(() => {
  if (selectedOptionIndex.value === null || !currentQuiz.value) return false;
  return currentQuiz.value.options[selectedOptionIndex.value].isCorrect;
});

const handleSelectQuizOption = (index: number) => {
  if (selectedOptionIndex.value !== null) return;
  selectedOptionIndex.value = index;
  if (currentQuiz.value.options[index].isCorrect) {
    quizScore.value += 20;
  }
};

const handleNextQuiz = () => {
  if (currentQuizIndex.value < SPLIT_QUIZ_QUESTIONS.length - 1) {
    currentQuizIndex.value++;
    selectedOptionIndex.value = null;
  }
};

const handleRestartQuiz = () => {
  currentQuizIndex.value = 0;
  selectedOptionIndex.value = null;
  quizScore.value = 0;
};

// 拆字实验室 Lab 状态
const quickLabChars = ['天', '果', '申', '未', '末', '卡', '甚', '肆', '舞', '武', '明', '春'];
const labCurrentChar = ref<string>('天');
const labCharInput = ref<string>('天');

const selectLabChar = (c: string) => {
  labCurrentChar.value = c;
  labCharInput.value = c;
};

const handleLabInput = () => {
  if (labCharInput.value) {
    labCurrentChar.value = labCharInput.value.slice(0, 1);
  }
};

const labCharData = computed(() => {
  return lookupWubiChar(labCurrentChar.value);
});

const labBreakdown = computed(() => {
  if (!labCharData.value) return { roots: [] };
  return getCharBreakdown(labCharData.value, '86');
});

const labFullCode = computed(() => {
  if (!labCharData.value) return '';
  return getFullCode(labCharData.value, '86');
});

const labShortCode = computed(() => {
  if (!labCharData.value) return '';
  return getShortCode(labCharData.value, '86');
});
</script>

<style scoped>
/* ================= 拆字法则趣味化模块专属样式 ================= */
.principles-gamified-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.sub-nav-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  background: var(--bg-primary);
  padding: 0.5rem;
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.sub-tab-btn {
  padding: 0.6rem 1.25rem;
  border-radius: 8px;
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-muted);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 6px;
}

.sub-tab-btn:hover {
  color: var(--text-main);
  background: var(--card-bg);
}

.sub-tab-btn.active {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
}

.split-tab-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 1. 四大法则图解卡片：两排，每排2个 */
.principles-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

@media (max-width: 768px) {
  .principles-grid {
    grid-template-columns: 1fr;
  }
}

.principle-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
}

.principle-card:hover {
  transform: translateY(-2px);
  border-color: var(--accent);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.p-card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.p-icon {
  font-size: 2rem;
  background: var(--card-bg);
  padding: 8px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
}

.p-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
}

.p-subtitle {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 2px;
}

.p-formula-box {
  background: var(--card-bg);
  border-radius: 10px;
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border-left: 4px solid var(--accent);
}

.p-formula {
  font-size: 0.9rem;
  color: var(--text-main);
  line-height: 1.4;
}

.p-analogy {
  font-size: 0.85rem;
  color: var(--accent);
  line-height: 1.4;
}

.p-priority {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 0.8rem;
  color: var(--text-muted);
  background: rgba(234, 179, 8, 0.08);
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid rgba(234, 179, 8, 0.2);
}

.priority-tag {
  color: var(--warning, #d97706);
  font-weight: 700;
  white-space: nowrap;
}

.priority-text {
  color: var(--text-main);
}

.p-examples {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.p-ex-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-main);
}

.p-ex-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.p-ex-item {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.p-ex-top {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.p-ex-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.p-ex-code {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.p-ex-code strong {
  font-family: monospace;
  color: var(--accent);
}

.p-ex-reason {
  font-size: 0.8rem;
  color: var(--text-main);
}

.p-ex-roots {
  font-size: 0.8rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.root-chip {
  background: var(--accent-subtle);
  color: var(--accent);
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 700;
  font-size: 0.85rem;
}

/* 2. 避坑大PK对决卡片 */
.pk-banner {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.25rem;
}

.pk-banner-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 4px;
}

.pk-banner-desc {
  font-size: 0.88rem;
  color: var(--text-muted);
  line-height: 1.5;
}

.pk-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: 1.25rem;
}

.pk-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.pk-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px dashed var(--border-color);
  padding-bottom: 0.75rem;
}

.pk-char-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.pk-char-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.pk-char-text {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--text-main);
}

.pk-pinyin {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.pk-difficulty {
  font-size: 0.75rem;
  color: #f59e0b;
  font-weight: 600;
}

.pk-title-tag {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--accent);
  background: var(--accent-subtle);
  padding: 4px 8px;
  border-radius: 6px;
}

.pk-vs-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 0.75rem;
  align-items: center;
}

.pk-side {
  border-radius: 10px;
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.5rem;
}

.correct-side {
  background: rgba(34, 197, 94, 0.08);
  border: 1px solid rgba(34, 197, 94, 0.25);
}

.wrong-side {
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.25);
}

.side-badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
}

.badge-green {
  background: rgba(34, 197, 94, 0.2);
  color: #16a34a;
}

.badge-red {
  background: rgba(239, 68, 68, 0.2);
  color: #dc2626;
}

.side-roots {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
}

.pk-root-pill {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 700;
}

.pk-root-pill.green {
  background: #22c55e;
  color: #fff;
}

.pk-root-pill.red {
  background: #ef4444;
  color: #fff;
}

.side-code {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-main);
  font-family: monospace;
}

.side-code.strike {
  text-decoration: line-through;
  color: var(--text-muted);
}

.pk-vs-divider {
  font-weight: 900;
  font-size: 0.95rem;
  color: var(--text-muted);
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pk-reason-box {
  background: var(--card-bg);
  border-radius: 10px;
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.85rem;
  line-height: 1.5;
}

.pk-principle-applied {
  color: var(--accent);
}

.pk-why-wrong {
  color: var(--text-main);
}

.pk-tip {
  color: #f59e0b;
}

/* 3. 拆字闯关小游戏 */
.quiz-container {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.quiz-status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.75rem;
}

.quiz-progress-text {
  font-size: 0.95rem;
  color: var(--text-muted);
}

.quiz-progress-text strong {
  color: var(--accent);
  font-size: 1.2rem;
}

.quiz-score-badge {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-main);
}

.score-num {
  color: #eab308;
  font-size: 1.1rem;
  font-weight: 800;
}

.quiz-card {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.quiz-char-header {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.quiz-q-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.quiz-principle-badge {
  background: var(--accent-subtle);
  color: var(--accent);
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  align-self: flex-start;
}

.quiz-question {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
  line-height: 1.4;
}

.quiz-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.quiz-opt-btn {
  background: var(--card-bg);
  border: 1.5px solid var(--border-color);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.quiz-opt-btn:hover:not(:disabled) {
  border-color: var(--accent);
  background: var(--accent-subtle);
}

.opt-label {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-main);
}

.opt-roots {
  display: flex;
  align-items: center;
  gap: 6px;
}

.opt-code {
  font-family: monospace;
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-left: 6px;
}

.quiz-opt-btn.is-correct {
  background: rgba(34, 197, 94, 0.1) !important;
  border-color: #22c55e !important;
}

.quiz-opt-btn.is-wrong {
  background: rgba(239, 68, 68, 0.1) !important;
  border-color: #ef4444 !important;
}

.quiz-feedback-box {
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  animation: fadeIn 0.3s ease;
}

.quiz-feedback-box.success {
  background: rgba(34, 197, 94, 0.08);
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.quiz-feedback-box.fail {
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.feedback-head {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text-main);
}

.feedback-text {
  font-size: 0.95rem;
  color: var(--text-main);
  line-height: 1.5;
}

.feedback-exp {
  font-size: 0.85rem;
  color: var(--text-muted);
  background: var(--card-bg);
  padding: 0.75rem;
  border-radius: 8px;
  line-height: 1.5;
}

.quiz-action-bar {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.5rem;
}

.quiz-next-btn {
  background: var(--accent);
  color: #fff;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
}

.quiz-next-btn:hover {
  opacity: 0.9;
}

.quiz-next-btn.restart {
  background: #eab308;
}

/* 4. 拆字微观实验室 */
.lab-container {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.lab-intro {
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 1rem;
}

.lab-intro-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 6px;
}

.lab-intro-desc {
  font-size: 0.88rem;
  color: var(--text-muted);
  line-height: 1.5;
  margin: 0;
}

.lab-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.25rem;
  background: var(--card-bg);
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.lab-input-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.lab-char-input {
  width: 54px;
  height: 54px;
  text-align: center;
  font-size: 1.8rem;
  font-weight: 800;
  border-radius: 10px;
  border: 2px solid var(--accent);
  background: var(--bg-primary);
  color: var(--text-main);
  outline: none;
  transition: all 0.2s;
}

.lab-char-input:focus {
  box-shadow: 0 0 0 3px var(--accent-subtle);
}

.lab-input-hint {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-weight: 600;
}

.lab-quick-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.lab-tag-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-main);
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.lab-tag-btn:hover {
  border-color: var(--accent);
  transform: translateY(-1px);
}

.lab-tag-btn.active {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}

.lab-stage {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.lab-dissect-view {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.5rem;
}

.stage-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.block-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
}

.char-pinyin {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.stage-arrow {
  font-size: 1rem;
  font-weight: 700;
  color: var(--accent);
}

.roots-flow {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.root-stage-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: var(--bg-primary);
  padding: 0.5rem 0.75rem;
  border-radius: 10px;
  border: 1px solid var(--border-color);
}

.root-seq-num {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.root-key-badge {
  font-family: monospace;
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--accent);
  background: var(--accent-subtle);
  padding: 2px 6px;
  border-radius: 4px;
}

.recog-box {
  background: var(--bg-primary);
  border: 1.5px dashed var(--accent);
  padding: 0.75rem 1rem;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.recog-key {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--accent);
  font-family: monospace;
}

.recog-desc {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.lab-analysis-footer {
  border-top: 1px solid var(--border-color);
  padding-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.lab-full-code-row {
  font-size: 1rem;
  color: var(--text-main);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.final-code {
  font-family: monospace;
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--accent);
}

.short-code-tag {
  background: rgba(34, 197, 94, 0.15);
  color: #16a34a;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 700;
}

.lab-formula-summary {
  font-size: 0.9rem;
  color: var(--text-muted);
}

.lab-formula-summary strong {
  color: var(--text-main);
}

.lab-empty {
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
  font-size: 0.95rem;
}
</style>
