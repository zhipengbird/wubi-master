import { describe, it, expect } from 'vitest';
import { calculatePhraseCode, getPhraseBreakdown } from '../src/data/wubiDict';
import {
  COMMON_PHRASES,
  HIGH_FREQ_PHRASES,
  getAllDynamicPhrases,
  getPhrasesByLength
} from '../src/data/wordsDict';

describe('一、词组五笔自动推导算法基准测试', () => {
  it('双字词规则（前二+次二）精确推导验证', () => {
    // 五笔：五(GGHG前2=GG) + 笔(TTHB前2=TT) = GGTT
    expect(calculatePhraseCode('五笔', '86')).toBe('GGTT');
    // 中国：中(KHK前2=KH) + 国(LGY前2=LG) = KHLG
    expect(calculatePhraseCode('中国', '86')).toBe('KHLG');
    // 打字：打(RSH前2=RS) + 字(PB前2=PB) = RSPB
    expect(calculatePhraseCode('打字', '86')).toBe('RSPB');
    // 学习：学(IPBF前2=IP) + 习(NUD前2=NU) = IPNU
    expect(calculatePhraseCode('学习', '86')).toBe('IPNU');
  });

  it('三字词规则（首+首+前二）精确推导验证', () => {
    // 计算机：计(Y) + 算(T) + 机(SM) = YTSM
    expect(calculatePhraseCode('计算机', '86')).toBe('YTSM');
    // 输入法：输(L) + 入(T) + 法(IF) = LTIF
    expect(calculatePhraseCode('输入法', '86')).toBe('LTIF');
    // 互联网：互(G) + 联(B) + 网(MQ) = GBMQ
    expect(calculatePhraseCode('互联网', '86')).toBe('GBMQ');
  });

  it('四字成语/词组规则（各取首码）精确推导验证', () => {
    // 春暖花开：春(D) + 暖(J) + 花(A) + 开(G) = DJAG
    expect(calculatePhraseCode('春暖花开', '86')).toBe('DJAG');
    // 厚德载物：厚(D) + 德(T) + 载(F) + 物(T) = DTFT
    expect(calculatePhraseCode('厚德载物', '86')).toBe('DTFT');
    // 五笔学堂：五(G) + 笔(T) + 学(I) + 堂(I) = GTII
    expect(calculatePhraseCode('五笔学堂', '86')).toBe('GTII');
    // 海纳百川：海(I) + 纳(X) + 百(D) + 川(K) = IXDK
    expect(calculatePhraseCode('海纳百川', '86')).toBe('IXDK');
  });

  it('多字长词规则（一二三末）精确推导验证', () => {
    // 中华人民共和国：中(K) + 华(W) + 人(W) + ... + 国(L) = KWWL
    expect(calculatePhraseCode('中华人民共和国', '86')).toBe('KWWL');
    // 中国特色社会主义：中(K) + 国(L) + 特(T) + ... + 义(Y) = KLTY
    expect(calculatePhraseCode('中国特色社会主义', '86')).toBe('KLTY');
  });

  it('getPhraseBreakdown 拆解步骤对象完整有效', () => {
    const bd = getPhraseBreakdown('春暖花开', '86');
    expect(bd.phrase).toBe('春暖花开');
    expect(bd.code).toBe('DJAG');
    expect(bd.steps.length).toBe(4);
    expect(bd.steps[0].char).toBe('春');
    expect(bd.steps[0].keys).toBe('D');
  });
});

describe('二、3,000 常用高频词库健全性测试', () => {
  it('词库总规模应不少于 3,000 条词组', () => {
    expect(HIGH_FREQ_PHRASES.length).toBeGreaterThanOrEqual(3000);
    expect(COMMON_PHRASES.length).toBeGreaterThanOrEqual(3000);
  });

  it('按词长筛选功能应覆盖双字词、三字词与四字成语', () => {
    const len2 = getPhrasesByLength(2);
    const len3 = getPhrasesByLength(3);
    const len4 = getPhrasesByLength(4);

    expect(len2.length).toBe(2000);
    expect(len3.length).toBe(400);
    expect(len4.length).toBe(600);
  });

  it('全量 3,000 条高频词组应 100% 成功生成有效四位五笔编码且拼音非空', () => {
    const all = getAllDynamicPhrases();
    expect(all.length).toBe(3000);

    for (let i = 0; i < all.length; i++) {
      const item = all[i];
      // 词长在 2~4 之间
      expect(item.word.length).toBeGreaterThanOrEqual(2);
      expect(item.word.length).toBeLessThanOrEqual(4);

      // 三版本五笔编码全为 4 位大写字母
      expect(item.code86).toMatch(/^[A-Z]{4}$/);
      expect(item.code98).toMatch(/^[A-Z]{4}$/);
      expect(item.codeNew).toMatch(/^[A-Z]{4}$/);

      // 拼音非空且包含空格分隔
      expect(item.pinyin).toBeTruthy();
      expect(item.pinyin.split(' ').length).toBe(item.word.length);

      // 取码拆解非空
      expect(item.breakdown).toBeTruthy();
    }
  });
});
