export type WubiVersion = '86' | '98' | 'newCentury';

export type PracticeCategory = 
  | 'root'        // 字根专练
  | 'level1'      // 一级简码
  | 'level2'      // 二级简码
  | 'level3'      // 三级简码
  | 'top500'      // 常用前500字
  | 'top1500'     // 常用前1500字
  | 'top3500'     // 常用3500字
  | 'single'      // 常用单字
  | 'phrase'      // 词组特训
  | 'article'     // 完整文章练习
  | 'mistakes';   // 错题复练

export type InputMode = 
  | 'full'        // 看字打全码
  | 'quick'       // 简码专练
  | 'smart';      // 简码优先实战

export type CommitMode = 'auto' | 'space'; // 'auto': 打对即走(无需空格) | 'space': 空格出字

export type ThemeName = 
  | 'tokyo-night' // 暗夜赛博
  | 'retro-beige' // 复古机械
  | 'nord-frost'  // 北欧极光
  | 'paper-ink'   // 纸墨素雅
  | 'matrix-green'; // 黑客终端

export type AudioEffect = 'blue-switch' | 'red-switch' | 'typewriter' | 'none';

export interface KeyRootInfo {
  key: string;              // 字母键，如 'G'
  zone: 0 | 1 | 2 | 3 | 4 | 5;  // 0:通配 1:横 2:竖 3:撇 4:捺 5:折
  position: number;         // 0-5
  code: string;             // 区位码，如 '11'
  keyName: string;          // 键名字，如 '王'
  mnemonic: string;         // 口诀，如 '王旁青头戋五一'
  mainRoots: string[];      // 主要字根
  allRoots: string[];       // 包含的所有字根
  notes?: string;           // 变体说明
}

export interface WubiCharData {
  char: string;             // 汉字
  pinyin: string;           // 拼音（带声调）
  pinyinPlain?: string;     // 纯字母拼音（无声调，方便快速拼音检索）
  code86: string;           // 86版全码
  code98: string;           // 98版全码
  codeNew: string;          // 新世纪全码
  short86?: string;         // 86版简码
  short98?: string;         // 98版简码
  shortNew?: string;        // 新世纪版简码
  roots86: string[];        // 86版拆分字根列表
  roots98: string[];        // 98版拆分字根列表
  rootsNew: string[];       // 新世纪版拆分字根列表
  recognitionCode?: string; // 识别码（若有）
  recognitionFlag?: string; // 识别码汉字结构规则，如 '折·杂合〔乛 ⿻〕'
  ids?: string;             // 汉字结构序列，如 '⿷匚也'
  strokes?: number;         // 笔画数
  radical?: string;         // 部首
  frequency?: number;       // 词频顺序
  type?: 'keyname' | 'formed' | 'general'; // 键名/成字/合体字
}

export interface WubiPhraseData {
  word: string;
  pinyin: string;
  code86: string;
  code98: string;
  codeNew: string;
  breakdown: string;        // 拆分规则说明，如 '首字前2码 + 次字前2码'
}

export interface ArticleTopic {
  id: string;
  title: string;
  author: string;
  category: 'classic' | 'wubi-drill' | 'poetry' | 'modern' | 'idiom' | 'history' | 'news' | string;
  categoryName: string;
  description: string;
  content: string;
  charCount: number;
}

export interface TypingStats {
  wpm: number;              // 每分钟汉字数
  kpm: number;              // 每分钟击键数 (Keystrokes per minute)
  accuracy: number;         // 准确率 0-100%
  totalChars: number;       // 总字数
  correctChars: number;     // 正确字数
  errorChars: number;       // 错误字数
  elapsedSeconds: number;   // 耗时(秒)
  backspaceCount: number;   // 退格次数
}

export interface MistakeRecord {
  char: string;
  errorCodes: string[];     // 用户的错误击键记录
  correctCode: string;
  roots: string[];
  count: number;
  lastErrorTime: number;
}
