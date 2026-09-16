import { describe, it, expect } from 'vitest';
import { getUpcomingCandidates, evaluateCandidates, matchChineseStream } from '../src/utils/phraseMatching';

describe('长文与竞速赛智能双轨词组匹配核心算法测试', () => {
  const sampleArticle = ['中', '国', '人', '民', '有', '智', '慧'];

  it('一、候选集嗅探测试：从指定位置应准确提取单字、二字词、三字词及四字词', () => {
    const candidates = getUpcomingCandidates(sampleArticle, 0, '86');
    expect(candidates.length).toBeGreaterThanOrEqual(4);

    // 单字：中 (KHK, 简码 K)
    const single = candidates.find(c => c.length === 1);
    expect(single).toBeDefined();
    expect(single?.text).toBe('中');
    expect(single?.shortCode).toBe('K');

    // 二字词：中国 (KHLG)
    const twoWord = candidates.find(c => c.length === 2);
    expect(twoWord).toBeDefined();
    expect(twoWord?.text).toBe('中国');
    expect(twoWord?.fullCode).toBe('KHLG');

    // 三字词：中国人 (KLWW: 中首1 K + 国首1 L + 人前2 WW)
    const threeWord = candidates.find(c => c.length === 3);
    expect(threeWord).toBeDefined();
    expect(threeWord?.text).toBe('中国人');
    expect(threeWord?.fullCode).toBe('KLWW');

    // 四字词：中国人民 (KLWN: 中K + 国L + 人W + 民N 各首1)
    const fourWord = candidates.find(c => c.length === 4);
    expect(fourWord).toBeDefined();
    expect(fourWord?.text).toBe('中国人民');
    expect(fourWord?.fullCode).toBe('KLWN');
  });

  it('二、纯英文键盘词组比对测试：输入 KHLG 应准确匹配二字词【中国】且步长为 2', () => {
    const candidates = getUpcomingCandidates(sampleArticle, 0, '86');
    
    // 输入 KHLG (4码直接命中或加空格)
    const res = evaluateCandidates('KHLG', candidates, false, 'space');
    expect(res.isMatch).toBe(true);
    expect(res.matchedCandidate?.text).toBe('中国');
    expect(res.matchedCandidate?.length).toBe(2);
  });

  it('三、纯英文键盘单字打法兼容测试：输入单字简码 K 加空格，应准确匹配单字【中】且步长为 1', () => {
    const candidates = getUpcomingCandidates(sampleArticle, 0, '86');
    
    // 输入 K + 空格
    const res = evaluateCandidates('K', candidates, true, 'space');
    expect(res.isMatch).toBe(true);
    expect(res.matchedCandidate?.text).toBe('中');
    expect(res.matchedCandidate?.length).toBe(1);
  });

  it('四、前缀合法性测试：在输入过程中 (如打 KH 或 KHL) 不应被误判为错字', () => {
    const candidates = getUpcomingCandidates(sampleArticle, 0, '86');
    
    // K 既是单字前缀也是词组前缀
    const res1 = evaluateCandidates('K', candidates, false, 'space');
    expect(res1.isPrefixMatch).toBe(true);
    expect(res1.isMatch).toBe(false);

    // KHL 虽然不是单字“中”的前缀，但它是二字词“中国” (KHLG) 的有效前缀！不应报红！
    const res2 = evaluateCandidates('KHL', candidates, false, 'space');
    expect(res2.isPrefixMatch).toBe(true);
    expect(res2.isMatch).toBe(false);

    // 打完全乱码 ZZZZ，既不是单字也不是任何词组前缀
    const res3 = evaluateCandidates('ZZZZ', candidates, false, 'space');
    expect(res3.isPrefixMatch).toBe(false);
    expect(res3.isMatch).toBe(false);
  });

  it('五、输入法汉字流式核销测试：一次性上屏词组【中国】或【中国人民】应准确流式核销对应数量', () => {
    // 模拟输入法敲词上屏“中国”
    const res1 = matchChineseStream(['中', '国'], sampleArticle, 0);
    expect(res1.matchedCount).toBe(2);
    expect(res1.isAllMatched).toBe(true);

    // 模拟输入法敲错字上屏“中俄”
    const res2 = matchChineseStream(['中', '俄'], sampleArticle, 0);
    expect(res2.matchedCount).toBe(1); // 命中第1个“中”，第2个不匹配截断
    expect(res2.isAllMatched).toBe(false);

    // 模拟输入法连续长句上屏“中国人民”
    const res3 = matchChineseStream(['中', '国', '人', '民'], sampleArticle, 0);
    expect(res3.matchedCount).toBe(4);
    expect(res3.isAllMatched).toBe(true);
  });
});
