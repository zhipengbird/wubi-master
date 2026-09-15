import type { WubiPhraseData } from '../types/wubi';
import { getAllDynamicPhrases, getPhrasesByLength, getDynamicPhrase, HIGH_FREQ_PHRASES } from './phraseData';

/**
 * 经典教学范例词组（涵盖双字/三字/四字成语/多字长词各类标准取码规则）
 */
export const CANONICAL_PHRASES: WubiPhraseData[] = [
  // 双字词（2+2规则）
  { word: '中国', pinyin: 'zhōng guó', code86: 'KHLG', code98: 'KHLG', codeNew: 'KHLG', breakdown: '中(KH) + 国(LG)' },
  { word: '人民', pinyin: 'rén mín', code86: 'WWNA', code98: 'WWNA', codeNew: 'WWNA', breakdown: '人(WW) + 民(NA)' },
  { word: '学习', pinyin: 'xué xí', code86: 'IPNU', code98: 'IPNU', codeNew: 'IPNU', breakdown: '学(IP) + 习(NU)' },
  { word: '五笔', pinyin: 'wǔ bǐ', code86: 'GGTT', code98: 'GGTT', codeNew: 'GGTT', breakdown: '五(GG) + 笔(TT)' },
  { word: '打字', pinyin: 'dǎ zì', code86: 'RSPB', code98: 'RSPB', codeNew: 'RSPB', breakdown: '打(RS) + 字(PB)' },
  { word: '练习', pinyin: 'liàn xí', code86: 'XANU', code98: 'XANU', codeNew: 'XANU', breakdown: '练(XA) + 习(NU)' },
  { word: '键盘', pinyin: 'jiàn pán', code86: 'QVTE', code98: 'QVTE', codeNew: 'QVTE', breakdown: '键(QV) + 盘(TE)' },
  { word: '字根', pinyin: 'zì gēn', code86: 'PBSV', code98: 'PBSV', codeNew: 'PBSV', breakdown: '字(PB) + 根(SV)' },
  { word: '世界', pinyin: 'shì jiè', code86: 'ANLW', code98: 'ANLW', codeNew: 'ANLW', breakdown: '世(AN) + 界(LW)' },
  { word: '科技', pinyin: 'kē jì', code86: 'TURF', code98: 'TURF', codeNew: 'TURF', breakdown: '科(TU) + 技(RF)' },
  { word: '创新', pinyin: 'chuàng xīn', code86: 'WBUS', code98: 'WBUS', codeNew: 'WBUS', breakdown: '创(WB) + 新(US)' },
  { word: '技术', pinyin: 'jì shù', code86: 'RFSI', code98: 'RFSI', codeNew: 'RFSI', breakdown: '技(RF) + 术(SI)' },
  { word: '生活', pinyin: 'shēng huó', code86: 'TGIT', code98: 'TGIT', codeNew: 'TGIT', breakdown: '生(TG) + 活(IT)' },
  { word: '工作', pinyin: 'gōng zuò', code86: 'AAWT', code98: 'AAWT', codeNew: 'AAWT', breakdown: '工(AA) + 作(WT)' },
  { word: '时间', pinyin: 'shí jiān', code86: 'JFUJ', code98: 'JFUJ', codeNew: 'JFUJ', breakdown: '时(JF) + 间(UJ)' },
  { word: '春天', pinyin: 'chūn tiān', code86: 'DWGD', code98: 'DWGD', codeNew: 'DWGD', breakdown: '春(DW) + 天(GD)' },
  { word: '荷花', pinyin: 'hé huā', code86: 'AWAW', code98: 'AWAW', codeNew: 'AWAW', breakdown: '荷(AW) + 花(AW)' },
  { word: '快速', pinyin: 'kuài sù', code86: 'NNGK', code98: 'NNSK', codeNew: 'NNGK', breakdown: '快(NN) + 速(GK)' },

  // 三字词（1+1+2规则）
  { word: '计算机', pinyin: 'jì suàn jī', code86: 'YTSM', code98: 'YTSW', codeNew: 'YTSW', breakdown: '计(Y) + 算(T) + 机(SM/SW)' },
  { word: '输入法', pinyin: 'shū rù fǎ', code86: 'LTIF', code98: 'LTIF', codeNew: 'LTIF', breakdown: '输(L) + 入(T) + 法(IF)' },
  { word: '互联网', pinyin: 'hù lián wǎng', code86: 'GBMQ', code98: 'GBMR', codeNew: 'GBMR', breakdown: '互(G) + 联(B) + 网(MQ/MR)' },
  { word: '新世纪', pinyin: 'xīn shì jì', code86: 'UAXN', code98: 'UAXN', codeNew: 'UAXN', breakdown: '新(U) + 世(A) + 纪(XN)' },

  // 四字成语及词组（1+1+1+1规则）
  { word: '科学技术', pinyin: 'kē xué jì shù', code86: 'TIRS', code98: 'TIRS', codeNew: 'TIRS', breakdown: '科(T) + 学(I) + 技(R) + 术(S)' },
  { word: '一心一意', pinyin: 'yī xīn yī yì', code86: 'GNGU', code98: 'GNGU', codeNew: 'GNGU', breakdown: '一(G) + 心(N) + 一(G) + 意(U)' },
  { word: '自强不息', pinyin: 'zì qiáng bù xī', code86: 'TXGT', code98: 'TXDT', codeNew: 'TXDT', breakdown: '自(T) + 强(X) + 不(G/D) + 息(T)' },
  { word: '春暖花开', pinyin: 'chūn nuǎn huā kāi', code86: 'DJAG', code98: 'DJAG', codeNew: 'DJAG', breakdown: '春(D) + 暖(J) + 花(A) + 开(G)' },
  { word: '海纳百川', pinyin: 'hǎi nà bǎi chuān', code86: 'IXDK', code98: 'IXDK', codeNew: 'IXDK', breakdown: '海(I) + 纳(X) + 百(D) + 川(K)' },
  { word: '日新月异', pinyin: 'rì xīn yuè yì', code86: 'JUEN', code98: 'JUEN', codeNew: 'JUEN', breakdown: '日(J) + 新(U) + 月(E) + 异(N)' },
  { word: '厚德载物', pinyin: 'hòu dé zài wù', code86: 'DTFT', code98: 'DTFT', codeNew: 'DTFT', breakdown: '厚(D) + 德(T) + 载(F) + 物(T)' },

  // 多字长词（1+1+1+末1规则）
  { word: '中华人民共和国', pinyin: 'zhōng huá rén mín gòng hé guó', code86: 'KWWL', code98: 'KWWL', codeNew: 'KWWL', breakdown: '中(K) + 华(W) + 人(W) + ... + 国(L)' },
  { word: '中国特色社会主义', pinyin: 'zhōng guó tè sè shè huì zhǔ yì', code86: 'KLTY', code98: 'KLCY', codeNew: 'KLTY', breakdown: '中(K) + 国(L) + 特(T/C) + ... + 义(Y)' }
];

// 构建融合了 3,000 条现代高频词的常用词组全集
const canonicalWords = new Set(CANONICAL_PHRASES.map(p => p.word));
const additionalDynamic = getAllDynamicPhrases().filter(p => !canonicalWords.has(p.word));

/**
 * 全量扩容词组库（3,000+ 条高频词组，全部动态算码支持）
 */
export const COMMON_PHRASES: WubiPhraseData[] = [
  ...CANONICAL_PHRASES,
  ...additionalDynamic
];

export {
  getAllDynamicPhrases,
  getPhrasesByLength,
  getDynamicPhrase,
  HIGH_FREQ_PHRASES
};

