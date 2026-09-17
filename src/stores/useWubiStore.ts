import { reactive, ref, computed } from 'vue';
import type { WubiVersion, ThemeName, AudioEffect, InputMode, CommitMode, PracticeCategory, MistakeRecord } from '../types/wubi';
import {
  getSavedVersion, saveVersion,
  getSavedTheme, saveTheme,
  getSavedAudio, saveAudio,
  getSavedInputMode, saveInputMode,
  getMistakes, saveMistake as persistMistake, removeMistake as removePersistedMistake, clearMistakes as clearAllMistakes
} from '../utils/storage';
import {
  getDbMistakes, saveDbMistake, removeDbMistake, clearDbMistakes, migrateMistakesFromLocalStorage
} from '../data/wubiDb';

export type MainTab = 'practice' | 'article' | 'rpg' | 'game' | 'keyboard' | 'rules' | 'lookup' | 'mistakes';

// 全局响应式状态
const version = ref<WubiVersion>(getSavedVersion());
const theme = ref<ThemeName>(getSavedTheme());
const audio = ref<AudioEffect>(getSavedAudio());
const inputMode = ref<InputMode>(getSavedInputMode());
const commitMode = ref<CommitMode>((localStorage.getItem('wubi_commit_mode') as CommitMode) || 'space');
const VALID_TABS: MainTab[] = ['practice', 'article', 'rpg', 'game', 'keyboard', 'rules', 'lookup', 'mistakes'];

export const normalizeTab = (raw: string | null | undefined): MainTab | null => {
  if (!raw) return null;
  const clean = raw.trim().toLowerCase().replace('#', '');
  if (clean === 'type') return 'practice'; // 别名兼容
  if (VALID_TABS.includes(clean as MainTab)) {
    return clean as MainTab;
  }
  return null;
};

const getInitialTab = (): MainTab => {
  if (typeof window === 'undefined') return 'practice';
  const fromHash = normalizeTab(window.location.hash);
  if (fromHash) return fromHash;

  const params = new URLSearchParams(window.location.search);
  const fromQuery = normalizeTab(params.get('tab'));
  if (fromQuery) return fromQuery;

  if (params.get('char') || params.get('q')) {
    return 'lookup';
  }
  return 'practice';
};

const activeTab = ref<MainTab>(getInitialTab());
const practiceCategory = ref<PracticeCategory>('level1');

// 键盘互动高亮状态
const activePressedKey = ref<string | null>(null);
const hoveredKey = ref<string | null>(null);

// 错题列表响应式（初值使用 localStorage 瞬间初始化，随后与 IndexedDB 异步合并同步）
const mistakeList = ref<MistakeRecord[]>(getMistakes());

// 异步从 IndexedDB 迁移及加载完整错题库（解除 200 条数量上限限制）
if (typeof window !== 'undefined') {
  migrateMistakesFromLocalStorage().then(dbList => {
    if (Array.isArray(dbList) && dbList.length > 0) {
      mistakeList.value = dbList;
    }
  }).catch(err => {
    console.warn('[useWubiStore] 错题数据库同步异常:', err);
  });
}

export function useWubiStore() {
  const setVersion = (v: WubiVersion) => {
    version.value = v;
    saveVersion(v);
  };

  const setTheme = (t: ThemeName) => {
    theme.value = t;
    saveTheme(t);
    document.documentElement.setAttribute('data-theme', t);
  };

  const setAudio = (a: AudioEffect) => {
    audio.value = a;
    saveAudio(a);
  };

  const setInputMode = (m: InputMode) => {
    inputMode.value = m;
    saveInputMode(m);
  };

  const setCommitMode = (cm: CommitMode) => {
    commitMode.value = cm;
    localStorage.setItem('wubi_commit_mode', cm);
  };

  const setActiveTab = (tab: MainTab, updateHash = true) => {
    activeTab.value = tab;
    if (updateHash && typeof window !== 'undefined') {
      const currentHash = window.location.hash.replace('#', '');
      if (currentHash !== tab) {
        window.location.hash = tab;
      }
    }
  };

  const syncTabFromLocation = () => {
    if (typeof window === 'undefined') return;
    const fromHash = normalizeTab(window.location.hash);
    if (fromHash && fromHash !== activeTab.value) {
      activeTab.value = fromHash;
    }
  };

  const setPracticeCategory = (cat: PracticeCategory) => {
    practiceCategory.value = cat;
  };

  const recordMistake = (char: string, errorCode: string, correctCode: string, roots: string[]) => {
    // 1. 内存极速乐观更新，保证打字特训 0ms 零延迟
    const existing = mistakeList.value.find(m => m.char === char);
    if (existing) {
      existing.count += 1;
      existing.lastErrorTime = Date.now();
      if (errorCode && !existing.errorCodes.includes(errorCode)) {
        existing.errorCodes.push(errorCode);
      }
    } else {
      mistakeList.value.unshift({
        char,
        errorCodes: errorCode ? [errorCode] : [],
        correctCode,
        roots: roots || [],
        count: 1,
        lastErrorTime: Date.now()
      });
    }

    // 2. 异步入库 IndexedDB（解除 200 条限制，保留全量历史）
    saveDbMistake(char, errorCode, correctCode, roots).catch(err => {
      console.warn('[useWubiStore] 错题写入数据库失败:', err);
    });

    // 3. localStorage 同步备份（安全降级兜底）
    try {
      persistMistake(char, errorCode, correctCode, roots);
    } catch {}
  };

  const deleteMistake = (char: string) => {
    // 乐观移出
    mistakeList.value = mistakeList.value.filter(m => m.char !== char);
    // 异步更新 IndexedDB
    removeDbMistake(char).catch(err => {
      console.warn('[useWubiStore] 数据库移出错题失败:', err);
    });
    // 同步更新 localStorage 备份
    try {
      removePersistedMistake(char);
    } catch {}
  };

  const resetAllMistakes = () => {
    mistakeList.value = [];
    clearDbMistakes().catch(err => {
      console.warn('[useWubiStore] 清空错题数据库失败:', err);
    });
    try {
      clearAllMistakes();
    } catch {}
  };

  return {
    version,
    theme,
    audio,
    inputMode,
    commitMode,
    activeTab,
    practiceCategory,
    activePressedKey,
    hoveredKey,
    mistakeList,

    setVersion,
    setTheme,
    setAudio,
    setInputMode,
    setCommitMode,
    setActiveTab,
    setPracticeCategory,
    recordMistake,
    deleteMistake,
    resetAllMistakes,
    syncTabFromLocation
  };
}
