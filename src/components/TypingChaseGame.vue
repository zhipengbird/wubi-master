<template>
  <div class="chase-game-wrapper">
    <!-- 顶部赛事面板：模式与难度选择、状态仪表盘 -->
    <div class="game-dashboard">
      <div class="dash-left">
        <div class="game-title-badge">
          <span class="badge-icon">🏎️</span>
          <div>
            <h2 class="dash-title">五笔极速追逐赛 · Cyber Chase</h2>
            <p class="dash-desc">全速敲击汉字五笔编码！甩开追捕者，向终点线全力冲刺！</p>
          </div>
        </div>
      </div>

      <div class="dash-controls">
        <!-- 词库难度选择 -->
        <div class="ctrl-pill-box">
          <span class="ctrl-label">题库难度</span>
          <div class="pill-buttons">
            <button
              v-for="d in difficultyOptions"
              :key="d.id"
              class="dash-pill-btn"
              :class="{ active: selectedDifficulty === d.id }"
              :disabled="gameState === 'running'"
              @click="setDifficulty(d.id)"
            >
              {{ d.name }}
            </button>
          </div>
        </div>

        <!-- 追逐者 AI 速度（车速档位） -->
        <div class="ctrl-pill-box">
          <span class="ctrl-label">对手航速 (WPM)</span>
          <div class="pill-buttons">
            <button
              v-for="s in aiSpeedOptions"
              :key="s.wpm"
              class="dash-pill-btn"
              :class="{ active: selectedAiWpm === s.wpm }"
              :disabled="gameState === 'running'"
              @click="setAiWpm(s.wpm)"
            >
              {{ s.name }} ({{ s.wpm }})
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 赛道实况 (Highway Chase Track) -->
    <div class="track-arena">
      <!-- 赛道背景装饰：终点拱门、米数标尺 -->
      <div class="track-header-bar">
        <div class="track-distance-info">
          赛程总长：<strong>{{ TARGET_COUNT }} 字</strong> | 剩余距离：<span class="dist-num">{{ remainingChars }} 字</span>
        </div>
        <div class="track-gap-status" :class="gapClass">
          <span class="gap-icon">{{ gapIcon }}</span>
          <span>追逐间距：<strong>{{ Math.abs(chaseGap).toFixed(1) }}</strong> 字 ({{ gapText }})</span>
        </div>
      </div>

      <!-- 实时 2.5D 双跑道视图 -->
      <div class="lanes-container">
        <!-- 起点线标记 -->
        <div class="start-line-marker">
          <span class="marker-flag">🚦</span>
          <span class="marker-text">START</span>
        </div>

        <!-- 跑道主体区 -->
        <div class="lanes-main-body">
          <!-- 玩家赛道 (Player Lane) -->
          <div class="lane player-lane">
            <div class="lane-label">
              <span class="lane-tag tag-player">YOU 玩家</span>
              <span class="lane-speed">{{ playerWpm }} WPM</span>
            </div>
            <div class="lane-track-strip">
              <!-- 动态进度条填充层（全主题高对比度） -->
              <div
                class="lane-progress-fill player-fill"
                :style="{ width: playerProgressPercent + '%' }"
              ></div>
              <div
                class="racer player-racer"
                :style="{ left: playerProgressPercent + '%' }"
              >
                <div class="racer-avatar">🚀</div>
                <div class="racer-name-bubble">
                  你 ({{ playerIndex }}/{{ TARGET_COUNT }})
                  <div class="exhaust-flame" v-if="gameState === 'running'"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- 对手追逐者赛道 (Rival / AI Lane) -->
          <div class="lane ai-lane">
            <div class="lane-label">
              <span class="lane-tag tag-ai">RIVAL 对手 ({{ aiWpm }} WPM)</span>
              <span class="lane-speed">{{ aiWpm }} WPM</span>
            </div>
            <div class="lane-track-strip">
              <!-- 动态进度条填充层（对手危险红） -->
              <div
                class="lane-progress-fill ai-fill"
                :style="{ width: aiProgressPercent + '%' }"
              ></div>
              <div
                class="racer ai-racer"
                :style="{ left: aiProgressPercent + '%' }"
              >
                <div class="racer-avatar">🛸</div>
                <div class="racer-name-bubble ai-bubble">
                  暗影猎手 ({{ Math.floor(aiCharProgress) }}/{{ TARGET_COUNT }})
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 赛道终点线标志 -->
        <div class="finish-line-marker">
          <span class="finish-flag">🏁</span>
          <span class="finish-text">FINISH</span>
        </div>
      </div>
    </div>

    <!-- 打字核心战场 (Typing Arena) -->
    <div class="typing-cockpit" @click="focusInput">
      <!-- 隐藏原生输入框捕获物理按键与输入法上屏 -->
      <input
        ref="hiddenInputRef"
        type="text"
        :value="inputBuffer"
        class="hidden-native-input"
        @keydown="handleKeyDown"
        @input="handleNativeInput"
        @compositionstart="handleCompositionStart"
        @compositionupdate="handleCompositionUpdate"
        @compositionend="handleCompositionEnd"
        :disabled="gameState === 'finished' || gameState === 'failed'"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
        inputmode="latin"
      />

      <!-- 战斗状态条 -->
      <div class="cockpit-stats-bar">
        <div class="cockpit-stat">
          <span class="stat-label">我的极速</span>
          <span class="stat-val highlight">{{ playerWpm }} <small>WPM</small></span>
        </div>
        <div class="cockpit-stat">
          <span class="stat-label">连击数</span>
          <span class="stat-val combo-val" :class="{ 'on-fire': comboCount >= 5 }">
            {{ comboCount }} 🔥
          </span>
        </div>
        <div class="cockpit-stat">
          <span class="stat-label">正确率</span>
          <span class="stat-val">{{ accuracy }}%</span>
        </div>
        <div class="cockpit-stat">
          <span class="stat-label">用时</span>
          <span class="stat-val">{{ formattedTime }}</span>
        </div>
      </div>

      <!-- 待打字流传送带 (Target Words Conveyor) -->
      <div class="word-stream-window">
        <div
          v-for="(item, idx) in visibleTargetChars"
          :key="idx"
          class="word-stream-item"
          :class="{
            'is-current': idx === 0,
            'is-next': idx === 1,
            'is-future': idx > 1
          }"
        >
          <!-- 当前目标焦点字 -->
          <template v-if="idx === 0">
            <div class="current-target-card">
              <MiZiGe :text="item.char" size="large" :active="true" />
              <div class="target-hints">
                <div class="hint-pinyin">{{ item.pinyin || '—' }}</div>
                <div class="hint-code-row">
                  全码: <span class="hint-full-code">{{ getCharTargetCode(item) }}</span>
                  <span class="hint-short-badge" v-if="getCharShortCodes(item).length > 0">
                    简码: {{ getCharShortCodes(item).join(' / ') }}
                  </span>
                </div>
                <div class="hint-roots">
                  拆解:
                  <span v-for="(r, ri) in getCharTargetRoots(item)" :key="ri" class="hint-root-tag">{{ r }}</span>
                </div>
              </div>
            </div>
          </template>

          <!-- 后续即将到来的字 -->
          <template v-else>
            <div class="future-target-card">
              <MiZiGe :text="item.char" size="medium" />
              <span class="future-code">{{ getCharTargetCode(item) }}</span>
            </div>
          </template>
        </div>
      </div>

      <!-- 玩家按键敲击实时展示 (Input Buffer Display) -->
      <div class="input-keystroke-row">
        <div class="keystroke-label">
          <span>击键编码：</span>
          <span class="ime-mode-chip">
            ⚡ 自由输入：支持「全码/简码直接敲键」与「系统输入法汉字上屏」
          </span>
        </div>
        <div class="keystroke-slots">
          <div
            v-for="i in 4"
            :key="i"
            class="key-slot"
            :class="{
              'filled': displayInput.length >= i,
              'active-cursor': displayInput.length === i - 1,
              'error-shake': hasInputError
            }"
          >
            {{ displayInput[i - 1] || '' }}
          </div>
        </div>
        <div class="input-guide-text">
          敲击五笔编码按字母直接录入，支持按 <kbd>空格</kbd> 提交或退格 <kbd>Backspace</kbd> 修正
        </div>
      </div>

      <!-- 底部辅助虚拟键盘 (追逐赛击键提示) -->
      <div class="game-virtual-kb">
        <VirtualKeyboard :active-key="nextExpectedKey" />
      </div>

      <!-- 游戏启动/暂停/结算浮层遮罩 -->
      <div class="game-overlay-modal" v-if="gameState !== 'running'">
        <!-- 准备开始状态 -->
        <div class="overlay-card" v-if="gameState === 'idle'">
          <div class="modal-icon">🏁</div>
          <h3 class="modal-title">准备好开始追逐了吗？</h3>
          <p class="modal-desc">
            调整对手速度与题库难度，在被超越前冲过终点线！
          </p>

          <!-- 弹窗内的直观配置区 -->
          <div class="modal-config-zone">
            <div class="modal-config-row">
              <span class="m-config-label">对手航速 (AI WPM)：</span>
              <div class="m-pill-group">
                <button
                  v-for="s in aiSpeedOptions"
                  :key="s.wpm"
                  type="button"
                  class="m-pill-btn"
                  :class="{ active: selectedAiWpm === s.wpm }"
                  @click="setAiWpm(s.wpm)"
                >
                  <span class="pill-title">{{ s.name }}</span>
                  <span class="pill-sub">{{ s.wpm }} WPM</span>
                </button>
              </div>
            </div>

            <div class="modal-config-row">
              <span class="m-config-label">汉字难度：</span>
              <div class="m-pill-group">
                <button
                  v-for="d in difficultyOptions"
                  :key="d.id"
                  type="button"
                  class="m-pill-btn"
                  :class="{ active: selectedDifficulty === d.id }"
                  @click="setDifficulty(d.id)"
                >
                  <span class="pill-title">{{ d.name }}</span>
                </button>
              </div>
            </div>
          </div>

          <button class="start-btn pulse" @click="startGame">
            🚀 踩下油门！以 {{ aiWpm }} WPM 开战
          </button>
        </div>

        <!-- 胜利结算状态 -->
        <div class="overlay-card victory" v-else-if="gameState === 'finished'">
          <div class="modal-icon">🏆</div>
          <h3 class="modal-title win">大获全胜！成功甩开对手！</h3>
          <p class="modal-desc">
            你以 <strong>{{ playerWpm }} WPM</strong> 的极速率先冲过终点！领先暗影猎手 <strong>{{ (TARGET_COUNT - aiCharProgress).toFixed(1) }}</strong> 个字身！
          </p>
          <div class="result-stats-grid">
            <div class="res-stat-item">
              <span class="r-label">平均手速</span>
              <span class="r-val">{{ playerWpm }} WPM</span>
            </div>
            <div class="res-stat-item">
              <span class="r-label">准确率</span>
              <span class="r-val">{{ accuracy }}%</span>
            </div>
            <div class="res-stat-item">
              <span class="r-label">最高连击</span>
              <span class="r-val">{{ maxCombo }} 🔥</span>
            </div>
            <div class="res-stat-item">
              <span class="r-label">总计用时</span>
              <span class="r-val">{{ formattedTime }}</span>
            </div>
          </div>
          <div class="modal-actions">
            <button class="start-btn" @click="restartGame">🔄 再来一局</button>
            <button class="start-btn secondary" @click="increaseAiDifficulty">🔥 挑战更高航速</button>
          </div>
        </div>

        <!-- 失败被追上结算状态 -->
        <div class="overlay-card defeat" v-else-if="gameState === 'failed'">
          <div class="modal-icon">💥</div>
          <h3 class="modal-title lose">被暗影猎手超越拦截！</h3>
          <p class="modal-desc">
            暗影猎手率先撞线！你在第 <strong>{{ playerIndex }}</strong> / {{ TARGET_COUNT }} 字遗憾告负。<br />
            别灰心，稳住心态，记住简码少击键，再次挑战吧！
          </p>
          <div class="result-stats-grid">
            <div class="res-stat-item">
              <span class="r-label">最终完成度</span>
              <span class="r-val">{{ Math.round((playerIndex / TARGET_COUNT) * 100) }}%</span>
            </div>
            <div class="res-stat-item">
              <span class="r-label">当前速度</span>
              <span class="r-val">{{ playerWpm }} WPM</span>
            </div>
            <div class="res-stat-item">
              <span class="r-label">对手速度</span>
              <span class="r-val">{{ aiWpm }} WPM</span>
            </div>
          </div>
          <div class="modal-actions">
            <button class="start-btn" @click="restartGame">🔄 重整旗鼓，再次挑战</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useWubiStore } from '../stores/useWubiStore';
import {
  COMMON_500_CHARS,
  COMMON_1500_CHARS,
  LEVEL_1_CHARS,
  KEY_NAME_CHARS,
  getFullCode,
  getShortCode,
  getAllValidCodes,
  getRoots,
  loadFullParsedChars,
  type WubiCharData
} from '../data/wubiDict';
import { soundPlayer } from '../utils/audio';
import MiZiGe from './MiZiGe.vue';
import VirtualKeyboard from './VirtualKeyboard.vue';
import confetti from 'canvas-confetti';
import {
  getUpcomingCandidates,
  evaluateCandidates,
  matchChineseStream
} from '../utils/phraseMatching';

const store = useWubiStore();

// 比赛配置
const TARGET_COUNT = 30; // 每一局 30 个字
const hiddenInputRef = ref<HTMLInputElement | null>(null);

// 游戏状态: 'idle' | 'running' | 'finished' | 'failed'
const gameState = ref<'idle' | 'running' | 'finished' | 'failed'>('idle');

// 难度设置
type DifficultyType = 'level1' | 'common500' | 'common1500';
const selectedDifficulty = ref<DifficultyType>('common500');

const difficultyOptions = [
  { id: 'level1' as DifficultyType, name: '初阶 · 一简与键名' },
  { id: 'common500' as DifficultyType, name: '进阶 · 常用500字' },
  { id: 'common1500' as DifficultyType, name: '高能 · 常用1500字' }
];

// 对手 AI 速度选择
const selectedAiWpm = ref<number>(45);
const aiSpeedOptions = [
  { name: '新手巡航', wpm: 30 },
  { name: '竞技标兵', wpm: 45 },
  { name: '极速飞驰', wpm: 60 },
  { name: '大师试炼', wpm: 80 }
];

const setDifficulty = (d: DifficultyType) => {
  if (gameState.value === 'running') return;
  selectedDifficulty.value = d;
  generateGameChars();
};

const setAiWpm = (wpm: number) => {
  if (gameState.value === 'running') return;
  selectedAiWpm.value = wpm;
};

// 题库与指针
const targetChars = ref<WubiCharData[]>([]);
const playerIndex = ref<number>(0);
const inputBuffer = ref<string>('');
const isComposingRef = ref(false);
const composingText = ref('');
let lastCommittedText = '';
const hasInputError = ref<boolean>(false);

const displayInput = computed(() => {
  return (inputBuffer.value || composingText.value).slice(0, 4);
});

// 玩家统计
const correctKeystrokes = ref<number>(0);
const totalKeystrokes = ref<number>(0);
const comboCount = ref<number>(0);
const maxCombo = ref<number>(0);
const startTime = ref<number>(0);
const currentTime = ref<number>(0);
let gameTimer: ReturnType<typeof setInterval> | null = null;

// AI 追逐者状态
const aiCharProgress = ref<number>(0);
const aiWpm = computed(() => selectedAiWpm.value);

// 计算属性
const gameCharsList = computed(() => {
  return targetChars.value.map(item => item.char);
});

// 提取当前光标处的单字候选（全码与简码均备）
const upcomingGameCandidates = computed(() => {
  const currentItem = targetChars.value[playerIndex.value];
  if (!currentItem) return [];
  return [
    {
      type: 'single' as const,
      length: 1,
      text: currentItem.char,
      fullCode: getCharTargetCode(currentItem),
      shortCode: getCharShortCode(currentItem)
    }
  ];
});

const upcomingGamePhrase = computed(() => null);

const visibleTargetChars = computed(() => {
  return targetChars.value.slice(playerIndex.value, playerIndex.value + 6);
});

const remainingChars = computed(() => {
  return Math.max(0, TARGET_COUNT - playerIndex.value);
});

const playerProgressPercent = computed(() => {
  // 映射到 2% 到 94% 之间，确保起点时不被左侧截断，终点时贴合 FINISH 线
  const ratio = Math.min(1, Math.max(0, playerIndex.value / TARGET_COUNT));
  return 2 + ratio * 92;
});

const aiProgressPercent = computed(() => {
  const ratio = Math.min(1, Math.max(0, aiCharProgress.value / TARGET_COUNT));
  return 2 + ratio * 92;
});

const chaseGap = computed(() => {
  return playerIndex.value - aiCharProgress.value;
});

const gapClass = computed(() => {
  if (chaseGap.value >= 3) return 'gap-safe';
  if (chaseGap.value > 0) return 'gap-warning';
  return 'gap-danger';
});

const gapIcon = computed(() => {
  if (chaseGap.value >= 3) return '🟢';
  if (chaseGap.value > 0) return '🟡';
  return '🔴';
});

const gapText = computed(() => {
  if (chaseGap.value > 0) return '领先对手';
  if (chaseGap.value < 0) return '已被超越！危险！';
  return '齐头并进';
});

const elapsedTime = computed(() => {
  if (startTime.value === 0) return 0;
  return Math.max(0, (currentTime.value - startTime.value) / 1000);
});

const formattedTime = computed(() => {
  const sec = Math.floor(elapsedTime.value);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
});

const playerWpm = computed(() => {
  if (elapsedTime.value <= 0.5) return 0;
  return Math.round((playerIndex.value / elapsedTime.value) * 60);
});

const accuracy = computed(() => {
  if (totalKeystrokes.value === 0) return 100;
  return Math.round((correctKeystrokes.value / totalKeystrokes.value) * 100);
});

// 生成游戏字库池
const generateGameChars = () => {
  let pool: WubiCharData[] = [];
  if (selectedDifficulty.value === 'level1') {
    pool = [...LEVEL_1_CHARS, ...KEY_NAME_CHARS];
  } else if (selectedDifficulty.value === 'common1500') {
    pool = [...COMMON_1500_CHARS];
  } else {
    pool = [...COMMON_500_CHARS];
  }

  // 洗牌随机选取 TARGET_COUNT 个
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  targetChars.value = shuffled.slice(0, TARGET_COUNT);
  playerIndex.value = 0;
  aiCharProgress.value = 0;
  inputBuffer.value = '';
  composingText.value = '';
};

const getCharTargetCode = (item: WubiCharData) => {
  return getFullCode(item, store.version.value).toUpperCase();
};

const getCharShortCodes = (item: WubiCharData): string[] => {
  return getAllValidCodes(item.char, store.version.value).shorts;
};

const getCharShortCode = (item: WubiCharData) => {
  return getAllValidCodes(item.char, store.version.value).shorts[0] || getShortCode(item, store.version.value)?.toUpperCase();
};

const getCharTargetRoots = (item: WubiCharData) => {
  return getRoots(item, store.version.value);
};


const nextExpectedKey = computed(() => {
  const currentItem = targetChars.value[playerIndex.value];
  if (!currentItem) return null;

  const valid = getAllValidCodes(currentItem.char, store.version.value);
  const targetCode = (store.inputMode.value === 'quick' && valid.shorts[0])
    ? valid.shorts[0]
    : valid.full;
  if (!targetCode) return null;

  const currentLen = (inputBuffer.value || composingText.value).length;
  if (currentLen < targetCode.length) {
    return targetCode[currentLen];
  }
  return ' ';
});

const focusInput = () => {
  if (hiddenInputRef.value) {
    hiddenInputRef.value.focus();
  }
};

// 启动游戏
const startGame = () => {
  generateGameChars();
  gameState.value = 'running';
  startTime.value = Date.now();
  currentTime.value = Date.now();
  playerIndex.value = 0;
  aiCharProgress.value = 0;
  correctKeystrokes.value = 0;
  totalKeystrokes.value = 0;
  comboCount.value = 0;
  maxCombo.value = 0;
  inputBuffer.value = '';

  nextTick(() => {
    focusInput();
  });

  if (gameTimer) clearInterval(gameTimer);
  gameTimer = setInterval(updateGameLoop, 50);
};

// 游戏主心跳循环 (50ms)
const updateGameLoop = () => {
  if (gameState.value !== 'running') return;
  currentTime.value = Date.now();

  // AI 追逐者匀速前进：speed = aiWpm / 60 个字/秒
  const deltaSec = 0.05;
  const charsPerSec = aiWpm.value / 60;
  aiCharProgress.value += charsPerSec * deltaSec;

  // 胜负判定
  // 1. 玩家率先完成
  if (playerIndex.value >= TARGET_COUNT) {
    endGame(true);
    return;
  }

  // 2. AI 追上且先到达终点
  if (aiCharProgress.value >= TARGET_COUNT) {
    endGame(false);
    return;
  }
};

const endGame = (isWin: boolean) => {
  if (gameTimer) {
    clearInterval(gameTimer);
    gameTimer = null;
  }
  gameState.value = isWin ? 'finished' : 'failed';

  if (isWin) {
    soundPlayer.playKey(store.audio.value, true, false);
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });
  } else {
    soundPlayer.playKey(store.audio.value, false, true);
  }
};

const restartGame = () => {
  startGame();
};

const increaseAiDifficulty = () => {
  const current = selectedAiWpm.value;
  const foundIdx = aiSpeedOptions.findIndex(o => o.wpm === current);
  if (foundIdx !== -1 && foundIdx < aiSpeedOptions.length - 1) {
    selectedAiWpm.value = aiSpeedOptions[foundIdx + 1].wpm;
  }
  startGame();
};

// 键盘特殊功能键处理 (退格、回车、空格)
const handleKeyDown = (e: KeyboardEvent) => {
  if (gameState.value !== 'running') return;

  const key = e.key;

  // 忽略控制键
  if (e.ctrlKey || e.metaKey || e.altKey) return;

  // 退格删除（IME 组字期间交给 IME 处理）
  if (key === 'Backspace') {
    if (isComposingRef.value) return;
    if (inputBuffer.value.length > 0 || composingText.value.length > 0) {
      e.preventDefault();
      inputBuffer.value = inputBuffer.value.slice(0, -1);
      composingText.value = '';
      if (hiddenInputRef.value) {
        hiddenInputRef.value.value = inputBuffer.value;
      }
      hasInputError.value = false;
      soundPlayer.playKey(store.audio.value, false, false);
    }
    return;
  }

  // 空格键提交出字：IME 组字期间也允许穿透（用 composingText 出字）
  if (key === ' ' || key === 'Spacebar') {
    e.preventDefault();
    if (composingText.value) {
      inputBuffer.value = composingText.value;
      composingText.value = '';
      if (hiddenInputRef.value) hiddenInputRef.value.value = '';
    }
    if (!inputBuffer.value.trim()) return; // 空内容不提交
    verifyCurrentInput(true);
    return;
  }

  // IME 组字期间，其他按键（字母等）交给输入法
  if (isComposingRef.value) return;

  // 回车清空
  if (key === 'Enter') {
    e.preventDefault();
    inputBuffer.value = '';
    composingText.value = '';
    if (hiddenInputRef.value) {
      hiddenInputRef.value.value = '';
    }
    hasInputError.value = false;
    return;
  }
};

// 输入法组合开始 (例如敲下五笔/拼音候选字母)
const handleCompositionStart = () => {
  isComposingRef.value = true;
  composingText.value = '';
  hasInputError.value = false;
};

const handleCompositionUpdate = (e: CompositionEvent) => {
  isComposingRef.value = true;
  hasInputError.value = false;
  composingText.value = (e.data || (hiddenInputRef.value?.value || '')).replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4);
};

// 输入法组合结束 (用户在输入法候选框中敲击空格或数字完成选字上屏)
const handleCompositionEnd = (e: CompositionEvent) => {
  isComposingRef.value = false;
  const committedData = (e.data || (hiddenInputRef.value ? hiddenInputRef.value.value : '')).trim();
  composingText.value = '';
  if (hiddenInputRef.value) hiddenInputRef.value.value = '';
  if (committedData) {
    if (/[\u4e00-\u9fa5]/.test(committedData)) {
      processChineseCommit(committedData);
    } else {
      inputBuffer.value = committedData.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4);
      verifyCurrentInput(true);
    }
  }
};

// 统一汉字上屏提交处理逻辑（完美支持单个汉字及多字词组流式上屏）
const processChineseCommit = (text: string) => {
  lastCommittedText = text;
  inputBuffer.value = '';
  composingText.value = '';
  if (hiddenInputRef.value) {
    hiddenInputRef.value.value = '';
  }

  // 提取所有文字字符（过滤换行符）
  const cleanChars = Array.from(text).filter(c => !/\r|\n/.test(c));
  if (cleanChars.length === 0) return;

  const res = matchChineseStream(cleanChars, gameCharsList.value, playerIndex.value);
  if (res.targetAdvancedCount > 0) {
    onCharSuccess(res.targetAdvancedCount);
  }

  if (!res.isAllMatched) {
    onCharError();
  }
};

// 统一原生输入处理：完美兼顾「五笔输入法打汉字上屏」与「纯英文键盘敲五笔编码」
const handleNativeInput = (e: Event) => {
  if (gameState.value !== 'running') return;

  const target = e.target as HTMLInputElement;
  const val = target.value;

  // 1. 若包含汉字，属于输入法选字上屏
  if (/[\u4e00-\u9fa5]/.test(val)) {
    if (lastCommittedText && val.trim() === lastCommittedText) {
      lastCommittedText = '';
      target.value = '';
      return;
    }
    processChineseCommit(val.trim());
    target.value = '';
    return;
  }

  // 2. 若处于输入法组字阶段，提取组合中的字母实时在界面槽位中显示
  if (isComposingRef.value || (e as InputEvent).isComposing) {
    hasInputError.value = false;
    composingText.value = val.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4);
    return;
  }

  // 3. 纯英文五笔编码
  lastCommittedText = '';
  composingText.value = '';
  const clean = val.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4);
  inputBuffer.value = clean;
  target.value = clean;
  totalKeystrokes.value++;
  soundPlayer.playKey(store.audio.value, false, false);
  verifyCurrentInput(false);

  if (inputBuffer.value === '') {
    target.value = '';
  }
};

// 验证输入是否与当前字匹配（支持全码与简码任意输入，拒绝偏废）
const verifyCurrentInput = (forceSpace: boolean) => {
  const currentItem = targetChars.value[playerIndex.value];
  if (!currentItem) return;

  const currentBuf = (inputBuffer.value || composingText.value).trim().toUpperCase();
  if (!currentBuf) {
    hasInputError.value = false;
    return;
  }

  // 1. 汉字直接比对
  if (currentBuf === currentItem.char) {
    onCharSuccess(1);
    return;
  }

  const validCodes = getAllValidCodes(currentItem.char, store.version.value);
  const fullCode = validCodes.full || getCharTargetCode(currentItem);
  const shortCodes = validCodes.shorts;

  // 2. 全码命中（打出4位全码，或敲空格出字，立即成功）
  if (currentBuf === fullCode) {
    if (store.commitMode.value === 'auto' || forceSpace || currentBuf.length >= 4) {
      onCharSuccess(1);
      return;
    }
  }

  // 3. 简码命中（支持一简、二简如“木”打 SS、三简）
  if (shortCodes.includes(currentBuf)) {
    if (forceSpace || store.commitMode.value === 'auto') {
      onCharSuccess(1);
      return;
    }
  }

  if (forceSpace) {
    onCharError();
    return;
  }

  // 4. 前缀合法性（只要是全码或简码的前缀，均不报红）
  const isPrefix = validCodes.all.some(code => code.startsWith(currentBuf));
  hasInputError.value = !isPrefix;
};

const onCharSuccess = (step = 1) => {
  correctKeystrokes.value += Math.max(step, inputBuffer.value.length);
  comboCount.value += step;
  if (comboCount.value > maxCombo.value) {
    maxCombo.value = comboCount.value;
  }

  playerIndex.value = Math.min(TARGET_COUNT, playerIndex.value + step);
  inputBuffer.value = '';
  composingText.value = '';
  if (hiddenInputRef.value) {
    hiddenInputRef.value.value = '';
  }
  hasInputError.value = false;
  soundPlayer.playKey(store.audio.value, true, false);

  if (playerIndex.value >= TARGET_COUNT) {
    endGame(true);
  }
};

const onCharError = () => {
  comboCount.value = 0;
  hasInputError.value = true;
  soundPlayer.playKey(store.audio.value, false, true);

  inputBuffer.value = '';
  composingText.value = '';
  if (hiddenInputRef.value) {
    hiddenInputRef.value.value = '';
  }

  setTimeout(() => {
    hasInputError.value = false;
  }, 400);
};

onMounted(() => {
  generateGameChars();
  loadFullParsedChars();
});

onUnmounted(() => {
  if (gameTimer) {
    clearInterval(gameTimer);
    gameTimer = null;
  }
});
</script>

<style scoped>
.chase-game-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* 顶部仪表盘面板 */
.game-dashboard {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.game-title-badge {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.badge-icon {
  font-size: 2.2rem;
  background: var(--accent-subtle);
  padding: 8px;
  border-radius: 12px;
}

.dash-title {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--text-main);
  margin: 0;
}

.dash-desc {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-top: 2px;
}

.dash-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.25rem;
}

.ctrl-pill-box {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ctrl-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pill-buttons {
  display: flex;
  gap: 4px;
  background: var(--bg-primary);
  padding: 3px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
}

.dash-pill-btn {
  background: transparent;
  border: none;
  padding: 5px 12px;
  border-radius: 7px;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s;
}

.dash-pill-btn:hover:not(:disabled) {
  color: var(--text-main);
}

.dash-pill-btn.active {
  background: var(--accent);
  color: var(--accent-text, #ffffff);
}

/* 赛道实况赛场 */
.track-arena {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.track-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.track-distance-info strong {
  color: var(--text-main);
}

.dist-num {
  font-weight: 800;
  color: var(--accent);
}

.track-gap-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
}

.gap-safe {
  background: rgba(34, 197, 94, 0.15);
  color: #16a34a;
}

.gap-warning {
  background: rgba(234, 179, 8, 0.15);
  color: #ca8a04;
}

.gap-danger {
  background: rgba(239, 68, 68, 0.15);
  color: #dc2626;
  animation: blink 1s infinite alternate;
}

@keyframes blink {
  from { opacity: 0.8; }
  to { opacity: 1; transform: scale(1.03); }
}

/* 赛道跑道与赛车 */
.lanes-container {
  position: relative;
  display: flex;
  align-items: stretch;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 1.25rem 0.5rem;
  overflow: visible;
  gap: 0.5rem;
}

.start-line-marker {
  width: 44px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-right: 2px dashed rgba(255, 255, 255, 0.2);
  padding: 0 4px;
  z-index: 5;
}

.marker-flag {
  font-size: 1.2rem;
}

.marker-text {
  font-size: 0.65rem;
  font-weight: 900;
  letter-spacing: 1px;
  writing-mode: vertical-rl;
  color: var(--text-muted);
}

.lanes-main-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  position: relative;
  padding-right: 36px; /* 为右侧 FINISH 线预留安全区 */
}

.lane {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.lane-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0 4px;
}

.lane-tag {
  padding: 2px 8px;
  border-radius: 4px;
}

.tag-player {
  background: var(--accent-subtle);
  color: var(--accent);
}

.tag-ai {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.lane-speed {
  font-family: monospace;
  color: var(--text-muted);
}

.lane-track-strip {
  position: relative;
  height: 52px;
  background: var(--bg-secondary);
  border: 1.5px solid var(--border-color);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.15);
}

/* 进度条能量填充槽（全主题高辨识度） */
.lane-progress-fill {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  border-radius: 8px 0 0 8px;
  transition: width 0.15s linear;
  opacity: 0.55;
  pointer-events: none;
}

.lane-progress-fill.player-fill {
  background: linear-gradient(90deg, var(--accent-subtle), var(--accent));
  border-right: 2px solid var(--accent);
  box-shadow: 0 0 14px var(--accent-subtle);
}

.lane-progress-fill.ai-fill {
  background: linear-gradient(90deg, rgba(239, 68, 68, 0.18), #ef4444);
  border-right: 2px solid #ef4444;
  box-shadow: 0 0 14px rgba(239, 68, 68, 0.5);
}

.start-line-marker {
  width: 44px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-right: 2px dashed var(--border-color);
  padding: 0 4px;
  z-index: 5;
}

.finish-line-marker {
  width: 44px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-left: 2px dashed var(--border-color);
  padding: 0 4px;
  background: repeating-linear-gradient(
    45deg,
    var(--accent-subtle, rgba(56, 189, 248, 0.08)),
    var(--accent-subtle, rgba(56, 189, 248, 0.08)) 6px,
    transparent 6px,
    transparent 12px
  );
  z-index: 5;
}

.finish-flag {
  font-size: 1.2rem;
}

.finish-text {
  font-size: 0.65rem;
  font-weight: 900;
  letter-spacing: 1px;
  writing-mode: vertical-rl;
  color: var(--text-muted);
}

.racer {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  transition: left 0.15s linear;
  display: flex;
  align-items: center;
  z-index: 10;
}

.racer-avatar {
  font-size: 2rem;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.3));
}

.racer-name-bubble {
  position: absolute;
  bottom: calc(100% + 4px);
  left: 50%;
  transform: translateX(-50%);
  background: var(--accent);
  color: #fff;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 12px;
  white-space: nowrap;
}

.ai-bubble {
  background: #ef4444;
}

.exhaust-flame {
  position: absolute;
  right: -10px;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 6px;
  background: linear-gradient(90deg, #f59e0b, transparent);
  border-radius: 4px;
  animation: flicker 0.1s infinite alternate;
}

@keyframes flicker {
  from { opacity: 0.6; width: 8px; }
  to { opacity: 1; width: 14px; }
}

/* 打字核心战场 Cockpit */
.typing-cockpit {
  position: relative;
  background: var(--card-bg);
  border: 2px solid var(--border-color);
  border-radius: 20px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  cursor: text;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.hidden-native-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  font-size: 16px; /* 声明 16px 彻底杜绝 iOS Safari 唤起软键盘时的视口自动缩放变形 */
  cursor: text;
  z-index: 1;
}

.cockpit-stats-bar {
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: var(--bg-primary);
  border-radius: 14px;
  padding: 0.85rem 1.5rem;
  border: 1px solid var(--border-color);
}

.cockpit-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 600;
}

.stat-val {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--text-main);
  font-family: monospace;
}

.stat-val.highlight {
  color: var(--accent);
}

.combo-val.on-fire {
  color: #f59e0b;
  text-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
  animation: pulse 0.8s infinite alternate;
}

/* 传送带字流 */
.word-stream-window {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  overflow-x: auto;
  padding: 0.5rem 0;
}

.current-target-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: var(--bg-primary);
  border: 2px solid var(--accent);
  padding: 1.25rem 2rem;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.15);
}

.target-hints {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.hint-pinyin {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-muted);
}

.hint-code-row {
  font-size: 1.1rem;
  color: var(--text-main);
  display: flex;
  align-items: center;
  gap: 8px;
}

.hint-full-code {
  font-family: monospace;
  font-weight: 900;
  color: var(--accent);
  letter-spacing: 2px;
}

.hint-short-badge {
  background: rgba(34, 197, 94, 0.15);
  color: #16a34a;
  font-size: 0.8rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
}

.hint-roots {
  font-size: 0.85rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 4px;
}

.hint-root-tag {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 700;
  color: var(--text-main);
}

.future-target-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  opacity: 0.6;
}

.future-code {
  font-family: monospace;
  font-size: 0.8rem;
  color: var(--text-muted);
}

/* 击键展示槽位 */
.input-keystroke-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.keystroke-label {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.keystroke-slots {
  display: flex;
  gap: 0.75rem;
}

.key-slot {
  width: 56px;
  height: 64px;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: monospace;
  font-size: 1.8rem;
  font-weight: 900;
  color: var(--text-main);
  transition: all 0.15s;
}

.key-slot.filled {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-subtle);
}

.key-slot.active-cursor {
  border-color: var(--accent);
  box-shadow: 0 0 12px rgba(99, 102, 241, 0.4);
}

.key-slot.error-shake {
  border-color: #ef4444;
  color: #ef4444;
  animation: shake 0.3s;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-6px); }
  75% { transform: translateX(6px); }
}

.input-guide-text {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.input-guide-text kbd {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  color: var(--text-main);
}

/* 浮层结算与开始模态框 */
.game-overlay-modal {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1.5rem;
}

.overlay-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 2.5rem;
  max-width: 540px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.25rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes popIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

.modal-icon {
  font-size: 3.5rem;
}

.modal-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--text-main);
  margin: 0;
}

.modal-title.win {
  color: #22c55e;
}

.modal-title.lose {
  color: #ef4444;
}

.modal-desc {
  font-size: 0.95rem;
  color: var(--text-muted);
  line-height: 1.6;
  margin: 0;
}

.start-btn {
  background: var(--accent);
  color: var(--bg-primary);
  border: none;
  padding: 0.85rem 2.2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 16px var(--accent-subtle);
}

.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--accent-subtle);
}

[data-theme='retro-beige'] .start-btn,
[data-theme='paper-ink'] .start-btn {
  color: #ffffff;
}

.start-btn.pulse {
  animation: buttonPulse 1.5s infinite;
}

@keyframes buttonPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.04); }
  100% { transform: scale(1); }
}

.start-btn.secondary {
  background: var(--bg-primary);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  box-shadow: none;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  width: 100%;
  justify-content: center;
}

.result-stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  width: 100%;
  background: var(--bg-primary);
  padding: 1.25rem;
  border-radius: 14px;
  border: 1px solid var(--border-color);
}

.res-stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.r-label {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.r-val {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--text-main);
  font-family: monospace;
}

/* 弹窗配置区与药丸按钮（多主题高对比度适配） */
.modal-config-zone {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  padding: 1.25rem;
  border-radius: 14px;
}

.modal-config-row {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  width: 100%;
}

.m-config-label {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-muted);
}

.m-pill-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
}

.m-pill-btn {
  flex: 1 1 auto;
  min-width: 90px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1.5px solid var(--border-color);
  background: var(--card-bg);
  color: var(--text-main);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.m-pill-btn .pill-title {
  font-size: 0.85rem;
  font-weight: 700;
}

.m-pill-btn .pill-sub {
  font-size: 0.72rem;
  color: var(--text-muted);
  font-family: monospace;
}

.m-pill-btn:hover {
  border-color: var(--accent);
  background: var(--bg-secondary);
}

/* 选中的药丸按钮：高对比度、清晰的阴影和强调色 */
.m-pill-btn.active {
  background: var(--accent);
  color: var(--bg-primary) !important;
  border-color: var(--accent);
  font-weight: 800;
  box-shadow: 0 4px 14px var(--accent-subtle);
  transform: translateY(-1px);
}

.m-pill-btn.active .pill-title {
  color: var(--bg-primary) !important;
}

.m-pill-btn.active .pill-sub {
  color: var(--bg-primary) !important;
  opacity: 0.85;
}

[data-theme='retro-beige'] .m-pill-btn.active,
[data-theme='retro-beige'] .m-pill-btn.active .pill-title,
[data-theme='retro-beige'] .m-pill-btn.active .pill-sub,
[data-theme='paper-ink'] .m-pill-btn.active,
[data-theme='paper-ink'] .m-pill-btn.active .pill-title,
[data-theme='paper-ink'] .m-pill-btn.active .pill-sub {
  color: #ffffff !important;
}

/* paper-ink (浅色丹红印泥主题) 专属适配：
   在该主题下玩家主色为朱红(--accent: #b91c1c)，为避免对手AI也是红色无法分辨，
   将对手AI定制为对比强烈的深靛青/紫罗兰色(#4f46e5)，进度条填充透明度提升 */
[data-theme='paper-ink'] .ai-fill {
  background: linear-gradient(90deg, rgba(79, 70, 229, 0.15), #4f46e5);
  border-right: 2px solid #4f46e5;
  box-shadow: 0 0 14px rgba(79, 70, 229, 0.4);
}

[data-theme='paper-ink'] .ai-bubble {
  background: #4f46e5;
}

[data-theme='paper-ink'] .tag-ai {
  background: rgba(79, 70, 229, 0.12);
  color: #4f46e5;
}

[data-theme='paper-ink'] .lane-progress-fill,
[data-theme='retro-beige'] .lane-progress-fill {
  opacity: 0.72;
}

/* 模式提示标签 */
.ime-mode-chip {
  font-size: 0.75rem;
  font-weight: normal;
  color: var(--text-muted);
  margin-left: 8px;
}

.phrase-hint-chip {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--zone-5);
  background: rgba(192, 132, 252, 0.15);
  border: 1px solid rgba(192, 132, 252, 0.3);
  padding: 1px 8px;
  border-radius: 6px;
  margin-left: 8px;
}

.game-virtual-kb {
  margin-top: 1.5rem;
  width: 100%;
}
</style>
