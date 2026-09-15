<template>
  <div class="type-engine-wrapper">
    <!-- 顶部练习控制条：模式切换与关卡选择 -->
    <div class="engine-toolbar">
      <!-- 打字判定模式 -->
      <div class="mode-selector">
        <button
          v-for="m in modeList"
          :key="m.id"
          class="mode-btn"
          :class="{ active: store.inputMode.value === m.id }"
          @click="changeInputMode(m.id)"
        >
          <component :is="m.icon" :size="15" />
          <span>{{ m.name }}</span>
        </button>
      </div>

      <!-- 出字方式：打对即走(无需空格) vs 空格出字 -->
      <div class="commit-selector">
        <button
          class="mode-btn"
          :class="{ active: store.commitMode.value === 'auto' }"
          @click="store.setCommitMode('auto')"
          title="无需按空格，编码打对即自动进入下一个字"
        >
          <span>⚡ 自动出字 (无需空格)</span>
        </button>
        <button
          class="mode-btn"
          :class="{ active: store.commitMode.value === 'space' }"
          @click="store.setCommitMode('space')"
          title="敲空格键出字"
        >
          <span>␣ 空格出字</span>
        </button>
      </div>

      <!-- 关卡练习分类 -->
      <div class="category-selector">
        <button
          v-for="cat in categoryList"
          :key="cat.id"
          class="cat-btn"
          :class="{ active: currentCategory === cat.id }"
          @click="selectCategory(cat.id)"
        >
          {{ cat.name }}
        </button>
      </div>

      <!-- 辅助提示开关与米字格开关 -->
      <div class="hints-toggle">
        <label class="toggle-label" title="开启/关闭书法米字格字帖模式">
          <input type="checkbox" v-model="useMiZiGe" />
          <span>米字格</span>
        </label>
        <label class="toggle-label" title="开启/关闭拆字字根与编码提示">
          <input type="checkbox" v-model="showHints" />
          <span>拆解提示</span>
        </label>
      </div>
    </div>

    <!-- 打字实时状态监控板 (WPM, KPM, 准确率, 进度) -->
    <div class="stats-ribbon">
      <div class="stat-card">
        <span class="stat-num">{{ stats.wpm }}</span>
        <span class="stat-lbl">WPM (字/分)</span>
      </div>
      <div class="stat-card">
        <span class="stat-num">{{ stats.kpm }}</span>
        <span class="stat-lbl">KPM (击键/分)</span>
      </div>
      <div class="stat-card">
        <span class="stat-num">{{ stats.accuracy }}%</span>
        <span class="stat-lbl">正确率</span>
      </div>
      <div class="stat-card">
        <span class="stat-num">{{ currentIndex }} / {{ practiceList.length }}</span>
        <span class="stat-lbl">进度</span>
      </div>
      <div class="stat-card">
        <span class="stat-num">{{ formattedTime }}</span>
        <span class="stat-lbl">耗时</span>
      </div>
      <button class="reset-btn" @click="resetSession" title="重新开始本轮">
        <RotateCcw :size="16" />
      </button>
    </div>

    <!-- 打字核心舞台 -->
    <div class="typing-stage" @click="focusInput">
      <!-- 当前字词预览展示 (米字格字帖排版) -->
      <div class="word-card" :class="{ 'shake-error': hasError }">
        <div class="pinyin-tag" v-if="currentChar?.pinyin">{{ currentChar.pinyin }}</div>

        <!-- 核心目标字展示：米字格书法排版 -->
        <div class="target-display-wrap">
          <template v-if="useMiZiGe && currentChar?.char">
            <div class="mizige-stage-row">
              <MiZiGe
                v-for="(ch, idx) in Array.from(currentChar.char)"
                :key="idx"
                :text="ch"
                :size="Array.from(currentChar.char).length > 2 ? 'medium' : 'large'"
                active
              />
            </div>
          </template>
          <template v-else>
            <div class="target-char-fallback">{{ currentChar?.char }}</div>
          </template>
        </div>

        <!-- 编码提示轨道 -->
        <div class="hints-rail" v-if="showHints && currentChar">
          <div class="target-codes">
            <span class="code-badge full-badge">全码：{{ targetFullCode }}</span>
            <span class="code-badge short-badge" v-if="targetShortCode && targetShortCode !== targetFullCode">
              简码：{{ targetShortCode }}
            </span>
          </div>

          <!-- 词组取码规则展示（双字/多字词） -->
          <div class="phrase-rail" v-if="isPhrase && currentPhraseBreakdown">
            <div class="phrase-rule-title">
              <span class="p-rule-badge">{{ currentPhraseBreakdown.ruleName }}</span>
              <span class="p-rule-text">{{ currentPhraseBreakdown.ruleDesc }}</span>
            </div>
            <div class="phrase-steps-list">
              <div 
                v-for="step in currentPhraseBreakdown.steps" 
                :key="step.index" 
                class="phrase-step-item"
              >
                <div class="step-char-card">
                  <MiZiGe :text="step.char" size="mini" />
                  <span class="step-rule-lbl">{{ step.desc }}</span>
                </div>
                <div class="step-arrow">➔</div>
                <div class="step-key-chip">{{ step.keys }}键</div>
              </div>
            </div>
          </div>

          <!-- 单字字根拆解展示 -->
          <div class="roots-chain" v-else>
            <span class="chain-label">拆字字根：</span>
            <div class="roots-mizige-row" v-if="useMiZiGe">
              <div v-for="(step, i) in currentRootSteps" :key="i" class="root-mizige-item">
                <MiZiGe 
                  :text="step.root" 
                  size="small" 
                  :sub="step.key ? `${step.key}键` : ''" 
                />
                <span class="root-step-num">第{{ i + 1 }}码</span>
              </div>
              <!-- 末笔识别码（若有） -->
              <div class="recog-mizige-item" v-if="currentRecogCode">
                <div class="recog-box">
                  <span class="recog-key">{{ currentRecogCode }}键</span>
                  <span class="recog-title">末笔识别</span>
                </div>
                <span class="root-step-num">第{{ currentRoots.length + 1 }}码</span>
              </div>
            </div>
            <div class="roots-fallback-row" v-else>
              <span v-for="(r, i) in currentRoots" :key="i" class="root-bubble">
                {{ r }}
              </span>
              <span class="recog-fallback-bubble" v-if="currentRecogCode">
                末笔识别码: {{ currentRecogCode }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 核心输入交互区：专业大输入胶囊 -->
      <div class="input-control-zone">
        <div class="input-capsule" :class="{ focused: isFocused, error: hasError }" @click.stop="focusInput">
          <input
            ref="inputRef"
            type="text"
            class="hidden-native-input"
            :value="inputBuffer"
            @keydown="handleKeyDown"
            @input="handleInput"
            @focus="isFocused = true"
            @blur="isFocused = false"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
            inputmode="latin"
          />

          <!-- 内容显示：若有输入则展示大号等宽编码；无输入则展示引导文案 -->
          <div class="capsule-content">
            <template v-if="inputBuffer">
              <span class="buffer-text">{{ inputBuffer }}</span>
              <span class="cursor cursor-blink"></span>
            </template>
            <template v-else>
              <span class="cursor cursor-blink" v-if="isFocused"></span>
              <span class="placeholder-text" v-if="store.commitMode.value === 'auto'">
                ⚡ 键入编码，打对即自动出字 (无需空格)...
              </span>
              <span class="placeholder-text" v-else>
                ⌨️ 键入编码，按空格出字...
              </span>
            </template>
          </div>

          <!-- 模式指示按钮 -->
          <button class="space-btn-pill" @click.stop="handleCheck(true)">
            {{ store.commitMode.value === 'auto' ? '⚡ 自动出字' : '␣ 空格出字' }}
          </button>
        </div>

        <!-- 失焦遮罩层：引导用户点击任意位置继续 -->
        <div class="focus-alert-banner" v-if="!isFocused && !isFinished" @click="focusInput">
          <span class="alert-icon">⚡</span>
          <span>当前输入未聚焦，点击此处继续练习</span>
        </div>

        <!-- 智能简码提醒气泡 -->
        <div class="smart-tip-banner" v-if="smartTip">
          💡 {{ smartTip }}
        </div>
      </div>

      <!-- 待打字流 (后续 7 个字) -->
      <div class="queue-preview">
        <span class="queue-lbl">即将出现：</span>
        <span
          v-for="(item, idx) in upcomingList"
          :key="idx"
          class="queue-item"
        >
          {{ item.char }}
        </span>
      </div>

      <!-- 双输入方式友好提示 -->
      <div class="ime-friendly-note">
        💡 提示：既可切换<strong>英文键盘 (ABC)</strong>看字打编码（网页自带五笔引擎），也可直接开启您的<strong>系统五笔输入法</strong>打出汉字实战，两者皆完美支持！
      </div>
    </div>

    <!-- 联动展示五笔大键盘 (实时指示下一按键) -->
    <div class="linked-keyboard-wrap">
      <VirtualKeyboard :active-key="nextExpectedKey" />
    </div>

    <!-- 结算模态框 -->
    <div class="modal-backdrop" v-if="isFinished">
      <div class="modal-card">
        <h2 class="modal-title">🎉 本轮练习完成！</h2>
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
          <button class="primary-btn" @click="resetSession">再练一轮</button>
          <button class="secondary-btn" @click="nextCategory">下一关卡</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useWubiStore } from '../stores/useWubiStore';
import type { InputMode, PracticeCategory, WubiCharData, TypingStats } from '../types/wubi';
import { 
  LEVEL_1_CHARS, 
  LEVEL_2_CHARS, 
  KEY_NAME_CHARS, 
  COMMON_500_CHARS,
  COMMON_1500_CHARS,
  COMMON_3500_CHARS,
  COMMON_CHARS, 
  getFullCode, 
  getShortCode, 
  getRoots,
  getRootSteps,
  getCharBreakdown,
  getRecognitionCode,
  getPhraseBreakdown
} from '../data/wubiDict';
import { COMMON_PHRASES } from '../data/wordsDict';
import { evaluateInput, calculateStats } from '../utils/wubiEngine';
import { soundPlayer } from '../utils/audio';
import VirtualKeyboard from './VirtualKeyboard.vue';
import MiZiGe from './MiZiGe.vue';
import { Zap, Target, Sparkles, RotateCcw } from 'lucide-vue-next';
import confetti from 'canvas-confetti';

const store = useWubiStore();

const inputRef = ref<HTMLInputElement | null>(null);
const inputBuffer = ref('');
const isFocused = ref(true);
const hasError = ref(false);
const smartTip = ref<string | null>(null);
const showHints = ref(true);
const useMiZiGe = ref(true);

const currentIndex = ref(0);
const correctCount = ref(0);
const errorCount = ref(0);
const keystrokes = ref(0);
const backspaceCount = ref(0);
const startTime = ref<number | null>(null);
const timerInterval = ref<number | null>(null);
const isFinished = ref(false);

const modeList = [
  { id: 'smart' as InputMode, name: '简码优先 (实战)', icon: Sparkles },
  { id: 'full' as InputMode, name: '看字打全码', icon: Target },
  { id: 'quick' as InputMode, name: '简码专练', icon: Zap },
];

const categoryList = [
  { id: 'level1' as PracticeCategory, name: '一级简码 (25字)' },
  { id: 'level2' as PracticeCategory, name: '二级简码精选' },
  { id: 'root' as PracticeCategory, name: '键名与字根' },
  { id: 'top500' as PracticeCategory, name: '常用前500字' },
  { id: 'top1500' as PracticeCategory, name: '常用前1500字' },
  { id: 'top3500' as PracticeCategory, name: '3500常用字全集' },
  { id: 'phrase' as PracticeCategory, name: '高频词组特训 (3000词)' },
];

const currentCategory = ref<PracticeCategory>('level1');

// 生成练习队列
const practiceList = ref<WubiCharData[]>([]);

const loadPracticeData = () => {
  let list: WubiCharData[] = [];
  switch (currentCategory.value) {
    case 'level1':
      list = [...LEVEL_1_CHARS];
      break;
    case 'level2':
      list = [...LEVEL_2_CHARS];
      break;
    case 'root':
      list = [...KEY_NAME_CHARS];
      break;
    case 'top500':
      list = [...COMMON_500_CHARS];
      break;
    case 'top1500':
      list = [...COMMON_1500_CHARS];
      break;
    case 'top3500':
      list = [...COMMON_3500_CHARS];
      break;
    case 'phrase':
      list = COMMON_PHRASES.map(p => ({
        char: p.word,
        pinyin: p.pinyin,
        code86: p.code86,
        code98: p.code98,
        codeNew: p.codeNew,
        roots86: [],
        roots98: [],
        rootsNew: []
      }));
      break;
    case 'single':
    default:
      list = [...COMMON_CHARS];
      break;
  }
  // 洗牌随机化练习顺序
  practiceList.value = list.sort(() => Math.random() - 0.5);
  resetSession();
};

const currentChar = computed(() => {
  return practiceList.value[currentIndex.value] || null;
});

const isPhrase = computed(() => {
  return currentChar.value ? currentChar.value.char.length > 1 : false;
});

const currentPhraseBreakdown = computed(() => {
  if (!currentChar.value || currentChar.value.char.length <= 1) return null;
  return getPhraseBreakdown(currentChar.value.char, store.version.value);
});

const upcomingList = computed(() => {
  return practiceList.value.slice(currentIndex.value + 1, currentIndex.value + 8);
});

const targetFullCode = computed(() => {
  if (!currentChar.value) return '';
  return getFullCode(currentChar.value, store.version.value).toUpperCase();
});

const targetShortCode = computed(() => {
  if (!currentChar.value) return '';
  return getShortCode(currentChar.value, store.version.value)?.toUpperCase();
});

const currentBreakdown = computed(() => {
  if (!currentChar.value) return null;
  return getCharBreakdown(currentChar.value, store.version.value);
});

const currentRoots = computed(() => {
  return currentBreakdown.value?.roots || [];
});

const currentRootSteps = computed(() => {
  return currentBreakdown.value?.rootSteps || [];
});

const currentRecogCode = computed(() => {
  if (!currentChar.value || currentChar.value.char.length > 1) return null;
  return currentBreakdown.value?.recognitionCode || null;
});

// 下一个预期按下的按键
const nextExpectedKey = computed(() => {
  if (!currentChar.value) return null;
  const target = (store.inputMode.value === 'quick' && targetShortCode.value)
    ? targetShortCode.value
    : targetFullCode.value;
  if (!target) return null;

  const currentLen = inputBuffer.value.length;
  if (currentLen < target.length) {
    return target[currentLen];
  }
  return ' ';
});

// 统计计算
const stats = ref<TypingStats>({
  wpm: 0,
  kpm: 0,
  accuracy: 100,
  totalChars: 0,
  correctChars: 0,
  errorChars: 0,
  elapsedSeconds: 0,
  backspaceCount: 0
});

const formattedTime = computed(() => {
  const s = stats.value.elapsedSeconds;
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
});

const focusInput = () => {
  inputRef.value?.focus();
};

const changeInputMode = (m: InputMode) => {
  store.setInputMode(m);
  resetSession();
};

const selectCategory = (cat: PracticeCategory) => {
  currentCategory.value = cat;
  loadPracticeData();
};

const nextCategory = () => {
  const idx = categoryList.findIndex(c => c.id === currentCategory.value);
  const next = categoryList[(idx + 1) % categoryList.length];
  selectCategory(next.id);
};

const resetSession = () => {
  currentIndex.value = 0;
  inputBuffer.value = '';
  correctCount.value = 0;
  errorCount.value = 0;
  keystrokes.value = 0;
  backspaceCount.value = 0;
  startTime.value = null;
  hasError.value = false;
  smartTip.value = null;
  isFinished.value = false;
  stats.value = {
    wpm: 0,
    kpm: 0,
    accuracy: 100,
    totalChars: 0,
    correctChars: 0,
    errorChars: 0,
    elapsedSeconds: 0,
    backspaceCount: 0
  };
  focusInput();
};

const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const raw = target.value.trim();

  // 支持两种模式：① 开启系统五笔输入法直接打出汉字；② 切换英文键盘打英文字母编码
  const hasChinese = /[\u4e00-\u9fa5]/.test(raw);
  const clean = hasChinese ? raw : raw.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4);
  inputBuffer.value = clean;
  target.value = clean;

  if (!clean) {
    hasError.value = false;
    return;
  }

  if (currentChar.value) {
    const isAuto = store.commitMode.value === 'auto';
    const evalRes = evaluateInput(
      clean,
      currentChar.value,
      store.inputMode.value,
      store.version.value,
      false,
      store.commitMode.value
    );
    if (!evalRes.isPrefixMatch && !evalRes.isMatch) {
      hasError.value = true;
      soundPlayer.playKey(store.audio.value, false, true);
    } else {
      hasError.value = false;
    }

    // 自动出字、打满4码或直接打出正确汉字时，自动进入下一个字
    const shouldAutoCommit = (isAuto && evalRes.isMatch) || (clean.length >= 4 && evalRes.isMatch) || (hasChinese && evalRes.isMatch);
    if (shouldAutoCommit) {
      setTimeout(() => {
        if (inputBuffer.value === clean) {
          handleCheck(false);
        }
      }, isAuto ? 90 : 120);
    }
  }
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (isFinished.value) return;

  if (!startTime.value) {
    startTime.value = Date.now();
  }

  // 退格处理
  if (e.key === 'Backspace') {
    soundPlayer.playKey(store.audio.value, false);
    backspaceCount.value += 1;
    hasError.value = false;
    return;
  }

  // 空格键：出字键（如果处于自动模式，敲空格同样支持出字）
  if (e.key === ' ' || e.code === 'Space') {
    e.preventDefault();
    handleCheck(true);
    return;
  }

  // 回车键：清空重打
  if (e.key === 'Enter') {
    e.preventDefault();
    inputBuffer.value = '';
    if (inputRef.value) inputRef.value.value = '';
    hasError.value = false;
    return;
  }

  // 英文字母击键计数与物理音效
  if (/^[a-zA-Z]$/.test(e.key)) {
    keystrokes.value += 1;
    soundPlayer.playKey(store.audio.value, false);
  }
};

const handleCheck = (hasPressedSpace: boolean) => {
  if (!currentChar.value) return;

  const res = evaluateInput(
    inputBuffer.value,
    currentChar.value,
    store.inputMode.value,
    store.version.value,
    hasPressedSpace,
    store.commitMode.value
  );

  if (res.isMatch) {
    // 成功出字
    soundPlayer.playKey(store.audio.value, true);
    correctCount.value += 1;
    hasError.value = false;
    inputBuffer.value = '';

    if (res.tip) {
      smartTip.value = res.tip;
      setTimeout(() => { smartTip.value = null; }, 3000);
    }

    if (currentIndex.value + 1 >= practiceList.value.length) {
      // 本轮结束
      finishSession();
    } else {
      currentIndex.value += 1;
    }
  } else {
    // 击错
    hasError.value = true;
    errorCount.value += 1;
    soundPlayer.playKey(store.audio.value, false, true);

    // 记录到错题本
    store.recordMistake(
      currentChar.value.char,
      inputBuffer.value,
      targetFullCode.value,
      currentRoots.value
    );
  }
};

const finishSession = () => {
  isFinished.value = true;
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 }
  });
};

const handleWindowKeyDown = (e: KeyboardEvent) => {
  // 如果焦点已经在别的 input/textarea/select 上，不劫持
  const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
  if (targetTag === 'textarea' || (targetTag === 'input' && e.target !== inputRef.value) || targetTag === 'select') {
    return;
  }
  // 命中字母或空格时自动聚焦
  if (/^[a-zA-Z]$/.test(e.key) || e.key === ' ') {
    if (document.activeElement !== inputRef.value) {
      focusInput();
    }
  }
};

// 计时器轮询刷新 WPM/KPM
onMounted(() => {
  loadPracticeData();
  window.addEventListener('keydown', handleWindowKeyDown);
  timerInterval.value = window.setInterval(() => {
    if (startTime.value && !isFinished.value) {
      stats.value = calculateStats(
        correctCount.value,
        errorCount.value,
        keystrokes.value,
        startTime.value,
        backspaceCount.value
      );
    }
  }, 500);
  focusInput();
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleWindowKeyDown);
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
  }
});

watch(() => store.version.value, () => {
  resetSession();
});
</script>

<style scoped>
.type-engine-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 1080px;
  margin: 0 auto;
  width: 100%;
}

.engine-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  background: var(--card-bg);
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.mode-selector, .category-selector {
  display: flex;
  gap: 4px;
  background: var(--bg-primary);
  padding: 3px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.mode-btn, .cat-btn {
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
}

.mode-btn.active, .cat-btn.active {
  background: var(--accent);
  color: #fff;
  font-weight: 600;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: var(--text-muted);
  cursor: pointer;
}

.stats-ribbon {
  display: grid;
  grid-template-columns: repeat(5, 1fr) auto;
  gap: 1rem;
  align-items: center;
}

.stat-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  padding: 0.75rem;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-num {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-main);
  font-family: monospace;
}

.stat-lbl {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.reset-btn {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-btn:hover {
  color: var(--accent);
  border-color: var(--accent);
}

/* 舞台字帖展示区 */
.word-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.65rem;
  transition: transform 0.2s ease;
}

.pinyin-tag {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 2px;
  min-height: 1.6rem;
  font-family: var(--font-mono, sans-serif);
}

.target-display-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 140px;
}

.mizige-stage-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.target-char-fallback {
  font-size: 4.8rem;
  font-weight: 800;
  color: var(--text-main);
  line-height: 1;
}

/* 编码与拆解提示轨道 */
.hints-rail {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.25rem;
}

.target-codes {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.code-badge {
  font-family: var(--font-mono, monospace);
  font-size: 0.95rem;
  font-weight: 700;
  padding: 0.3rem 0.85rem;
  border-radius: 6px;
  letter-spacing: 1px;
}

.full-badge {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  color: var(--text-main);
}

.short-badge {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid var(--success);
  color: var(--success);
}

/* 拆字字根展示 */
.roots-chain {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: center;
}

.chain-label {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-weight: 600;
}

.roots-mizige-row {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex-wrap: wrap;
}

.root-mizige-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}

.root-step-num {
  font-size: 0.72rem;
  color: var(--text-muted);
  font-weight: 600;
}

.roots-fallback-row {
  display: flex;
  gap: 0.4rem;
}

.root-bubble {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  padding: 0.25rem 0.65rem;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-main);
}

.recog-fallback-bubble {
  background: rgba(99, 102, 241, 0.1);
  border: 1px dashed var(--accent);
  padding: 0.25rem 0.65rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--accent);
}

/* 末笔识别码方块 */
.recog-mizige-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}

.recog-box {
  width: 58px;
  height: 58px;
  border: 2px dashed var(--accent);
  background: rgba(99, 102, 241, 0.06);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.recog-key {
  font-family: var(--font-mono, monospace);
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--accent);
}

.recog-title {
  font-size: 0.65rem;
  color: var(--text-muted);
  font-weight: 600;
}

/* 词组拆字取码规则提示轨道 */
.phrase-rail {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.65rem;
  width: 100%;
}

.phrase-rule-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.p-rule-badge {
  background: var(--accent);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.p-rule-text {
  font-size: 0.82rem;
  color: var(--text-muted);
}

.phrase-steps-list {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.phrase-step-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.step-char-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.4rem 0.6rem;
}

.step-rule-lbl {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.step-arrow {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.step-key-chip {
  font-family: var(--font-mono, monospace);
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--accent);
  background: rgba(99, 102, 241, 0.12);
  padding: 0.1rem 0.45rem;
  border-radius: 4px;
}

.typing-stage {
  position: relative;
  background: var(--card-bg);
  border: 2px solid var(--border-color);
  border-radius: 16px;
  padding: 2.5rem 2rem;
  min-height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  cursor: text;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.input-control-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  max-width: 480px;
  position: relative;
}

.input-capsule {
  position: relative;
  width: 100%;
  height: 54px;
  background: var(--bg-primary);
  border: 2px solid var(--border-color);
  border-radius: 27px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem 0 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  cursor: text;
  transition: all 0.2s ease;
}

.input-capsule.focused {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-subtle), 0 4px 16px rgba(0, 0, 0, 0.12);
}

.input-capsule.error {
  border-color: var(--error);
  background: rgba(244, 63, 94, 0.06);
  box-shadow: 0 0 0 3px rgba(244, 63, 94, 0.15);
}

.hidden-native-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: text;
  z-index: 2;
}

.capsule-content {
  display: flex;
  align-items: center;
  flex: 1;
  overflow: hidden;
  pointer-events: none;
}

.buffer-text {
  font-size: 1.6rem;
  font-weight: 800;
  font-family: monospace;
  letter-spacing: 4px;
  color: var(--text-main);
}

.placeholder-text {
  font-size: 0.95rem;
  color: var(--text-muted);
  font-weight: 500;
}

.cursor {
  display: inline-block;
  width: 3px;
  height: 26px;
  background: var(--accent);
  margin-right: 6px;
  flex-shrink: 0;
}

.space-btn-pill {
  z-index: 3;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  font-size: 0.75rem;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.15s;
  user-select: none;
}

.space-btn-pill:hover {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}

.focus-alert-banner {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(245, 158, 11, 0.15);
  color: var(--warning);
  border: 1px dashed var(--warning);
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.smart-tip-banner {
  background: rgba(245, 158, 11, 0.15);
  color: var(--warning);
  border: 1px solid var(--warning);
  padding: 4px 14px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
}

.queue-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 0.5rem;
}

.queue-lbl {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.queue-item {
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--text-muted);
  opacity: 0.45;
}

.ime-friendly-note {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-align: center;
}

.linked-keyboard-wrap {
  width: 100%;
}

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
}

.secondary-btn {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
</style>
