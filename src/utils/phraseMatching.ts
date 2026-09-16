import { calculatePhraseCode, lookupWubiChar, getFullCode, getShortCode } from '../data/wubiDict';
import type { WubiVersion } from '../types/wubi';

export interface MatchCandidate {
  type: 'single' | 'phrase';
  length: number;    // 覆盖的字符数 (1: 单字, 2: 二字词, 3: 三字词, 4: 四字词)
  text: string;      // 对应的汉字内容 (如 "中", "中国", "计算机", "一心一意")
  fullCode: string;  // 标准四位或全码 (如 "KHK", "KHLG", "YTSM", "GNGU")
  shortCode?: string; // 简码 (单字可用)
}

export interface CandidateMatchResult {
  isMatch: boolean;
  isPrefixMatch: boolean;
  matchedCandidate: MatchCandidate | null;
}

/**
 * 提取从当前字符位置起始的单字与多字词组候选集（单字、二字词、三字词、四字词）
 */
export const getUpcomingCandidates = (
  chars: string[],
  startIndex: number,
  version: WubiVersion = '86'
): MatchCandidate[] => {
  const candidates: MatchCandidate[] = [];
  if (startIndex >= chars.length) return candidates;

  // 1. 当前单字候选
  const firstChar = chars[startIndex];
  const firstItem = lookupWubiChar(firstChar);
  if (firstItem) {
    candidates.push({
      type: 'single',
      length: 1,
      text: firstChar,
      fullCode: getFullCode(firstItem, version).toUpperCase(),
      shortCode: getShortCode(firstItem, version)?.toUpperCase()
    });
  }

  // 2. 依次嗅探 2 字词、3 字词、4 字词
  for (const len of [2, 3, 4]) {
    if (startIndex + len <= chars.length) {
      const slice = chars.slice(startIndex, startIndex + len);
      // 必须全部为中文汉字（若遇到标点符号、空格或英文字符则不构成词组）
      if (slice.every(c => /[\u4e00-\u9fa5]/.test(c))) {
        const phraseText = slice.join('');
        const code = calculatePhraseCode(phraseText, version);
        if (code && code.length === 4) {
          candidates.push({
            type: 'phrase',
            length: len,
            text: phraseText,
            fullCode: code.toUpperCase()
          });
        }
      }
    }
  }

  return candidates;
};

/**
 * 比对用户当前输入与候选集（优先长词组匹配）
 */
export const evaluateCandidates = (
  input: string,
  candidates: MatchCandidate[],
  hasPressedSpace: boolean,
  commitMode: 'space' | 'auto' = 'space'
): CandidateMatchResult => {
  const clean = input.trim().toUpperCase();
  if (!clean || candidates.length === 0) {
    return { isMatch: false, isPrefixMatch: false, matchedCandidate: null };
  }

  // 1. 精确匹配检查 (优先更长的词组)
  const exactMatches = candidates.filter(c => {
    // 简码命中（仅单字支持空格出字或自动上屏）
    if (c.shortCode && c.shortCode === clean) {
      if (commitMode === 'auto' || hasPressedSpace) return true;
    }
    // 全码/词组码命中
    if (c.fullCode === clean) {
      if (c.fullCode.length === 4) return true; // 4码在auto模式或输入满4码时可出字
      if (hasPressedSpace) return true;        // 不足4码敲空格出字
    }
    return false;
  });

  if (exactMatches.length > 0) {
    // 降序排序：词长更长者优先（如二字词优先于单字，避免将词组前半段误截断为单字）
    exactMatches.sort((a, b) => b.length - a.length);
    return {
      isMatch: true,
      isPrefixMatch: true,
      matchedCandidate: exactMatches[0]
    };
  }

  // 2. 前缀合法性检查（用户在敲第 1、2、3 码时，是否属于任一候选的前缀）
  const hasPrefix = candidates.some(c => {
    if (c.fullCode.startsWith(clean)) return true;
    if (c.shortCode && c.shortCode.startsWith(clean)) return true;
    return false;
  });

  return {
    isMatch: false,
    isPrefixMatch: hasPrefix,
    matchedCandidate: null
  };
};

export const isPunctuation = (ch: string): boolean => {
  if (!ch) return false;
  return /[，。！？；：“”‘’（）《》、\s\.,!?;:()"'`\-—…、～~]/.test(ch);
};

export const isPunctuationEquivalent = (inputKey: string, targetChar: string): boolean => {
  if (inputKey === targetChar) return true;
  const map: Record<string, string[]> = {
    '，': [',', '，'],
    '。': ['.', '。'],
    '！': ['!', '！'],
    '？': ['?', '？'],
    '；': [';', '；'],
    '：': [':', '：'],
    '、': ['\\', '/', '、'],
    '“': ['"', '“'],
    '”': ['"', '”'],
    '‘': ["'", '‘'],
    '’': ["'", '’'],
    '《': ['<', '《'],
    '》': ['>', '》'],
    '（': ['(', '（'],
    '）': [')', '）'],
    '—': ['-', '_', '—'],
    '…': ['^', '…', '.']
  };
  return map[targetChar]?.includes(inputKey) || false;
};

export interface StreamMatchResult {
  matchedCount: number;         // 输入文本中匹配成功的字符数
  targetAdvancedCount: number;  // 目标文本中前进的字符数（含智能跳过的标点）
  isAllMatched: boolean;        // 输入文本是否全部正确匹配
}

/**
 * 顺序核销输入的汉字/标点流（支持输入法直接上屏单字、词组、整句及标点）
 * 智能支持标点等价匹配与跨标点自动核销
 */
export const matchChineseStream = (
  inputChars: string[],
  targetChars: string[],
  startIndex: number
): StreamMatchResult => {
  let inputIdx = 0;
  let currTargetIdx = startIndex;

  while (inputIdx < inputChars.length && currTargetIdx < targetChars.length) {
    const inChar = inputChars[inputIdx];
    const targetChar = targetChars[currTargetIdx];

    // 1. 完全相同
    if (inChar === targetChar) {
      inputIdx++;
      currTargetIdx++;
      continue;
    }

    // 2. 标点符号中英文等价（例如输入英文逗号匹配中文逗号）
    if (isPunctuation(targetChar) && isPunctuationEquivalent(inChar, targetChar)) {
      inputIdx++;
      currTargetIdx++;
      continue;
    }

    // 3. 智能跳过标点：如果目标当前是标点或空白，但输入的字符不是标点
    //    自动跳过目标文本中的标点符号，看后面是否与输入字符匹配
    if (isPunctuation(targetChar) && !isPunctuation(inChar)) {
      currTargetIdx++;
      continue;
    }

    // 4. 出现错字，立即中断流水核销
    break;
  }

  return {
    matchedCount: inputIdx,
    targetAdvancedCount: currTargetIdx - startIndex,
    isAllMatched: inputIdx === inputChars.length
  };
};
