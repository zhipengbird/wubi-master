# 📚 字典数据维护技术手册

> 最后更新：2026-09-15 v1.4.0  
> 文档版本：v1.4.0 (规范化指南)

本文档说明五笔学堂项目的字典数据分层体系、字根清洗与规范化流水线、IndexedDB 客户端同步机制，以及日常新增精修字和规则的操作指南。

---

## 一、数据分层架构总览

数据按优先级从高到低逐层覆盖加载：

```
优先级  数据源                         规模      位置与加载模式
 ①     EXPERT_CORRECTED_CHARS         30 字    wubiDict.ts（手工校准字，最高权威）
 ②     LEVEL_1_CHARS (一级简码)       25 字    wubiDict.ts（高频简码字）
 ③     KEY_NAME_CHARS (键名字)        25 字    wubiDict.ts（25 个键名字）
 ④     LEVEL_2_CHARS (二级精修)       30 字    wubiDict.ts（次级精修字）
 ⑤     rawCommonDictData              3,500 字 wubiCommonDictData.ts（首屏静态同步载入）
 ⑥     rawDictData                   28,058 字 wubiFullDictData.ts（后台异步分块载入）
```

**防覆盖设计原则**：
- `EXPERT_CORRECTED_CHARS`、`LEVEL_1_CHARS`、`KEY_NAME_CHARS`、`LEVEL_2_CHARS` 在模块加载时率先注入 `WUBI_CHAR_MAP`
- 后续在解析 3,500 常用字及 2.8 万全量字时，`parseRawEntry(r)` 会优先执行：
  ```typescript
  const existing = WUBI_CHAR_MAP.get(char);
  if (existing) {
    attachMeta(existing);
    return existing; // 直接保留高优先级精修对象，严禁被原始数据覆盖
  }
  ```

---

## 二、数据处理流水线

```
rawDictData 原始 11 元组
         │
         ▼
   parseRawEntry()
         │
    查 WUBI_CHAR_MAP ─── 命中精修字 ──► 直接返回精修版本
         │（未命中）
         ▼
   normalizeRoots()  ← 自动执行 7 条清洗规则
         │
         ▼
   attachMeta()      ← 附加笔画/部首等元数据
         │
         ▼
   写入 WUBI_CHAR_MAP (内存) 与 IndexedDB (本地持久化)
```

---

## 三、字根规范化流水线（`normalizeRoots` 7 条规则）

实现文件：`src/data/wubiDict.ts`，在 `parseRawEntry` 阶段自动触发。

| 规则 # | 触发条件 | 规范化操作 | 受益汉字规模 | 典型汉字 |
|:---:|---------|---------|:---:|---------|
| **1** | 编码含 `QG` 且属于鱼部字 | 将 `['⺈', '一']` 升级为一体化字根 `['⺈田']`（无尾鱼） | ~100 字 | 鱼、鲁、鲜、鲫、鲤 |
| **2** | 编码以 `ME` 开头 | 将 `['冂', '冃']` 替换为 `['冎', '月']`（骨字头专用字根） | ~30 字 | 骨、骷、骼、骸 |
| **3** | 编码含 `W` 且属于祭部字 | 将误标的 `癶` 纠正为 `祭头`（严格区别于登字头） | ~17 字 | 祭、蔡、察、擦 |
| **4** | 编码以 `KH` 开头（足字旁） | 将 `⻊` 展开为 86 版两码：`口` (K) + `止` (H) | ~111 字 | 跑、跳、跃、路、踩 |
| **5** | 编码以 `AF` 开头（革字旁） | 将 `革` 展开为 86 版两码：`廿` (A) + `十` (F) | ~24 字 | 鞋、靴、鞭、勒、鞍 |
| **6** | 含 Ext-B/生僻字符或 PUA 码 | `𡭔→小`、`𱼀→⺼`、`𭕄→⺌`、`𰀁→二`、`𰀪→彡` 等标准替换 | ~60 字 | 未、刺、策、枣、胜 |
| **7** | 编码含 `OG` 或 `GO` 且字根含 `灬` | 将误标的 `灬` 纠正为 `业头`（口诀“火业头，四点米”中 O 键的业字头） | ~14 字 | 晋、亚、业、恶、严、哑 |

### 新增自动规范化规则的操作方法

若发现某类汉字在全量字典中存在系统性错拆（规模 > 5 字），直接在 `normalizeRoots` 中追加分支：

```typescript
// 8. 示例：某部首统一展开规则
if (code && code.startsWith('XY') && res[0] === '某部首') {
  res.splice(0, 1, '字根A', '字根B');
}
```

---

## 四、字根显示规范化（双映射机制）

为了同时满足“程序逻辑严谨性”与“界面视觉直观性”，字根在展示层经过双映射管道：

```
程序内部标签（如 '业头'、'祭头'、'⺈田'）
        │
        ▼  ROOT_GLYPH_NORMALIZE  →  米字格可视字形（如 '业'、'祭头'、'⺈田'）
        │
        ▼  ROOT_NAME_MAP         →  底部角标注释（如 '业字头'、'祭字头'、'无尾鱼'）
```

### 1. `ROOT_GLYPH_NORMALIZE`（标签 → 显示字形）
负责将具有描述性质的内部词汇转换为米字格中真实可显示的单字或专用部件：
```typescript
export const ROOT_GLYPH_NORMALIZE: Record<string, string> = {
  '业头': '业',        // 业字头在格子中显示单字 '业'
  '祭字头': '祭头',    // 对应 MiZiGe.vue 中专属 SVG 渲染
  '无尾鱼': '⺈田',    // 对应 MiZiGe.vue 中上下双层堆叠渲染
  '水侧': '氺',        // 转换生僻字根描述为可视汉字
  '止底': '龰',
  // ...
};
```

### 2. `ROOT_NAME_MAP`（显示字形 → 中文注释）
负责在字根拆解卡片底部提供易懂的口诀与部件名称提示：
```typescript
export const ROOT_NAME_MAP: Record<string, string> = {
  '业': '业字头',
  '祭头': '祭字头',
  '⺈田': '无尾鱼',
  '⺼': '肉月旁',
  '⻊': '足字旁',
  '⺌': '小字头',
  '⺍': '学字头',
  // ...
};
```

---

## 五、专家精修字典维护指南（`EXPERT_CORRECTED_CHARS`）

### 5.1 当前精修字阵容（30 字）

```
匜 鱼 鲜 骨 物 然 觉 击 象 求 牛 年 失 气 尤 母 具 直 
祭 蔡 察 擦 跑 刺 卌 礻 衤 晋 亚 业
```

### 5.2 完整字条结构模板

```typescript
{
  char: '晋',
  pinyin: 'jìn',
  code86: 'GOGJ',
  code98: 'GOJF',
  codeNew: 'GOGJ',
  short86: 'GOG',
  short98: 'GOJ',
  shortNew: 'GOG',
  roots86: ['一', '业头', '一', '日'], // 内部存储业头
  roots98: ['一', '业头', '日'],
  rootsNew: ['一', '业头', '一', '日'],
  recognitionCode: undefined,        // 四码满码无末笔识别码
  ids: '⿳一业头日',                  // 汉字结构表意序列
  strokes: 10,
  radical: '日'
}
```

### 5.3 新增精修汉字的标准流程

1. **编辑 `src/data/wubiDict.ts`**：在 `EXPERT_CORRECTED_CHARS` 数组中追加标准数据对象。
2. **升级补丁版本号**：若修改影响了已被用户缓存的旧数据，打开 `src/data/wubiDb.ts`，将 `CORRECTIONS_KEY` 由 `corrections_v1` 递增为 `corrections_v2`。
3. **自动同步生效**：`applyDbCorrections()` 会自动将所有 `EXPERT_CORRECTED_CHARS` 及业部汉字写回用户的本地 IndexedDB，无需用户手动清除浏览器缓存。

---

## 六、IndexedDB 同步方案与版本控制

### 6.1 查询三级兜底逻辑 (`queryByChar`)

```
用户输入汉字查询
      │
      ├─ ① 优先从内存 WUBI_CHAR_MAP 读取（<0.01ms，100% 优先命中精修与常用字）
      │
      ├─ ② 内存未命中时，异步检索客户端 IndexedDB（1~5ms，覆盖 2.8 万全量字库）
      │
      └─ ③ 最终兜底：全量静态解析 lookupWubiChar()
```

### 6.2 启动补丁机制 (`applyDbCorrections`)

- **触发时机**：应用启动后由 `App.vue` 中的 `requestIdleCallback` 闲时异步调用。
- **执行过程**：读取 `db.meta` 中的版本标记，未执行时一次性将精修字批量覆盖（`bulkPut`）写入本地数据库。
- **性能开销**：单次写入 30~50 条记录，执行耗时 < 5ms，完全无感。

### 6.3 元数据标记规范

| Key | 作用 | 写入时机 |
|---|---|---|
| `populated_v2` | 标识 28,058 全量字库是否已成功写入本地 IndexedDB | `ensureDictPopulated()` 首次写入完成 |
| `corrections_v1` | 标识精修字根补丁是否已同步应用至本地数据库 | `applyDbCorrections()` 首次写入完成 |
| `last_sync_time` | 记录最近一次数据库同步时间戳 | 每次写入或修补完成 |

---

## 七、日常排查与维护速查表

| 问题现象 | 根因分类 | 对应处理方法 |
|---|---|---|
| 某高频汉字拆解字根与权威五笔不符 | 单字数据瑕疵 | 在 `wubiDict.ts` 的 `EXPERT_CORRECTED_CHARS` 中追加精修条目 |
| 同偏旁的一组汉字均发生字根错位 | 规则级偏差 | 在 `wubiDict.ts` 的 `normalizeRoots` 中追加规则分支 |
| 拆解字根显示为方形空白或方框问号 | 缺失 Unicode 字符 | 在 `normalizeRoots` 规则 6 中将生僻编码映射为通用字根 |
| 米字格中字根显示为两个汉字（如“业头”） | 缺少字形规范化 | 在 `ROOT_GLYPH_NORMALIZE` 中补充映射（如 `'业头': '业'`） |
| 米字格底部缺失中文含义标签 | 缺少名称映射 | 在 `ROOT_NAME_MAP` 中补充键值映射（如 `'业': '业字头'`） |
| 代码修改后本地网页字根仍显示旧数据 | 浏览器 IndexedDB 缓存 | 递增 `wubiDb.ts` 中的 `CORRECTIONS_KEY` 版本号并刷新页面 |

---

## 八、本地数据验证与测试套件

修改字典或规则后，请按序执行以下三道指令进行严格验收：

### 1. 单字拆解精准度验证
```bash
bun -e '
import { WUBI_CHAR_MAP, getCharBreakdown, getRootName } from "./src/data/wubiDict";
const target = "晋";
const data = WUBI_CHAR_MAP.get(target);
if (!data) { console.error("未找到字符:", target); process.exit(1); }
const bd = getCharBreakdown(data, "86");
console.log("字符:", target, "全码:", data.code86);
console.log("拆解:", bd.roots.map(r => `${r} (${getRootName(r) || r})`).join(" + "));
'
```

### 2. 构建类型与打包校验
```bash
bun run build
```
*要求：0 错误、0 警告终止，构建时间保持在 300ms ~ 400ms 区间。*

### 3. 本地全功能自测
```bash
bun run dev
```
打开浏览器：
- 在「全量汉字反查」中搜索该字，检查米字格字形与底部标签；
- 在「打字特训」或「文章实战」中输入该字，验证判卷引擎是否准确响应。

---

> 📖 **配套架构文档**：[系统技术架构与核心算法文档 (ARCHITECTURE.md)](./ARCHITECTURE.md)
