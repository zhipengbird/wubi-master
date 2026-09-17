# ⌨️ 五笔学堂 (Wubi Master)

> **新一代现代化、专业级五笔字型全能学习与打字实战系统**  
> 支持 **86 版 / 98 版 / 新世纪版** 三代五笔标准同屏对比、全量汉字反查、全真米字格拆解与全文长打。

**🌐 在线体验：[https://wubi.pinme.dev/](https://wubi.pinme.dev/)**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Vue 3](https://img.shields.io/badge/Vue-3.5-brightgreen.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-purple.svg)](https://vitejs.dev/)

---

## 🌟 核心特性

### 📚 八大功能模块

- 🎯 **打字特训**：单字/字根/词组分级练习，实时 WPM/KPM 统计与准确率分析
- 🗡️ **修仙打怪闯关 (RPG)**：十三大修仙境界沉浸式打怪，ATB 时间条机制、飞剑连击蓄力、万剑归宗大招、战利品宝箱与乱序破阵复习
- 📖 **长文实战**：收录经典名篇（出师表、赤壁赋等）+ 自定义导入（.txt/.md 文件或粘贴文本）
- 🎮 **极速追逐赛**：与 AI 赛车竞速的打字游戏，实时可视化进度对比
- 🔍 **汉字反查**：28,058 全量字库，支持汉字/编码/拼音多模态检索，智能推导词组编码
- ⌨️ **交互式键盘**：五大区位科学分布，悬停查看字根表与助记口诀
- 📐 **拆字规则教学**：互动式五笔编码规则讲解，识别码推导工具
- 📝 **错题生字本**：自动记录打错的字，支持批量复习与删除

### 🎯 专业特性

- **权威正统三代支持**：完整内置 **86版**、**98版**、**新世纪版 (06版)** 三代五笔字型全套编码与字根标准，支持毫秒级一键无感切换
- **28,058+ 全量汉字反查大字典**：
  - 覆盖常用字与全量 CJK 汉字
  - 智能分离**真实字根**与**末笔字型交叉识别码**（彻底杜绝将识别码误作字根的错误）
  - 智能推导双字词、三字词、四字及多字词整词编码与详细取码步骤（前二+次二、前三+末一等）
- **传统书法风米字格 (MiZiGe)**：
  - 独创纯 CSS/SVG 矢量米字格印章舞台
  - 字根按笔顺与键位直观陈列，附带专属角标（如 `第1码 / G键`、`末笔识别码`）
- **双输入模式极致兼容**：
  - 既可切**系统英文键盘 (ABC)** 练习原生五笔按键直觉（自带轻量级自动上屏/空格出字引擎）
  - 亦可直接开启用户的**真实系统五笔输入法**打字实战，两者皆丝滑支持
- **无删减全文篇章实战题库**：
  - 收录《出师表》、《前赤壁赋》、《春》、《背影》、《荷塘月色》、《桃花源记》、《岳阳楼记》等传世名篇**一字不漏・无删减全篇**
  - 支持 **题库大全分类大弹窗** 筛选浏览
  - 配备视口智能平滑自动跟滚动（Auto Scroll）与断点进度记忆
- **双模式自定义长文导入**：
  - 支持本地选择文件（`.txt` / `.md`）与拖拽上传，自动解析文件名并生成题库
  - 支持手动自由粘贴海量篇章段落，并提供实时字数动态统计
- **专业打字机交互与多维战报**：
  - WPM (每分钟字数)、KPM (每分钟击键)、精确到 0.1% 的准确率、退格数与用时统计
  - 联动高亮虚拟五笔大键盘与智能简码优先提醒气泡

---

## 🚀 快速启动

本项目采用 [Bun](https://bun.sh/) 与 [Vite](https://vitejs.dev/) 构建，启动与构建极速（构建仅需 ~200ms）。

### 1. 安装依赖
```bash
# 推荐使用 bun
bun install

# 或使用 npm / pnpm
npm install
```

### 2. 启动本地开发服务
```bash
bun run dev
```
启动后在浏览器访问控制台提示的地址（例如 `http://localhost:5173/` 或 `http://localhost:5175/`）。

#### 3. 执行自动化测试
```bash
# 运行全量 Vitest 单元测试 (99 项测试)
bun run test

# 运行统一 Playwright 全链路端到端自动化巡检 (61 项真机用例)
bun run test:e2e

# 仅运行全站 8 大 UI 模块端到端交互巡检 (35 项用例)
bun run test:e2e:ui

# 仅运行五笔修仙打怪 RPG 全量 13 关端到端实战通关 (26 项用例)
bun run test:e2e:rpg
```

### 4. 构建生产包
```bash
bun run build
```
产物将输出至 `dist/` 目录。

---

## 📂 项目结构概览

```text
wubi-master/
├── docs/                          # 详细产品与技术设计文档
│   ├── PRODUCT.md                 # 产品功能设计与业务规则规范
│   ├── ARCHITECTURE.md            # 系统架构、核心算法与技术实现细节
│   └── DATA_MAINTENANCE.md        # 字根数据维护操作手册
├── public/                        # 静态资源与音频音效
├── raw_dicts/                     # 官方正统 86/98/新世纪 权威原始字根数据库
├── scripts/                       # 自动化测试与工程化脚本
│   └── e2eAllStagesHarness.ts     # Puppeteer 13关端到端自动化测试巡检脚本
├── src/
│   ├── components/                # 顶层视图组件与子系统模块
│   │   ├── TypeEngine.vue         # 核心打字练习引擎（单字/字根/词组）
│   │   ├── RpgAdventure.vue       # 修仙打怪闯关 RPG（十三关卡/ATB战斗/大招/秘宝）
│   │   ├── ArticlePractice.vue    # 长文篇章练习（全文阅读/导入/自动滚动）
│   │   ├── TypingChaseGame.vue    # 极速打字追逐赛游戏
│   │   ├── WubiLookup.vue         # 全量汉字反查（三版对比/词组推导）
│   │   ├── VirtualKeyboard.vue    # 五笔大键盘（分区着色/悬停提示）
│   │   ├── RuleTutorial.vue       # 拆字规则互动教学
│   │   ├── MistakeNotebook.vue    # 错题生字本
│   │   ├── MiZiGe.vue             # 矢量书法米字格展示
│   │   ├── Navbar.vue             # 顶部导航与设置面板
│   │   ├── article/               # 长文实战子模块 (高内聚 scoped 样式)
│   │   │   ├── ArticleLibraryModal.vue       # 题库大全大弹窗
│   │   │   ├── ArticleCustomImportModal.vue  # 本地文件/粘贴导入弹窗
│   │   │   └── ArticleFinishModal.vue        # 篇章打字战报结算弹窗
│   │   ├── engine/                # 打字特训子模块
│   │   │   ├── TypeEngineToolbar.vue         # 双层练习控制工具栏
│   │   │   └── TypeResultModal.vue           # 批次打字战报结算弹窗
│   │   ├── rules/                 # 规则教学子模块
│   │   │   └── RuleSplitPrinciples.vue       # 拆分原则/正误PK/闯关Quiz/微观拆字实验室
│   │   ├── chase/                 # 追逐赛子模块
│   │   │   └── ChaseResultModal.vue          # 赛车竞技结算弹窗
│   │   └── rpg/                   # 修仙 RPG 子模块
│   │       ├── RpgShopModal.vue              # 藏宝阁商铺弹窗
│   │       └── RpgBattleResultModal.vue      # 关卡战斗战报结算弹窗
│   ├── composables/               # 独立业务逻辑状态机 (Composables)
│   │   ├── useRpgInput.ts         # RPG 修仙专属输入调度引擎
│   │   └── useChaseInput.ts       # 赛车追逐赛专属输入调度引擎
│   ├── data/                      # 数据层（字典/题库/键盘）
│   │   ├── wubiDict.ts            # 字典查询API、词组取码算法
│   │   ├── wubiDb.ts              # IndexedDB 数据库封装（Dexie.js）
│   │   ├── wubiCommonDictData.ts  # 3,500 常用字内存字典
│   │   ├── wubiFullDictData.ts    # 28,058 全量字典（异步加载）
│   │   ├── rpgStages.ts           # RPG 修仙十三关卡与 400+ 字符词组题库配置
│   │   ├── charMetaData.ts        # 汉字元数据（笔画/部首/频率）
│   │   ├── articles.ts            # 全文无删减经典长文题库
│   │   ├── keyboards.ts           # 三版五笔键盘布局定义
│   │   ├── rules.ts               # 五笔编码规则与教学数据
│   │   └── wordsDict.ts           # 常用词组字典
│   ├── stores/                    # 响应式状态管理 (Vue 3 Store)
│   │   ├── useWubiStore.ts        # 全局状态（版本/模式/错题本）
│   │   └── useRpgStore.ts         # RPG 修仙状态（关卡/战利品/背包/连击）
│   ├── types/                     # TypeScript 类型定义
│   │   └── wubi.ts                # 核心类型接口
│   ├── utils/                     # 工具函数
│   │   ├── wubiEngine.ts          # 判卷引擎（编码校验/统计计算）
│   │   ├── storage.ts             # localStorage 白名单校验封装
│   │   ├── phraseMatching.ts      # 智能词组流式匹配算法
│   │   └── audio.ts               # 音效合成
│   ├── styles/                    # 全局样式
│   │   └── theme.css              # 11 套深浅高对比度主题变量与 WCAG AA 无障碍适配
│   └── App.vue                    # 应用根组件（URL Hash 路由切换）
├── scripts/                       # 自动化测试与工程化脚本
│   └── e2eHarness.ts              # 统一端到端 E2E 自动化测试 Harness (UI 8大模块 + RPG 13关)
├── tests/                         # Vitest 自动化单元测试套件 (7大套件 / 99用例)
├── vite.config.ts                 # Vite 构建配置 (固定 5175 端口)
└── package.json                   # 项目依赖与脚本 (v1.7.3)
```

---

## 🎯 技术亮点

- ⚡ **极速构建**：Vite 8 + Bun，生产构建仅需 ~200ms
- 📦 **智能分包**：首屏 379KB gzip（较 v1.1 优化 50%），全量字典按需加载
- 🗄️ **三级缓存**：精修字（14字）→ 内存常用字（3,500）→ IndexedDB 全量（28,058）
- 🔍 **多维索引**：支持汉字/编码/拼音/笔画/部首多模态检索
- 🎨 **主题切换**：内置 11 套深浅高对比度主题（6套酷炫暗色 + 5套简洁明亮），达到 WCAG AA 无障碍高对比度标准
- 💾 **离线可用**：IndexedDB 本地持久化，无需网络连接

---

## 📖 深入文档

- 📘 [产品设计与功能规范 (docs/PRODUCT.md)](docs/PRODUCT.md)：了解各个功能模块的交互理念、五笔词组编码法则、字根/识别码设计规范
- 🛠️ [技术架构与算法设计 (docs/ARCHITECTURE.md)](docs/ARCHITECTURE.md)：了解数据结构 11 元组格式、词组自动推导算法、响应式状态与打字判卷引擎实现
- 📝 [字根数据维护手册 (docs/DATA_MAINTENANCE.md)](docs/DATA_MAINTENANCE.md)：字典数据更新流程与字根纠正规范
- 📋 [版本变更记录 (CHANGELOG.md)](CHANGELOG.md)：查阅各版本演进历程、重大功能发布、学术级错拆修复与排雷记录

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

- 🐛 **Bug 反馈**：发现字根拆解错误、编码不准确等问题，请提供具体汉字与预期结果
- 💡 **功能建议**：欢迎提出新功能想法或改进建议
- 📝 **文档改进**：发现文档错误或不清晰之处，欢迎提交修正
- 🎨 **UI/UX 优化**：界面设计改进建议

---

## 📄 开源许可证

本项目基于 [MIT 许可证](LICENSE) 开源。欢迎学习、交流与二次开发！

---

## ⭐ Star History

如果这个项目对你有帮助，欢迎点亮 ⭐ Star 支持一下！

