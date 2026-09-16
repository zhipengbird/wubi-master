<template>
  <div class="rules-wrapper">
    <!-- 顶部导学模块导航 -->
    <div class="rules-tabs">
      <button
        v-for="rule in WUBI_RULES"
        :key="rule.id"
        class="rule-tab-btn"
        :class="{ active: currentRuleId === rule.id }"
        @click="currentRuleId = rule.id"
      >
        <span class="tab-badge">{{ rule.badge }}</span>
        <span class="tab-title">{{ rule.title }}</span>
      </button>
    </div>

    <!-- 规则主体内容展示 -->
    <div class="rule-body" v-if="activeRule">
      <!-- 规则头部总览 -->
      <div class="rule-header">
        <div class="header-left">
          <span class="header-badge">{{ activeRule.badge }}</span>
          <h2 class="header-title">{{ activeRule.title }}</h2>
          <p class="header-summary">{{ activeRule.summary }}</p>
        </div>
      </div>

      <!-- ================= 针对【汉字拆分四项基本原则】的趣味互动模块 ================= -->
      <div v-if="activeRule.id === 'split-principles'" class="principles-gamified-container">
        <!-- 趣味子导航栏 -->
        <div class="sub-nav-tabs">
          <button
            class="sub-tab-btn"
            :class="{ active: activeSplitTab === 'visual-guide' }"
            @click="activeSplitTab = 'visual-guide'"
          >
            🎨 四大原则图解
          </button>
          <button
            class="sub-tab-btn"
            :class="{ active: activeSplitTab === 'pk-arena' }"
            @click="activeSplitTab = 'pk-arena'"
          >
            ⚔️ 避坑大PK (正拆 vs 误拆)
          </button>
          <button
            class="sub-tab-btn"
            :class="{ active: activeSplitTab === 'quiz-game' }"
            @click="activeSplitTab = 'quiz-game'"
          >
            🎮 拆字闯关挑战
          </button>
          <button
            class="sub-tab-btn"
            :class="{ active: activeSplitTab === 'lab-dissect' }"
            @click="activeSplitTab = 'lab-dissect'"
          >
            🔬 拆字实验室
          </button>
        </div>

        <!-- 1. 四大法则图解与拟人化口诀 -->
        <div v-if="activeSplitTab === 'visual-guide'" class="split-tab-content">
          <div class="principles-grid">
            <div
              v-for="p in SPLIT_PRINCIPLES_DETAILED"
              :key="p.id"
              class="principle-card"
            >
              <div class="p-card-header">
                <span class="p-icon">{{ p.icon }}</span>
                <div>
                  <h3 class="p-title">{{ p.title }}</h3>
                  <div class="p-subtitle">{{ p.subtitle }}</div>
                </div>
              </div>

              <!-- 趣味口诀与比喻 -->
              <div class="p-formula-box">
                <div class="p-formula">🗣️ <strong>口诀：</strong>{{ p.formula }}</div>
                <div class="p-analogy">💡 <strong>妙趣比喻：</strong>{{ p.analogy }}</div>
              </div>

              <div class="p-priority">
                <span class="priority-tag">法则地位</span>
                <span class="priority-text">{{ p.priority }}</span>
              </div>

              <!-- 典型字示例剖析 -->
              <div class="p-examples">
                <div class="p-ex-title">典型字图解演示：</div>
                <div class="p-ex-list">
                  <div v-for="ex in p.examples" :key="ex.char" class="p-ex-item">
                    <div class="p-ex-top">
                      <MiZiGe :text="ex.char" size="small" />
                      <div class="p-ex-info">
                        <div class="p-ex-code">
                          全码: <strong>{{ ex.code }}</strong>
                        </div>
                        <div class="p-ex-reason">{{ ex.reason }}</div>
                      </div>
                    </div>
                    <div class="p-ex-roots">
                      字根拆解：
                      <span v-for="(r, ri) in ex.roots" :key="ri" class="root-chip">{{ r }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. 避坑大PK (正拆 vs 误拆对决卡片) -->
        <div v-if="activeSplitTab === 'pk-arena'" class="split-tab-content">
          <div class="pk-banner">
            <div class="pk-banner-title">⚡ 为什么这样拆不对？—— 拆字易错排雷排行榜</div>
            <div class="pk-banner-desc">
              五笔学习中最让人挠头的往往不是记不住字根，而是“面对一个汉字不知道字根从哪切”。点击卡片深度揭秘经典坑点！
            </div>
          </div>

          <div class="pk-grid">
            <div
              v-for="(item, pki) in TRICKY_SPLIT_PK_LIST"
              :key="pki"
              class="pk-card"
            >
              <div class="pk-header">
                <div class="pk-char-box">
                  <MiZiGe :text="item.char" size="medium" />
                  <div class="pk-char-meta">
                    <span class="pk-char-text">{{ item.char }}</span>
                    <span class="pk-pinyin">({{ item.pinyin }})</span>
                    <span class="pk-difficulty">难度: {{ item.difficulty }}</span>
                  </div>
                </div>
                <div class="pk-title-tag">{{ item.title }}</div>
              </div>

              <!-- 对决对比栏 -->
              <div class="pk-vs-row">
                <!-- 正确拆法 -->
                <div class="pk-side correct-side">
                  <div class="side-badge badge-green">✅ 正确拆法</div>
                  <div class="side-roots">
                    <span v-for="(cr, cri) in item.correctRoots" :key="cri" class="pk-root-pill green">
                      {{ cr }}
                    </span>
                  </div>
                  <div class="side-code">编码: {{ item.correctCode }}</div>
                </div>

                <div class="pk-vs-divider">VS</div>

                <!-- 常见错误拆法 -->
                <div class="pk-side wrong-side">
                  <div class="side-badge badge-red">❌ 常见误拆</div>
                  <div class="side-roots">
                    <span v-for="(wr, wri) in item.wrongRoots" :key="wri" class="pk-root-pill red">
                      {{ wr }}
                    </span>
                  </div>
                  <div class="side-code strike">编码: {{ item.wrongCode }}</div>
                </div>
              </div>

              <!-- 原则应用与深度剖析 -->
              <div class="pk-reason-box">
                <div class="pk-principle-applied">
                  📌 <strong>关键法则：</strong>{{ item.principleApplied }}
                </div>
                <div class="pk-why-wrong">
                  🔍 <strong>误区剖析：</strong>{{ item.whyWrong }}
                </div>
                <div class="pk-tip">
                  💡 <strong>避坑记忆金句：</strong>{{ item.tip }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. 拆字闯关挑战小游戏 -->
        <div v-if="activeSplitTab === 'quiz-game'" class="split-tab-content">
          <div class="quiz-container">
            <div class="quiz-status-bar">
              <div class="quiz-progress-text">
                第 <strong>{{ currentQuizIndex + 1 }}</strong> / {{ SPLIT_QUIZ_QUESTIONS.length }} 关
              </div>
              <div class="quiz-score-badge">
                得分：<span class="score-num">{{ quizScore }}</span> 钻 💎
              </div>
            </div>

            <!-- 当前关卡卡片 -->
            <div class="quiz-card" v-if="currentQuiz">
              <div class="quiz-char-header">
                <MiZiGe :text="currentQuiz.char" size="large" />
                <div class="quiz-q-info">
                  <span class="quiz-principle-badge">{{ currentQuiz.principleTag }}</span>
                  <h3 class="quiz-question">{{ currentQuiz.question }}</h3>
                </div>
              </div>

              <!-- 选项列表 -->
              <div class="quiz-options">
                <button
                  v-for="(opt, oi) in currentQuiz.options"
                  :key="oi"
                  class="quiz-opt-btn"
                  :class="{
                    'selected': selectedOptionIndex === oi,
                    'is-correct': selectedOptionIndex !== null && opt.isCorrect,
                    'is-wrong': selectedOptionIndex === oi && !opt.isCorrect
                  }"
                  :disabled="selectedOptionIndex !== null"
                  @click="handleSelectQuizOption(oi)"
                >
                  <div class="opt-label">{{ opt.label }}</div>
                  <div class="opt-roots">
                    <span v-for="(r, ri) in opt.roots" :key="ri" class="root-chip">{{ r }}</span>
                    <span class="opt-code">编码: {{ opt.code }}</span>
                  </div>
                </button>
              </div>

              <!-- 选后即时反馈解析 -->
              <div v-if="selectedOptionIndex !== null" class="quiz-feedback-box" :class="{ success: isCurrentCorrect, fail: !isCurrentCorrect }">
                <div class="feedback-head">
                  {{ isCurrentCorrect ? '🎉 恭喜回答正确！' : '😅 哎呀，掉进陷阱啦！' }}
                </div>
                <div class="feedback-text">
                  {{ currentQuiz.options[selectedOptionIndex].feedback }}
                </div>
                <div class="feedback-exp">
                  <strong>权威解析：</strong>{{ currentQuiz.explanation }}
                </div>

                <div class="quiz-action-bar">
                  <button
                    v-if="currentQuizIndex < SPLIT_QUIZ_QUESTIONS.length - 1"
                    class="quiz-next-btn"
                    @click="handleNextQuiz"
                  >
                    下一关 ➡️
                  </button>
                  <button
                    v-else
                    class="quiz-next-btn restart"
                    @click="handleRestartQuiz"
                  >
                    再挑战一次 🔄
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 4. 交互式拆字实验室 (探索任意字) -->
        <div v-if="activeSplitTab === 'lab-dissect'" class="split-tab-content">
          <div class="lab-container">
            <div class="lab-intro">
              <div class="lab-intro-title">🔬 拆字微观实验室</div>
              <p class="lab-intro-desc">
                输入任意汉字或点击快捷候选，观察汉字如何在米字格中被解构成独立字根，并自动推导其编码与识别码！
              </p>
            </div>

            <!-- 输入与快捷选字 -->
            <div class="lab-controls">
              <div class="lab-input-group">
                <input
                  type="text"
                  v-model="labCharInput"
                  maxlength="1"
                  placeholder="输单字"
                  class="lab-char-input"
                  @input="handleLabInput"
                />
                <span class="lab-input-hint">输入或点选右侧经典字：</span>
              </div>
              <div class="lab-quick-tags">
                <button
                  v-for="c in quickLabChars"
                  :key="c"
                  class="lab-tag-btn"
                  :class="{ active: labCurrentChar === c }"
                  @click="selectLabChar(c)"
                >
                  {{ c }}
                </button>
              </div>
            </div>

            <!-- 动态拆字与显微镜展示 -->
            <div class="lab-stage" v-if="labCharData">
              <div class="lab-dissect-view">
                <!-- 原字米字格展示 -->
                <div class="stage-block orig-char">
                  <div class="block-label">目标全字</div>
                  <MiZiGe :text="labCharData.char" size="large" />
                  <div class="char-pinyin">{{ labCharData.pinyin || '—' }}</div>
                </div>

                <div class="stage-arrow">➔ 拆解为</div>

                <!-- 拆解部件阵列 -->
                <div class="stage-block roots-breakdown">
                  <div class="block-label">拆出字根序列 (从左至右)</div>
                  <div class="roots-flow">
                    <div
                      v-for="(r, ri) in labBreakdown.roots"
                      :key="ri"
                      class="root-stage-item"
                    >
                      <span class="root-seq-num">第{{ ri + 1 }}码</span>
                      <MiZiGe :text="r" size="medium" />
                      <span class="root-key-badge">{{ labFullCode[ri] || '?' }} 键</span>
                    </div>
                  </div>
                </div>

                <!-- 末笔识别码（若有） -->
                <div class="stage-block recog-block" v-if="labBreakdown.recognitionCode">
                  <div class="block-label">末笔识别码</div>
                  <div class="recog-box">
                    <span class="recog-key">{{ labBreakdown.recognitionCode }}</span>
                    <span class="recog-desc">字根不足4个追加</span>
                  </div>
                </div>
              </div>

              <!-- 实验室结论解读 -->
              <div class="lab-analysis-footer">
                <div class="lab-full-code-row">
                  全码输出：<span class="final-code">{{ labFullCode }}</span>
                  <span class="short-code-tag" v-if="labShortCode && labShortCode !== labFullCode">
                    一/二级简码：{{ labShortCode }}
                  </span>
                </div>
                <div class="lab-formula-summary">
                  拆字逻辑公式：
                  <strong>{{ labBreakdown.roots.join(' + ') }}</strong>
                  <span v-if="labBreakdown.recognitionCode">
                    + [末笔识别码: {{ labBreakdown.recognitionCode }}]
                  </span>
                  = <strong>{{ labFullCode }}</strong>
                </div>
              </div>
            </div>

            <div v-else class="lab-empty">
              未在当前五笔词库中查到该字，请输入常用简体汉字。
            </div>
          </div>
        </div>
      </div>

      <!-- ================= 模块 2：字根五区与键位规律 ================= -->
      <div v-else-if="activeRule.id === 'roots-zone'" class="roots-gamified-container">
        <!-- 五区分组切换标签 -->
        <div class="zone-selector-bar">
          <button
            v-for="z in ZONES_DETAILED"
            :key="z.zone"
            class="zone-select-btn"
            :class="{ active: currentSelectedZone === z.zone }"
            :style="{ '--zone-theme': z.color }"
            @click="currentSelectedZone = z.zone"
          >
            <span class="zone-badge">{{ z.name }}</span>
            <span class="zone-stroke">{{ z.stroke }}</span>
          </button>
        </div>

        <!-- 选中的区位全景卡 -->
        <div class="zone-detail-card" v-if="activeZoneInfo" :style="{ '--zone-theme': activeZoneInfo.color }">
          <div class="zone-card-top">
            <div class="zone-hero-badge">
              <span class="hero-icon">🛡️</span>
              <div class="hero-text-box">
                <h3 class="hero-title">{{ activeZoneInfo.name }}（{{ activeZoneInfo.stroke }}）</h3>
                <div class="hero-motto">{{ activeZoneInfo.mnemonicHero }}</div>
              </div>
            </div>
            <div class="zone-keys-pills">
              包含按键：<strong>{{ activeZoneInfo.keys }}</strong>
            </div>
          </div>

          <!-- 该区各键位深度助记卡片 -->
          <div class="zone-keys-grid">
            <div
              v-for="k in activeZoneInfo.keysDetail"
              :key="k.key"
              class="zone-key-card"
            >
              <div class="key-head">
                <div class="key-pill">{{ k.key }}</div>
                <div class="key-meta">
                  <span class="key-name">键名字：<strong>{{ k.keyName }}</strong></span>
                  <span class="key-code">区位码：{{ k.code }}</span>
                </div>
              </div>

              <!-- 口诀与字根 -->
              <div class="key-mnemonic-box">
                <div class="key-mnemonic">🎵 <strong>助记口诀：</strong>{{ k.mnemonic }}</div>
                <div class="key-roots-tags">
                  <span v-for="(r, ri) in k.roots" :key="ri" class="root-chip">{{ r }}</span>
                </div>
              </div>

              <div class="key-tips-text">💡 {{ k.tips }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ================= 模块 3：末笔交叉识别码全解 ================= -->
      <div v-else-if="activeRule.id === 'recognition-code'" class="recog-gamified-container">
        <!-- 核心交互推导板 -->
        <div class="interactive-matrix-section">
          <div class="matrix-header-row">
            <div>
              <h3 class="matrix-title">🎮 末笔交叉识别码互动推导板</h3>
              <p class="matrix-tip">点击选择汉字的【末笔画】和【字型结构】，即时推导五笔识别码键位！</p>
            </div>
            <div class="matrix-formula-pill">
              识别码 = 末笔画所在区(1-5) + 字型结构所在位(1-3)
            </div>
          </div>

          <div class="matrix-builder">
            <!-- 步骤一：选择末笔画 -->
            <div class="step-box">
              <span class="step-label">第一步：选择汉字最后一笔</span>
              <div class="step-btns">
                <button
                  v-for="s in strokes"
                  :key="s.id"
                  class="step-btn"
                  :class="{ active: selectedStroke === s.id }"
                  @click="selectedStroke = s.id"
                >
                  {{ s.name }} ({{ s.id }}区)
                </button>
              </div>
            </div>

            <!-- 步骤二：选择字型结构 -->
            <div class="step-box">
              <span class="step-label">第二步：选择汉字字型结构</span>
              <div class="step-btns">
                <button
                  v-for="t in structures"
                  :key="t.id"
                  class="step-btn"
                  :class="{ active: selectedStructure === t.id }"
                  @click="selectedStructure = t.id"
                >
                  {{ t.name }} ({{ t.id }}位)
                </button>
              </div>
            </div>

            <!-- 推导结论卡片 -->
            <div class="result-box">
              <div class="res-title">识别码推导结果</div>
              <div class="res-key">{{ derivedCode.key }}</div>
              <div class="res-detail">
                区位码：<strong>{{ derivedCode.code }}</strong> | 对应键位：<strong>{{ derivedCode.key }} 键</strong>
              </div>
            </div>
          </div>

          <!-- 5x3 完整速查矩阵表 -->
          <div class="table-container">
            <table class="matrix-table">
              <thead>
                <tr>
                  <th>末笔笔画</th>
                  <th>1型（左右型）</th>
                  <th>2型（上下型）</th>
                  <th>3型（杂合型）</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in RECOGNITION_MATRIX" :key="row.strokeIndex">
                  <td class="row-head">{{ row.strokeName }}</td>
                  <td
                    v-for="col in row.types"
                    :key="col.type"
                    :class="{ highlight: selectedStroke === row.strokeIndex && selectedStructure === col.type }"
                  >
                    <span class="key-tag">{{ col.key }}</span>
                    <span class="code-tag">{{ col.code }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 识别码高难特例与避坑排雷 -->
        <div class="recog-pitfalls-box">
          <div class="pitfalls-title">⚠️ 识别码高阶“深坑”特例排雷（90% 初学者必错）</div>
          <div class="pitfalls-grid">
            <div v-for="(p, pi) in RECOG_PITFALL_LIST" :key="pi" class="pitfall-card">
              <div class="pitfall-top">
                <MiZiGe :text="p.char" size="medium" />
                <div class="pitfall-meta">
                  <div class="pitfall-char">{{ p.char }} ({{ p.pinyin }})</div>
                  <div class="pitfall-type">结构：{{ p.typeDesc }}</div>
                  <div class="pitfall-last">末笔判定：<strong>{{ p.lastStroke }}</strong></div>
                </div>
                <div class="pitfall-code-tag">识别码: {{ p.recogCode }}</div>
              </div>
              <div class="pitfall-analysis">{{ p.analysis }}</div>
              <div class="pitfall-formula">公式：<strong>{{ p.formula }}</strong></div>
              <div class="pitfall-alert">{{ p.alert }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ================= 模块 4：简码打法与极速提速秘诀 ================= -->
      <div v-else-if="activeRule.id === 'short-codes'" class="short-codes-gamified-container">
        <!-- 简码提速大作战三阶梯 -->
        <div class="speed-strategies-grid">
          <div
            v-for="strat in SHORT_CODE_STRATEGIES"
            :key="strat.type"
            class="strategy-card"
          >
            <div class="strat-header">
              <span class="strat-badge">{{ strat.speedMultiplier }}</span>
              <h3 class="strat-title">{{ strat.title }}</h3>
            </div>
            <div class="strat-rule">📜 <strong>规则：</strong>{{ strat.rule }}</div>
            <div class="strat-trick">⚡ <strong>提速窍门：</strong>{{ strat.trick }}</div>

            <div class="strat-examples">
              <div class="strat-ex-title">实战范例与击键对比：</div>
              <div class="strat-ex-list">
                <div v-for="ex in strat.examples" :key="ex.word" class="strat-ex-item">
                  <MiZiGe :text="ex.word" size="small" />
                  <div class="strat-ex-info">
                    <span class="strat-code">{{ ex.code }}</span>
                    <span class="strat-saved">{{ ex.strokeSaved }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 25 个一级简码金刚卡盘 -->
        <div class="level1-deck-box">
          <div class="deck-header">
            <h3 class="deck-title">🏆 25 个一级简码·全键盘飞天顺口溜</h3>
            <p class="deck-sub">牢记此 25 字，敲 1 个字母加空格，提速 75% 的极速飞跃！</p>
          </div>
          <div class="level1-chars-grid">
            <div
              v-for="item in LEVEL_1_CHARS"
              :key="item.char"
              class="l1-card"
            >
              <span class="l1-key">{{ item.short86 }}</span>
              <span class="l1-char">{{ item.char }}</span>
              <span class="l1-code-sub">{{ item.code86 }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ================= 模块 5：词组编码取码规则 ================= -->
      <div v-else-if="activeRule.id === 'phrase-rules'" class="phrase-gamified-container">
        <!-- 四大词组公式卡片 -->
        <div class="phrase-formulas-grid">
          <div
            v-for="pf in PHRASE_FORMULAS"
            :key="pf.type"
            class="phrase-card"
          >
            <div class="phrase-card-head">
              <span class="phrase-type-pill">{{ pf.type }}</span>
              <span class="phrase-formula-text">{{ pf.formula }}</span>
            </div>
            <h3 class="phrase-name">{{ pf.name }}</h3>
            <div class="phrase-motto">💡 {{ pf.motto }}</div>

            <!-- 范例直观拆解 -->
            <div class="phrase-demo-box">
              <div class="demo-phrase">{{ pf.demo.phrase }}</div>
              <div class="demo-split">{{ pf.demo.split }}</div>
              <div class="demo-final">
                最终编码：<strong>{{ pf.demo.finalCode }}</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- 互动词组拆解模拟器 -->
        <div class="phrase-simulator-box">
          <div class="sim-header">
            <h3 class="sim-title">⚡ 词组取码实时拆解模拟器</h3>
            <p class="sim-desc">输入任意 2 到 8 字的中文词汇，观察各字如何各司其职取码拼装成 4 码！</p>
          </div>

          <div class="sim-input-row">
            <input
              type="text"
              v-model="simPhraseInput"
              placeholder="输入词组，如：人工智能、五笔字型..."
              class="sim-input"
            />
            <div class="sim-quick-tags">
              <button
                v-for="p in quickSimPhrases"
                :key="p"
                class="sim-tag-btn"
                :class="{ active: simPhraseInput === p }"
                @click="simPhraseInput = p"
              >
                {{ p }}
              </button>
            </div>
          </div>

          <!-- 模拟器解析结果 -->
          <div class="sim-result-stage" v-if="simPhraseBreakdown">
            <div class="sim-summary-head">
              <span class="sim-rule-tag">{{ simPhraseBreakdown.ruleName }}</span>
              <span class="sim-rule-desc">{{ simPhraseBreakdown.ruleDesc }}</span>
            </div>

            <!-- 词组中每个字的贡献流 -->
            <div class="sim-chars-flow">
              <div
                v-for="step in simPhraseBreakdown.steps"
                :key="step.index"
                class="sim-char-step-card"
              >
                <div class="step-idx-badge">第 {{ step.index }} 字</div>
                <MiZiGe :text="step.char" size="medium" />
                <div class="step-contribution">
                  贡献编码：<strong class="contr-keys">{{ step.keys }}</strong>
                </div>
                <div class="step-rule-desc">{{ step.desc }} (全码: {{ step.charFullCode }})</div>
              </div>
            </div>

            <div class="sim-final-banner">
              整词四位编码：<span class="sim-final-code">{{ simPhraseBreakdown.code }}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  WUBI_RULES,
  RECOGNITION_MATRIX,
  SPLIT_PRINCIPLES_DETAILED,
  TRICKY_SPLIT_PK_LIST,
  SPLIT_QUIZ_QUESTIONS,
  ZONES_DETAILED,
  RECOG_PITFALL_LIST,
  SHORT_CODE_STRATEGIES,
  PHRASE_FORMULAS
} from '../data/rules';
import {
  lookupWubiChar,
  getCharBreakdown,
  getFullCode,
  getShortCode,
  LEVEL_1_CHARS,
  getPhraseBreakdown
} from '../data/wubiDict';
import MiZiGe from './MiZiGe.vue';

const currentRuleId = ref<string>('split-principles');

const activeRule = computed(() => {
  return WUBI_RULES.find(r => r.id === currentRuleId.value);
});

// 拆字法则的趣味子标签: 'visual-guide' | 'pk-arena' | 'quiz-game' | 'lab-dissect'
const activeSplitTab = ref<'visual-guide' | 'pk-arena' | 'quiz-game' | 'lab-dissect'>('visual-guide');

// 拆字闯关 Quiz 状态
const currentQuizIndex = ref<number>(0);
const selectedOptionIndex = ref<number | null>(null);
const quizScore = ref<number>(0);

const currentQuiz = computed(() => {
  return SPLIT_QUIZ_QUESTIONS[currentQuizIndex.value];
});

const isCurrentCorrect = computed(() => {
  if (selectedOptionIndex.value === null || !currentQuiz.value) return false;
  return currentQuiz.value.options[selectedOptionIndex.value].isCorrect;
});

const handleSelectQuizOption = (index: number) => {
  if (selectedOptionIndex.value !== null) return;
  selectedOptionIndex.value = index;
  if (currentQuiz.value.options[index].isCorrect) {
    quizScore.value += 20;
  }
};

const handleNextQuiz = () => {
  if (currentQuizIndex.value < SPLIT_QUIZ_QUESTIONS.length - 1) {
    currentQuizIndex.value++;
    selectedOptionIndex.value = null;
  }
};

const handleRestartQuiz = () => {
  currentQuizIndex.value = 0;
  selectedOptionIndex.value = null;
  quizScore.value = 0;
};

// 拆字实验室 Lab 状态
const quickLabChars = ['天', '果', '申', '未', '末', '卡', '甚', '肆', '舞', '武', '明', '春'];
const labCurrentChar = ref<string>('天');
const labCharInput = ref<string>('天');

const selectLabChar = (c: string) => {
  labCurrentChar.value = c;
  labCharInput.value = c;
};

const handleLabInput = () => {
  if (labCharInput.value) {
    labCurrentChar.value = labCharInput.value.slice(0, 1);
  }
};

const labCharData = computed(() => {
  return lookupWubiChar(labCurrentChar.value);
});

const labBreakdown = computed(() => {
  if (!labCharData.value) return { roots: [] };
  return getCharBreakdown(labCharData.value, '86');
});

const labFullCode = computed(() => {
  if (!labCharData.value) return '';
  return getFullCode(labCharData.value, '86');
});

const labShortCode = computed(() => {
  if (!labCharData.value) return '';
  return getShortCode(labCharData.value, '86');
});

// ================= 模块 2：字根五区状态 =================
const currentSelectedZone = ref<number>(1);
const activeZoneInfo = computed(() => {
  return ZONES_DETAILED.find(z => z.zone === currentSelectedZone.value) || ZONES_DETAILED[0];
});

// ================= 模块 3：识别码推导板状态 =================
const selectedStroke = ref<number>(1); // 1-5
const selectedStructure = ref<number>(1); // 1-3

const strokes = [
  { id: 1, name: '一 (横/提)' },
  { id: 2, name: '丨 (竖/竖钩)' },
  { id: 3, name: '丿 (撇)' },
  { id: 4, name: '丶 (捺/点)' },
  { id: 5, name: '𠃍 (折)' },
];

const structures = [
  { id: 1, name: '左右结构' },
  { id: 2, name: '上下结构' },
  { id: 3, name: '杂合/包围/独体' },
];

const derivedCode = computed(() => {
  const row = RECOGNITION_MATRIX.find(r => r.strokeIndex === selectedStroke.value);
  if (!row) return { key: 'G', code: '11' };
  const col = row.types.find(t => t.type === selectedStructure.value);
  return col || { key: 'G', code: '11' };
});

// ================= 模块 5：词组取码模拟器状态 =================
const quickSimPhrases = ['中国', '计算机', '一心一意', '中华人民共和国', '五笔输入', '人工智能'];
const simPhraseInput = ref<string>('计算机');

const simPhraseBreakdown = computed(() => {
  if (!simPhraseInput.value || !simPhraseInput.value.trim()) return null;
  return getPhraseBreakdown(simPhraseInput.value.trim(), '86');
});
</script>

<style scoped>
.rules-wrapper {
  max-width: 1080px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.rules-tabs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 0.75rem;
}

.rule-tab-btn {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  padding: 0.75rem 1rem;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.rule-tab-btn:hover {
  border-color: var(--accent);
}

.rule-tab-btn.active {
  background: var(--accent-subtle);
  border-color: var(--accent);
}

.tab-badge {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--accent);
}

.tab-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-main);
}

.rule-body {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.rule-header {
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 1rem;
}

.header-badge {
  color: var(--accent);
  font-size: 0.8rem;
  font-weight: 700;
}

.header-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--text-main);
  margin-top: 4px;
}

.header-summary {
  color: var(--text-muted);
  font-size: 0.95rem;
  margin-top: 6px;
}

.rule-content-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.content-item {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--text-main);
  background: var(--bg-primary);
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  border-left: 4px solid var(--accent);
}

.examples-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}

.example-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
}

.ex-char {
  font-size: 2.2rem;
  font-weight: 800;
  color: var(--text-main);
}

.ex-code {
  font-family: monospace;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--accent);
  background: var(--accent-subtle);
  padding: 2px 8px;
  border-radius: 6px;
}

.ex-desc {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.interactive-matrix-section {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.matrix-title {
  font-size: 1.2rem;
  color: var(--text-main);
}

.matrix-tip {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.matrix-builder {
  display: grid;
  grid-template-columns: 1fr 1fr 1.2fr;
  gap: 1rem;
  align-items: center;
}

.step-box {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.step-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-main);
}

.step-btns {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.step-btn {
  padding: 6px 12px;
  border-radius: 6px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  font-size: 0.85rem;
  cursor: pointer;
  text-align: left;
}

.step-btn.active {
  background: var(--accent);
  color: var(--accent-text, #ffffff);
  font-weight: 600;
  border-color: var(--accent);
}

.result-box {
  background: var(--card-bg);
  border: 2px solid var(--accent);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
}

.res-title {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.res-key {
  font-size: 3.5rem;
  font-weight: 800;
  color: var(--accent);
  line-height: 1;
}

.res-detail {
  font-size: 0.85rem;
  color: var(--text-main);
}

.matrix-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.matrix-table th, .matrix-table td {
  border: 1px solid var(--border-color);
  padding: 10px;
  text-align: center;
}

.matrix-table th {
  background: var(--bg-secondary);
  color: var(--text-main);
  font-size: 0.85rem;
}

.row-head {
  font-weight: 600;
  color: var(--text-main);
}

.matrix-table td.highlight {
  background: var(--accent-subtle);
  border-color: var(--accent);
}

.key-tag {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--accent);
  margin-right: 4px;
}

.code-tag {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-family: monospace;
}

@media (max-width: 768px) {
  .matrix-builder {
    grid-template-columns: 1fr;
  }
}

/* ================= 拆字法则趣味化模块专属样式 ================= */
.principles-gamified-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.sub-nav-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  background: var(--bg-primary);
  padding: 0.5rem;
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.sub-tab-btn {
  padding: 0.6rem 1.25rem;
  border-radius: 8px;
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-muted);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 6px;
}

.sub-tab-btn:hover {
  color: var(--text-main);
  background: var(--card-bg);
}

.sub-tab-btn.active {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
}

.split-tab-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 1. 四大法则图解卡片：两排，每排2个 */
.principles-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

@media (max-width: 768px) {
  .principles-grid {
    grid-template-columns: 1fr;
  }
}

.principle-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
}

.principle-card:hover {
  transform: translateY(-2px);
  border-color: var(--accent);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.p-card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.p-icon {
  font-size: 2rem;
  background: var(--card-bg);
  padding: 8px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
}

.p-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
}

.p-subtitle {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 2px;
}

.p-formula-box {
  background: var(--card-bg);
  border-radius: 10px;
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border-left: 4px solid var(--accent);
}

.p-formula {
  font-size: 0.9rem;
  color: var(--text-main);
  line-height: 1.4;
}

.p-analogy {
  font-size: 0.85rem;
  color: var(--accent);
  line-height: 1.4;
}

.p-priority {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 0.8rem;
  color: var(--text-muted);
  background: rgba(234, 179, 8, 0.08);
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid rgba(234, 179, 8, 0.2);
}

.priority-tag {
  color: var(--warning, #d97706);
  font-weight: 700;
  white-space: nowrap;
}

.priority-text {
  color: var(--text-main);
}

.p-examples {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.p-ex-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-main);
}

.p-ex-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.p-ex-item {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.p-ex-top {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.p-ex-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.p-ex-code {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.p-ex-code strong {
  font-family: monospace;
  color: var(--accent);
}

.p-ex-reason {
  font-size: 0.8rem;
  color: var(--text-main);
}

.p-ex-roots {
  font-size: 0.8rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.root-chip {
  background: var(--accent-subtle);
  color: var(--accent);
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 700;
  font-size: 0.85rem;
}

/* 2. 避坑大PK对决卡片 */
.pk-banner {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.25rem;
}

.pk-banner-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 4px;
}

.pk-banner-desc {
  font-size: 0.88rem;
  color: var(--text-muted);
  line-height: 1.5;
}

.pk-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: 1.25rem;
}

.pk-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.pk-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px dashed var(--border-color);
  padding-bottom: 0.75rem;
}

.pk-char-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.pk-char-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.pk-char-text {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--text-main);
}

.pk-pinyin {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.pk-difficulty {
  font-size: 0.75rem;
  color: #f59e0b;
  font-weight: 600;
}

.pk-title-tag {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--accent);
  background: var(--accent-subtle);
  padding: 4px 8px;
  border-radius: 6px;
}

.pk-vs-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 0.75rem;
  align-items: center;
}

.pk-side {
  border-radius: 10px;
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.5rem;
}

.correct-side {
  background: rgba(34, 197, 94, 0.08);
  border: 1px solid rgba(34, 197, 94, 0.25);
}

.wrong-side {
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.25);
}

.side-badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
}

.badge-green {
  background: rgba(34, 197, 94, 0.2);
  color: #16a34a;
}

.badge-red {
  background: rgba(239, 68, 68, 0.2);
  color: #dc2626;
}

.side-roots {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
}

.pk-root-pill {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 700;
}

.pk-root-pill.green {
  background: #22c55e;
  color: #fff;
}

.pk-root-pill.red {
  background: #ef4444;
  color: #fff;
}

.side-code {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-main);
  font-family: monospace;
}

.side-code.strike {
  text-decoration: line-through;
  color: var(--text-muted);
}

.pk-vs-divider {
  font-weight: 900;
  font-size: 0.95rem;
  color: var(--text-muted);
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pk-reason-box {
  background: var(--card-bg);
  border-radius: 10px;
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.85rem;
  line-height: 1.5;
}

.pk-principle-applied {
  color: var(--accent);
}

.pk-why-wrong {
  color: var(--text-main);
}

.pk-tip {
  color: #f59e0b;
}

/* 3. 拆字闯关小游戏 */
.quiz-container {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.quiz-status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.75rem;
}

.quiz-progress-text {
  font-size: 0.95rem;
  color: var(--text-muted);
}

.quiz-progress-text strong {
  color: var(--accent);
  font-size: 1.2rem;
}

.quiz-score-badge {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-main);
}

.score-num {
  color: #eab308;
  font-size: 1.1rem;
  font-weight: 800;
}

.quiz-card {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.quiz-char-header {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.quiz-q-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.quiz-principle-badge {
  background: var(--accent-subtle);
  color: var(--accent);
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  align-self: flex-start;
}

.quiz-question {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
  line-height: 1.4;
}

.quiz-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.quiz-opt-btn {
  background: var(--card-bg);
  border: 1.5px solid var(--border-color);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.quiz-opt-btn:hover:not(:disabled) {
  border-color: var(--accent);
  background: var(--accent-subtle);
}

.opt-label {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-main);
}

.opt-roots {
  display: flex;
  align-items: center;
  gap: 6px;
}

.opt-code {
  font-family: monospace;
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-left: 6px;
}

.quiz-opt-btn.is-correct {
  background: rgba(34, 197, 94, 0.1) !important;
  border-color: #22c55e !important;
}

.quiz-opt-btn.is-wrong {
  background: rgba(239, 68, 68, 0.1) !important;
  border-color: #ef4444 !important;
}

.quiz-feedback-box {
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  animation: fadeIn 0.3s ease;
}

.quiz-feedback-box.success {
  background: rgba(34, 197, 94, 0.08);
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.quiz-feedback-box.fail {
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.feedback-head {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text-main);
}

.feedback-text {
  font-size: 0.95rem;
  color: var(--text-main);
  line-height: 1.4;
}

.feedback-exp {
  font-size: 0.85rem;
  color: var(--text-muted);
  border-top: 1px dashed var(--border-color);
  padding-top: 0.5rem;
}

.quiz-action-bar {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.5rem;
}

.quiz-next-btn {
  background: var(--accent);
  color: #fff;
  border: none;
  padding: 0.6rem 1.5rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
}

.quiz-next-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* 4. 拆字实验室 */
.lab-container {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.lab-intro-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--text-main);
}

.lab-intro-desc {
  font-size: 0.88rem;
  color: var(--text-muted);
  margin-top: 4px;
}

.lab-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  background: var(--card-bg);
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.lab-input-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.lab-char-input {
  width: 80px;
  height: 44px;
  text-align: center;
  font-size: 1.4rem;
  font-weight: 800;
  background: var(--bg-primary);
  border: 2px solid var(--accent);
  color: var(--text-main);
  border-radius: 8px;
  outline: none;
}

.lab-input-hint {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.lab-quick-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.lab-tag-btn {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-main);
  cursor: pointer;
  transition: all 0.2s;
}

.lab-tag-btn:hover {
  border-color: var(--accent);
}

.lab-tag-btn.active {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}

.lab-stage {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.lab-dissect-view {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.5rem;
}

.stage-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.block-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
}

.char-pinyin {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.stage-arrow {
  font-size: 1rem;
  font-weight: 700;
  color: var(--accent);
}

.roots-flow {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.root-stage-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: var(--bg-primary);
  padding: 0.5rem 0.75rem;
  border-radius: 10px;
  border: 1px solid var(--border-color);
}

.root-seq-num {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.root-key-badge {
  font-family: monospace;
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--accent);
  background: var(--accent-subtle);
  padding: 2px 6px;
  border-radius: 4px;
}

.recog-box {
  background: var(--bg-primary);
  border: 1.5px dashed var(--accent);
  padding: 0.75rem 1rem;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.recog-key {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--accent);
  font-family: monospace;
}

.recog-desc {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.lab-analysis-footer {
  border-top: 1px solid var(--border-color);
  padding-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.lab-full-code-row {
  font-size: 1rem;
  color: var(--text-main);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.final-code {
  font-family: monospace;
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--accent);
}

.short-code-tag {
  background: rgba(34, 197, 94, 0.15);
  color: #16a34a;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 700;
}

.lab-formula-summary {
  font-size: 0.9rem;
  color: var(--text-muted);
}

.lab-formula-summary strong {
  color: var(--text-main);
}

.lab-empty {
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
  font-size: 0.95rem;
}

/* ================= 模块 2：字根五区专属样式 ================= */
.roots-gamified-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.zone-selector-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 0.75rem;
}

.zone-select-btn {
  background: var(--bg-primary);
  border: 1.5px solid var(--border-color);
  padding: 0.85rem 1rem;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.zone-select-btn:hover {
  border-color: var(--zone-theme);
  transform: translateY(-2px);
}

.zone-select-btn.active {
  background: var(--card-bg);
  border-color: var(--zone-theme);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.zone-badge {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--zone-theme);
}

.zone-stroke {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.zone-detail-card {
  background: var(--bg-primary);
  border: 1.5px solid var(--border-color);
  border-top: 4px solid var(--zone-theme);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.zone-card-top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px dashed var(--border-color);
  padding-bottom: 1rem;
}

.zone-hero-badge {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.hero-icon {
  font-size: 2.2rem;
  background: var(--card-bg);
  padding: 8px;
  border-radius: 12px;
}

.hero-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-main);
  margin: 0;
}

.hero-motto {
  font-size: 0.88rem;
  color: var(--zone-theme);
  font-weight: 600;
  margin-top: 2px;
}

.zone-keys-pills {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.85rem;
  color: var(--text-main);
}

.zone-keys-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.zone-key-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: all 0.2s;
}

.zone-key-card:hover {
  border-color: var(--zone-theme);
  transform: translateY(-2px);
}

.key-head {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.key-pill {
  font-family: monospace;
  font-size: 1.5rem;
  font-weight: 900;
  color: #fff;
  background: var(--zone-theme);
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.key-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.key-name {
  font-size: 0.95rem;
  color: var(--text-main);
}

.key-code {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.key-mnemonic-box {
  background: var(--bg-primary);
  border-radius: 8px;
  padding: 0.6rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.key-mnemonic {
  font-size: 0.85rem;
  color: var(--text-main);
  line-height: 1.4;
}

.key-roots-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.key-tips-text {
  font-size: 0.8rem;
  color: var(--text-muted);
  line-height: 1.4;
}

/* ================= 模块 3：识别码专属样式 ================= */
.recog-gamified-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.matrix-header-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px dashed var(--border-color);
  padding-bottom: 0.75rem;
  margin-bottom: 0.5rem;
}

.matrix-formula-pill {
  background: var(--accent-subtle);
  color: var(--accent);
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 700;
}

.recog-pitfalls-box {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.pitfalls-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: #ef4444;
}

.pitfalls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 1.25rem;
}

.pitfall-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-left: 4px solid #ef4444;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.pitfall-top {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  justify-content: space-between;
}

.pitfall-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.pitfall-char {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text-main);
}

.pitfall-type, .pitfall-last {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.pitfall-code-tag {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  font-weight: 800;
  font-family: monospace;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.85rem;
}

.pitfall-analysis {
  font-size: 0.85rem;
  color: var(--text-main);
  line-height: 1.5;
}

.pitfall-formula {
  font-size: 0.82rem;
  color: var(--accent);
  background: var(--bg-primary);
  padding: 4px 8px;
  border-radius: 6px;
}

.pitfall-alert {
  font-size: 0.8rem;
  color: #f59e0b;
  font-weight: 600;
}

/* ================= 模块 4：简码专属样式 ================= */
.short-codes-gamified-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.speed-strategies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.25rem;
}

.strategy-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  transition: all 0.2s;
}

.strategy-card:hover {
  transform: translateY(-2px);
  border-color: var(--accent);
}

.strat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.strat-badge {
  background: rgba(34, 197, 94, 0.15);
  color: #16a34a;
  font-weight: 800;
  font-size: 0.75rem;
  padding: 3px 8px;
  border-radius: 6px;
}

.strat-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text-main);
  margin: 0;
}

.strat-rule, .strat-trick {
  font-size: 0.85rem;
  line-height: 1.4;
  color: var(--text-main);
}

.strat-trick {
  color: var(--accent);
}

.strat-examples {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border-top: 1px dashed var(--border-color);
  padding-top: 0.75rem;
}

.strat-ex-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
}

.strat-ex-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.strat-ex-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--card-bg);
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.strat-ex-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.strat-code {
  font-family: monospace;
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--accent);
}

.strat-saved {
  font-size: 0.75rem;
  color: #16a34a;
}

.level1-deck-box {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.deck-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--text-main);
  margin: 0;
}

.deck-sub {
  font-size: 0.88rem;
  color: var(--text-muted);
  margin-top: 4px;
}

.level1-chars-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 0.6rem;
}

.l1-card {
  background: var(--card-bg);
  border: 1.5px solid var(--border-color);
  border-radius: 10px;
  padding: 0.6rem 0.4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  transition: all 0.2s;
}

.l1-card:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
  background: var(--accent-subtle);
}

.l1-key {
  font-family: monospace;
  font-weight: 900;
  font-size: 1.1rem;
  color: var(--accent);
}

.l1-char {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--text-main);
}

.l1-code-sub {
  font-size: 0.65rem;
  color: var(--text-muted);
  font-family: monospace;
}

/* ================= 模块 5：词组规则专属样式 ================= */
.phrase-gamified-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.phrase-formulas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}

.phrase-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: all 0.2s;
}

.phrase-card:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
}

.phrase-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.phrase-type-pill {
  background: var(--accent-subtle);
  color: var(--accent);
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
}

.phrase-formula-text {
  font-family: monospace;
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--success, #10b981);
}

.phrase-name {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text-main);
  margin: 0;
}

.phrase-motto {
  font-size: 0.82rem;
  color: var(--text-muted);
  line-height: 1.4;
}

.phrase-demo-box {
  background: var(--card-bg);
  border-radius: 8px;
  padding: 0.6rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.demo-phrase {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-main);
}

.demo-split {
  font-size: 0.78rem;
  color: var(--text-muted);
}

.demo-final {
  font-size: 0.85rem;
  color: var(--text-main);
}

.demo-final strong {
  font-family: monospace;
  color: var(--accent);
}

.phrase-simulator-box {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.sim-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--text-main);
  margin: 0;
}

.sim-desc {
  font-size: 0.88rem;
  color: var(--text-muted);
  margin-top: 4px;
}

.sim-input-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

.sim-input {
  flex: 1;
  min-width: 220px;
  height: 44px;
  padding: 0 1rem;
  background: var(--card-bg);
  border: 1.5px solid var(--border-color);
  border-radius: 10px;
  color: var(--text-main);
  font-size: 1.05rem;
  outline: none;
}

.sim-input:focus {
  border-color: var(--accent);
}

.sim-quick-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.sim-tag-btn {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.88rem;
  color: var(--text-main);
  cursor: pointer;
  transition: all 0.2s;
}

.sim-tag-btn:hover {
  border-color: var(--accent);
}

.sim-tag-btn.active {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}

.sim-result-stage {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.sim-summary-head {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.sim-rule-tag {
  background: var(--accent-subtle);
  color: var(--accent);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 700;
}

.sim-rule-desc {
  font-size: 0.88rem;
  color: var(--text-muted);
}

.sim-chars-flow {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.sim-char-step-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  flex: 1;
  min-width: 140px;
}

.step-idx-badge {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 600;
}

.step-contribution {
  font-size: 0.85rem;
  color: var(--text-main);
}

.contr-keys {
  font-family: monospace;
  font-size: 1.1rem;
  color: var(--accent);
}

.step-rule-desc {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-align: center;
}

.sim-final-banner {
  background: var(--bg-primary);
  border: 1.5px solid var(--accent);
  border-radius: 10px;
  padding: 0.85rem 1.25rem;
  font-size: 1rem;
  color: var(--text-main);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.sim-final-code {
  font-family: monospace;
  font-size: 1.6rem;
  font-weight: 900;
  color: var(--accent);
  letter-spacing: 2px;
}
</style>

