<template>
  <div class="article-practice-wrapper">
    <!-- 顶部文章选择与工具栏 -->
    <div class="article-header">
      <div class="article-info">
        <div class="title-with-badge">
          <span class="cat-pill">{{ currentArticle.categoryName }}</span>
          <h2 class="curr-title">{{ currentArticle.title }}</h2>
        </div>
        <span class="curr-meta">
          作者：{{ currentArticle.author }} | 总字数：{{ currentArticle.charCount }} 字 | {{ currentArticle.description }}
        </span>
      </div>

      <div class="header-actions">
        <!-- 题库大弹窗选择按钮 -->
        <button class="action-btn library-btn" @click="showLibraryModal = true">
          <BookOpen :size="16" />
          <span>题库大全 ({{ articleList.length }}篇)</span>
        </button>

        <!-- 快速切换文章下拉框 (按题材分组) -->
        <select class="article-select" :value="currentArticle.id" @change="handleArticleChange">
          <optgroup v-for="cat in availableCategories" :key="cat" :label="cat">
            <option 
              v-for="art in articleList.filter(a => a.categoryName === cat)" 
              :key="art.id" 
              :value="art.id"
            >
              {{ art.title }} ({{ art.charCount }}字)
            </option>
          </optgroup>
        </select>

        <!-- 自定义文章按钮 -->
        <button class="action-btn custom-btn" @click="showCustomModal = true">
          <Plus :size="16" />
          <span>导入自定义文章</span>
        </button>
      </div>
    </div>

    <!-- 实时指标看板与进度条 -->
    <div class="article-stats-bar">
      <div class="mini-stat">
        <span class="val">{{ stats.wpm }}</span>
        <span class="lbl">WPM</span>
      </div>
      <div class="mini-stat">
        <span class="val">{{ stats.kpm }}</span>
        <span class="lbl">KPM</span>
      </div>
      <div class="mini-stat">
        <span class="val">{{ stats.accuracy }}%</span>
        <span class="lbl">正确率</span>
      </div>
      <div class="mini-stat">
        <span class="val">{{ charIndex }} / {{ totalChars }}</span>
        <span class="lbl">进度 ({{ progressPercent }}%)</span>
      </div>
      <div class="mini-stat">
        <span class="val">{{ formattedTime }}</span>
        <span class="lbl">用时</span>
      </div>

      <div class="progress-bar-wrap">
        <div class="progress-bar-fill" :style="{ width: progressPercent + '%' }"></div>
      </div>
    </div>

    <!-- 长文沉浸式阅读与击键主区域 -->
    <div class="article-viewport" @click="focusInput">
      <!-- 篇章文本行流排版 (已打置灰、当前聚焦高亮、待打清晰) -->
      <div class="article-text-container" ref="textContainerRef">
        <span
          v-for="(char, idx) in articleChars"
          :key="idx"
          class="char-unit"
          :class="{
            completed: idx < charIndex,
            current: idx === charIndex,
            error: idx === charIndex && hasError,
            punctuation: isPunctuation(char)
          }"
        >
          {{ char }}
        </span>
      </div>

      <!-- 当前字专属击键控制台 (沉浸居中) -->
      <div class="article-input-console">
        <!-- 当前字与提示信息 -->
        <div class="char-info-pill" v-if="targetChar">
          <span class="focus-char" :class="{ 'punct-char': isPunctuation(targetChar) }">{{ targetChar }}</span>
          <div class="codes-group" v-if="currentCharData">
            <span class="badge full">全码: {{ targetFullCode }}</span>
            <span class="badge short" v-if="targetShortCode && targetShortCode !== targetFullCode">
              简码: {{ targetShortCode }}
            </span>
            <span class="badge phrase" v-if="upcomingPhrase">
              词组[{{ upcomingPhrase.text }}]: {{ upcomingPhrase.fullCode }}
            </span>
            <span class="roots-tag">拆解: {{ currentRoots.join(' + ') }}</span>
          </div>
          <div class="codes-group punct-group" v-else-if="isPunctuation(targetChar)">
            <span class="badge punct">标点符号</span>
            <span class="roots-tag">直接键入【{{ targetChar }}】或按【空格】跳过</span>
          </div>
          <div class="codes-group fallback-group" v-else>
            <span class="roots-tag">使用输入法直接打出【{{ targetChar }}】即可</span>
          </div>
        </div>

        <!-- 真实居中输入胶囊 -->
        <div class="article-capsule" :class="{ focused: isFocused, error: hasError }" @click.stop="focusInput">
          <input
            ref="inputRef"
            type="text"
            class="hidden-native-input"
            :value="inputBuffer"
            @keydown="handleKeyDown"
            @input="handleInput"
            @compositionstart="handleCompositionStart"
            @compositionupdate="handleCompositionUpdate"
            @compositionend="handleCompositionEnd"
            @focus="isFocused = true"
            @blur="isFocused = false"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
            inputmode="latin"
          />

          <div class="capsule-content">
            <template v-if="displayInput">
              <span class="buffer-text">{{ displayInput }}</span>
              <span class="cursor cursor-blink"></span>
            </template>
            <template v-else>
              <span class="cursor cursor-blink" v-if="isFocused"></span>
              <span class="placeholder-text" v-if="isPunctuation(targetChar)">
                标点符号：键入【{{ targetChar }}】或按【空格】跳过...
              </span>
              <span class="placeholder-text" v-else>
                键入上方高亮汉字编码，按空格出字...
              </span>
            </template>
          </div>

          <button class="space-btn-pill" @click.stop="checkChar(true)">
            {{ isPunctuation(targetChar) ? '␣ 跳过' : '␣ 空格' }}
          </button>
        </div>

        <!-- 失焦提醒 -->
        <div class="focus-alert-banner" v-if="!isFocused && !isFinished" @click="focusInput">
          <span class="alert-icon">⚡</span>
          <span>点击此处或按任意键继续文章打字</span>
        </div>
      </div>
    </div>

    <!-- 底部辅助虚拟键盘 (长文击键提示) -->
    <div class="linked-kb-area">
      <VirtualKeyboard :active-key="nextExpectedKey" />
    </div>
    <!-- 题库大全大弹窗 -->
    <ArticleLibraryModal
      :show="showLibraryModal"
      :article-list="articleList"
      :current-article-id="currentArticle.id"
      @close="showLibraryModal = false"
      @select="selectArticleFromLibrary"
    />

    <!-- 自定义文章导入弹窗 -->
    <ArticleCustomImportModal
      :show="showCustomModal"
      @close="showCustomModal = false"
      @apply="onApplyCustomArticle"
    />

    <!-- 篇章完成结算弹窗 -->
    <ArticleFinishModal
      :show="isFinished"
      :article-title="currentArticle.title"
      :stats="stats"
      :formatted-time="formattedTime"
      @restart="restartArticle"
      @next="nextArticle"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useWubiStore } from '../stores/useWubiStore';
import type { ArticleTopic, TypingStats } from '../types/wubi';
import { ARTICLES_LIBRARY } from '../data/articles';
import {
  lookupWubiChar,
  getFullCode,
  getShortCode,
  getRoots,
  loadFullParsedChars,
  WUBI_CHAR_MAP
} from '../data/wubiDict';
import { evaluateInput, calculateStats } from '../utils/wubiEngine';
import { soundPlayer } from '../utils/audio';
import { getArticleProgress, saveArticleProgress } from '../utils/storage';
import VirtualKeyboard from './VirtualKeyboard.vue';
import ArticleLibraryModal from './article/ArticleLibraryModal.vue';
import ArticleCustomImportModal from './article/ArticleCustomImportModal.vue';
import ArticleFinishModal from './article/ArticleFinishModal.vue';
import { Plus, BookOpen } from 'lucide-vue-next';
import confetti from 'canvas-confetti';
import {
  getUpcomingCandidates,
  evaluateCandidates,
  matchChineseStream,
  isPunctuation,
  isPunctuationEquivalent
} from '../utils/phraseMatching';

const store = useWubiStore();

const articleList = ref<ArticleTopic[]>([...ARTICLES_LIBRARY]);
const currentArticle = ref<ArticleTopic>(articleList.value[0]);
const dictReady = ref(false);

const showLibraryModal = ref(false);

const selectArticleFromLibrary = (art: ArticleTopic) => {
  currentArticle.value = art;
  showLibraryModal.value = false;
  loadSavedProgress();
};

const textContainerRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const inputBuffer = ref('');
const isComposingRef = ref(false);
const composingText = ref('');
let lastCommittedText = '';
const isFocused = ref(true);
const charIndex = ref(0);
const hasError = ref(false);
const charHasMistake = ref(false);

const scrollToCurrentChar = () => {
  if (!textContainerRef.value) return;
  const currentEl = textContainerRef.value.querySelector('.char-unit.current') as HTMLElement | null;
  if (currentEl) {
    currentEl.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest'
    });
  }
};

const correctCount = ref(0);
const errorCount = ref(0);
const keystrokes = ref(0);
const backspaceCount = ref(0);
const startTime = ref<number | null>(null);
const timerInterval = ref<number | null>(null);
const isFinished = ref(false);

// 自定义文章导入状态
const showCustomModal = ref(false);

const articleChars = computed(() => {
  return currentArticle.value.content.split('');
});

const totalChars = computed(() => articleChars.value.length);

const progressPercent = computed(() => {
  if (totalChars.value === 0) return 0;
  return Math.min(100, Math.round((charIndex.value / totalChars.value) * 100));
});

const targetChar = computed(() => {
  return articleChars.value[charIndex.value] || '';
});

const displayInput = computed(() => {
  return inputBuffer.value || composingText.value;
});

const currentCharData = computed(() => {
  if (dictReady.value) {
    // 建立对 dictReady 响应式依赖，字典全量载入后自动重新计算
  }
  if (!targetChar.value || isPunctuation(targetChar.value)) return null;
  return lookupWubiChar(targetChar.value);
});

const targetFullCode = computed(() => {
  if (!currentCharData.value) return '';
  return getFullCode(currentCharData.value, store.version.value).toUpperCase();
});

const targetShortCode = computed(() => {
  if (!currentCharData.value) return '';
  return getShortCode(currentCharData.value, store.version.value)?.toUpperCase();
});

const currentRoots = computed(() => {
  if (!currentCharData.value) return [];
  return getRoots(currentCharData.value, store.version.value);
});

// 动态提取从当前字起始的候选集（单字、二字词、三字词、四字词）
const upcomingCandidates = computed(() => {
  return getUpcomingCandidates(articleChars.value, charIndex.value, store.version.value);
});

// 嗅探当前位置是否存在待打多字词组，用于界面智能提示
const upcomingPhrase = computed(() => {
  return upcomingCandidates.value.find(c => c.type === 'phrase');
});

const nextExpectedKey = computed(() => {
  if (isPunctuation(targetChar.value)) {
    return ' ';
  }
  if (!currentCharData.value) return null;
  const target = (store.inputMode.value === 'quick' && targetShortCode.value)
    ? targetShortCode.value
    : targetFullCode.value;
  if (!target) return null;

  const currentLen = (inputBuffer.value || composingText.value).length;
  if (currentLen < target.length) {
    return target[currentLen];
  }
  return ' ';
});

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

const handleArticleChange = (e: Event) => {
  const id = (e.target as HTMLSelectElement).value;
  const found = articleList.value.find(a => a.id === id);
  if (found) {
    currentArticle.value = found;
    loadSavedProgress();
  }
};

const loadSavedProgress = () => {
  const savedIdx = getArticleProgress(currentArticle.value.id);
  charIndex.value = Math.min(savedIdx, totalChars.value - 1);
  restartSession();
};

const restartSession = () => {
  inputBuffer.value = '';
  composingText.value = '';
  correctCount.value = 0;
  errorCount.value = 0;
  keystrokes.value = 0;
  backspaceCount.value = 0;
  startTime.value = null;
  hasError.value = false;
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

const restartArticle = () => {
  charIndex.value = 0;
  saveArticleProgress(currentArticle.value.id, 0);
  restartSession();
};

const nextArticle = () => {
  const idx = articleList.value.findIndex(a => a.id === currentArticle.value.id);
  const next = articleList.value[(idx + 1) % articleList.value.length];
  currentArticle.value = next;
  loadSavedProgress();
};

// 跟踪输入法组合状态与事件交互
const handleCompositionStart = () => {
  isComposingRef.value = true;
  composingText.value = '';
  hasError.value = false;
};

const handleCompositionUpdate = (e: CompositionEvent) => {
  isComposingRef.value = true;
  hasError.value = false;
  // 组字阶段仅保留英文字母五笔编码
  composingText.value = (e.data || (inputRef.value?.value || '')).replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4);
};

const handleCompositionEnd = (e: CompositionEvent) => {
  isComposingRef.value = false;
  composingText.value = '';
  const committedData = (e.data || (inputRef.value ? inputRef.value.value : '')).trim();
  if (inputRef.value) inputRef.value.value = '';
  if (committedData) {
    processCommit(committedData);
  }
};

// 核心流式汉字/标点核销：支持输入法直接上屏单字、两字词、四字成语乃至整句长句与标点
const processCommit = (text: string) => {
  lastCommittedText = text;
  inputBuffer.value = '';
  composingText.value = '';
  if (inputRef.value) inputRef.value.value = '';

  // 接收上屏内容（汉字、词组、成语或标点符号，过滤换行符）
  const cleanChars = Array.from(text).filter(c => !/\r|\n/.test(c));
  if (cleanChars.length === 0) return;

  const res = matchChineseStream(cleanChars, articleChars.value, charIndex.value);
  if (res.targetAdvancedCount > 0) {
    soundPlayer.playKey(store.audio.value, true);
    correctCount.value += res.matchedCount;
    keystrokes.value += res.matchedCount * 2;
    hasError.value = false;
    charHasMistake.value = false;
    advanceNextChar(res.targetAdvancedCount);
  }

  // 若存在错字，触发错误震慑与记错
  if (!res.isAllMatched) {
    hasError.value = true;
    soundPlayer.playKey(store.audio.value, false, true);
    charHasMistake.value = true;
    errorCount.value += (cleanChars.length - res.matchedCount);
    if (currentCharData.value) {
      store.recordMistake(
        currentCharData.value.char,
        text,
        targetFullCode.value,
        currentRoots.value
      );
    }
  }
};

const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const val = target.value;

  // 1. 若包含汉字或中文标点，属于输入法选字上屏
  if (/[\u4e00-\u9fa5，。！？；：“”‘’（）《》、\.,!?;:()"]/.test(val)) {
    // 若刚刚 compositionend 已经处理过完全相同的文本，避免重复核销
    if (lastCommittedText && val.trim() === lastCommittedText) {
      lastCommittedText = '';
      target.value = '';
      return;
    }
    processCommit(val.trim());
    target.value = '';
    return;
  }

  // 2. 若处于输入法组字阶段（纯英文字母），更新实时组字回显
  if (isComposingRef.value || (e as InputEvent).isComposing) {
    hasError.value = false;
    composingText.value = val.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4);
    return;
  }

  // 3. 纯英文字母模式 (直接敲五笔字母盲打)
  lastCommittedText = '';
  composingText.value = '';
  const clean = val.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4);
  inputBuffer.value = clean;
  target.value = clean;

  if (!clean) {
    hasError.value = false;
    return;
  }

  // 如果当前目标字符是标点符号，纯字母输入自动跳过标点，并作用于标点后的下一个汉字
  if (isPunctuation(targetChar.value)) {
    advanceNextChar(1);
  }

  // 动态结合当前单字与多字词组候选集进行比对
  const candidates = upcomingCandidates.value;
  const evalRes = evaluateCandidates(clean, candidates, false, store.commitMode.value);

  if (!evalRes.isPrefixMatch && !evalRes.isMatch) {
    hasError.value = true;
    soundPlayer.playKey(store.audio.value, false, true);

    if (!charHasMistake.value && currentCharData.value) {
      charHasMistake.value = true;
      errorCount.value += 1;
      store.recordMistake(
        currentCharData.value.char,
        clean,
        targetFullCode.value,
        currentRoots.value
      );
    }
  } else {
    hasError.value = false;
  }

  // 标准五笔铁律：
  // 满 4 码命中立即瞬间出字（0 延迟！无需按空格，彻底消灭 setTimeout 定时器带来的竞争问题）
  // 或 auto 模式下命中即刻出字
  const isAuto = store.commitMode.value === 'auto';
  const shouldAutoCommit = (isAuto && evalRes.isMatch) || (clean.length === 4 && evalRes.isMatch);
  if (shouldAutoCommit) {
    checkChar(false);
    target.value = '';
    if (inputRef.value) inputRef.value.value = '';
  }
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (isFinished.value) return;

  if (!startTime.value) {
    startTime.value = Date.now();
  }

  // 标点符号处理：敲空格或对应的标点按键直接跳过（IME 期间也允许）
  if (isPunctuation(targetChar.value)) {
    if (e.key === ' ' || e.code === 'Space' || isPunctuationEquivalent(e.key, targetChar.value)) {
      e.preventDefault();
      soundPlayer.playKey(store.audio.value, true);
      correctCount.value += 1;
      keystrokes.value += 1;
      advanceNextChar(1);
      return;
    }
  }

  // 空格键：出字键。IME 组字期间也允许穿透（inputBuffer 已由 handleInput 累积）
  if (e.key === ' ' || e.code === 'Space') {
    e.preventDefault();
    if (!inputBuffer.value.trim() && !composingText.value.trim()) return; // 空内容不提交
    checkChar(true);
    if (inputRef.value) inputRef.value.value = '';
    return;
  }

  // 以下按键 IME 组字期间交给输入法处理
  if (isComposingRef.value) return;

  if (e.key === 'Backspace') {
    soundPlayer.playKey(store.audio.value, false);
    backspaceCount.value += 1;
    hasError.value = false;
    inputBuffer.value = inputBuffer.value.slice(0, -1);
    if (inputRef.value) inputRef.value.value = inputBuffer.value;
    return;
  }

  if (e.key === 'Enter') {
    e.preventDefault();
    inputBuffer.value = '';
    composingText.value = '';
    if (inputRef.value) inputRef.value.value = '';
    hasError.value = false;
    return;
  }

  if (/^[a-zA-Z]$/.test(e.key)) {
    keystrokes.value += 1;
    soundPlayer.playKey(store.audio.value, false);
  }
};

const checkChar = (hasPressedSpace: boolean) => {
  if (isFinished.value) return;

  // 如果目标字符是标点符号且按了空格，跳过标点
  if (isPunctuation(targetChar.value)) {
    soundPlayer.playKey(store.audio.value, true);
    correctCount.value += 1;
    keystrokes.value += 1;
    advanceNextChar(1);
    return;
  }

  if (!currentCharData.value) {
    // 词库未收录字直接前进
    advanceNextChar(1);
    return;
  }

  const candidates = upcomingCandidates.value;
  const res = evaluateCandidates(
    inputBuffer.value,
    candidates,
    hasPressedSpace,
    store.commitMode.value
  );

  if (res.isMatch && res.matchedCandidate) {
    const step = res.matchedCandidate.length;
    soundPlayer.playKey(store.audio.value, true);
    correctCount.value += step;
    hasError.value = false;
    charHasMistake.value = false;
    inputBuffer.value = '';
    composingText.value = '';
    if (inputRef.value) inputRef.value.value = '';
    advanceNextChar(step);
  } else {
    hasError.value = true;
    soundPlayer.playKey(store.audio.value, false, true);

    if (!charHasMistake.value && currentCharData.value) {
      charHasMistake.value = true;
      errorCount.value += 1;
      store.recordMistake(
        currentCharData.value.char,
        inputBuffer.value,
        targetFullCode.value,
        currentRoots.value
      );
    }
  }
};

const advanceNextChar = (step = 1) => {
  charHasMistake.value = false;
  if (charIndex.value + step >= totalChars.value) {
    charIndex.value = totalChars.value;
    finishArticle();
  } else {
    charIndex.value += step;
    saveArticleProgress(currentArticle.value.id, charIndex.value);
    scrollToCurrentChar();
  }
};

const finishArticle = () => {
  isFinished.value = true;
  saveArticleProgress(currentArticle.value.id, 0);
  confetti({
    particleCount: 100,
    spread: 80,
    origin: { y: 0.6 }
  });
};

const onApplyCustomArticle = (payload: { title: string; text: string }) => {
  const newArt: ArticleTopic = {
    id: 'custom-' + Date.now(),
    title: payload.title || '自定义练习长文',
    author: '用户导入',
    category: 'modern',
    categoryName: '自定义',
    description: '用户自定义导入的文章打字题库',
    content: payload.text.replace(/\r\n/g, '\n'),
    charCount: payload.text.length
  };
  articleList.value.unshift(newArt);
  currentArticle.value = newArt;
  charIndex.value = 0;
  showCustomModal.value = false;
  restartSession();
};

const handleWindowKeyDown = (e: KeyboardEvent) => {
  const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
  if (targetTag === 'textarea' || (targetTag === 'input' && e.target !== inputRef.value) || targetTag === 'select') {
    return;
  }
  if (/^[a-zA-Z]$/.test(e.key) || e.key === ' ') {
    if (document.activeElement !== inputRef.value) {
      focusInput();
    }
  }
};

onMounted(() => {
  loadSavedProgress();
  window.addEventListener('keydown', handleWindowKeyDown);
  // 后台预热全量五笔字库，确保长文中所有冷僻字（如陋、苔、痕等）均有完整字根与编码提示
  loadFullParsedChars().then(() => {
    dictReady.value = true;
  });
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
  setTimeout(scrollToCurrentChar, 100);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleWindowKeyDown);
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
  }
});

watch(() => store.version.value, () => {
  restartSession();
});

watch(() => charIndex.value, () => {
  scrollToCurrentChar();
});
</script>

<style scoped>
.article-practice-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-width: 1080px;
  margin: 0 auto;
  width: 100%;
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  background: var(--card-bg);
  padding: 1rem 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.title-with-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.cat-pill {
  font-size: 0.72rem;
  font-weight: 700;
  background: rgba(99, 102, 241, 0.15);
  color: var(--accent);
  border: 1px solid var(--accent);
  padding: 2px 8px;
  border-radius: 999px;
}

.curr-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
}

.curr-meta {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.library-btn {
  background: rgba(99, 102, 241, 0.12);
  color: var(--accent);
  border: 1px solid var(--accent);
}

.library-btn:hover {
  background: var(--accent);
  color: #fff;
}

.custom-btn {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  color: var(--text-main);
}

.custom-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.article-select {
  padding: 7px 12px;
  border-radius: 8px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  font-size: 0.85rem;
  outline: none;
  cursor: pointer;
}


.article-stats-bar {
  display: grid;
  grid-template-columns: repeat(4, 1fr) 1.5fr;
  gap: 0.75rem;
  background: var(--card-bg);
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  align-items: center;
}

.mini-stat {
  display: flex;
  flex-direction: column;
}

.mini-stat .val {
  font-size: 1.2rem;
  font-weight: 800;
  font-family: monospace;
  color: var(--text-main);
}

.mini-stat .lbl {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.progress-bar-wrap {
  width: 100%;
  height: 8px;
  background: var(--bg-primary);
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--zone-2));
  transition: width 0.2s ease;
}

.article-viewport {
  position: relative;
  background: var(--card-bg);
  border: 2px solid var(--border-color);
  border-radius: 16px;
  padding: 2rem;
  min-height: 280px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  cursor: text;
}

.article-text-container {
  font-size: 1.35rem;
  line-height: 2.2;
  letter-spacing: 2px;
  max-height: 320px;
  overflow-y: auto;
  scroll-behavior: smooth;
  padding: 0.5rem 0.75rem 0.5rem 0.25rem;
}

.article-input-console {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  border-top: 1px dashed var(--border-color);
  padding-top: 1.25rem;
  width: 100%;
}

.char-info-pill {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  padding: 6px 16px;
  border-radius: 12px;
}

.focus-char {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--accent);
  line-height: 1;
}

.codes-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.badge {
  font-family: monospace;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
}

.badge.full {
  background: var(--accent-subtle);
  color: var(--accent);
  border: 1px solid var(--accent);
}

.badge.short {
  background: rgba(16, 185, 129, 0.15);
  color: var(--success);
  border: 1px solid var(--success);
}

.badge.phrase {
  background: rgba(192, 132, 252, 0.15);
  color: var(--zone-5);
  border: 1px solid var(--zone-5);
  font-weight: 700;
}

.badge.punct {
  background: rgba(245, 158, 11, 0.15);
  color: var(--warning, #f59e0b);
  border: 1px solid var(--warning, #f59e0b);
}

.focus-char.punct-char {
  color: var(--warning, #f59e0b);
}

.roots-tag {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.article-capsule {
  position: relative;
  width: 100%;
  max-width: 520px;
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

.article-capsule.focused {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-subtle), 0 4px 16px rgba(0, 0, 0, 0.12);
}

.article-capsule.error {
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

.char-unit {
  display: inline-block;
  padding: 0 1px;
  color: var(--text-main);
  transition: all 0.1s;
}

.char-unit.completed {
  color: var(--text-muted);
  opacity: 0.45;
}

.char-unit.current {
  background: var(--accent);
  color: #ffffff;
  border-radius: 4px;
  font-weight: 700;
  transform: scale(1.1);
  box-shadow: 0 0 10px var(--accent-subtle);
}

.char-unit.error {
  background: var(--error) !important;
  color: #ffffff !important;
}

.char-unit.punctuation {
  opacity: 0.7;
}
</style>
