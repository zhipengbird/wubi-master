# 📚 字典数据维护技术手册

本文档说明五笔学堂项目的字典数据架构、技术方案，以及日常数据维护的操作方法。

---

## 一、数据分层架构总览

```
优先级  数据源                         规模      位置
 ①     EXPERT_CORRECTED_CHARS         ~30字    wubiDict.ts  ← 最高权威，手工精修
 ②     LEVEL_1_CHARS / KEY_NAME_CHARS ~50字    wubiDict.ts
 ③     LEVEL_2_CHARS                  ~30字    wubiDict.ts
 ④     rawCommonDictData              3,500字  wubiCommonDictData.ts（首屏同步）
 ⑤     rawDictData                   28,058字  wubiFullDictData.ts（异步按需）
```

**关键规则**：`parseRawEntry` 解析时先查 `WUBI_CHAR_MAP`，命中则直接返回精修版本，低优先级数据永远无法覆盖高优先级数据。

---

## 二、数据处理流水线

```
原始 rawDictData（11元组数组）
         │
         ▼
   parseRawEntry()
         │
    查 WUBI_CHAR_MAP ─── 命中精修字 ──► 直接返回精修版本
         │（未命中）
         ▼
   normalizeRoots()  ← 自动规范化字根（7条规则）
         │
         ▼
   写入 WUBI_CHAR_MAP → IndexedDB
```

---

## 三、字根规范化（`normalizeRoots` 7条规则）

文件：`src/data/wubiDict.ts`

| 规则# | 触发条件 | 修正内容 | 受益字数 |
|------|---------|---------|---------|
| 1 | 编码含 `QG` + 鱼部字 | `⺈ + 一` → `⺈田`（无尾鱼） | ~100字 |
| 2 | 编码 `ME` 开头 + `冂冃` | `冂 + 冃` → `冎 + 月`（骨字头） | ~30字 |
| 3 | 编码含 `W` + 祭字头字 | `癶/𠂊` → `祭头` | ~17字 |
| 4 | 编码 `KH` 开头 + 足字旁 | `⻊` 展开为 `口 + 止` | ~111字 |
| 5 | 编码 `AF` 开头 + 革字旁 | `革` 展开为 `廿 + 十` | ~24字 |
| 6 | 含生僻 Unicode 字符 | `𡭔→小`、`𱼀→⺼`、`𭕄→⺌` 等 | 多字 |
| 7 | 编码含 `OG` 或 `GO` + `灬` | `灬` → `业头`（业字头/亚字头） | ~14字 |

### 新增规则方法

```typescript
// 在 normalizeRoots 函数末尾追加：
// N. 说明触发场景与修正原因
if (code && code.includes('XX') && res.includes('错字根')) {
  res = res.map(r => r === '错字根' ? '正确字根' : r);
}
```

---

## 四、字根显示规范化（双映射机制）

字根从数据层到 UI 经过两次转换：

```
内部存储标签（如 '业头'）
        │
        ▼  ROOT_GLYPH_NORMALIZE  →  MiZiGe 格子显示字形（如 '业'）
        │
        ▼  ROOT_NAME_MAP         →  格子底部标签（如 '业字头'）
```

**`ROOT_GLYPH_NORMALIZE`** — 描述性标签 → 可视字形：

```typescript
'业头'   → '业'      // 业字头上部
'无尾鱼' → '⺈田'   // 复合字根
'祭字头' → '祭头'   // SVG 矢量渲染
```

**`ROOT_NAME_MAP`** — 可视字形 → 中文注释：

```typescript
'业'  → '业字头'
'⺈田' → '无尾鱼'
'⺼'  → '肉月旁'
'⻊'  → '足字旁'
```

---

## 五、专家精修字典（`EXPERT_CORRECTED_CHARS`）

### 完整字段结构

```typescript
{
  char: '晋',                          // 汉字
  pinyin: 'jìn',                       // 拼音（带声调）
  code86: 'GOGJ',                      // 86版全码
  code98: 'GOJF',                      // 98版全码
  codeNew: 'GOGJ',                     // 新世纪全码
  short86: 'GOG',                      // 86版简码（可选）
  short98: 'GOJ',                      // 98版简码（可选）
  shortNew: 'GOG',                     // 新世纪简码（可选）
  roots86: ['一', '业头', '一', '日'],   // 86版字根（内部标签）
  roots98: ['一', '业头', '日'],         // 98版字根
  rootsNew: ['一', '业头', '一', '日'],  // 新世纪字根
  recognitionCode: undefined,          // 识别码（四码全满则无）
  ids: '⿳一业头日',                    // IDS结构描述
  strokes: 10,                         // 笔画数
  radical: '日'                        // 部首
}
```

### 新增精修字步骤

1. 在 `EXPERT_CORRECTED_CHARS` 末尾追加正确字条
2. 若属系统性错误（多字共用规则），优先在 `normalizeRoots` 加规则
3. 更新 `applyDbCorrections` 中的 `CORRECTED_CHARS` 列表
4. 升级 `corrections_v1` → `corrections_v2`（强制旧库重新 patch）

```typescript
// wubiDb.ts — 每次新增精修字后同步更新
const CORRECTIONS_KEY = 'corrections_v2';   // ← 版本号递增
const CORRECTED_CHARS = [
  '晋', '亚', '业', '恶', '严', ...
  // 新增字追加到此处 ↓
  '新字1', '新字2',
];
```

---

## 六、IndexedDB 同步方案

### 数据流与优先级

```
用户查询 queryByChar(char)
    │
    ├─ ① WUBI_CHAR_MAP.get(char)   内存精修（最快，含所有精修字）
    │
    ├─ ② db.chars.get(char)        IndexedDB（生僻字兜底）
    │
    └─ ③ lookupWubiChar(char)      全量字典（最终兜底）
```

### 启动时自动同步

```
App 启动 → requestIdleCallback（空闲时）
    │
    ├─ ensureDictPopulated()    首次建库写入 28,058 字
    └─ applyDbCorrections()     精修字补丁（corrections_v1 标记，只跑一次）
```

### meta 表版本标记

| key | 含义 |
|-----|------|
| `populated_v2` | 全量字库已写入 |
| `corrections_v1` | 精修字根补丁已应用 |
| `last_sync_time` | 上次同步时间戳 |

> 每次修改影响已建库用户的数据，升级 `corrections_vN` 版本号，下次启动自动重新 patch。

---

## 七、Dexie.js 数据库结构

```typescript
// chars 表 — 主键: char，多重索引支持多模态检索
version(2).stores({
  chars: 'char, code86, code98, codeNew, pinyin, pinyinPlain, strokes, radical'
})
```

| 查询方式 | API | 场景 |
|---------|-----|------|
| 单字查询 | `db.chars.get(char)` | 查单字详情 |
| 编码精确反查 | `.where('code86').equals(code)` | 输入 GOGJ 查晋 |
| 编码前缀联想 | `.where('code86').startsWith(prefix)` | 输入 KH 联想足部字 |
| 拼音检索 | `.where('pinyinPlain').startsWith(pinyin)` | 输入 pao 查跑 |

---

## 八、日常维护操作清单

| 场景 | 操作文件 | 操作方式 |
|------|---------|---------|
| 某字字根显示错误 | `wubiDict.ts` | 加入 `EXPERT_CORRECTED_CHARS` |
| 某类字系统性错标 | `wubiDict.ts` | 在 `normalizeRoots` 加规则 |
| 字根显示豆腐块 | `wubiDict.ts` | 在规则6加 `生僻字→标准字根` |
| 字根标签显示两字 | `wubiDict.ts` | 在 `ROOT_GLYPH_NORMALIZE` 加映射 |
| 格子底部无标签 | `wubiDict.ts` | 在 `ROOT_NAME_MAP` 加 `字形:'注释'` |
| 旧用户DB需更新 | `wubiDb.ts` | 更新 `CORRECTED_CHARS` + 升级版本号 |

### 修改后验证命令

```bash
# 验证某字字根
bun -e '
import { WUBI_CHAR_MAP, getCharBreakdown, getRootName } from "./src/data/wubiDict";
const d = WUBI_CHAR_MAP.get("目标字");
const bd = getCharBreakdown(d, "86");
console.log(bd.roots.map(r => r + "(" + (getRootName(r)||r) + ")").join(" + "));
'

# 构建验证（0错误）
bun run build
```

---

## 九、已知修正历史

| 版本 | 修正字 | 问题根因 | 修正方式 |
|------|--------|---------|---------|
| v1.2.0 | 跑/足部111字 | `⻊` 被作为整体字根 | normalizeRoots 规则4展开 |
| v1.2.0 | 蔡/祭部17字 | `癶` 混淆登字头/祭字头 | normalizeRoots 规则3区分 |
| v1.2.0 | 未/刺/策等 | `𡭔` 生僻字豆腐块 | normalizeRoots 规则6替换 |
| v1.4.0 | 晋/亚/业等14字 | O键字根`灬`误标（应为`业头`） | normalizeRoots 规则7 + EXPERT_CORRECTED_CHARS |
