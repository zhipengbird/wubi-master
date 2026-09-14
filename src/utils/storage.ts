import type { WubiVersion, ThemeName, AudioEffect, InputMode, MistakeRecord } from '../types/wubi';

const STORAGE_KEYS = {
  VERSION: 'wubi_version',
  THEME: 'wubi_theme',
  AUDIO: 'wubi_audio',
  INPUT_MODE: 'wubi_input_mode',
  MISTAKES: 'wubi_mistakes',
  ARTICLE_PROGRESS: 'wubi_article_progress',
};

export const getSavedVersion = (): WubiVersion => {
  return (localStorage.getItem(STORAGE_KEYS.VERSION) as WubiVersion) || '86';
};

export const saveVersion = (ver: WubiVersion) => {
  localStorage.setItem(STORAGE_KEYS.VERSION, ver);
};

export const getSavedTheme = (): ThemeName => {
  return (localStorage.getItem(STORAGE_KEYS.THEME) as ThemeName) || 'tokyo-night';
};

export const saveTheme = (theme: ThemeName) => {
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
};

export const getSavedAudio = (): AudioEffect => {
  return (localStorage.getItem(STORAGE_KEYS.AUDIO) as AudioEffect) || 'blue-switch';
};

export const saveAudio = (effect: AudioEffect) => {
  localStorage.setItem(STORAGE_KEYS.AUDIO, effect);
};

export const getSavedInputMode = (): InputMode => {
  return (localStorage.getItem(STORAGE_KEYS.INPUT_MODE) as InputMode) || 'smart';
};

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
