# 🛠️ 五笔学堂 (Wubi Master) 技术架构与核心算法文档

> 最后更新：2026-09-17 v1.7.3  
> 文档版本：v1.7.3 (组件解耦分层架构、输入调度 Composable 状态机与统一 E2E 自动化巡检体系)

## 一、技术栈选型

| 类别 | 技术选型 | 说明 |
|------|---------|------|
| 核心框架 | [Vue 3.5.42](https://vuejs.org/) | SFC + `<script setup>` + Composition API |
| 开发语言 | [TypeScript 6.0.2](https://www.typescriptlang.org/) | 全链路严格类型检查，消除所有非标属性与类型告警 |
| 构建工具 | [Vite 8.3.0](https://vitejs.dev/) + [Bun](https://bun.sh/) | 毫秒级编译与极速 HMR，固定 5175 端口开发调试 |
| 测试框架 | [Vitest 5.0.0](https://vitest.dev/) + [Puppeteer 25.11](https://pptr.dev/) | 自动化单元测试（7套件 / 99 tests）+ 统一 E2E 全链路真机巡检（61 项全量 PASS） |
| 状态管理 | [Vue 3 Composition Store](https://vuejs.org/) | 原生响应式单例（`ref` + `reactive`），集中管理五笔版本、输入模式、出字模式、错题本及 RPG 修仙系统（`useRpgStore`） |
| 业务逻辑状态机 | [Vue 3 Composables](https://vuejs.org/) | 下沉底层输入调度引擎（`useRpgInput.ts`、`useChaseInput.ts`），解耦物理按键与视图状态 |
| 本地数据库 | [Dexie.js 4.4.6](https://dexie.org/) | 封装 IndexedDB，28,058 汉字持久化 + 7 重多维索引，实现错题本自动无损迁移 |
| 图标库 | [lucide-vue-next 1.0.0](https://lucide.dev/) | 现代矢量线性图标 |
| 动画特效 | [canvas-confetti 1.9.4](https://www.npmjs.com/package/canvas-confetti) | 通关庆祝礼花动效 |

---

## 二、整体架构图

### 2.1 核心数据流

```
┌─────────────────────────────────────────────────────────────────┐
│                        用户交互层                                 │
│  Navbar.vue (导航与主题) + 核心业务大组件 (结构化子组件拆解)        │
│  ├─ TypeEngine.vue        ──► TypeEngineToolbar / TypeResultModal│
│  ├─ RpgAdventure.vue      ──► RpgShopModal / RpgBattleResultModal │
│  ├─ ArticlePractice.vue   ──► ArticleLibrary / CustomImport / Fin│
│  ├─ TypingChaseGame.vue   ──► ChaseResultModal                   │
│  ├─ RuleTutorial.vue      ──► RuleSplitPrinciples (四大原则/微观) │
│  ├─ WubiLookup.vue        (全量汉字反查+多模态搜索+词组推导)    │
│  ├─ VirtualKeyboard.vue   (交互式五笔大键盘与按键高亮)          │
│  └─ MistakeNotebook.vue   (IndexedDB 错题生字本与练习回溯)      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ keydown / input events
┌─────────────────────────────────────────────────────────────────┐
│              Composables 输入调度层 (业务逻辑状态机)             │
│  useRpgInput.ts   —— 4位卡槽回显、ATB时序连击、0ms出字推进       │
│  useChaseInput.ts —— 赛车竞速按键核销、连击加成与输入防穿透      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
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
                     │  localStorage (白名单枚举校验)  │
                     │  - 五笔版本 (86/98/新世纪)       │
                     │  - 主题模式 (4套高对比度主题)    │
                     │  - 输入出字模式 (auto/space)    │
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

### 11.1 模块结构与状态设计 (`useRpgStore.ts` + `RpgAdventure.vue` + `useRpgInput.ts`)

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

### 11.2 四端统一 0 延迟秒出与 IME 状态机解耦 (`useRpgInput.ts` / `useChaseInput.ts`)

为彻底消除定时器引发的按键吞噬、竞态条件以及中文输入法在空格确认选词时的穿透问题，在 v1.7.3 中重构引入了纯状态机驱动的 0 延迟秒出架构：

```
用户击键输入 (物理键盘 / 虚拟键盘 / 中文输入法)
    │
    ├─ 1. IME 组字流拦截：
    │      ├── compositionstart: 标记 isComposing = true，挂起字符上屏
    │      ├── compositionupdate: 捕获输入法拼音，优先渲染至字符激活槽
    │      ├── compositionend: 记录 lastImeCommitText，释放 isComposing
    │      └── keydown.space: 若正在组字或刚完成选词，阻断默认空格穿透并重置原生 input
    │
    ├─ 2. 4 码秒出瞬间判定 (0 延迟盲打，免敲空格)：
    │      ├── 击键满 4 码且命中合法编码集 (all.includes) → 瞬间触发 onHit()
    │      └── 击键满 4 码且不匹配任何合法编码 → 瞬间触发 onError() 走火入魔扣血
    │
    └─ 3. 单键/简码模式 (commitMode === 'auto' 或一级简码关卡)：
           └── 键入命中一级/二级简码 (shorts.includes) → 即刻触发 onHit()
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

### 11.4 统一端到端自动化巡检 Harness (`scripts/e2eHarness.ts`)

在 `scripts/e2eHarness.ts` 中封装了基于真实 Chromium 浏览器的统一 E2E 自动化测试 Harness：
1. **单一入口架构**：整合全站 8 大核心 UI 模块深度交互测试与 RPG 13 关全自动实战巡检，支持通过命令行参数灵活调度：
   - `bun run test:e2e:ui` (`--ui` 模式)：测试 35 个关键交互断言，用时 ~15 秒，适合日常快速冒烟；
   - `bun run test:e2e:rpg` (`--rpg` 模式)：覆盖全部 13 关打怪、掉宝、大招与结算，用时 ~80 秒；
   - `bun run test:e2e` (全量模式)：按序执行全套 61 项测试断言，100% 验证高可用与零崩溃。
2. **拟真输入与边界注入**：
   - 注入非法字符校验抗崩溃与震颤反馈；
   - 验证简码/全码出字与空格防穿透；
   - 蓄力完成后触发 `Tab` 释放「万剑归宗」，断言粒子特效与 Boss 冰冻；
   - 击败 Boss 后断言秘宝箱点击、聚宝阁弹窗购买及商店金币扣减逻辑；
3. **分目录高清快照归档**：按 `e2e_screenshots/ui/` 与 `e2e_screenshots/rpg/` 自动生成 1080P 高清页面快照。

---

## 十二、超大组件解耦重构与规范化治理

在 v1.7.3 版本中，针对代码库中原有的千行级巨石组件实施了深度解耦与职责剥离，累计重构精简代码超 **2600+ 行**，显著提升了组件可维护性、测试可验证性及渲染性能。

### 12.1 样式内聚规范 (Scoped Styling Principle)
- **禁止样式外溢剥离**：各子组件自身的布局、视觉及动画特效严格保留在子组件的 `<style scoped>` 块内，坚决杜绝抽离为外部全局 CSS 文件导致的样式污染与依赖失控。
- **Props / Emits 单向数据流**：弹窗、工具栏与微观实验室子组件通过清晰的 Typed Props 接收上下文，通过 `defineEmits` 向父组件报告操作事件（如 `close`、`select`、`apply`、`reset`）。

### 12.2 核心解耦拓扑表

| 核心父组件 | 原代码行数 | 重构后行数 | 拆解出的独立子组件 / Composable | 职责边界剥离说明 |
|:---|:---:|:---:|:---|:---|
| **RuleTutorial.vue** | 2,688 行 | **1,424 行** | `src/components/rules/RuleSplitPrinciples.vue` (1,299 行) | 将四大基本拆字原则交互实验室、正误 PK 对决与动态微观拆字试炼完全独立 |
| **TypingChaseGame.vue** | 1,721 行 | **1,529 行** | `src/composables/useChaseInput.ts` (223 行)<br>`src/components/chase/ChaseResultModal.vue` (197 行) | 抽离双车道赛车输入事件状态机与终点礼花结算大弹窗 |
| **ArticlePractice.vue** | 1,809 行 | **1,136 行** | `src/components/article/ArticleLibraryModal.vue` (307 行)<br>`src/components/article/ArticleCustomImportModal.vue` (418 行)<br>`src/components/article/ArticleFinishModal.vue` (168 行) | 抽离分类题库选择大弹窗、双模式自定义题库导入大弹窗及打字结算统计面板 |
| **TypeEngine.vue** | 1,625 行 | **1,336 行** | `src/components/engine/TypeEngineToolbar.vue` (271 行)<br>`src/components/engine/TypeResultModal.vue` (145 行) | 抽离双层练习控制条（选字/批次/开关）与分批练习阶段性结算战报弹窗 |
| **RpgAdventure.vue** | 2,082 行 | **1,876 行** | `src/composables/useRpgInput.ts` (202 行)<br>`src/components/rpg/RpgShopModal.vue` (213 行)<br>`src/components/rpg/RpgBattleResultModal.vue` (326 行) | 抽离修仙输入引擎状态机、聚宝阁法宝丹药商店与胜利/破阵结算大弹窗 |

---

## 十三、构建性能与打包指标

| 指标 | 数值 | 说明 |
|------|------|------|
| **首屏主包 JS (gzip)** | **386KB** | 解耦后依然保持极致轻量，按需加载各子组件 |
| **首屏主包 CSS (gzip)** | **15.2KB** | 紧凑 scoped 样式与矢量特效 |
| **全量字典独立分块 (gzip)** | **512KB** | `wubiFullDictData` 独立异步加载 |
| **Vite 生产构建耗时** | **~300ms** | Bun + Vite 原生速度 |
| **内存 Map 命中耗时** | **<0.01ms** | `WUBI_CHAR_MAP` 同步哈希查找 |
| **IndexedDB 检索延迟** | **1~5ms** | 客户端本地倒排索引 |
| **全量自动化测试通过率** | **100% (160/160)** | 99 项单元测试 + 61 项 E2E 深度断言 |

---

## 十四、核心组件规模与职责划分

| 组件 / 模块 | 代码行数 | 核心职责 | 关键交互 |
|------|:---:|---------|---------|
| **RpgAdventure.vue** | 1,876 行 | 修仙打怪闯关 RPG 主战场 | 十三修仙关卡、ATB 即时战斗时序、飞剑蓄力/万剑归宗大招 |
| **TypingChaseGame.vue** | 1,529 行 | 极速追逐赛主游戏 | 2.5D 双车道赛车、30~120 WPM 四档 AI 速度梯队、终点礼花战报 |
| **RuleTutorial.vue** | 1,424 行 | 拆字规则互动教学主框架 | 规则章节导航、避坑大 PK、末笔识别码 5×3 交互实验室 |
| **TypeEngine.vue** | 1,336 行 | 核心打字练习引擎 | 一级简码/键名/常用字分级特训、实时 WPM/KPM、动态米字格印章 |
| **RuleSplitPrinciples.vue** | 1,299 行 | 拆字四项基本原则实验室 | 兼顾直观/取大优先/能连不交/能散不连深度交互试炼与正误对决 |
| **ArticlePractice.vue** | 1,136 行 | 长文篇章实战练习主体 | 传世名篇无删减全文、视口自动平滑居中跟随、断点续打记忆 |
| **WubiLookup.vue** | 1,130 行 | 全量汉字反查与推导 | 汉字/编码/拼音三合一多模态检索、三代编码同屏对比、候选字联想网格 |
| **VirtualKeyboard.vue** | 747 行 | 交互式五笔大键盘 | 5 大区位色谱映射、字根表悬停提示、敲击实时键帽下沉动画 |
| **ArticleCustomImportModal.vue** | 418 行 | 自定义题库导入大弹窗 | 本地 .txt/.md 拖拽读取与手动粘贴双模式、字数实时统计 |
| **Navbar.vue** | 408 行 | 顶部导航与全局设置 | 8 大功能 Tab 切换、三版五笔无感切换、出字模式与音效控制面板 |
| **MistakeNotebook.vue** | 362 行 | 错题生字本管理 | 打错字自动收录、三代编码与字根回溯、一键针对性重练 |
| **RpgBattleResultModal.vue** | 326 行 | 修仙战斗结算弹窗 | 胜利/失败评定、通关评星、战利品秘宝箱点击、乱序破阵/循序复习 |
| **ArticleLibraryModal.vue** | 307 行 | 分类题库选择大弹窗 | 古文/名家散文/成语寓言/现代科技分类题库切换与字数提示 |
| **TypeEngineToolbar.vue** | 271 行 | 打字特训双层控制条 | 选字难度切换、批次 25/50/100 调节、按键/字根/简码提示开关 |
| **useChaseInput.ts** | 223 行 | 极速赛车专用输入状态机 | 0 延迟秒出、单字命中、错误音效震颤与 IME 防空格穿透 |
| **MiZiGe.vue** | 228 行 | 传统书法米字格组件 | SVG 矢量十字与对角线、特殊复合字根（⺈田/祭头）专用渲染 |
| **RpgShopModal.vue** | 213 行 | 聚宝阁修仙法宝商店 | 金疮药、玄龟甲、暴击丹、万剑令实时购买与灵石同步扣减 |
| **useRpgInput.ts** | 202 行 | 修仙打怪专用输入状态机 | 4 码秒出、简码出字、大招快捷释放拦截与 IME 防穿透 |
| **ChaseResultModal.vue** | 197 行 | 追逐赛终点战报弹窗 | 胜负判断、WPM 与用时对比、差距分析与礼花动画 |
| **ArticleFinishModal.vue** | 168 行 | 长文打字阶段结算弹窗 | 完成用时、平均速度、击键数、准确率与再来一次/换篇练习 |
| **TypeResultModal.vue** | 145 行 | 分批打字阶段结算弹窗 | 阶段用时、WPM、准确率、错字分布与无缝开启下一组 |

---

> 📖 **配套技术手册**  
> - [字根数据维护技术手册 (DATA_MAINTENANCE.md)](./DATA_MAINTENANCE.md)  
> - [产品功能设计规范 (PRODUCT.md)](./PRODUCT.md)  
> - [版本变更记录 (../CHANGELOG.md)](../CHANGELOG.md)

