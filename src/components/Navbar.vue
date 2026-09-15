<template>
  <header class="navbar-wrapper">
    <div class="navbar-container">
      <!-- 品牌 Logo 与版本标签 -->
      <div class="brand-area" @click="store.setActiveTab('practice')">
        <div class="brand-icon">
          <span>五</span>
        </div>
        <div>
          <h1 class="brand-title">五笔学堂 <span class="brand-subtitle">Wubi Master</span></h1>
          <p class="brand-desc">沉浸式三代五笔学习与极速练习</p>
        </div>
      </div>

      <!-- 中间核心模块切换 Tab -->
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

      <!-- 右侧控制区：版本切换、打字模式、主题选择与音效 -->
      <div class="actions-area">
        <!-- 五笔版本切换 -->
        <div class="ctrl-group" title="切换五笔编码版本">
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
            <Volume2 v-if="store.audio.value !== 'none'" :size="18" />
            <VolumeX v-else :size="18" />
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
            <option value="tokyo-night">🌙 暗夜赛博</option>
            <option value="retro-beige">⌨️ 复古机械</option>
            <option value="nord-frost">❄️ 北欧极光</option>
            <option value="paper-ink">📜 纸墨素雅</option>
            <option value="matrix-green">💻 黑客终端</option>
          </select>
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
  padding: 0.55rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.brand-area {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  cursor: pointer;
  flex-shrink: 0;
}

.brand-icon {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  background: linear-gradient(135deg, var(--accent), var(--zone-5));
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  color: #fff;
  font-size: 1.15rem;
  box-shadow: 0 4px 10px var(--accent-subtle);
}

.brand-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1.2;
  white-space: nowrap;
}

.brand-subtitle {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--accent);
  margin-left: 4px;
}

.brand-desc {
  font-size: 0.72rem;
  color: var(--text-muted);
  white-space: nowrap;
}

@media (max-width: 1240px) {
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
  overflow-x: auto;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 9px;
  border-radius: 7px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: 0.82rem;
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
  color: #ffffff;
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
  gap: 0.6rem;
  flex-shrink: 0;
}

.ctrl-group {
  display: flex;
  align-items: center;
  gap: 6px;
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
</style>
