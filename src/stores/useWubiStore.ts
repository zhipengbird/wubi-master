import { reactive, ref, computed } from 'vue';
import type { WubiVersion, ThemeName, AudioEffect, InputMode, CommitMode, PracticeCategory, MistakeRecord } from '../types/wubi';
import {
  getSavedVersion, saveVersion,
  getSavedTheme, saveTheme,
  getSavedAudio, saveAudio,
  getSavedInputMode, saveInputMode,
  getMistakes, saveMistake as persistMistake, removeMistake as removePersistedMistake, clearMistakes as clearAllMistakes
} from '../utils/storage';

export type MainTab = 'practice' | 'article' | 'game' | 'keyboard' | 'rules' | 'lookup' | 'mistakes';

// 全局响应式状态
const version = ref<WubiVersion>(getSavedVersion());
const theme = ref<ThemeName>(getSavedTheme());
const audio = ref<AudioEffect>(getSavedAudio());
const inputMode = ref<InputMode>(getSavedInputMode());
const commitMode = ref<CommitMode>((localStorage.getItem('wubi_commit_mode') as CommitMode) || 'auto');
const activeTab = ref<MainTab>('practice');
const practiceCategory = ref<PracticeCategory>('level1');

// 键盘互动高亮状态
const activePressedKey = ref<string | null>(null);
const hoveredKey = ref<string | null>(null);

// 错题列表响应式
const mistakeList = ref<MistakeRecord[]>(getMistakes());

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

  const setActiveTab = (tab: MainTab) => {
    activeTab.value = tab;
  };

  const setPracticeCategory = (cat: PracticeCategory) => {
    practiceCategory.value = cat;
  };

  const recordMistake = (char: string, errorCode: string, correctCode: string, roots: string[]) => {
    persistMistake(char, errorCode, correctCode, roots);
    mistakeList.value = getMistakes();
  };

  const deleteMistake = (char: string) => {
    removePersistedMistake(char);
    mistakeList.value = getMistakes();
  };

  const resetAllMistakes = () => {
    clearAllMistakes();
    mistakeList.value = [];
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
    resetAllMistakes
  };
}
