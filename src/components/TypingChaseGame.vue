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
        <!-- 玩家赛道 (Player Lane) -->
        <div class="lane player-lane">
          <div class="lane-label">
            <span class="lane-tag tag-player">YOU 玩家</span>
            <span class="lane-speed">{{ playerWpm }} WPM</span>
          </div>
          <div class="lane-track-strip">
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

        <!-- 赛道终点线标志 -->
        <div class="finish-line-marker">
          <span class="finish-flag">🏁</span>
          <span class="finish-text">FINISH</span>
        </div>
      </div>
    </div>

    <!-- 打字核心战场 (Typing Arena) -->
    <div class="typing-cockpit" @click="focusInput">
      <!-- 隐藏原生输入框捕获物理按键 -->
      <input
        ref="hiddenInputRef"
        type="text"
        v-model="inputBuffer"
        class="hidden-native-input"
        @keydown="handleKeyDown"
        :disabled="gameState === 'finished' || gameState === 'failed'"
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
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
                  <span class="hint-short-badge" v-if="item.short86">简码: {{ item.short86 }}</span>
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
        <div class="keystroke-label">已击键位：</div>
        <div class="keystroke-slots">
          <div
            v-for="i in 4"
            :key="i"
            class="key-slot"
            :class="{
              'filled': inputBuffer.length >= i,
              'active-cursor': inputBuffer.length === i - 1,
              'error-shake': hasInputError
            }"
          >
            {{ inputBuffer[i - 1] || '' }}
          </div>
        </div>
        <div class="input-guide-text">
          敲击五笔编码按字母直接录入，支持按 <kbd>空格</kbd> 提交或退格 <kbd>Backspace</kbd> 修正
        </div>
      </div>

      <!-- 游戏启动/暂停/结算浮层遮罩 -->
      <div class="game-overlay-modal" v-if="gameState !== 'running'">
        <!-- 准备开始状态 -->
        <div class="overlay-card" v-if="gameState === 'idle'">
          <div class="modal-icon">🏁</div>
          <h3 class="modal-title">准备好开始追逐了吗？</h3>
          <p class="modal-desc">
            对手暗影猎手将以 <strong>{{ aiWpm }} WPM</strong> 的恒定巡航速度向终点冲刺！<br />
            你必须以更快的五笔手速完成 <strong>{{ TARGET_COUNT }} 个汉字</strong> 的敲击，在被超越前冲过终点线！
          </p>
          <button class="start-btn pulse" @click="startGame">
            🚀 踩下油门！开始追逐
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
  getRoots,
  type WubiCharData
} from '../data/wubiDict';
import { soundPlayer } from '../utils/audio';
import MiZiGe from './MiZiGe.vue';
import confetti from 'canvas-confetti';

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
const hasInputError = ref<boolean>(false);

// 玩家统计
const correctKeystrokes = ref<number>(0);
const totalKeystrokes = ref<number>(0);
const comboCount = ref<number>(0);
const maxCombo = ref<number>(0);
const startTime = ref<number>(0);
const currentTime = ref<number>(0);
let gameTimer: any = null;

// AI 追逐者状态
const aiCharProgress = ref<number>(0);
const aiWpm = computed(() => selectedAiWpm.value);

// 计算属性
const visibleTargetChars = computed(() => {
  return targetChars.value.slice(playerIndex.value, playerIndex.value + 6);
});

const remainingChars = computed(() => {
  return Math.max(0, TARGET_COUNT - playerIndex.value);
});

const playerProgressPercent = computed(() => {
  return Math.min(100, (playerIndex.value / TARGET_COUNT) * 100);
});

const aiProgressPercent = computed(() => {
  return Math.min(100, (aiCharProgress.value / TARGET_COUNT) * 100);
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
};

const getCharTargetCode = (item: WubiCharData) => {
  return getFullCode(item, store.version.value).toUpperCase();
};

const getCharTargetRoots = (item: WubiCharData) => {
  return getRoots(item, store.version.value);
};

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

// 键盘事件处理
const handleKeyDown = (e: KeyboardEvent) => {
  if (gameState.value !== 'running') return;

  // 忽略控制键
  if (e.ctrlKey || e.metaKey || e.altKey) return;

  const key = e.key;

  // 退格删除
  if (key === 'Backspace') {
    e.preventDefault();
    if (inputBuffer.value.length > 0) {
      inputBuffer.value = inputBuffer.value.slice(0, -1);
      hasInputError.value = false;
      soundPlayer.playKey(store.audio.value, false, false);
    }
    return;
  }

  // 空格键提交
  if (key === ' ' || key === 'Spacebar') {
    e.preventDefault();
    verifyCurrentInput(true);
    return;
  }

  // 普通字母键输入 A-Z
  if (/^[a-zA-Z]$/.test(key)) {
    e.preventDefault();
    const upperKey = key.toUpperCase();
    totalKeystrokes.value++;

    if (inputBuffer.value.length < 4) {
      inputBuffer.value += upperKey;
      soundPlayer.playKey(store.audio.value, false, false);

      // 实时判断是否可立即匹配
      verifyCurrentInput(false);
    }
  }
};

// 验证输入是否与当前字匹配
const verifyCurrentInput = (forceSpace: boolean) => {
  const currentItem = targetChars.value[playerIndex.value];
  if (!currentItem) return;

  const targetFull = getCharTargetCode(currentItem);
  const targetShort = (currentItem.short86 || '').toUpperCase();
  const currentBuf = inputBuffer.value.trim().toUpperCase();

  // 1. 空格直接出字 (简码匹配 或 全码未满四位匹配)
  if (forceSpace) {
    if (currentBuf === targetShort || currentBuf === targetFull) {
      onCharSuccess();
      return;
    } else {
      onCharError();
      return;
    }
  }

  // 2. 满四码自动校验提交
  if (currentBuf.length === 4) {
    if (currentBuf === targetFull) {
      onCharSuccess();
    } else {
      onCharError();
    }
  } else if (currentBuf.length < 4) {
    // 提前击键过程中的前缀核对
    if (!targetFull.startsWith(currentBuf) && !(targetShort && targetShort.startsWith(currentBuf))) {
      hasInputError.value = true;
    } else {
      hasInputError.value = false;
    }
  }
};

const onCharSuccess = () => {
  correctKeystrokes.value += inputBuffer.value.length;
  comboCount.value++;
  if (comboCount.value > maxCombo.value) {
    maxCombo.value = comboCount.value;
  }

  playerIndex.value++;
  inputBuffer.value = '';
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

  setTimeout(() => {
    hasInputError.value = false;
  }, 400);
};

onMounted(() => {
  generateGameChars();
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
  color: #fff;
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
  flex-direction: column;
  gap: 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 1rem 1.5rem 1rem 1rem;
  overflow: hidden;
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
}

.lane-tag {
  padding: 2px 8px;
  border-radius: 4px;
}

.tag-player {
  background: rgba(99, 102, 241, 0.2);
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
  height: 48px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-image: linear-gradient(90deg, transparent 50%, rgba(255, 255, 255, 0.03) 50%);
  background-size: 40px 100%;
}

.finish-line-marker {
  position: absolute;
  right: 12px;
  top: 0;
  bottom: 0;
  width: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-left: 2px dashed rgba(255, 255, 255, 0.3);
  background: repeating-linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.05),
    rgba(255, 255, 255, 0.05) 6px,
    transparent 6px,
    transparent 12px
  );
  z-index: 5;
}

.finish-flag {
  font-size: 1.2rem;
}

.finish-text {
  font-size: 0.6rem;
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
  opacity: 0;
  pointer-events: none;
  width: 1px;
  height: 1px;
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
  color: #fff;
  border: none;
  padding: 0.85rem 2.2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4);
}

.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.6);
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
</style>
