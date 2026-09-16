import { describe, it, expect, beforeAll } from 'vitest';
import {
  WUBI_CHAR_MAP,
  loadFullParsedChars,
  getCharBreakdown,
  getRootName,
  ROOT_GLYPH_NORMALIZE,
  ROOT_NAME_MAP,
  type WubiCharData
} from '../src/data/wubiDict';

let fullDictMap: Map<string, WubiCharData>;

beforeAll(async () => {
  const fullChars = await loadFullParsedChars();
  fullDictMap = new Map(fullChars.map(c => [c.char, c]));
});

const getChar = (ch: string): WubiCharData | undefined => {
  return WUBI_CHAR_MAP.get(ch) || fullDictMap?.get(ch);
};

describe('一、业/亚部汉字 O 键字根纠正回归测试', () => {
  const YE_CHARS = ['晋', '亚', '业', '恶', '严', '哑', '娅', '垩', '垭', '戬', '桠', '痖', '鄑', '挜'];

  for (const ch of YE_CHARS) {
    it(`汉字【${ch}】的字根拆解中必须包含“业”，绝不能出现错误的四点底“灬”`, () => {
      const item = getChar(ch);
      expect(item).toBeDefined();
      if (!item) return;

      const bd = getCharBreakdown(item, '86');
      // 显示字形应为 "业"
      expect(bd.roots).toContain('业');
      // 绝不能为 "灬"
      expect(bd.roots).not.toContain('灬');
    });
  }

  it('字根显示规范化映射表必须正确将“业头”映射为“业”，且注释为“业字头”', () => {
    expect(ROOT_GLYPH_NORMALIZE['业头']).toBe('业');
    expect(ROOT_NAME_MAP['业']).toBe('业字头');
    expect(getRootName('业')).toBe('业字头');
  });
});

describe('二、祭字头与登字头区分回归测试', () => {
  it('祭部汉字（蔡、祭、察、擦）必须使用“祭头”，绝不能误用“癶”', () => {
    const jiChars = ['蔡', '祭', '察', '擦'];
    for (const ch of jiChars) {
      const item = getChar(ch);
      expect(item).toBeDefined();
      if (!item) continue;

      const bd = getCharBreakdown(item, '86');
      expect(bd.roots).toContain('祭头');
      expect(bd.roots).not.toContain('癶');
    }
  });

  it('登部汉字（登、癸）必须使用登字头“癶”', () => {
    const dengChars = ['登', '癸'];
    for (const ch of dengChars) {
      const item = getChar(ch);
      expect(item).toBeDefined();
      if (!item) continue;

      const bd = getCharBreakdown(item, '86');
      expect(bd.roots).toContain('癶');
    }
  });
});

describe('三、部首规范展开回归测试', () => {
  it('足部汉字【跑】字根必须展开为【口】与【止】，且无虚假识别码', () => {
    const pao = getChar('跑');
    expect(pao).toBeDefined();
    if (!pao) return;

    expect(pao.code86).toBe('KHQN');
    const bd = getCharBreakdown(pao, '86');
    expect(bd.roots).toEqual(['口', '止', '勹', '巳']);
    expect(bd.recognitionCode).toBeUndefined();
  });

  it('革部汉字字根必须规范展开为【廿】与【十】', () => {
    const geChars = ['鞋', '靴', '鞭'];
    for (const ch of geChars) {
      const item = getChar(ch);
      if (!item) continue;

      const bd = getCharBreakdown(item, '86');
      expect(bd.roots[0]).toBe('廿');
      expect(bd.roots[1]).toBe('十');
    }
  });

  it('鱼部汉字必须规范合并为一体化字根【⺈田】（无尾鱼）', () => {
    const fishChars = ['鱼', '鲁', '鲜'];
    for (const ch of fishChars) {
      const item = getChar(ch);
      if (!item) continue;

      const bd = getCharBreakdown(item, '86');
      expect(bd.roots).toContain('⺈田');
    }
  });
});

describe('四、Ext-B 生僻字与乱码过滤回归测试', () => {
  it('汉字【未】等不应包含 Unicode 扩展区生僻字符（如 𡭔），应规范显示为【小】', () => {
    const wei = getChar('未');
    expect(wei).toBeDefined();
    if (!wei) return;

    const bd = getCharBreakdown(wei, '86');
    for (const r of bd.roots) {
      expect(r).not.toBe('𡭔');
      expect(r).not.toBe('𱼀');
      expect(r).not.toBe('𭕄');
    }
  });

  it('汉字【馨】（FNMJ）字根拆解必须规范为【士 + 尸 + 几 + 日】，绝不能出现豆腐块乱码（𠃜、𠘧）', () => {
    const xin = getChar('馨');
    expect(xin).toBeDefined();
    if (!xin) return;

    expect(xin.code86).toBe('FNMJ');
    const bd = getCharBreakdown(xin, '86');
    expect(bd.roots).toEqual(['士', '尸', '几', '日']);
    expect(bd.rootSteps).toEqual([
      { root: '士', key: 'F' },
      { root: '尸', key: 'N' },
      { root: '几', key: 'M' },
      { root: '日', key: 'J' }
    ]);
    for (const r of bd.roots) {
      expect(r).not.toContain('𠃜');
      expect(r).not.toContain('𠘧');
    }
  });

  it('原含 𠃜 字符（声、眉）必须规范化为标准字根【尸】', () => {
    const sheng = getChar('声');
    expect(sheng).toBeDefined();
    if (sheng) {
      const bd = getCharBreakdown(sheng, '86');
      expect(bd.roots).toEqual(['士', '尸']);
    }

    const mei = getChar('眉');
    expect(mei).toBeDefined();
    if (mei) {
      const bd = getCharBreakdown(mei, '86');
      expect(bd.roots).toEqual(['尸', '目']);
    }
  });

  it('原含 𠘧 字符（设、投、船）必须规范化为标准字根【几】', () => {
    const she = getChar('设');
    expect(she).toBeDefined();
    if (she) {
      const bd = getCharBreakdown(she, '86');
      expect(bd.roots).toEqual(['讠', '几', '又']);
    }

    const tou = getChar('投');
    expect(tou).toBeDefined();
    if (tou) {
      const bd = getCharBreakdown(tou, '86');
      expect(bd.roots).toEqual(['扌', '几', '又']);
    }

    const chuan = getChar('船');
    expect(chuan).toBeDefined();
    if (chuan) {
      const bd = getCharBreakdown(chuan, '86');
      expect(bd.roots).toContain('几');
      expect(bd.roots).not.toContain('𠘧');
    }
  });
});
