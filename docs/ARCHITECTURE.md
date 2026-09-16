# 🛠️ 五笔学堂 (Wubi Master) 技术架构与核心算法文档

> 最后更新：2026-09-16 v1.6.0  
> 文档版本：v1.6.0 (RPG 修仙闯关系统、智能简码防抖与 E2E 自动化测试体系)

## 一、技术栈选型

| 类别 | 技术选型 | 说明 |
|------|---------|------|
| 核心框架 | [Vue 3.5.42](https://vuejs.org/) | SFC + `<script setup>` + Composition API |
| 开发语言 | [TypeScript 6.0.2](https://www.typescriptlang.org/) | 全链路严格类型检查 |
| 构建工具 | [Vite 8.3.0](https://vitejs.dev/) + [Bun](https://bun.sh/) | 毫秒级编译与极速 HMR，构建仅需 ~300ms |
| 测试框架 | [Vitest 5.0.0](https://vitest.dev/) + [Puppeteer 24.40](https://pptr.dev/) | 自动化单元测试（98 tests / 26k assertions）+ 13 关全量 E2E 真实浏览器打字自动化巡检 |
| 状态管理 | [Vue 3 Composition Store](https://vuejs.org/) | 原生响应式单例（`ref` + `reactive`），集中管理五笔版本、输入模式、出字模式、错题本及 RPG 修仙系统（`useRpgStore`） |
| 本地数据库 | [Dexie.js 4.4.6](https://dexie.org/) | 封装 IndexedDB，28,058 汉字持久化 + 7 重多维索引 |
| 图标库 | [lucide-vue-next 1.0.0](https://lucide.dev/) | 现代矢量线性图标 |
| 动画特效 | [canvas-confetti 1.9.4](https://www.npmjs.com/package/canvas-confetti) | 通关庆祝礼花动效 |

---

## 二、整体架构图

### 2.1 核心数据流

```
┌─────────────────────────────────────────────────────────────────┐
│                        用户交互层                                 │
│  Navbar.vue (导航切换) + 核心功能组件                            │
│  ├─ TypeEngine.vue          (单字/字根/词组打字练习主引擎)        │
│  ├─ RpgAdventure.vue        (五笔修仙打怪RPG/ATB时序/大招/秘宝)   │
│  ├─ ArticlePractice.vue     (长文篇章实战+自定义导入+平滑跟滚动) │
│  ├─ TypingChaseGame.vue     (极速追逐赛 2.5D 竞技游戏)            │
│  ├─ VirtualKeyboard.vue     (交互式五笔大键盘与按键高亮)          │
│  ├─ RuleTutorial.vue        (拆字规则互动教学与识别码实验室)      │
│  ├─ WubiLookup.vue          (全量汉字反查+多模态搜索+词组推导)    │
│  └─ MistakeNotebook.vue     (错题生字本与练习回溯)                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ keydown / input events
┌─────────────────────────────────────────────────────────────────┐
│                    wubiEngine.ts (判卷引擎)                       │
│  evaluateInput()  —— 编码校验（全码/简码/前缀匹配/输入法直通）    │
│  calculateStats() —— WPM / KPM / 准确率实时计算                  │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
    ┌─────────┐      ┌──────────────┐      ┌──────────┐
    │ Audio   │      │ Vue 3 Store  │      │  字典层  │
    │ 声效合成│      │(useWubiStore)│      │ 查询API  │
    └─────────┘      └──────────────┘      └──────────┘
                              │                   │
                              ▼                   ▼
                     ┌─────────────────────────────────┐
                     │  localStorage (用户偏好持久化)   │
                     │  - 五笔版本 (86/98/新世纪)       │
                     │  - 主题模式 (light/dark/auto)   │
                     │  - 输入模式 (full/quick/smart)  │
                     │  - 出字模式 (auto/space)        │
                     │  - 错题生字本记录               │
                     └─────────────────────────────────┘
```

### 2.2 字典数据架构（三级缓存链路）

```
┌──────────────────────────────────────────────────────────────┐
│                    字典查询入口 (wubiDict / wubiDb)            │
│  lookupWubiChar(char) [同步] / queryByChar(char) [异步]        │
└──────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌──────────────────┐  ┌──────────────┐  ┌────────────────────┐
│ L1: 精修字优先   │  │ L2: 内存常用 │  │ L3: IndexedDB全量  │
│ (最高权威)       │  │ (同步命中)   │  │ (异步查询)         │
│                  │  │              │  │                    │
│ EXPERT_CORRECTED │  │ WUBI_CHAR_   │  │ db.chars.get()     │
│ _CHARS (30字)    │  │ MAP (3,500)  │  │ (28,058字)         │
│                  │  │              │  │                    │
│ 精修字根补丁     │  │ 基础字根表   │  │ 7重索引多维检索    │
│ (业/亚/晋等)     │  │ (命中率99%)  │  │ - 汉字/编码/拼音   │
└──────────────────┘  └──────────────┘  └────────────────────┘
         │                   │                   │
         └───────────────────┴───────────────────┘
                              │
                              ▼
                    返回 WubiCharData 对象
              (含86/98/新世纪三版全码+简码+字根数组)
```

---

## 三、字典数据层架构（双层存储设计）

### 3.1 双层存储设计原理

**设计目标**：首屏零阻塞秒开 + 2.8 万全量字库按需快速检索

| 层级 | 数据源 | 字符数 | 加载方式 | 命中率 | 用途 |
|------|--------|--------|----------|--------|------|
| **L1 内存常用字库** | `wubiCommonDictData.ts` | 3,500 | 首屏同步静态导入 | ~99% | 所有练习模式零延迟即时响应 |
| **L2 IndexedDB 全量库** | `wubiFullDictData.ts` | 28,058 | 异步动态分块按需载入 | 100% | 疑难生僻字反查 + 编码前缀联想 + 拼音检索 |

**性能成果**：
- 首屏主包 gzip 压缩后仅 **379KB**（较分离前降低 50%，原体积 ~767KB）
- 全量字典独立分块 gzip 512KB（通过 Vite Code-Splitting 独立异步拆分）
- IndexedDB 建库耗时约 2s（通过 `requestIdleCallback` 浏览器空闲时调度，完全不阻塞首屏打字交互）

### 3.2 数据优先级链

```typescript
// 查询流程：内存精修与常用字（WUBI_CHAR_MAP） > IndexedDB 客户端缓存 > 全量字典解析兜底
export const queryByChar = async (char: string): Promise<WubiCharData | undefined> => {
  // ① 内存 WUBI_CHAR_MAP（优先命中手工精修字与 3,500 常用字，<0.01ms）
  const { WUBI_CHAR_MAP, lookupWubiChar } = await import('./wubiDict');
  const inMemory = WUBI_CHAR_MAP.get(char);
  if (inMemory) return inMemory;

  // ② 内存未命中（生僻字），查 IndexedDB
  try {
    const item = await db.chars.get(char);
    if (item) return item;
  } catch (e) {
    console.warn(`[WubiDb] queryByChar error for ${char}:`, e);
  }

  // ③ 最终兜底：从全量字典模块查
  return lookupWubiChar(char);
};
```

**精修字典 (`EXPERT_CORRECTED_CHARS`) 的架构意义**：
- 解决原始数据中历史遗留的错拆（如 O 键误标为 `灬`、足部展开等）
- 模块初始化时直接注入 `WUBI_CHAR_MAP`，保证优先于任何低级数据
- 启动时通过 `applyDbCorrections()` 自动将精修数据写回 IndexedDB，老用户无感升级

### 3.3 11 元组紧凑存储格式

字典原始数据采用紧凑数组元组存储，避免 2.8 万个 JavaScript 对象键名产生的数兆内存开销：

```typescript
export type RawDictTuple = [
  char: string,       // [0] 汉字本体，如 '男'
  pinyin: string,     // [1] 汉语拼音（带声调），如 'nán'
  c86: string,        // [2] 86 版全码，如 'LLB'
  c98: string,        // [3] 98 版全码，如 'LER'
  cNew: string,       // [4] 新世纪版全码，如 'LER'
  s86?: string,       // [5] 86 版简码（可选），如 'LL'
  s98?: string,       // [6] 98 版简码（可选）
  sNew?: string,      // [7] 新世纪简码（可选）
  r86?: string[],     // [8] 86 版构字字根数组，如 ['田', '力']
  r98?: string[],     // [9] 98 版构字字根数组
  rNew?: string[]     // [10] 新世纪构字字根数组
];
```

解析时经 `parseRawEntry()` 处理，附加识别码与元数据转换为结构化 `WubiCharData` 对象。

---

## 四、字根规范化流水线

### 4.1 `normalizeRoots()` — 自动规范化引擎（7 条规则）

原始字典存在系统性错标与生僻字符编码丢失，通过 `normalizeRoots` 在数据解析时执行管道清洗：

| 规则 | 触发条件 | 修正内容 | 受益汉字示例 |
|:---:|---------|---------|-------------|
| 1 | 编码含 `QG` + 鱼部字 | `⺈ + 一` 升级为 `⺈田`（无尾鱼复合字根） | 鱼、鲁、鲜、鲫、鲤 |
| 2 | 编码 `ME` 开头（骨字头） | `冂 + 冃` 规范为 `冎 + 月`（骨字头专用构件） | 骨、骷、骼、骸 |
| 3 | 编码含 `W` + 祭字头字 | `癶/𠂊` 纠正为 `祭头`（严格区别于登字头） | 蔡、祭、察、擦 |
| 4 | 编码 `KH` 开头（足字旁） | `⻊` 展开为 86 版正统字根 `口 + 止` | 跑、跳、跃、路、踩 |
| 5 | 编码 `AF` 开头（革字旁） | `革` 展开为 86 版正统字根 `廿 + 十` | 鞋、靴、鞭、勒、鞍 |
| 6 | 含生僻 Unicode / PUA 乱码 | `𡭔→小`、`𱼀→⺼`、`𭕄→⺌`、`𰀁→二` 等替换为通用标准字形 | 未、刺、策、枣、胜 |
| 7 | 编码含 `OG`/`GO` + `灬` | `灬` 纠正为 `业头`（口诀“火业头，四点米”中 O 键的业字头） | 业、亚、晋、严、恶、哑等 14 字 |

**规则 7 核心逻辑**：
```typescript
if (code && (code.includes('OG') || code.includes('GO')) && res.includes('灬')) {
  res = res.map(r => r === '灬' ? '业头' : r);
}
```

### 4.2 字根显示规范化（双映射管道）

字根从内部数据模型到用户界面，经过解耦的双层转换管道：

```
① 内部存储标签（如 '业头'、'祭头'、'⺈田'）
        │
        ▼ ROOT_GLYPH_NORMALIZE (描述标签 → 可视字形)
        │
② MiZiGe 米字格主字形（如 '业'、'祭头' [SVG渲染]、'⺈田' [上下叠放]）
        │
        ▼ ROOT_NAME_MAP (可视字形/标签 → 中文注释)
        │
③ 格子底部角标与提示（如 '业字头'、'祭字头'、'无尾鱼'）
```

**映射表配置**：
```typescript
// 描述标签转换为标准显示字形
export const ROOT_GLYPH_NORMALIZE: Record<string, string> = {
  '业头': '业',
  '祭字头': '祭头',
  '无尾鱼': '⺈田',
  '水侧': '氺',
  '止底': '龰',
  // ...
};

// 显示字形对应中文注释
export const ROOT_NAME_MAP: Record<string, string> = {
  '业': '业字头',
  '祭头': '祭字头',
  '⺈田': '无尾鱼',
  '冎': '骨字头',
  '⺼': '肉月旁',
  // ...
};
```

---

## 五、IndexedDB 数据库架构（`wubiDb.ts`）

### 5.1 数据库结构（Dexie.js Schema）

```typescript
export class WubiDatabase extends Dexie {
  chars!: Table<WubiCharData, string>;  // 主表：汉字数据
  meta!: Table<DbMetaItem, string>;     // 元数据：建库标记与同步版本

  constructor() {
    super('WubiMasterDB');
    this.version(2).stores({
      // chars 表：7 重索引全面支持多模态反查与快速联想
      chars: 'char, code86, code98, codeNew, pinyin, pinyinPlain, strokes, radical',
      // meta 表：键值对元数据存储
      meta: 'key'
    });
  }
}
```

### 5.2 多模态智能搜索引擎（`searchMultiModal`）

单一搜索框自动识别用户意图并分流至最优索引策略：

| 输入类型 | 识别正则 | 检索策略 | 索引字段 | 示例 |
|---------|---------|---------|---------|------|
| **单个汉字** | `[\u4e00-\u9fa5]` | `queryByChar()` 精确命中 | `char` 主键 | `亚` → GOGD |
| **五笔编码** | `^[a-zA-Z]{1,4}$` | 完全匹配 + 前缀匹配联想 | `code86/98/codeNew` | `KH` → 跑、跳、路 |
| **拼音字母** | `^[a-zA-Z]+$` | 纯字母拼音前缀索引 | `pinyinPlain` | `pao` → 跑、炮、泡 |
| **整词短语** | 连续汉字（长度≥2） | 分字解析 + 词组取码算法 | 组合索引 | `五笔学堂` → GTIP |

### 5.3 数据库补丁同步机制（`applyDbCorrections`）

解决老用户浏览器中已缓存旧版错误字根（如 `灬`）的问题：

```typescript
export const applyDbCorrections = async (): Promise<void> => {
  try {
    const CORRECTIONS_KEY = 'corrections_v1';
    const already = await db.meta.get(CORRECTIONS_KEY);
    if (already && already.value === true) return;

    const { WUBI_CHAR_MAP, EXPERT_CORRECTED_CHARS } = await import('./wubiDict');

    const RULE_CORRECTED_CHARS = [
      '晋', '亚', '业', '恶', '严', '哑', '娅', '垩', '垭', '戬', '桠', '痖', '鄑', '挜'
    ];
    const allTargetChars = new Set([
      ...RULE_CORRECTED_CHARS,
      ...EXPERT_CORRECTED_CHARS.map(c => c.char)
    ]);

    const toUpdate: WubiCharData[] = [];
    for (const ch of allTargetChars) {
      const corrected = WUBI_CHAR_MAP.get(ch);
      if (corrected) toUpdate.push(corrected);
    }

    if (toUpdate.length > 0) {
      await db.chars.bulkPut(toUpdate);
    }
    await db.meta.put({ key: CORRECTIONS_KEY, value: true });
  } catch (e) {
    console.warn('[WubiDb] applyDbCorrections error:', e);
  }
};
```

---

## 六、真实字根与末笔识别码解耦算法（`getCharBreakdown`）

### 6.1 识别码黄金判定律

**学术标准**：凡拆出 4 个或 4 个以上字根的汉字，各键位均为真实字根，**绝无末笔交叉识别码**；仅在字根少于 4 个、非键名字/单笔画、且全码长度大于字根数时，末位才是末笔识别码。

```typescript
export const getCharBreakdown = (charData: WubiCharData, version: WubiVersion): CharBreakdownInfo => {
  let rawRoots: string[] = [];
  switch (version) {
    case '98': rawRoots = charData.roots98 || []; break;
    case 'newCentury': rawRoots = charData.rootsNew || []; break;
    case '86': default: rawRoots = charData.roots86 || []; break;
  }

  // 规范化字根标签，将“业头”等转换为显示字形“业”
  const roots = rawRoots.map(r => ROOT_GLYPH_NORMALIZE[r] || r);
  const fullCode = getFullCode(charData, version).toUpperCase();

  const isKeyName = charData.type === 'keyname' || 
    (roots.length === 1 && fullCode.length === 4 && fullCode[0] === fullCode[1] && fullCode[1] === fullCode[2] && fullCode[2] === fullCode[3]) ||
    ['GGLL', 'HHLL', 'TTLL', 'YYLL', 'NNLL'].includes(fullCode);

  if (roots && roots.length > 0) {
    let recognitionCode: string | undefined = undefined;
    // 黄金判定：字根数不足 4 且全码长于字根数时，末位才为识别码
    if (!isKeyName && roots.length < 4 && fullCode.length > roots.length) {
      recognitionCode = charData.recognitionCode || fullCode[fullCode.length - 1];
    }

    const rootSteps: RootStep[] = roots.map((r, i) => ({
      root: r,
      key: fullCode[i] || ''
    }));

    return { roots, rootSteps, recognitionCode };
  }

  return { roots: [], rootSteps: [], recognitionCode: undefined };
};
```

### 6.2 典型汉字拆解对比

| 汉字 | 86 全码 | 字根数 | 构字字根 | 末笔识别码 | 说明 |
|:---:|:---:|:---:|:---|:---:|:---|
| **跑** | KHQN | 4 | `口` `止` `勹` `巳` | 无 | 四码全满，绝无假识别码 |
| **晋** | GOGJ | 4 | `一` `业` `一` `日` | 无 | 四码全满，O 键为业字头 |
| **业** | OGD | 2 | `业` `一` | D (横·杂合) | 2 字根，D 为末笔横交叉识别码 |
| **亚** | GOGD | 3 | `一` `业` `一` | D (横·杂合) | 3 字根，D 为末笔识别码 |
| **中** | KHK | 2 | `口` `丨` | K (竖·杂合) | 2 字根，K 为末笔竖交叉识别码 |
| **工** | AAAA | 1 | `工` | 无 | 键名字，连击 4 键 |

---

## 七、词组五笔自动推导算法（`getPhraseBreakdown`）

### 7.1 词组取码规则表

| 词长 | 取码规则 | 编码公式 | 权威实测示例 |
|:---:|:---:|:---|:---|
| **双字词** | 前二 + 次二 | `char[0]` 前 2 码 + `char[1]` 前 2 码 | 五笔 → `五(GG)` + `笔(TT)` = **`GGTT`** |
| **三字词** | 首 + 首 + 前二 | `char[0]` 首码 + `char[1]` 首码 + `char[2]` 前 2 码 | 计算机 → `计(Y)` + `算(T)` + `机(SM)` = **`YTSM`** |
| **四字词** | 各取首码 | `char[0..3]` 各取首码 | 春暖花开 → `春(D)` + `暖(J)` + `花(A)` + `开(G)` = **`DJAG`** |
| **多字词** | 首三 + 末首 | `char[0..2]` 各首码 + `char[末]` 首码 | 中华人民共和国 → `中(K)` + `华(W)` + `人(W)` + `国(L)` = **`KWWL`** |

### 7.2 算法实现（同步推导）

```typescript
export const getPhraseBreakdown = (phrase: string, version: WubiVersion = '86'): PhraseBreakdownInfo => {
  const chars = Array.from(phrase.replace(/[^\u4e00-\u9fa5]/g, ''));
  const fullCode = calculatePhraseCode(phrase, version).toUpperCase();

  const getCharFull = (ch: string) => {
    const item = lookupWubiChar(ch);
    return item ? getFullCode(item, version).toUpperCase() : '';
  };

  const steps: PhraseCharStep[] = [];
  // 1. 双字词：第1字前2码 + 第2字前2码
  // 2. 三字词：第1字首码 + 第2字首码 + 第3字前2码
  // 3. 四字词：第1~4字各取首码
  // 4. 多字词：第1~3字各取首码 + 末字首码
  return { phrase, code: fullCode, ruleName, ruleDesc, steps };
};
```


---

## 八、双模式输入判卷引擎（`wubiEngine.ts`）

### 8.1 输入模式设计

```typescript
export const evaluateInput = (
  inputBuffer: string,
  charData: WubiCharData,
  mode: InputMode,         // 'full' | 'quick' | 'smart'
  version: WubiVersion,    // '86' | '98' | 'newCentury'
  hasPressedSpace = false,
  commitMode: CommitMode = 'auto' // 'auto' | 'space'
): EvaluationResult => {
  const cleanInput = inputBuffer.trim().toUpperCase();
  const fullCode = getFullCode(charData, version).toUpperCase();
  const shortCode = getShortCode(charData, version)?.toUpperCase();

  // 1. 中文输入法直通兼容：输入内容即目标汉字时直接判定成功
  if (cleanInput === charData.char || inputBuffer.trim() === charData.char) {
    return { isMatch: true, matchedVia: 'full', isPrefixMatch: false };
  }

  // 2. 字母编码匹配分支（含自动出字与空格出字判定）
  // ...
};
```

### 8.2 实时打字指标计算公式

```typescript
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
```

---

## 九、全局状态管理（Vue 3 响应式 Store）

采用原生 Vue 3 Composition API 构建的轻量级单例 Store (`src/stores/useWubiStore.ts`)：

```typescript
// 全局响应式状态单例
const version = ref<WubiVersion>(getSavedVersion());
const theme = ref<ThemeName>(getSavedTheme());
const audio = ref<AudioEffect>(getSavedAudio());
const inputMode = ref<InputMode>(getSavedInputMode());
const commitMode = ref<CommitMode>((localStorage.getItem('wubi_commit_mode') as CommitMode) || 'auto');
const activeTab = ref<MainTab>(getInitialTab());
const mistakeList = ref<MistakeRecord[]>(getMistakes());

export function useWubiStore() {
  return {
    version, theme, audio, inputMode, commitMode, activeTab,
    mistakeList,
    setVersion, setTheme, setAudio, setInputMode, setCommitMode,
    recordMistake, deleteMistake, resetAllMistakes
  };
}
```

**持久化边界**：
- `localStorage`：五笔版本、主题色、按键音效、输入模式、出字模式、错题本生字列表
- 组件内部 `ref`：实时击键缓存、输入进度 `charIndex`、计时器句柄

---

## 十、长文阅读平滑跟滚动（`ArticlePractice.vue`）

在篇章全文实战中，激活字始终保持在视觉中心：

```typescript
currentEl.scrollIntoView({
  behavior: 'smooth',
  block: 'center',
  inline: 'nearest'
});
```

---

## 十一、RPG 修仙打怪闯关引擎与状态机架构

### 11.1 模块结构与状态设计 (`useRpgStore.ts` + `RpgAdventure.vue`)

修仙闯关模块采用 Pinia / Vue Composition Store 进行全局跨会话持久化（LocalStorage 保存境界等级、关卡星级、金币与背包法宝），`RpgAdventure.vue` 维护当前战场高频微观状态机：

```typescript
// 核心战场状态机
interface RpgBattleState {
  currentStageId: number;         // 1 ~ 13
  stageTargets: string[];         // 原始关卡词库 (400+ 字符)
  activeStageTargets: string[];   // 当前作战目标队列 (支持乱序洗牌)
  currentTargetIndex: number;     // 当前需敲击字下标
  playerHp: number;               // 玩家当前生命值 (0 ~ 100)
  playerMaxHp: number;
  monsterHp: number;              // Boss 动态血量
  monsterMaxHp: number;
  monsterAtb: number;             // ATB 攻击充能条 (0 ~ 100%)
  swordEnergy: number;            // 飞剑灵气值 (0 ~ 100%)
  comboCount: number;             // 连续连击击键计数
  isBossFrozen: boolean;          // 是否处于万剑归宗冰冻状态
  isBossEnraged: boolean;         // 残血狂暴状态 (Hp <= 35%)
  battleState: 'idle' | 'fighting' | 'victory' | 'defeat';
}
```

### 11.2 智能 120ms 防抖自动跳字算法 (`checkAutoCommit`)

为同时兼顾**多级简码（一/二/三级）即停即跳**与**全码快速盲打不吞键**，构建了基于动态定时器的智能判定管道：

```
用户击键输入
    │
    ├─ 1. 比对是否命中有效编码集 (有效包含所有一级/二级/三级简码与全码)
    │
    ├─ 2. 若命中四码全码：
    │      └── 立即触发 commitAndAdvance()，清除任何挂起的定时器
    │
    └─ 3. 若命中合法简码 (如 "木" 打 "SS")：
           ├── 先行记录候选成功态
           ├── 启动 120ms 防抖计时器: autoCommitTimer = setTimeout(..., 120)
           │
           ├── 若用户 120ms 内停顿：
           │      └── 定时器触发，自动判定该字完成并平滑跳至下一目标字
           │
           └── 若用户 120ms 内继续输入第 3、第 4 码（全码击键）：
                  └── 快速下一次击键立即 clearTimeout(autoCommitTimer)，
                      继续按全码判定，彻底杜绝任何按键漏判与吞字！
```

### 11.3 Fisher-Yates 动态内存洗牌（乱序破阵）

针对用户二次通关或温习时容易产生“位置记忆/死记硬背”的问题，设计了完全解耦的动态洗牌算法：

```typescript
function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
```
已通关的关卡在胜利结算时提供「🎲 乱序破阵」与「📖 循序复习」双入口，每次重玩生成全新输入序列，极大强化五笔即时反应能力。

### 11.4 Puppeteer 13 关端到端自动化测试巡检体系

在 `scripts/e2eAllStagesHarness.ts` 中封装了基于真实 Chromium 浏览器的 E2E 自动化测试 Harness：
1. **真实 DOM 挂载**：启动 `localhost:5173` 本地 Vite 服务，由 Puppeteer 打开无头浏览器并导航至 `/#rpg`；
2. **全流程拟真打字**：遍历 1 到 13 关，调用字典引擎实时获取当前字五笔编码，向页面输入框注入真实键盘击键；
3. **关键边界与异常注入验证**：
   - 故意输入错误键（如输入 `Z`），断言触发屏幕震颤与玩家扣血；
   - 测试二级简码（如针对 `木` 输入 `SS`），断言 120ms 自动前进；
   - 蓄力完成后触发 `Tab` 键释放「万剑归宗」，断言粒子特效生成与 Boss 冰冻；
   - 击败首领后断言胜利弹窗与秘宝箱点击掉落道具逻辑；
4. **全自动快照归档**：每关通关自动截取 1080P 高清页面渲染快照至 `e2e_screenshots/`。

---

## 十二、构建性能与打包指标

| 指标 | 数值 | 说明 |
|------|------|------|
| **首屏主包 JS (gzip)** | **386KB** | 新增 RPG 引擎与题库后依然保持极致轻量 |
| **首屏主包 CSS (gzip)** | **15.2KB** | 紧凑原子样式与 RPG 特效动画 |
| **全量字典独立分块 (gzip)** | **512KB** | `wubiFullDictData` 独立异步加载 |
| **Vite 生产构建耗时** | **~300ms** | Bun + Vite 原生速度 |
| **内存 Map 命中耗时** | **<0.01ms** | `WUBI_CHAR_MAP` 同步哈希查找 |
| **IndexedDB 检索延迟** | **1~5ms** | 客户端本地倒排索引 |

---

## 十三、核心组件规模与职责划分

| 组件 | 代码行数 | 核心职责 | 关键交互 |
|------|---------|---------|---------|
| **RuleTutorial.vue** | 2,681 行 | 拆字规则互动教学 | 四大基本原则图解、避坑大 PK、末笔识别码 5×3 交互实验室 |
| **TypingChaseGame.vue** | 1,700 行 | 极速追逐赛游戏 | 2.5D 双车道赛车、30~120 WPM 四档 AI 速度梯队、终点礼花战报 |
| **ArticlePractice.vue** | 1,606 行 | 长文篇章实战练习 | 传世名篇无删减全文、视口自动平滑居中跟随、.txt/.md 自定义导入 |
| **TypeEngine.vue** | 1,311 行 | 核心打字练习引擎 | 一级简码/键名/常用字分级特训、实时 WPM/KPM、动态米字格印章 |
| **RpgAdventure.vue** | 1,230 行 | 修仙打怪闯关 RPG | 十三修仙关卡、ATB 即时战斗时序、飞剑蓄力/万剑归宗大招、战利品宝箱、乱序重玩 |
| **WubiLookup.vue** | 1,129 行 | 全量汉字反查与推导 | 汉字/编码/拼音三合一多模态检索、三代编码同屏对比、候选字联想网格 |
| **VirtualKeyboard.vue** | 484 行 | 交互式五笔大键盘 | 5 大区位色谱映射、字根表悬停提示、敲击实时键帽下沉动画 |
| **Navbar.vue** | 320 行 | 顶部导航与全局设置 | 8 大功能 Tab 切换、三版五笔无感切换、出字模式与音效控制面板 |
| **MistakeNotebook.vue** | 315 行 | 错题生字本管理 | 打错字自动收录、三代编码与字根回溯、一键针对性重练 |
| **MiZiGe.vue** | 228 行 | 传统书法米字格组件 | SVG 矢量十字与对角线、特殊复合字根（⺈田/祭头）专用渲染 |

---

> 📖 **配套技术手册**  
> - [字根数据维护技术手册 (DATA_MAINTENANCE.md)](./DATA_MAINTENANCE.md)  
> - [产品功能设计规范 (PRODUCT.md)](./PRODUCT.md)  
> - [版本变更记录 (../CHANGELOG.md)](../CHANGELOG.md)
