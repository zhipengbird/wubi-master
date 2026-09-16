<template>
  <div class="keyboard-section">
    <!-- 区位说明图例 -->
    <div class="zones-legend">
      <div class="legend-list">
        <div
          v-for="zone in zoneList"
          :key="zone.id"
          class="zone-capsule"
          :class="{ 'is-active': activeZoneId === zone.id }"
          :style="{ '--zone-color': zone.color }"
        >
          <span class="zone-badge"></span>
          <span class="zone-name">{{ zone.name }}</span>
          <span class="zone-stroke">起笔 {{ zone.stroke }}</span>
        </div>

        <div class="legend-divider"></div>

        <div
          class="zone-capsule z-capsule"
          :class="{ 'is-active': activeZoneId === 0 }"
        >
          <span class="z-badge">Z</span>
          <span class="zone-name">Z 键</span>
          <span class="zone-stroke">通配与学习</span>
        </div>
      </div>
    </div>

    <!-- 交互式虚拟键盘主板 -->
    <div class="keyboard-board">
      <!-- 第一排：Q W E R T   Y U I O P -->
      <div class="kb-row">
        <div
          v-for="key in row1"
          :key="key"
          class="wubi-key key-cap"
          :class="[
            getKeyZoneClass(key),
            { active: activeKey === key, pressed: pressedKey === key }
          ]"
          @mouseenter="onHover(key)"
          @mouseleave="onLeave"
          @click="onClickKey(key)"
        >
          <div class="key-header">
            <span class="key-letter">{{ key }}</span>
            <span class="key-code" v-if="getKeyInfo(key)">{{ getKeyInfo(key)?.code }}</span>
          </div>
          <div class="key-name" v-if="getKeyInfo(key)">
            {{ getKeyInfo(key)?.keyName }}
          </div>
          <div class="key-roots" v-if="getKeyInfo(key)">
            {{ getKeyInfo(key)?.mainRoots.slice(0, 3).join(' ') }}
          </div>
        </div>
      </div>

      <!-- 第二排：A S D F G   H J K L -->
      <div class="kb-row row-offset-1">
        <div
          v-for="key in row2"
          :key="key"
          class="wubi-key key-cap"
          :class="[
            getKeyZoneClass(key),
            { active: activeKey === key, pressed: pressedKey === key }
          ]"
          @mouseenter="onHover(key)"
          @mouseleave="onLeave"
          @click="onClickKey(key)"
        >
          <div class="key-header">
            <span class="key-letter">{{ key }}</span>
            <span class="key-code" v-if="getKeyInfo(key)">{{ getKeyInfo(key)?.code }}</span>
          </div>
          <div class="key-name" v-if="getKeyInfo(key)">
            {{ getKeyInfo(key)?.keyName }}
          </div>
          <div class="key-roots" v-if="getKeyInfo(key)">
            {{ getKeyInfo(key)?.mainRoots.slice(0, 3).join(' ') }}
          </div>
        </div>
      </div>

      <!-- 第三排：Z X C V B N M -->
      <div class="kb-row row-offset-2">
        <div
          v-for="key in row3"
          :key="key"
          class="wubi-key key-cap"
          :class="[
            getKeyZoneClass(key),
            { active: activeKey === key, pressed: pressedKey === key, 'z-key': key === 'Z' }
          ]"
          @mouseenter="onHover(key)"
          @mouseleave="onLeave"
          @click="onClickKey(key)"
        >
          <div class="key-header">
            <span class="key-letter">{{ key }}</span>
            <span class="key-code" v-if="getKeyInfo(key)">{{ getKeyInfo(key)?.code }}</span>
            <span class="key-code" v-else-if="key === 'Z'">*</span>
          </div>
          <div class="key-name" v-if="getKeyInfo(key)">
            {{ getKeyInfo(key)?.keyName }}
          </div>
          <div class="key-name z-name" v-else-if="key === 'Z'">
            查询
          </div>
          <div class="key-roots" v-if="getKeyInfo(key)">
            {{ getKeyInfo(key)?.mainRoots.slice(0, 3).join(' ') }}
          </div>
          <div class="key-roots" v-else-if="key === 'Z'">
            通配符
          </div>
        </div>
      </div>

      <!-- 第四排：空格键 -->
      <div class="kb-row">
        <div
          class="wubi-key space-cap"
          :class="{ pressed: pressedKey === ' ' }"
          @click="onClickSpace"
        >
          <span class="space-text">SPACE（确认 / 简码出字）</span>
        </div>
      </div>
    </div>

    <!-- 底部或选定键位的字根深度卡片 -->
    <div class="detail-card" v-if="currentKeyData">
      <div class="detail-header">
        <div class="detail-badge" :style="{ background: currentZoneColor }">
          {{ currentKeyData.key }} 键 (区位 {{ currentKeyData.code }})
        </div>
        <div class="detail-name">键名汉字：<strong>{{ currentKeyData.keyName }}</strong></div>
        <div class="detail-version">当前版本：{{ versionName }}</div>
      </div>

      <div class="detail-mnemonic">
        <span class="label">助记口诀：</span>
        <span class="text highlight">{{ currentKeyData.mnemonic }}</span>
      </div>

      <div class="detail-roots-grid">
        <div class="label">包含所有字根：</div>
        <div class="roots-tags">
          <span v-for="r in currentKeyData.allRoots" :key="r" class="root-tag">
            {{ r }}
          </span>
        </div>
      </div>

      <div class="detail-notes" v-if="currentKeyData.notes">
        💡 提示：{{ currentKeyData.notes }}
      </div>
    </div>
    <div class="detail-card empty-card" v-else>
      <div class="empty-tip">
        👉 鼠标移动或点击键盘任意键位，查看对应五笔字根拆解、助记口诀与区位规律。
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useWubiStore } from '../stores/useWubiStore';
import { getKeyboardByVersion, ZONE_CONFIG } from '../data/keyboards';
import type { KeyRootInfo } from '../types/wubi';
import { soundPlayer } from '../utils/audio';

const props = defineProps<{
  activeKey?: string | null;
}>();

const store = useWubiStore();

const row1 = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
const row2 = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
const row3 = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'];

const pressedKey = ref<string | null>(null);
const hoveredKey = ref<string | null>(null);

const currentKeyboard = computed(() => getKeyboardByVersion(store.version.value));

const zoneList = computed(() => Object.values(ZONE_CONFIG));

const versionName = computed(() => {
  switch (store.version.value) {
    case '98': return '98版五笔';
    case 'newCentury': return '新世纪版五笔';
    case '86': default: return '86版五笔';
  }
});

const getKeyInfo = (key: string): KeyRootInfo | undefined => {
  return currentKeyboard.value[key];
};

const activeZoneId = computed(() => {
  const k = hoveredKey.value || props.activeKey || pressedKey.value;
  if (!k) return null;
  const upper = k.toUpperCase();
  if (upper === 'Z') return 0;
  const info = getKeyInfo(upper);
  return info ? info.zone : null;
});

const getKeyZoneClass = (key: string): string => {
  const info = getKeyInfo(key);
  if (!info || info.zone === 0) return '';
  return `zone-${info.zone}`;
};

const onHover = (key: string) => {
  hoveredKey.value = key;
};

const onLeave = () => {
  hoveredKey.value = null;
};

const triggerPress = (key: string) => {
  pressedKey.value = key;
  soundPlayer.playKey(store.audio.value, key === ' ');
  setTimeout(() => {
    if (pressedKey.value === key) {
      pressedKey.value = null;
    }
  }, 150);
};

const onClickKey = (key: string) => {
  triggerPress(key);
  hoveredKey.value = key;
};

const onClickSpace = () => {
  triggerPress(' ');
};

const currentKey = computed(() => {
  return hoveredKey.value || props.activeKey || 'G';
});

const currentKeyData = computed(() => {
  return getKeyInfo(currentKey.value);
});

const currentZoneColor = computed(() => {
  if (!currentKeyData.value) return 'var(--accent)';
  if (currentKeyData.value.zone === 0) return 'var(--text-muted)';
  return `var(--zone-${currentKeyData.value.zone})`;
});
</script>

<style scoped>
.keyboard-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
}

.zones-legend {
  display: flex;
  justify-content: center;
  width: 100%;
  max-width: 960px;
}

.legend-list {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 7px 14px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.zone-capsule {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 11px;
  border-radius: 7px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  font-size: 0.78rem;
  color: var(--text-main);
  transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
}

.zone-capsule:hover {
  border-color: var(--zone-color);
  background: var(--bg-secondary);
}

.zone-capsule.is-active {
  border-color: var(--zone-color);
  background: var(--accent-subtle);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.zone-badge {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--zone-color);
  flex-shrink: 0;
}

.zone-name {
  font-weight: 600;
  color: var(--text-main);
}

.zone-stroke {
  color: var(--text-muted);
  font-size: 0.72rem;
}

.legend-divider {
  width: 1px;
  height: 18px;
  background: var(--border-color);
  margin: 0 2px;
}

.z-capsule {
  border-style: dashed;
}

.z-capsule:hover,
.z-capsule.is-active {
  border-color: var(--accent);
  border-style: solid;
}

.z-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 15px;
  height: 15px;
  font-size: 0.65rem;
  font-weight: 700;
  border-radius: 3px;
  background: var(--bg-tertiary);
  color: var(--text-muted);
  flex-shrink: 0;
}

.z-capsule.is-active .z-badge {
  background: var(--accent);
  color: var(--bg-primary);
}

.keyboard-board {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: var(--card-bg);
  padding: 1.25rem;
  border-radius: 16px;
  border: 1px solid var(--border-color);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  max-width: 960px;
  width: 100%;
}

.kb-row {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.key-cap {
  width: 72px;
  height: 72px;
  padding: 6px 8px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.key-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.key-letter {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text-main);
}

.key-code {
  font-size: 0.7rem;
  color: var(--text-muted);
  font-family: monospace;
}

.key-name {
  font-size: 0.95rem;
  font-weight: 700;
  text-align: center;
  color: var(--accent);
}

.key-roots {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.zone-1 { border-top: 3px solid var(--zone-1); }
.zone-2 { border-top: 3px solid var(--zone-2); }
.zone-3 { border-top: 3px solid var(--zone-3); }
.zone-4 { border-top: 3px solid var(--zone-4); }
.zone-5 { border-top: 3px solid var(--zone-5); }

.z-key {
  border-top: 3px solid var(--text-muted);
  opacity: 0.85;
}

.space-cap {
  width: 460px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.space-text {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted);
}

.detail-card {
  width: 100%;
  max-width: 960px;
  min-height: 185px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.75rem;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.detail-badge {
  color: #fff;
  padding: 4px 12px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.9rem;
}

.detail-name {
  font-size: 1rem;
  color: var(--text-main);
}

.detail-version {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-left: auto;
}

.detail-mnemonic {
  font-size: 1.05rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-mnemonic .highlight {
  font-weight: 700;
  color: var(--accent);
}

.detail-roots-grid {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.roots-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.root-tag {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
}

.detail-notes {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.empty-card {
  text-align: center;
  padding: 1.5rem;
}

.empty-tip {
  color: var(--text-muted);
  font-size: 0.9rem;
}

@media (max-width: 860px) {
  .legend-list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    width: 100%;
    gap: 6px;
    padding: 8px;
  }

  .legend-divider {
    display: none;
  }

  .zone-capsule {
    justify-content: center;
    padding: 5px 6px;
    font-size: 0.74rem;
  }
}

@media (max-width: 768px) {
  .key-cap {
    width: 32px;
    height: 48px;
    padding: 2px 4px;
  }
  .key-letter {
    font-size: 0.8rem;
  }
  .key-name, .key-code, .key-roots {
    display: none;
  }
  .space-cap {
    width: 200px;
  }
}

@media (max-width: 480px) {
  .legend-list {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
