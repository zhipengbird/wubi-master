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
        <div class="char-info-pill" v-if="currentCharData">
          <span class="focus-char">{{ targetChar }}</span>
          <div class="codes-group">
            <span class="badge full">全码: {{ targetFullCode }}</span>
            <span class="badge short" v-if="targetShortCode && targetShortCode !== targetFullCode">
              简码: {{ targetShortCode }}
            </span>
            <span class="badge phrase" v-if="upcomingPhrase">
              词组[{{ upcomingPhrase.text }}]: {{ upcomingPhrase.fullCode }}
            </span>
            <span class="roots-tag">拆解: {{ currentRoots.join(' + ') }}</span>
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
            @compositionend="handleCompositionEnd"
            @focus="isFocused = true"
            @blur="isFocused = false"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
          />

          <div class="capsule-content">
            <template v-if="inputBuffer">
              <span class="buffer-text">{{ inputBuffer }}</span>
              <span class="cursor cursor-blink"></span>
            </template>
            <template v-else>
              <span class="cursor cursor-blink" v-if="isFocused"></span>
              <span class="placeholder-text">键入上方高亮汉字编码，按空格出字...</span>
            </template>
          </div>

          <button class="space-btn-pill" @click.stop="checkChar(true)">
            ␣ 空格
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

    <!-- 题库大全大弹窗 (分类卡片与自由筛选) -->
    <div class="modal-backdrop" v-if="showLibraryModal" @click.self="showLibraryModal = false">
      <div class="modal-dialog library-modal-dialog">
        <div class="library-header">
          <div class="lib-title-wrap">
            <h3 class="modal-heading">📚 五笔长文实战题库大全</h3>
            <span class="lib-counter">共 {{ articleList.length }} 篇</span>
          </div>
          <button class="lib-close-btn" @click="showLibraryModal = false">
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
            :class="{ active: art.id === currentArticle.id }"
            @click="selectArticleFromLibrary(art)"
          >
            <div class="lib-card-top">
              <span class="lib-card-badge">{{ art.categoryName }}</span>
              <span class="lib-card-length">{{ art.charCount }} 字</span>
            </div>
            <h4 class="lib-card-title">{{ art.title }}</h4>
            <div class="lib-card-author">作者：{{ art.author }}</div>
            <p class="lib-card-desc">{{ art.description }}</p>
            <div class="lib-card-footer">
              <span class="lib-enter-hint" v-if="art.id === currentArticle.id">练习中...</span>
              <span class="lib-enter-btn" v-else>立即练习 ➔</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 自定义文章导入弹窗 (支持选文件导入 / 手动复制粘贴) -->
    <div class="modal-backdrop" v-if="showCustomModal" @click.self="showCustomModal = false">
      <div class="modal-dialog import-modal-dialog">
        <div class="import-modal-header">
          <div class="import-header-title">
            <h3 class="modal-heading">📝 导入文章练习题库</h3>
            <span class="import-badge">支持两种导入方式</span>
          </div>
          <button class="lib-close-btn" @click="showCustomModal = false">
            <X :size="20" />
          </button>
        </div>

        <!-- 导入模式切换 Tab -->
        <div class="import-tabs">
          <button
            class="import-tab-btn"
            :class="{ active: customImportMode === 'file' }"
            @click="customImportMode = 'file'"
          >
            <Upload :size="16" />
            <span>本地选文件导入 (.txt / .md)</span>
          </button>
          <button
            class="import-tab-btn"
            :class="{ active: customImportMode === 'paste' }"
            @click="customImportMode = 'paste'"
          >
            <Clipboard :size="16" />
            <span>手动粘贴正文</span>
          </button>
        </div>

        <!-- 方式一：文件拖拽/选取导入 -->
        <div class="file-upload-zone" v-if="customImportMode === 'file'">
          <input
            ref="fileInputRef"
            type="file"
            accept=".txt,.md,.text"
            class="hidden-file-input"
            @change="handleFileUpload"
          />
          <div
            class="drop-box"
            :class="{ 'has-file': uploadedFileName }"
            @click="triggerFileInput"
            @dragover.prevent
            @drop.prevent="handleFileDrop"
          >
            <div class="drop-icon-wrap">
              <FileText :size="36" v-if="uploadedFileName" class="file-icon-ready" />
              <Upload :size="36" v-else class="file-icon-idle" />
            </div>
            <div class="drop-texts">
              <span class="drop-primary" v-if="uploadedFileName">已加载文件：{{ uploadedFileName }}</span>
              <span class="drop-primary" v-else>点击选取电脑文件，或直接将文件拖拽至此</span>
              <span class="drop-sub">支持 UTF-8 编码的 .txt 纯文本或 .md 格式文件</span>
            </div>
          </div>
        </div>

        <!-- 通用设置：标题与正文预览/手动粘贴 -->
        <div class="import-fields">
          <div class="field-item">
            <label class="field-lbl">文章标题（选填，默认读取文件名或自拟）：</label>
            <input
              v-model="customTitle"
              type="text"
              placeholder="请输入或自定文章标题（如：公司公文通报、经典美文练习等）"
              class="custom-input-title"
            />
          </div>

          <div class="field-item">
            <div class="field-lbl-row">
              <label class="field-lbl">
                {{ customImportMode === 'file' ? '导入文件正文预览（可微调修改）：' : '请粘贴文章正文：' }}
              </label>
              <span class="char-counter-tag" v-if="customText">共 {{ customText.length }} 字</span>
            </div>
            <textarea
              v-model="customText"
              rows="7"
              :placeholder="customImportMode === 'file' ? '选择文件后此处将自动显示文本内容，亦可手动编辑...' : '请在此粘贴您想打字练习的任意中文篇章、新闻或小说段落...'"
              class="custom-textarea"
            ></textarea>
          </div>
        </div>

        <div class="modal-btns">
          <button class="btn-cancel" @click="showCustomModal = false">取消</button>
          <button class="btn-submit" :disabled="!customText.trim()" @click="applyCustomArticle">
            立即生成打字题
          </button>
        </div>
      </div>
    </div>

    <!-- 篇章完成结算弹窗 -->
    <div class="modal-backdrop" v-if="isFinished">
      <div class="modal-dialog finish-card">
        <h3 class="modal-heading">🏆 恭喜完成全篇文章！</h3>
        <p class="modal-sub">《{{ currentArticle.title }}》篇章打字战报</p>
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
          <button class="btn-submit" @click="restartArticle">重新练这篇</button>
          <button class="btn-cancel" @click="nextArticle">换下一篇</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useWubiStore } from '../stores/useWubiStore';
import type { ArticleTopic, TypingStats } from '../types/wubi';
import { ARTICLES_LIBRARY } from '../data/articles';
import { lookupWubiChar, getFullCode, getShortCode, getRoots } from '../data/wubiDict';
import { evaluateInput, calculateStats } from '../utils/wubiEngine';
import { soundPlayer } from '../utils/audio';
import { getArticleProgress, saveArticleProgress } from '../utils/storage';
import VirtualKeyboard from './VirtualKeyboard.vue';
import { Plus, BookOpen, X, Upload, FileText, Clipboard } from 'lucide-vue-next';
import confetti from 'canvas-confetti';
import { getUpcomingCandidates, evaluateCandidates, matchChineseStream } from '../utils/phraseMatching';

const store = useWubiStore();

const articleList = ref<ArticleTopic[]>([...ARTICLES_LIBRARY]);
const currentArticle = ref<ArticleTopic>(articleList.value[0]);

const showLibraryModal = ref(false);
const selectedCategoryTab = ref('all');

const availableCategories = computed(() => {
  const set = new Set<string>();
  articleList.value.forEach(a => set.add(a.categoryName));
  return Array.from(set);
});

const filteredArticleList = computed(() => {
  if (selectedCategoryTab.value === 'all') {
    return articleList.value;
  }
  return articleList.value.filter(a => a.categoryName === selectedCategoryTab.value);
});

const selectArticleFromLibrary = (art: ArticleTopic) => {
  currentArticle.value = art;
  showLibraryModal.value = false;
  loadSavedProgress();
};

const textContainerRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const inputBuffer = ref('');
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
const customImportMode = ref<'file' | 'paste'>('file');
const customTitle = ref('');
const customText = ref('');
const uploadedFileName = ref('');
const fileInputRef = ref<HTMLInputElement | null>(null);

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const readFileContent = (file: File) => {
  if (!file) return;
  uploadedFileName.value = file.name;
  if (!customTitle.value.trim()) {
    // 自动将文件名（去掉后缀）作为标题
    customTitle.value = file.name.replace(/\.[^/.]+$/, '');
  }
  const reader = new FileReader();
  reader.onload = (event) => {
    const content = event.target?.result as string;
    if (content) {
      customText.value = content.trim();
    }
  };
  reader.readAsText(file, 'UTF-8');
};

const handleFileUpload = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    readFileContent(file);
  }
};

const handleFileDrop = (e: DragEvent) => {
  const file = e.dataTransfer?.files?.[0];
  if (file) {
    readFileContent(file);
  }
};

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

const isPunctuation = (ch: string) => {
  return /[，。！？；：“”‘’（）《》、\s\.,!?;:()"]/.test(ch);
};

const currentCharData = computed(() => {
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
  if (!currentCharData.value) return null;
  const target = (store.inputMode.value === 'quick' && targetShortCode.value)
    ? targetShortCode.value
    : targetFullCode.value;
  if (!target) return null;

  const len = inputBuffer.value.length;
  if (len < target.length) {
    return target[len];
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

// 跟踪输入法组合状态与最近提交时间戳
const isComposingRef = ref(false);
let lastImeCommitTime = 0;

const handleCompositionStart = () => {
  isComposingRef.value = true;
};

const handleCompositionEnd = (e: CompositionEvent) => {
  isComposingRef.value = false;
  const committedData = e.data || (inputRef.value ? inputRef.value.value : '');
  if (committedData && /[\u4e00-\u9fa5]/.test(committedData)) {
    processChineseCommit(committedData);
  }
};

// 核心流式汉字核销：支持输入法直接上屏单字、两字词、四字成语乃至整句长句
const processChineseCommit = (text: string) => {
  lastImeCommitTime = Date.now();
  inputBuffer.value = '';
  if (inputRef.value) inputRef.value.value = '';

  // 过滤出所有汉字字符
  const chineseChars = Array.from(text).filter(c => /[\u4e00-\u9fa5]/.test(c));
  if (chineseChars.length === 0) return;

  const res = matchChineseStream(chineseChars, articleChars.value, charIndex.value);
  if (res.matchedCount > 0) {
    soundPlayer.playKey(store.audio.value, true);
    correctCount.value += res.matchedCount;
    keystrokes.value += res.matchedCount * 2;
    hasError.value = false;
    charHasMistake.value = false;
    advanceNextChar(res.matchedCount);
  }

  // 若存在错字，触发错误震慑与记错
  if (!res.isAllMatched) {
    hasError.value = true;
    soundPlayer.playKey(store.audio.value, false, true);
    charHasMistake.value = true;
    errorCount.value += (chineseChars.length - res.matchedCount);
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
  if (isComposingRef.value || (e as InputEvent).isComposing) {
    return;
  }

  const target = e.target as HTMLInputElement;
  const raw = target.value.trim();

  // 1. 若为汉字输入法直接上屏，调用流式多字流水线
  if (/[\u4e00-\u9fa5]/.test(raw)) {
    processChineseCommit(raw);
    return;
  }

  // 2. 纯英文字母模式 (直接敲五笔字母盲打)
  const clean = raw.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4);
  inputBuffer.value = clean;
  target.value = clean;

  if (!clean) {
    hasError.value = false;
    return;
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

  // 自动出字（auto 模式下命中，或满4码自动核验命中）
  const isAuto = store.commitMode.value === 'auto';
  const shouldAutoCommit = (isAuto && evalRes.isMatch) || (clean.length === 4 && evalRes.isMatch);
  if (shouldAutoCommit) {
    setTimeout(() => {
      if (inputBuffer.value === clean) {
        checkChar(false);
      }
    }, isAuto ? 90 : 120);
  }
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (isFinished.value) return;

  // 输入法正在组合候选时不拦截
  if (e.isComposing || isComposingRef.value || e.keyCode === 229) {
    return;
  }

  if (!startTime.value) {
    startTime.value = Date.now();
  }

  // 标点符号直接按任意键或者空格跳过
  if (isPunctuation(targetChar.value)) {
    e.preventDefault();
    advanceNextChar(1);
    return;
  }

  if (e.key === 'Backspace') {
    soundPlayer.playKey(store.audio.value, false);
    backspaceCount.value += 1;
    hasError.value = false;
    return;
  }

  if (e.key === ' ' || e.code === 'Space') {
    e.preventDefault();
    // 关键防抖：如果刚在 250ms 内完成输入法选词汉字上屏，该空格属于输入法确认键，忽略之
    if (Date.now() - lastImeCommitTime < 250) {
      return;
    }
    checkChar(true);
    return;
  }

  if (e.key === 'Enter') {
    e.preventDefault();
    inputBuffer.value = '';
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
  if (!currentCharData.value) {
    // 词库未收录字或标点直接前进
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

const applyCustomArticle = () => {
  if (!customText.value.trim()) return;
  const newArt: ArticleTopic = {
    id: 'custom-' + Date.now(),
    title: customTitle.value.trim() || '自定义练习长文',
    author: '用户导入',
    category: 'modern',
    categoryName: '自定义',
    description: '用户自定义导入的文章打字题库',
    content: customText.value.trim().replace(/\r\n/g, '\n'),
    charCount: customText.value.trim().length
  };
  articleList.value.unshift(newArt);
  currentArticle.value = newArt;
  charIndex.value = 0;
  showCustomModal.value = false;
  customText.value = '';
  customTitle.value = '';
  uploadedFileName.value = '';
  if (fileInputRef.value) fileInputRef.value.value = '';
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

/* 题库大全大模态框 */
.library-modal-dialog {
  max-width: 820px;
  width: 95%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
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
  color: var(--text-muted);
  transition: color 0.15s;
}

.lib-card-item:hover .lib-enter-btn {
  color: var(--accent);
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

/* 统一弹窗遮罩层（全屏浮层） */
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
}

.modal-sub {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.custom-input-title, .custom-textarea {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  font-size: 0.9rem;
  outline: none;
}

.import-modal-dialog {
  max-width: 680px;
  width: 95%;
  max-height: 88vh;
  overflow-y: auto;
}

.import-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.75rem;
}

.import-header-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.import-badge {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--accent);
  background: rgba(99, 102, 241, 0.12);
  padding: 2px 8px;
  border-radius: 999px;
}

.import-tabs {
  display: flex;
  gap: 0.5rem;
  background: var(--bg-primary);
  padding: 4px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
}

.import-tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  background: transparent;
  color: var(--text-muted);
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.import-tab-btn.active {
  background: var(--card-bg);
  color: var(--accent);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.file-upload-zone {
  width: 100%;
}

.hidden-file-input {
  display: none;
}

.drop-box {
  border: 2px dashed var(--border-color);
  border-radius: 12px;
  background: var(--bg-primary);
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.drop-box:hover {
  border-color: var(--accent);
  background: rgba(99, 102, 241, 0.04);
}

.drop-box.has-file {
  border-color: var(--success, #10b981);
  background: rgba(16, 185, 129, 0.06);
}

.file-icon-idle {
  color: var(--text-muted);
}

.file-icon-ready {
  color: var(--success, #10b981);
}

.drop-texts {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.drop-primary {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-main);
}

.drop-sub {
  font-size: 0.78rem;
  color: var(--text-muted);
}

.import-fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field-item {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.field-lbl {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-muted);
}

.field-lbl-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.char-counter-tag {
  font-size: 0.75rem;
  color: var(--accent);
  font-weight: 700;
  background: rgba(99, 102, 241, 0.1);
  padding: 1px 6px;
  border-radius: 4px;
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

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
</style>
