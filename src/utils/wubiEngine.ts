import type { InputMode, CommitMode, WubiVersion, WubiCharData, TypingStats } from '../types/wubi';
import { getFullCode, getShortCode, getAllValidCodes } from '../data/wubiDict';

export interface EvaluationResult {
  isMatch: boolean;        // 是否成功出字
  matchedVia: 'full' | 'short' | 'none';
  tip?: string;            // 提示（例如：“该字有简码更快捷”）
  isPrefixMatch: boolean;  // 当前输入的几个字符是否是目标编码的有效前缀
}

/**
 * 校验当前输入的编码与目标字符在指定模式下的匹配情况
 */
export const evaluateInput = (
  inputBuffer: string,
  charData: WubiCharData,
  mode: InputMode,
  version: WubiVersion,
  hasPressedSpace = false,
  commitMode: CommitMode = 'space'
): EvaluationResult => {
  const cleanInput = inputBuffer.trim().toUpperCase();
  const validCodes = getAllValidCodes(charData.char, version);
  const fullCode = validCodes.full || getFullCode(charData, version).toUpperCase();
  const shortCodes = validCodes.shorts;
  const primaryShort = getShortCode(charData, version)?.toUpperCase();

  if (!cleanInput) {
    return { isMatch: false, matchedVia: 'none', isPrefixMatch: true };
  }

  // 兼容直接使用五笔输入法打字上屏的情况：若输入内容直接就是目标汉字，立即判定成功！
  if (cleanInput === charData.char || inputBuffer.trim() === charData.char) {
    return { isMatch: true, matchedVia: 'full', isPrefixMatch: false };
  }

  // A. 自动出字模式 (auto)：打对编码立即命中出字，无需额外按空格
  if (commitMode === 'auto') {
    if (mode === 'full') {
      if (cleanInput === fullCode) {
        return { isMatch: true, matchedVia: 'full', isPrefixMatch: false };
      }
      return { isMatch: false, matchedVia: 'none', isPrefixMatch: fullCode.startsWith(cleanInput) };
    }

    if (mode === 'quick' || mode === 'smart') {
      // 1. 优先简码匹配 (涵盖一简、二简、键名二简等全部简码)
      if (shortCodes.includes(cleanInput)) {
        return { isMatch: true, matchedVia: 'short', isPrefixMatch: false };
      }
      // 2. 无论何时输入全码均合法出字
      if (cleanInput === fullCode) {
        let tip: string | undefined;
        if (primaryShort && primaryShort.length < fullCode.length) {
          tip = `打【${primaryShort}】键更快捷！`;
        }
        return { isMatch: true, matchedVia: 'full', tip, isPrefixMatch: false };
      }

      const isPrefix = validCodes.all.some(code => code.startsWith(cleanInput));
      return { isMatch: false, matchedVia: 'none', isPrefixMatch: isPrefix };
    }
  }

  // B. 真实空格出字模式 (space)
  if (mode === 'full') {
    if (hasPressedSpace || cleanInput.length >= 4) {
      if (cleanInput === fullCode) {
        return { isMatch: true, matchedVia: 'full', isPrefixMatch: false };
      }
    }
    return { isMatch: false, matchedVia: 'none', isPrefixMatch: fullCode.startsWith(cleanInput) };
  }

  if (mode === 'quick' || mode === 'smart') {
    if (hasPressedSpace) {
      if (shortCodes.includes(cleanInput)) {
        return { isMatch: true, matchedVia: 'short', isPrefixMatch: false };
      }
      if (cleanInput === fullCode) {
        let tip: string | undefined;
        if (primaryShort && primaryShort.length < fullCode.length) {
          tip = `打【${primaryShort} + 空格】出字更快哦！`;
        }
        return { isMatch: true, matchedVia: 'full', tip, isPrefixMatch: false };
      }
    }

    // 满4码时全码自动判定
    if (cleanInput.length >= 4 && cleanInput === fullCode) {
      return { isMatch: true, matchedVia: 'full', isPrefixMatch: false };
    }

    const isPrefixMatch = validCodes.all.some(code => code.startsWith(cleanInput));
    return { isMatch: false, matchedVia: 'none', isPrefixMatch };
  }
};

/**
 * 实时打字指标计算
 */
export const calculateStats = (
  correctCount: number,
  errorCount: number,
  keystrokes: number,
  startTime: number,
  backspaceCount: number
): TypingStats => {
  const now = Date.now();
  const elapsedSeconds = Math.max(1, Math.floor((now - startTime) / 1000));
  const elapsedMinutes = elapsedSeconds / 60;

  const totalChars = correctCount + errorCount;
  const accuracy = totalChars > 0 ? Math.round((correctCount / totalChars) * 100) : 100;
  const wpm = Math.round(correctCount / elapsedMinutes);
  const kpm = Math.round(keystrokes / elapsedMinutes);

  return {
    wpm,
    kpm,
    accuracy,
    totalChars,
    correctChars: correctCount,
    errorChars: errorCount,
    elapsedSeconds,
    backspaceCount
  };
};
