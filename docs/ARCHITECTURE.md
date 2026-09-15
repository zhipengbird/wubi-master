# 🛠️ 五笔学堂 (Wubi Master) 技术架构与核心算法文档

> 最后更新：2026-09-15 v1.4.0

## 一、技术栈选型

| 类别 | 技术选型 |
|------|---------|
| 核心框架 | [Vue 3](https://vuejs.org/) (SFC + `<script setup>` + Composition API) |
| 开发语言 | [TypeScript 5.x](https://www.typescriptlang.org/) 全链路严格类型检查 |
| 构建工具 | [Vite 8.x](https://vitejs.dev/) + [Bun](https://bun.sh/) 毫秒级编译与极速 HMR |
| 状态管理 | [Pinia](https://pinia.vuejs.org/) 集中管理五笔版本、输入模式、错题本 |
| 本地数据库 | [Dexie.js](https://dexie.org/) 封装 IndexedDB，28,058汉字持久化 |
| 图标库 | [lucide-vue-next](https://lucide.dev/) 现代矢量线性图标 |
| 动画特效 | [canvas-confetti](https://www.npmjs.com/package/canvas-confetti) 通关礼花 |

---

## 二、整体架构图

```
[用户按键输入]
      │
      ▼
[Native Input 拦截 / 虚拟大键盘]
      │
      ▼
[wubiEngine.ts 判卷引擎] ◄─────────────────────────────┐
      │                                                  │
      │                    ┌────────────────────────────┐│
      │                    │      字典数据层              ││
      │                    │  EXPERT_CORRECTED_CHARS ①  ││
      │                    │  LEVEL_1/2_CHARS        ②③ ││
      │                    │  rawCommonDictData(3500) ④  ││
      │                    │  → WUBI_CHAR_MAP(内存)      ││
      │                    │  rawDictData(28058)      ⑤  ││
      │                    │  → IndexedDB(Dexie.js)      ││
      │                    └─────────────────────────────┘│
      │                            wubiDict.ts / wubiDb.ts│
      │                    ────────────────────────────────┘
      ├─────► [Audio 合成声效]
      ├─────► [Pinia 错题本持久化]
      └─────► [TypeEngine / ArticlePractice UI 响应更新]
```

---

## 三、字典数据层架构（v1.4.0 重构）

### 3.1 双层存储设计

**层1 — 内存常用字库（同步，零延迟）**
- `wubiCommonDictData.ts`：3,500 常用字紧凑数组，首屏同步加载
- 解析后写入 `WUBI_CHAR_MAP`，所有练习模式从内存直接命中

**层2 — IndexedDB 全量字库（异步，后台建库）**
- `wubiFullDictData.ts`：28,058 字，通过 Vite Code-Splitting 独立分块
- App 启动后 `requestIdleCallback` 空闲时后台写入 Dexie.js IndexedDB
- 首屏 gzip 从 767KB 降至 **379KB**，全量字库按需加载

### 3.2 数据优先级链

```
EXPERT_CORRECTED_CHARS（精修字，最高权威）
        ↓ 覆盖
LEVEL_1/2_CHARS + KEY_NAME_CHARS（手工精修）
        ↓ 覆盖
rawCommonDictData → parseRawEntry → 查 WUBI_CHAR_MAP → 命中则跳过
        ↓ 未命中
rawDictData → normalizeRoots → 写入 WUBI_CHAR_MAP + IndexedDB
```

### 3.3 11元组紧凑存储格式

```typescript
type RawDictTuple = [
  char: string,    // [0] 汉字
  pinyin: string,  // [1] 拼音（带声调）
  c86: string,     // [2] 86版全码
  c98: string,     // [3] 98版全码
  cNew: string,    // [4] 新世纪全码
  s86?: string,    // [5] 86版简码
  s98?: string,    // [6] 98版简码
  sNew?: string,   // [7] 新世纪简码
  r86?: string[],  // [8] 86版字根数组
  r98?: string[],  // [9] 98版字根数组
  rNew?: string[]  // [10] 新世纪字根数组
];
```

---

## 四、字根规范化流水线

### 4.1 `normalizeRoots` — 自动规范化（7条规则）

原始字典存在系统性字根错标（如 O 键字根统一写 `灬`，无论是业头还是四点底），由 `normalizeRoots` 在解析时自动纠正：

| 规则 | 触发条件 | 修正内容 |
|------|---------|---------|
| 1 | 编码含 `QG` + 鱼部字 | `⺈+一` → `⺈田`（无尾鱼） |
| 2 | 编码 `ME` 开头 | `冂+冃` → `冎+月`（骨字头） |
| 3 | 编码含 `W` + 祭字头字 | `癶` → `祭头` |
| 4 | 编码 `KH` 开头 | `⻊` 展开为 `口+止` |
| 5 | 编码 `AF` 开头 | `革` 展开为 `廿+十` |
| 6 | 含生僻 Unicode 字符 | `𡭔→小`、`𱼀→⺼` 等 |
| 7 | 编码含 `OG`/`GO` + `灬` | `灬` → `业头`（业字头） |

### 4.2 字根显示规范化（双映射）

```
内部存储标签
    │ ROOT_GLYPH_NORMALIZE   描述标签 → 可视字形
    ▼
MiZiGe 格子显示字形（如 '业'、'⺈田'、'祭头'）
    │ ROOT_NAME_MAP           可视字形 → 中文注释
    ▼
格子底部标签（如 '业字头'、'无尾鱼'、'祭字头'）
```

---

## 五、IndexedDB 查询架构（`wubiDb.ts`）

### 5.1 查询优先级（`queryByChar`）

```typescript
// 三级优先：内存精修 > IndexedDB缓存 > 全量字典兜底
export const queryByChar = async (char) => {
  // ① 内存 WUBI_CHAR_MAP（含精修，最快）
  const inMemory = WUBI_CHAR_MAP.get(char);
  if (inMemory) return inMemory;

  // ② IndexedDB（生僻字）
  const dbItem = await db.chars.get(char);
  if (dbItem) return dbItem;

  // ③ 全量字典兜底
  return lookupWubiChar(char);
};
```

### 5.2 多模态检索（`searchMultiModal`）

| 输入类型 | 检索策略 | 示例 |
|---------|---------|------|
| 汉字 | `queryByChar` 逐字查询 | `亚` |
| 五笔编码（1-4位） | 精确匹配 + 前缀联想 | `KH`、`GOGJ` |
| 纯拼音 | `pinyinPlain` 索引前缀查 | `pao` |
| 词组 | 分字查询 + `getPhraseBreakdown` | `五笔学堂` |

### 5.3 Dexie.js 数据库结构

```typescript
// chars 表 — 7个索引支持多模态检索
version(2).stores({
  chars: 'char, code86, code98, codeNew, pinyin, pinyinPlain, strokes, radical'
})
// meta 表 — 版本标记防止重复操作
// populated_v2: 全量字库已写入
// corrections_v1: 精修字补丁已应用
```

### 5.4 IndexedDB 同步补丁机制（`applyDbCorrections`）

解决已建库用户收到字根纠正的问题：

```
App启动 → requestIdleCallback
    ├─ ensureDictPopulated()   首次建库（28,058字）
    └─ applyDbCorrections()    精修字补丁
              │
         检查 corrections_v1 标记
              │ 未执行
         bulkPut(CORRECTED_CHARS)  ← 仅更新约14字，<5ms
              │
         写入 corrections_v1=true  ← 下次启动跳过
```

---

## 六、真实字根与末笔识别码解耦（`getCharBreakdown`）

**识别码黄金判定律**：凡拆出 4 个或以上字根的汉字，各键位均为真实字根，绝无识别码；仅字根少于 4 个且全码长度大于字根数时才判定识别码。

```typescript
export const getCharBreakdown = (charData, version) => {
  // ROOT_GLYPH_NORMALIZE 处理：描述标签 → 显示字形
  const roots = rawRoots.map(r => ROOT_GLYPH_NORMALIZE[r] || r);

  let recognitionCode;
  // 四码字（roots.length === 4）：绝无识别码
  if (!isKeyName && roots.length < 4 && fullCode.length > roots.length) {
    recognitionCode = charData.recognitionCode || fullCode[fullCode.length - 1];
  }
  return { roots, rootSteps, recognitionCode };
};
```

---

## 七、词组五笔自动推导（`getPhraseBreakdown`）

支持 2字/3字/4字/N字词组在86/98/新世纪三版本下的全自动编码推导：

```
双字词：chars[0]前2码 + chars[1]前2码          → 共4码
三字词：chars[0]首码 + chars[1]首码 + chars[2]前2码  → 共4码
四字词：chars[0..3] 各取首码                   → 共4码
多字词：chars[0..2]首码 + chars[末尾]首码       → 共4码
```

---

## 八、双模式输入判卷（`evaluateInput`）

兼容"打字母编码"与"系统中文输入法打汉字"两种模式：

```typescript
const hasChinese = /[\u4e00-\u9fa5]/.test(rawInput);
if (hasChinese) {
  // 系统中文输入法：汉字直接与目标比对
  return { isMatch: rawInput === targetChar };
} else {
  // 英文键盘打五笔编码：验证全码/简码/前缀
  const isMatch = inputCode === fullCode || inputCode === shortCode;
  const isPrefixMatch = fullCode.startsWith(inputCode);
  return { isMatch, isPrefixMatch };
}
```

---

## 九、长文平滑跟滚动（`ArticlePractice`）

监听 `charIndex` 变更，激活字符始终平滑保持在视口中心：

```typescript
currentEl.scrollIntoView({
  behavior: 'smooth',
  block: 'center',
  inline: 'nearest'
});
```

---

## 十、构建性能指标（v1.4.0）

| 指标 | 数值 |
|------|------|
| 首屏主包 gzip | **379KB**（较 v1.1 降低 50%） |
| 全量字典分块 | 512KB gzip（独立异步加载） |
| Vite 生产构建耗时 | ~300ms |
| IndexedDB 建库耗时 | ~2s（后台，不阻塞交互） |
| `queryByChar` 内存命中 | O(1) Map 查找，<0.01ms |

**Bundle 分割策略**：
- 主包：Vue 运行时 + Pinia + 核心逻辑 + 3,500 常用字 → `index.js`
- 异步分块：`wubiFullDictData.ts`（28,058字）→ 独立 chunk，按需加载

---

> 📖 字根数据维护操作手册见 [docs/DATA_MAINTENANCE.md](./DATA_MAINTENANCE.md)
