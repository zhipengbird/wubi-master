import { describe, it, expect } from 'vitest';
import {
  WUBI_CHAR_MAP,
  LEVEL_1_CHARS,
  KEY_NAME_CHARS,
  getCharBreakdown,
  getRootSteps,
  getFullCode,
  getShortCode,
  getRecognitionCode
} from '../src/data/wubiDict';

describe('一、一级简码（25字）标准规则验证', () => {
  const EXPECTED_LEVEL_1: Record<string, string> = {
    '一': 'G', '地': 'F', '在': 'D', '要': 'S', '工': 'A',
    '上': 'H', '是': 'J', '中': 'K', '国': 'L', '同': 'M',
    '和': 'T', '的': 'R', '有': 'E', '人': 'W', '我': 'Q',
    '主': 'Y', '产': 'U', '不': 'I', '为': 'O', '这': 'P',
    '民': 'N', '了': 'B', '发': 'V', '以': 'C', '经': 'X'
  };

  it('一级简码应包含且仅包含 25 个汉字', () => {
    expect(LEVEL_1_CHARS.length).toBe(25);
    const chars = Object.keys(EXPECTED_LEVEL_1);
    expect(chars.length).toBe(25);
  });

  for (const [char, expectedKey] of Object.entries(EXPECTED_LEVEL_1)) {
    it(`一级简码字【${char}】简码应为单键【${expectedKey}】`, () => {
      const item = WUBI_CHAR_MAP.get(char);
      expect(item).toBeDefined();
      if (!item) return;

      const short86 = getShortCode(item, '86');
      expect(short86).toBe(expectedKey);
    });
  }
});

describe('二、25个键名字标准规则验证', () => {
  const KEY_NAMES: Record<string, string> = {
    '王': 'G', '土': 'F', '大': 'D', '木': 'S', '工': 'A',
    '目': 'H', '日': 'J', '口': 'K', '田': 'L', '山': 'M',
    '禾': 'T', '白': 'R', '月': 'E', '人': 'W', '金': 'Q',
    '言': 'Y', '立': 'U', '水': 'I', '火': 'O', '之': 'P',
    '已': 'N', '子': 'B', '女': 'V', '又': 'C', '纟': 'X'
  };

  it('键名字全码必须为该键位的 4 连击编码（如 GGGG、AAAA）且绝无末笔识别码', () => {
    for (const [char, key] of Object.entries(KEY_NAMES)) {
      const item = WUBI_CHAR_MAP.get(char);
      expect(item).toBeDefined();
      if (!item) continue;

      const expected4 = key.repeat(4);
      const code86 = getFullCode(item, '86');
      expect(code86).toBe(expected4);

      // 键名字连打4键，绝无末笔识别码
      const recog = getRecognitionCode(item, '86');
      expect(recog).toBeUndefined();
    }
  });
});

describe('三、成字字根（字根汉字）编码与拆解验证', () => {
  it('成字字根【五】全码应为 GGHG，拆解严格为 4 码，绝无多余第 5 码', () => {
    const wu = WUBI_CHAR_MAP.get('五');
    expect(wu).toBeDefined();
    if (!wu) return;

    expect(wu.code86).toBe('GGHG');
    const breakdown = getCharBreakdown(wu, '86');
    expect(breakdown.roots).toEqual(['五', '一', '丨', '一']);
    expect(breakdown.roots.length).toBe(4);

    const steps = getRootSteps(wu, '86');
    expect(steps.length).toBe(4);
    expect(steps[0]).toEqual({ root: '五', key: 'G' });
    expect(steps[1]).toEqual({ root: '一', key: 'G' });
    expect(steps[2]).toEqual({ root: '丨', key: 'H' });
    expect(steps[3]).toEqual({ root: '一', key: 'G' });
  });

  const ROOT_CHARS: Record<string, string> = {
    '干': 'FGG',
    '寸': 'FGH',
    '雨': 'FGH',
    '西': 'SGH',
    '石': 'DGT',
    '车': 'LGNH',
    '手': 'RTG',
    '止': 'HHHG',
    '心': 'NYN',
    '门': 'UYHN',
    '八': 'WTY',
    '方': 'YYG',
    '辛': 'UYG'
  };

  for (const [char, expectedPrefix] of Object.entries(ROOT_CHARS)) {
    it(`成字字根【${char}】编码应符合“报户头+首笔+次笔+末笔”规范 (${expectedPrefix})`, () => {
      const item = WUBI_CHAR_MAP.get(char);
      expect(item).toBeDefined();
      if (!item) return;

      const code86 = getFullCode(item, '86');
      expect(code86.startsWith(expectedPrefix)).toBe(true);
    });
  }
});

describe('四、末笔字型交叉识别码黄金判定律', () => {
  it('凡 4 码全满字，各键位均为真实构字字根，绝无末笔识别码', () => {
    const fourRootChars = ['跑', '拼', '缩', '照', '经', '掉', '轻', '承', '罩', '晋'];
    for (const ch of fourRootChars) {
      const item = WUBI_CHAR_MAP.get(ch);
      if (!item) continue;
      const breakdown = getCharBreakdown(item, '86');
      if (breakdown.roots.length >= 4) {
        expect(breakdown.recognitionCode).toBeUndefined();
      }
    }
  });

  it('不足 4 字根的单字，在全码长于字根数时准确附带末笔识别码', () => {
    // 中：口(K) + 丨(H) + 杂合(K) = KHK
    const zhong = WUBI_CHAR_MAP.get('中');
    expect(zhong).toBeDefined();
    if (zhong) {
      const bd = getCharBreakdown(zhong, '86');
      expect(bd.roots.length).toBe(2);
      expect(bd.recognitionCode).toBe('K');
    }

    // 亚：一(G) + 业头(O) + 一(G) + 杂合(D) = GOGD
    const ya = WUBI_CHAR_MAP.get('亚');
    expect(ya).toBeDefined();
    if (ya) {
      const bd = getCharBreakdown(ya, '86');
      expect(bd.roots.length).toBe(3);
      expect(bd.recognitionCode).toBe('D');
    }
  });
});
