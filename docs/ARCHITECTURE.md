# 🛠️ 五笔学堂 (Wubi Master) 技术架构与核心算法文档

## 一、技术栈选型与项目架构

- **核心框架**：[Vue 3](https://vuejs.org/) (SFC + `<script setup>` + Composition API)
- **开发语言**：[TypeScript 5.x](https://www.typescriptlang.org/) (全链路严格类型检查)
- **构建工具**：[Vite 8.x](https://vitejs.dev/) + [Bun](https://bun.sh/) (毫秒级编译与极速 HMR)
- **状态管理**：[Pinia](https://pinia.vuejs.org/) (集中管理五笔版本、输入模式、上屏方式、练习成绩与错题本)
- **图标库**：[lucide-vue-next](https://lucide.dev/) (现代矢量线性图标)
- **动画特效**：[canvas-confetti](https://www.npmjs.com/package/canvas-confetti) (篇章通关礼花特效)

```text
[用户按键输入]
      │
      ▼
[Native Input 拦截 / 虚拟大键盘]
      │
      ▼
[wubiEngine.ts 判卷引擎] ◄──── [wubiDict.ts (28,058 汉字大字典 / 词组推导算法)]
      │
      ├─────► [Audio 合成声效]
      ├─────► [Pinia 错题本持久化]
      └─────► [TypeEngine / ArticlePractice UI 响应更新 (米字格 / 跟滚动)]
```

---

## 二、核心数据结构与字典压缩设计

### 1. 28,058 汉字大字典 11 元组存储设计 (`wubiFullDict.json`)
为了避免 2.8 万汉字的对象产生大量重复 key 字符串（降低内存与体积），字典数据压缩为纯紧凑数组：
```typescript
type WubiRawTuple = [
  char: string,       // [0] 汉字字符，例如 '男'
  pinyin: string,     // [1] 汉语拼音，例如 'nán'
  c86: string,        // [2] 86 版全码，例如 'LLB'
  c98: string,        // [3] 98 版全码，例如 'LER'
  cNew: string,       // [4] 新世纪版全码，例如 'LER'
  s86?: string,       // [5] 86 版简码 (可选)
  s98?: string,       // [6] 98 版简码 (可选)
  sNew?: string,      // [7] 新世纪简码 (可选)
  r86?: string[],     // [8] 86 版真实构字字根数组，例如 ['田', '力']
  r98?: string[],     // [9] 98 版真实构字字根数组，例如 ['田', '力']
  r06?: string[]      // [10] 新世纪真实构字字根数组，例如 ['田', '力']
];
```
在客户端初始化阶段，通过 `Map<string, WubiCharData>` 进行 `O(1)` 高速哈希索引构建。

### 2. 真实字根与末笔识别码动态解耦算法 (`getCharBreakdown`)
以往五笔系统常见 Bug：将不足 4 个字根的单字（如“男” `LLB`）中的识别码 `B` 当作第 3 个字根，错误显示为“田 田 子”。

**解析算法逻辑**：
```typescript
export const getCharBreakdown = (charData: WubiCharData, version: WubiVersion): CharBreakdownInfo => {
  const roots = getVersionRoots(charData, version);
  const fullCode = getFullCode(charData, version).toUpperCase();

  if (roots && roots.length > 0) {
    let recognitionCode: string | undefined = undefined;
    // 识别码黄金判定律：当构字字根少于 4 个，且全码长度大于字根数时，末位必是交叉识别码
    if (roots.length < 4 && fullCode.length > roots.length) {
      recognitionCode = fullCode[fullCode.length - 1];
    }
    return {
      roots,           // 纯净真实字根，如 ['田', '力']
      recognitionCode  // 独立识别码，如 'B'
    };
  }
  // 生僻字/未收录字根 fallback 兜底...
};
```

---

## 三、词组五笔自动推导与分步解析算法 (`getPhraseBreakdown`)

支持对任意 2 字、3 字、4 字以及 N 字汉语词组在 86/98/新世纪 下的全自动编码推导，并生成每个汉字的取码说明：

```typescript
export interface PhraseCharStep {
  char: string;         // 汉字，如 '日'
  index: number;        // 汉字在词中的位次 (1-indexed)
  keys: string;         // 该字贡献的键位，如 'J'
  charFullCode: string; // 该字本身全码，如 'JJJJ'
  desc: string;         // 取码规则说明，如 '取首码' 或 '取前两码'
}

export const getPhraseBreakdown = (phrase: string, version: WubiVersion = '86'): PhraseBreakdownInfo => {
  const chars = Array.from(phrase.replace(/[^\u4e00-\u9fa5]/g, ''));
  // 根据 chars.length 动态匹配规则：
  // 1. 双字词：chars[0] 前2码 + chars[1] 前2码
  // 2. 三字词：chars[0] 首码 + chars[1] 首码 + chars[2] 前2码
  // 3. 四字词：chars[0..3] 各取首码
  // 4. 多字词：chars[0..2] 各取首码 + chars[末尾] 首码
};
```

---

## 四、双模式输入判卷与兼容处理 (`evaluateInput`)

为了同时兼顾 **“看字打字母编码”**（内置网页五笔模拟）与 **“打字员使用真实系统输入法打汉字”**，输入事件监听做如下兼容：

```typescript
// 智能识别输入形式
const hasChinese = /[\u4e00-\u9fa5]/.test(rawInput);
if (hasChinese) {
  // 用户开启了系统中文五笔输入法：打出的汉字直接与目标汉字进行比对
  return { isMatch: rawInput === targetChar, isPrefixMatch: false };
} else {
  // 用户切换了英文键盘：打出的是五笔按键编码 (如 "LLB" 或 "LL")
  // 验证是否与全码/简码精确匹配，或为前缀击键
  const isMatch = (inputCode === fullCode) || (inputCode === shortCode);
  const isPrefixMatch = fullCode.startsWith(inputCode);
  return { isMatch, isPrefixMatch };
}
```

---

## 五、长文阅读视口与平滑跟滚动 (Smooth Auto Scroll)

长文篇章（几百字到千字）如果用户击键到下方而视口不滚动，会导致焦点丢失。

**实现细节**：
1. 绑定 `textContainerRef` 容器；
2. 监听 `charIndex` 的响应式变更；
3. 获取当前激活的字符 DOM 节点 `.char-unit.current`；
4. 调用现代 DOM 平滑滚动 API：
   ```typescript
   currentEl.scrollIntoView({
     behavior: 'smooth',
     block: 'center',    // 确保当前正在打的字始终平滑保持在视口中心高度
     inline: 'nearest'
   });
   ```

---

## 六、构建性能与工程优化

1. **JSON 异步模块化**：`wubiFullDict.json` 作为静态资源由 Vite 进行高效 chunk 打包。
2. **纯 CSS 动画代替 JS 计算**：米字格印章背景采用 SVG 矢量线，高亮与聚焦采用 CSS GPU 加速变换。
3. **极小包体构建**：生产打包纯 JS/CSS gzip 压缩后仅约 550KB，首屏秒开。
