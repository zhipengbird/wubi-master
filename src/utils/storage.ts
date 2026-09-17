import type { WubiVersion, ThemeName, AudioEffect, InputMode, MistakeRecord } from '../types/wubi';

const STORAGE_KEYS = {
  VERSION: 'wubi_version',
  THEME: 'wubi_theme',
  AUDIO: 'wubi_audio',
  INPUT_MODE: 'wubi_input_mode',
  MISTAKES: 'wubi_mistakes',
  ARTICLE_PROGRESS: 'wubi_article_progress',
};

// 枚举白名单校验辅助函数
function readEnum<T extends string>(key: string, validValues: readonly T[], defaultValue: T): T {
  const raw = localStorage.getItem(key);
  return (raw && (validValues as readonly string[]).includes(raw)) ? (raw as T) : defaultValue;
}

const VALID_VERSIONS: readonly WubiVersion[] = ['86', '98', 'newCentury'];
const VALID_THEMES: readonly ThemeName[] = [
  'tokyo-night', 'cyber-neon', 'dracula-vampire', 'deep-space', 'matrix-green',
  'nord-frost', 'pure-white', 'paper-ink', 'retro-beige', 'matcha-zen', 'warm-latte'
];
const VALID_AUDIO: readonly AudioEffect[] = ['blue-switch', 'red-switch', 'typewriter', 'none'];
const VALID_INPUT_MODES: readonly InputMode[] = ['full', 'quick', 'smart'];

export const getSavedVersion = (): WubiVersion =>
  readEnum(STORAGE_KEYS.VERSION, VALID_VERSIONS, '86');

export const saveVersion = (ver: WubiVersion) => {
  localStorage.setItem(STORAGE_KEYS.VERSION, ver);
};

export const getSavedTheme = (): ThemeName =>
  readEnum(STORAGE_KEYS.THEME, VALID_THEMES, 'tokyo-night');

export const saveTheme = (theme: ThemeName) => {
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
};

export const getSavedAudio = (): AudioEffect =>
  readEnum(STORAGE_KEYS.AUDIO, VALID_AUDIO, 'blue-switch');

export const saveAudio = (effect: AudioEffect) => {
  localStorage.setItem(STORAGE_KEYS.AUDIO, effect);
};

export const getSavedInputMode = (): InputMode =>
  readEnum(STORAGE_KEYS.INPUT_MODE, VALID_INPUT_MODES, 'smart');

export const saveInputMode = (mode: InputMode) => {
  localStorage.setItem(STORAGE_KEYS.INPUT_MODE, mode);
};

// 错题本管理
export const getMistakes = (): MistakeRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MISTAKES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveMistake = (char: string, errorCode: string, correctCode: string, roots: string[]) => {
  const list = getMistakes();
  const existing = list.find(m => m.char === char);
  if (existing) {
    existing.count += 1;
    existing.lastErrorTime = Date.now();
    if (!existing.errorCodes.includes(errorCode)) {
      existing.errorCodes.push(errorCode);
    }
  } else {
    list.unshift({
      char,
      errorCodes: [errorCode],
      correctCode,
      roots,
      count: 1,
      lastErrorTime: Date.now()
    });
  }
  localStorage.setItem(STORAGE_KEYS.MISTAKES, JSON.stringify(list.slice(0, 200)));
};

export const removeMistake = (char: string) => {
  const list = getMistakes().filter(m => m.char !== char);
  localStorage.setItem(STORAGE_KEYS.MISTAKES, JSON.stringify(list));
};

export const clearMistakes = () => {
  localStorage.removeItem(STORAGE_KEYS.MISTAKES);
};

// 文章打字进度断点记忆
export const getArticleProgress = (articleId: string): number => {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.ARTICLE_PROGRESS}_${articleId}`);
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
};

export const saveArticleProgress = (articleId: string, index: number) => {
  localStorage.setItem(`${STORAGE_KEYS.ARTICLE_PROGRESS}_${articleId}`, index.toString());
};
