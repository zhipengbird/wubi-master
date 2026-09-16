<template>
  <header class="navbar-wrapper">
    <div class="navbar-container">
      <!-- 品牌 Logo 与版本标签 -->
      <div class="brand-area" @click="store.setActiveTab('practice')">
        <div class="brand-icon">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="brand-svg">
            <defs>
              <linearGradient id="nav-seal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#e11d48"/>
                <stop offset="100%" stop-color="#9f1239"/>
              </linearGradient>
            </defs>
            <rect x="8" y="8" width="84" height="84" rx="20" fill="url(#nav-seal-grad)" stroke="#f43f5e" stroke-width="2"/>
            <path d="M8 50 H92 M50 8 V92" stroke="#ffffff" stroke-opacity="0.18" stroke-dasharray="3 3" stroke-width="1.2"/>
            <rect x="20" y="20" width="60" height="60" rx="9" fill="none" stroke="#ffffff" stroke-opacity="0.32" stroke-width="1.5"/>
            <path d="M30 35 H70" stroke="#ffffff" stroke-width="6.5" stroke-linecap="square"/>
            <path d="M49 35 V49 H63 V65 M37 49 H49 V65" stroke="#ffffff" stroke-width="6.5" stroke-linecap="square" stroke-linejoin="miter"/>
            <path d="M26 65 H74" stroke="#ffffff" stroke-width="7" stroke-linecap="square"/>
          </svg>
        </div>
        <div>
          <h1 class="brand-title">五笔学堂 <span class="brand-subtitle">Wubi Master</span></h1>
          <p class="brand-desc">沉浸式三代五笔学习与极速练习</p>
        </div>
      </div>

      <!-- 右侧组合区：上排核心功能 Tab，下排右对齐偏好设置（版本、音效、主题） -->
      <div class="nav-right-cluster">
        <!-- 上排核心模块切换 Tab -->
        <nav class="nav-tabs">
          <button
            v-for="tab in tabOptions"
            :key="tab.id"
            class="tab-btn"
            :class="{ active: store.activeTab.value === tab.id }"
            @click="store.setActiveTab(tab.id)"
          >
            <component :is="tab.icon" class="tab-icon" :size="16" />
            <span>{{ tab.name }}</span>
            <span v-if="tab.id === 'mistakes' && mistakeCount > 0" class="badge-count">
              {{ mistakeCount }}
            </span>
          </button>
        </nav>

        <!-- 下排控制区：靠右对齐展示五笔版本、打字音效与主题 -->
        <div class="actions-area">
          <!-- 五笔版本切换 -->
          <div class="ctrl-group">
            <span class="ctrl-label">词库版本:</span>
            <div class="pill-group">
              <button
                v-for="ver in versionOptions"
                :key="ver.id"
                class="pill-btn"
                :class="{ active: store.version.value === ver.id }"
                @click="store.setVersion(ver.id)"
              >
                {{ ver.label }}
              </button>
            </div>
          </div>

          <!-- 音效选择 -->
          <div class="ctrl-group">
            <button class="icon-btn" :title="'按键音效: ' + currentAudioLabel" @click="cycleAudio">
              <Volume2 v-if="store.audio.value !== 'none'" :size="17" />
              <VolumeX v-else :size="17" />
              <span class="btn-text">{{ currentAudioLabel }}</span>
            </button>
          </div>

          <!-- 主题切换 -->
          <div class="ctrl-group">
            <select
              :value="store.theme.value"
              @change="handleThemeChange"
              class="theme-select"
            >
              <optgroup label="✨ 酷炫暗色">
                <option value="tokyo-night">🌙 暗夜赛博</option>
                <option value="cyber-neon">⚡ 霓虹幻境</option>
                <option value="dracula-vampire">🧛 德古拉之夜</option>
                <option value="deep-space">🌌 深空星际</option>
                <option value="matrix-green">💻 黑客终端</option>
                <option value="nord-frost">❄️ 北欧极光</option>
              </optgroup>
              <optgroup label="🍃 简洁明亮">
                <option value="pure-white">⚪ 极简纯白</option>
                <option value="paper-ink">📜 纸墨素雅</option>
                <option value="retro-beige">⌨️ 复古机械</option>
                <option value="matcha-zen">🍵 抹茶禅意</option>
                <option value="warm-latte">☕ 暖阳浅咖</option>
              </optgroup>
            </select>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useWubiStore, type MainTab } from '../stores/useWubiStore';
import type { WubiVersion, AudioEffect, ThemeName } from '../types/wubi';
import {
  Keyboard,
  BookOpen,
  Search,
  BookMarked,
  FileText,
  Volume2,
  VolumeX,
  Sparkles,
  Gamepad2
} from 'lucide-vue-next';

const store = useWubiStore();

const mistakeCount = computed(() => store.mistakeList.value.length);

const tabOptions = [
  { id: 'practice' as MainTab, name: '打字特训', icon: Keyboard },
  { id: 'article' as MainTab, name: '长文实战', icon: FileText },
  { id: 'game' as MainTab, name: '极速追逐赛', icon: Gamepad2 },
  { id: 'keyboard' as MainTab, name: '字根大键盘', icon: Sparkles },
  { id: 'rules' as MainTab, name: '拆字法则', icon: BookOpen },
  { id: 'lookup' as MainTab, name: '五笔字典', icon: Search },
  { id: 'mistakes' as MainTab, name: '错题本', icon: BookMarked },
];

const versionOptions: { id: WubiVersion; label: string }[] = [
  { id: '86', label: '86版' },
  { id: '98', label: '98版' },
  { id: 'newCentury', label: '新世纪' },
];

const currentAudioLabel = computed(() => {
  switch (store.audio.value) {
    case 'blue-switch': return '青轴';
    case 'red-switch': return '红轴';
    case 'typewriter': return '打字机';
    case 'none': return '静音';
  }
});

const cycleAudio = () => {
  const list: AudioEffect[] = ['blue-switch', 'red-switch', 'typewriter', 'none'];
  const nextIdx = (list.indexOf(store.audio.value) + 1) % list.length;
  store.setAudio(list[nextIdx]);
};

const handleThemeChange = (e: Event) => {
  const val = (e.target as HTMLSelectElement).value as ThemeName;
  store.setTheme(val);
};
</script>

<style scoped>
.navbar-wrapper {
  border-bottom: 1px solid var(--border-color);
  background: var(--card-bg);
  backdrop-filter: blur(12px);
  position: sticky;
  top: 0;
  z-index: 50;
}

.navbar-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0.65rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}

.brand-area {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  flex-shrink: 0;
}

.nav-right-cluster {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.45rem;
  flex-shrink: 0;
}

.brand-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(225, 29, 72, 0.22);
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.brand-area:hover .brand-icon {
  transform: scale(1.08) rotate(-3deg);
}

.brand-svg {
  width: 100%;
  height: 100%;
  display: block;
  border-radius: 10px;
}

.brand-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1.2;
  white-space: nowrap;
}

.brand-subtitle {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--accent);
  margin-left: 4px;
}

.brand-desc {
  font-size: 0.75rem;
  color: var(--text-muted);
  white-space: nowrap;
}

@media (max-width: 1200px) {
  .brand-desc {
    display: none;
  }
}

.nav-tabs {
  display: flex;
  align-items: center;
  background: var(--bg-primary);
  padding: 3px;
  border-radius: 9px;
  border: 1px solid var(--border-color);
  gap: 2px;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 11px;
  border-radius: 7px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: 0.84rem;
  font-weight: 500;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
  white-space: nowrap;
}

.tab-btn:hover {
  color: var(--text-main);
  background: var(--bg-secondary);
}

.tab-btn.active {
  background: var(--accent);
  color: var(--accent-text, #ffffff);
  font-weight: 600;
}

.badge-count {
  background: var(--error);
  color: #fff;
  font-size: 0.65rem;
  padding: 1px 5px;
  border-radius: 999px;
  font-weight: 700;
}

.actions-area {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
}

.ctrl-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.ctrl-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  user-select: none;
}

.pill-group {
  display: flex;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 2px;
}

.pill-btn {
  padding: 3px 8px;
  font-size: 0.75rem;
  border: none;
  background: transparent;
  color: var(--text-muted);
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.pill-btn.active {
  background: var(--bg-secondary);
  color: var(--accent);
  font-weight: 600;
}

.icon-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px;
  border-radius: 7px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-main);
  font-size: 0.78rem;
  cursor: pointer;
  white-space: nowrap;
}

.icon-btn:hover {
  border-color: var(--accent);
}

.theme-select {
  padding: 4px 8px;
  border-radius: 7px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-main);
  font-size: 0.78rem;
  cursor: pointer;
  outline: none;
  white-space: nowrap;
}

.theme-select:focus {
  border-color: var(--accent);
}

.theme-select optgroup {
  background: var(--bg-secondary);
  color: var(--text-muted);
  font-size: 0.75rem;
  font-weight: 600;
}

.theme-select option {
  background: var(--bg-primary);
  color: var(--text-main);
  font-size: 0.78rem;
}

@media (max-width: 992px) {
  .navbar-container {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .nav-right-cluster {
    align-items: stretch;
  }

  .nav-tabs {
    overflow-x: auto;
  }

  .actions-area {
    justify-content: flex-start;
    overflow-x: auto;
  }
}
</style>
