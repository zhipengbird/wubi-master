export interface RuleSection {
  id: string;
  title: string;
  badge: string;
  summary: string;
  content: string[];
  examples?: {
    word: string;
    code: string;
    analysis: string;
  }[];
}

// 识别码 5x3 矩阵
// 行：末笔画（1横、2竖、3撇、4捺、5折）
// 列：字型（1左右、2上下、3杂合）
export const RECOGNITION_MATRIX = [
  { strokeIndex: 1, strokeName: '横 (一)', types: [{ type: 1, typeName: '左右型', key: 'G', code: '11' }, { type: 2, typeName: '上下型', key: 'F', code: '12' }, { type: 3, typeName: '杂合型', key: 'D', code: '13' }] },
  { strokeIndex: 2, strokeName: '竖 (丨)', types: [{ type: 1, typeName: '左右型', key: 'H', code: '21' }, { type: 2, typeName: '上下型', key: 'J', code: '22' }, { type: 3, typeName: '杂合型', key: 'K', code: '23' }] },
  { strokeIndex: 3, strokeName: '撇 (丿)', types: [{ type: 1, typeName: '左右型', key: 'T', code: '31' }, { type: 2, typeName: '上下型', key: 'R', code: '32' }, { type: 3, typeName: '杂合型', key: 'E', code: '33' }] },
  { strokeIndex: 4, strokeName: '捺 (丶)', types: [{ type: 1, typeName: '左右型', key: 'Y', code: '41' }, { type: 2, typeName: '上下型', key: 'U', code: '42' }, { type: 3, typeName: '杂合型', key: 'I', code: '43' }] },
  { strokeIndex: 5, strokeName: '折 (𠃍)', types: [{ type: 1, typeName: '左右型', key: 'N', code: '51' }, { type: 2, typeName: '上下型', key: 'B', code: '52' }, { type: 3, typeName: '杂合型', key: 'V', code: '53' }] },
];

// 拆字原则详细口诀与拟人化说明
export interface SplitPrincipleDetail {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  formula: string; // 朗朗上口的口诀
  analogy: string; // 趣味比喻
  explanation: string;
  priority: string; // 优先级地位
  examples: {
    char: string;
    roots: string[];
    code: string;
    reason: string;
    breakdownNote: string;
  }[];
}

// 正误拆法大PK（避坑实战）
export interface SplitPKItem {
  char: string;
  pinyin: string;
  title: string;
  correctRoots: string[];
  correctCode: string;
  wrongRoots: string[];
  wrongCode: string;
  principleApplied: string;
  whyWrong: string;
  tip: string;
  difficulty: '★☆☆' | '★★☆' | '★★★' | '★★★★' | '★★★★★';
}

// 互动拆字闯关题目
export interface SplitQuizItem {
  id: number;
  char: string;
  pinyin: string;
  question: string;
  options: {
    label: string;
    roots: string[];
    code: string;
    isCorrect: boolean;
    feedback: string;
  }[];
  explanation: string;
  principleTag: string;
}

// 拆字四大原则趣味全景
export const SPLIT_PRINCIPLES_DETAILED: SplitPrincipleDetail[] = [
  {
    id: 'order',
    title: '书写顺序',
    subtitle: '天然直觉：写字从哪先下笔，字根就先取谁',
    icon: '✍️',
    formula: '从左到右、由上而下、先外后内、先进后关',
    analogy: '如同排队过安检，笔顺就像时间轴，先写出来的部件先进站，谁也不能插队！',
    explanation: '拆字必须严格遵循汉字传统的标准笔顺次序，不可跳跃跨越取字根。',
    priority: '最高铁律：任何拆分都不可颠倒先写与后写的笔顺关系。',
    examples: [
      { char: '新', roots: ['立', '木', '斤'], code: 'USRH', reason: '先左后右：先写亲字左边“立木”，再写右侧“斤”', breakdownNote: 'U (立) + S (木) + R (斤) + H (末笔竖左右识别)' },
      { char: '同', roots: ['冂', '一', '口'], code: 'MGKD', reason: '先外后内：先写外部边框“冂”，再写内部“一”与“口”', breakdownNote: 'M (冂) + G (一) + K (口) + D (识别码)' },
      { char: '国', roots: ['囗', '王', '丶'], code: 'LGYI', reason: '先进后关：先写外框“囗”，再放入内容“玉”，封口最后算全字完成', breakdownNote: 'L (囗) + G (王) + Y (丶) + I (识别码)' }
    ]
  },
  {
    id: 'size',
    title: '取大优先',
    subtitle: '贪吃蛇原则：每次尽量吃进笔画最多的大字根',
    icon: '🦁',
    formula: '步步取大块，杜绝零碎画；能组大字根，不拆小零星',
    analogy: '好比搭积木时优先挑选最大的现成模块，不仅省力速度快，拼出的结构也最稳固！',
    explanation: '在符合书写顺序的前提下，按从大到小的原则拆分，使得拆出的字根总数最少、各字根涵盖笔画最多。',
    priority: '核心基石：解决多义拆解的第一判据，消除模棱两可。',
    examples: [
      { char: '果', roots: ['曰', '木'], code: 'JSI', reason: '优先取大字根“曰”(J)，而不是碎拆成“日+一+木”或“田”', breakdownNote: 'J (曰) + S (木) + I (杂合识别码)' },
      { char: '主', roots: ['丶', '王'], code: 'YGD', reason: '先取顶上的点“丶”(Y)，下面整体取大字根“王”(G)，而不是拆“三+丨”', breakdownNote: 'Y (丶) + G (王) + D (杂合识别码)' },
      { char: '甚', roots: ['甘', '匹', '十'], code: 'ADWN', reason: '顶部先取最大完整的“甘”(A)，接下来是横折包围“匹框”，再取“十”', breakdownNote: 'A (甘) + D (匹底) + W (八) + N (折)' }
    ]
  },
  {
    id: 'visual',
    title: '兼顾直观',
    subtitle: '视觉完整：形体自然清晰，一眼就能看出原貌',
    icon: '👁️',
    formula: '保留整体感，符合骨架相；视觉不割裂，一目了然强',
    analogy: '给汉字拍照，切块时尽量顺应自然的器官和轮廓，别把完整的人脸切成两截！',
    explanation: '字根拆分应当符合常人对汉字骨架结构的视觉心理，保持字根的原有形态，不人为打碎易识别的自然块。',
    priority: '视觉平衡：当取大与习惯视觉产生极微冲突时，以直观自然为重。',
    examples: [
      { char: '自', roots: ['丿', '目'], code: 'THD', reason: '虽然“白”是个字根，但根据骨架视觉，自然看作一撇+目，结构清爽直观', breakdownNote: 'T (丿) + H (目) + D (杂合识别码)' },
      { char: '生', roots: ['𠂉', '土'], code: 'TGD', reason: '直观分为“牛头/𠂉”与下方底座“土”，符合汉字整体重心视觉', breakdownNote: 'T (𠂉) + G (土) + D (杂合识别码)' }
    ]
  },
  {
    id: 'connect',
    title: '能连不交',
    subtitle: '和谐共处：能相依相连的，绝不狠心相交穿越',
    icon: '🤝',
    formula: '能连绝不交，相接胜相穿；笔画有粘连，互不腰斩过',
    analogy: '两人手拉手（相连）是和谐好朋友，如果拿宝剑横穿对方身体（相交）那就是事故现场！',
    explanation: '一个字如果既可以拆成几个相互连接的字根，也可以拆成相交穿越的字根，必须取相连而绝不取相交。',
    priority: '判错王牌：五笔最常见的“易错坑”90% 都是违反了此项原则！',
    examples: [
      { char: '天', roots: ['一', '大'], code: 'GDI', reason: '“一”与“大”是相连相依；若拆成“二”与“人”，则“人”被横线腰斩穿越变成相交大忌！', breakdownNote: 'G (一) + D (大) + I (杂合识别码)' },
      { char: '于', roots: ['一', '十'], code: 'GFK', reason: '先写横“一”，连着写“十/干底”；绝不拆成相交的“二”与竖钩', breakdownNote: 'G (一) + F (十) + K (杂合识别码)' },
      { char: '未', roots: ['二', '小'], code: 'FII', reason: '“二”与“木底(小)”相连相接，不把中间的长竖和横相交割裂', breakdownNote: 'F (二) + I (小木底) + I (识别码)' }
    ]
  }
];

// 正误拆法大PK精选避坑宝典
export const TRICKY_SPLIT_PK_LIST: SplitPKItem[] = [
  {
    char: '天',
    pinyin: 'tiān',
    title: '能连不交的典型标杆',
    correctRoots: ['一 (G)', '大 (D)'],
    correctCode: 'GD + I (识别码) = GDI',
    wrongRoots: ['二 (F)', '人 (W)'],
    wrongCode: 'FWI (错！)',
    principleApplied: '能连不交',
    whyWrong: '拆成“二 + 人”，人的撇捺与横线形成交叉相穿；拆成“一 + 大”，一与大只在顶端相接，属于相连关系。能连绝不交！',
    tip: '看到天字，脑海中浮现“头顶一条线(一)，脚踩大英雄(大)”。',
    difficulty: '★★☆'
  },
  {
    char: '申',
    pinyin: 'shēn',
    title: '贯穿相交 vs 取大优先',
    correctRoots: ['曰 (J)', '丨 (H)'],
    correctCode: 'JH + K (识别码) = JHK',
    wrongRoots: ['口 (K)', '十 (F)'],
    wrongCode: 'KFD (错！)',
    principleApplied: '取大优先 + 书写顺序',
    whyWrong: '许多人以为是口字加个十字，但写申字是先写日(曰)字框，最后中间贯穿一竖！曰是更大的字根，且符合真实笔顺。',
    tip: '“申”是日中贯一竖，先打日(J)再打竖(H)。',
    difficulty: '★★★'
  },
  {
    char: '果',
    pinyin: 'guǒ',
    title: '贪吃大字根还是拆成小碎块？',
    correctRoots: ['曰 (J)', '木 (S)'],
    correctCode: 'JS + I (识别码) = JSI',
    wrongRoots: ['田 (L)', '木 (S)'],
    wrongCode: 'LSI (错！)',
    principleApplied: '取大优先 + 书写顺序',
    whyWrong: '不少初学者直觉看到上面像个“田”，但实际上果字的竖是和下方的木相通相连的，字根库中上方取大为“曰(J)”，下部为完整的“木(S)”。',
    tip: '树上结了日头果：日(J) + 木(S)。',
    difficulty: '★★★'
  },
  {
    char: '末',
    pinyin: 'mò',
    title: '“末”与“未”的双子星陷阱',
    correctRoots: ['一 (G)', '木 (S)'],
    correctCode: 'GS + I (识别码) = GSI',
    wrongRoots: ['二 (F)', '小 (I)'],
    wrongCode: 'FII (这是“未”！)',
    principleApplied: '取大优先 + 直观',
    whyWrong: '“末”上面一横长，下面是一个完整的“木”，取大直接为“一”+“木”；而“未”上面一横短，必须拆成“二”+“小木底”！两者天壤之别！',
    tip: '上长下短是“末”，取一木(GS)；上短下长是“未”，取二木(FI)。',
    difficulty: '★★★★'
  },
  {
    char: '卡',
    pinyin: 'kǎ',
    title: '上下各半还是取大优先？',
    correctRoots: ['上 (H)', '卜 (H)'],
    correctCode: 'HH + U (识别码) = HHU',
    wrongRoots: ['| (H)', '一 (G)', '卜 (H)'],
    wrongCode: 'HGH (错！)',
    principleApplied: '取大优先',
    whyWrong: '卡字上半截本身就是一个完整的字根“上(H)”，下半截是“卜(H)”，两次取大即可完美搞定，绝不需要碎拆成单笔画。',
    tip: '上面是“上”，下面是“卜”，上卜成卡(HHU)。',
    difficulty: '★★☆'
  },
  {
    char: '我',
    pinyin: 'wǒ',
    title: '天天打却拆不对的全码盲区',
    correctRoots: ['丿 (T)', '扌 (R)', '戈 (N)'],
    correctCode: '全码 TRNT (一简只需打 Q)',
    wrongRoots: ['丿 (T)', '手 (R)', '弋 (A)'],
    wrongCode: 'TRA (错！)',
    principleApplied: '书写顺序与复合字根',
    whyWrong: '平时都用 Q 键打我，但全码拆解非常考验功力：先写一撇(T)，再写提手偏旁(R)，右边是带横的“戈(N)”并在最后补末笔撇(T)。',
    tip: '一简为 Q，全码为“撇提手戈撇”(TRNT)。',
    difficulty: '★★★★'
  },
  {
    char: '甚',
    pinyin: 'shèn',
    title: '经典骨灰级高难拆字',
    correctRoots: ['甘 (A)', '匹框 (D)', '八 (W)', '𠃊 (N)'],
    correctCode: 'ADWN (全码直出)',
    wrongRoots: ['十 (F)', '十 (F)', '八 (W)'],
    wrongCode: 'FFW (错！)',
    principleApplied: '取大优先',
    whyWrong: '甚字上方虽然看起来像两个十，但实际上可以取最大的完整预设字根“甘(A)”！下部由底框与八组合，构成 ADWN。',
    tip: '甚字头顶是甘蔗：甘(A)打头，瞬间破局！',
    difficulty: '★★★★★'
  },
  {
    char: '肆',
    pinyin: 'sì',
    title: '复杂左右结构的取大拆分',
    correctRoots: ['镸 (D)', '聿 (V)', '十 (F)', '一 (G)'],
    correctCode: 'DVFH',
    wrongRoots: ['长 (T)', '聿 (V)'],
    wrongCode: 'TV (错！)',
    principleApplied: '取大优先 + 规范字根',
    whyWrong: '肆左边是古代繁体长“镸”，字根码为 D；右侧是聿字(V)，按序取大，编码极为严谨精巧。',
    tip: '肆意挥洒：左镸(D)右聿(V)，大写数字四的排面。',
    difficulty: '★★★★★'
  }
];

// 拆字大考验互动题库
export const SPLIT_QUIZ_QUESTIONS: SplitQuizItem[] = [
  {
    id: 1,
    char: '天',
    pinyin: 'tiān',
    question: '“天”字在五笔中应该如何正确拆分？遵循哪项核心法则？',
    options: [
      { label: '一 (G) + 大 (D)', roots: ['一', '大'], code: 'GDI', isCorrect: true, feedback: '太棒了！遵循【能连不交】，一与大首尾相连，避免相交割裂！' },
      { label: '二 (F) + 人 (W)', roots: ['二', '人'], code: 'FWI', isCorrect: false, feedback: '错误！拆成二和人会使人的撇捺与横线交叉穿透，违反【能连不交】大忌！' },
      { label: '一 (G) + 一 (G) + 人 (W)', roots: ['一', '一', '人'], code: 'GGWI', isCorrect: false, feedback: '错误！碎拆成零散小笔画，违反了【取大优先】原则！' }
    ],
    explanation: '“能连不交”是五笔精髓：字根之间相连相接优于相互交叉，因此拆为“一”+“大”。',
    principleTag: '能连不交'
  },
  {
    id: 2,
    char: '申',
    pinyin: 'shēn',
    question: '“申”字经常被误拆为口与十，它的标准拆法是？',
    options: [
      { label: '曰 (J) + 丨 (H)', roots: ['曰', '丨'], code: 'JHK', isCorrect: true, feedback: '完全正确！申字书写为先写外框曰(J)，最后一竖贯通(H)，取大优先！' },
      { label: '口 (K) + 十 (F)', roots: ['口', '十'], code: 'KFD', isCorrect: false, feedback: '错误！违反书写笔顺，且曰比口涵盖笔画更大更精准！' },
      { label: '日 (J) + 十 (F)', roots: ['日', '十'], code: 'JFD', isCorrect: false, feedback: '错误！十字横画并不存在，只有中间那一竖！' }
    ],
    explanation: '申字的书写顺序是先写“曰”，最后中间悬针竖贯穿，取码为 JHK。',
    principleTag: '书写顺序 & 取大优先'
  },
  {
    id: 3,
    char: '果',
    pinyin: 'guǒ',
    question: '拆分“果”字时，上半部分的合理字根是哪个？',
    options: [
      { label: '田 (L) —— 直观看起来四四方方', roots: ['田', '木'], code: 'LSI', isCorrect: false, feedback: '错啦！果字的中间一竖是通到下面木字里的，上面不是封闭独立的田！' },
      { label: '曰 (J) —— 包含上面扁日框', roots: ['曰', '木'], code: 'JSI', isCorrect: true, feedback: '答对了！上部取大字根为曰(J)，下部整块为木(S)，合为 JSI！' },
      { label: '日 (J) + 一 (G) —— 分层拆解', roots: ['日', '一', '木'], code: 'JGSI', isCorrect: false, feedback: '错误！太碎了，违背了【取大优先】能一块绝不两块的原则！' }
    ],
    explanation: '“果”字上部为“曰(J)”，下部为“木(S)”，末笔为木的捺点，杂合型识别码为 I。',
    principleTag: '取大优先'
  },
  {
    id: 4,
    char: '末',
    pinyin: 'mò',
    question: '如何一眼区分“末”和“未”在五笔中的取码拆解？',
    options: [
      { label: '末是上长下短，取大为“一 + 木”(GS)；未是上短下长，拆为“二 + 小(木底)”(FI)', roots: ['一', '木'], code: 'GSI', isCorrect: true, feedback: '高分洞察！末字底下一个完整木，因此直观取“一+木”；未字上短下长只能取“二”！' },
      { label: '两者都是一横加木，完全一样编码', roots: ['一', '木'], code: 'GSI', isCorrect: false, feedback: '大错特错！五笔对未和末有严格区分，未是 FII，末是 GSI！' },
      { label: '末拆为“二 + 小木底”', roots: ['二', '小木底'], code: 'FII', isCorrect: false, feedback: '记反了！FII 是“未”的拆法！' }
    ],
    explanation: '末字上方横长，下方是一个天然纯粹的“木(S)”，取码 GSI；未字上方横短，拆为二与小木底，取码 FII。',
    principleTag: '兼顾直观 & 取大优先'
  },
  {
    id: 5,
    char: '卡',
    pinyin: 'kǎ',
    question: '“卡”字既有竖又有一横，最快最准的拆法是？',
    options: [
      { label: '上 (H) + 卜 (H)', roots: ['上', '卜'], code: 'HHU', isCorrect: true, feedback: '火眼金睛！直接拆成两个现成的大字根“上”和“卜”，击键极其轻快流畅！' },
      { label: '丨 (H) + 一 (G) + 卜 (H)', roots: ['丨', '一', '卜'], code: 'HGHU', isCorrect: false, feedback: '过于零碎！字根库里有完整的“上”，不应拆解单笔画！' },
      { label: '止 (H) + 丶 (Y)', roots: ['止', '丶'], code: 'HYI', isCorrect: false, feedback: '不符合汉字结构，卡字没有止字偏旁！' }
    ],
    explanation: '遵循取大优先，卡字由“上(H)”和“卜(H)”组合而成，末笔点，杂合型识别码为 U。',
    principleTag: '取大优先'
  }
];

// ================= 模块 2：字根五区趣味助记与闯关 =================
export interface ZoneDetail {
  zone: number;
  name: string;
  stroke: string;
  keys: string;
  color: string;
  mnemonicHero: string; // 拟人化/顺口溜记忆法
  description: string;
  keysDetail: {
    key: string;
    code: string;
    keyName: string;
    mnemonic: string;
    roots: string[];
    tips: string;
  }[];
}

export const ZONES_DETAILED: ZoneDetail[] = [
  {
    zone: 1,
    name: '1区 · 横起区',
    stroke: '一 (横/提)',
    keys: 'G - F - D - S - A',
    color: '#3b82f6',
    mnemonicHero: '王者工匠团：以“王”为首，起笔皆为一横，指尖横扫天下！',
    description: '1区包括 G(11)、F(12)、D(13)、S(14)、A(15)，从键盘中心 G 往左延伸至 A。字根起笔均为横（提笔归入横）。',
    keysDetail: [
      { key: 'G', code: '11', keyName: '王', mnemonic: '王旁青头戋五一', roots: ['王', '龶', '戋', '五', '一'], tips: '1区1位：单笔画“一”与王字旁，打四下 GGGG 出“王”' },
      { key: 'F', code: '12', keyName: '土', mnemonic: '土士二干十寸雨', roots: ['土', '士', '二', '干', '十', '寸', '雨'], tips: '1区2位：涵盖二、十、土等，两横起笔' },
      { key: 'D', code: '13', keyName: '大', mnemonic: '大犬三羊古石厂', roots: ['大', '犬', '三', '羊', '古', '石', '厂'], tips: '1区3位：三横、大、厂等经典大件' },
      { key: 'S', code: '14', keyName: '木', mnemonic: '木丁西', roots: ['木', '丁', '西', '覀'], tips: '1区4位：树木家族，覀、西等' },
      { key: 'A', code: '15', keyName: '工', mnemonic: '工戈草头右框七', roots: ['工', '戈', '艹', '匚', '七', '廿'], tips: '1区5位最左翼：极其常用的草字头艹与工戈' }
    ]
  },
  {
    zone: 2,
    name: '2区 · 竖起区',
    stroke: '丨 (竖/竖钩)',
    keys: 'H - J - K - L - M',
    color: '#10b981',
    mnemonicHero: '顶天立地团：以“目”领衔，起笔皆为坚挺悬针竖！',
    description: '2区包括 H(21)、J(22)、K(23)、L(24)、M(25)，从键盘中心 H 往右延伸至 M。字根起笔均为竖或竖钩。',
    keysDetail: [
      { key: 'H', code: '21', keyName: '目', mnemonic: '目具上止卜虎皮', roots: ['目', '止', '卜', '虎', '皮', '丨'], tips: '2区1位：单笔画“丨”与目、上、卜' },
      { key: 'J', code: '22', keyName: '日', mnemonic: '日早两竖与虫依', roots: ['日', '早', '刂', '虫', '曰'], tips: '2区2位：日字、立刀旁刂、虫' },
      { key: 'K', code: '23', keyName: '口', mnemonic: '口与川，字根稀', roots: ['口', '川'], tips: '2区3位：汉字最常见的口字旁，单打出口' },
      { key: 'L', code: '24', keyName: '田', mnemonic: '田甲方框四车力', roots: ['田', '甲', '四', '车', '力', '皿'], tips: '2区4位：带田字框与力车部件' },
      { key: 'M', code: '25', keyName: '山', mnemonic: '山由贝，下框几', roots: ['山', '由', '贝', '冂', '几'], tips: '2区5位最下端：群山立峰，由、贝、冂框' }
    ]
  },
  {
    zone: 3,
    name: '3区 · 撇起区',
    stroke: '丿 (撇)',
    keys: 'T - R - E - W - Q',
    color: '#f59e0b',
    mnemonicHero: '飘逸剑客团：以“禾”为首，起笔如飞剑撇落，动作利落！',
    description: '3区包括 T(31)、R(32)、E(33)、W(34)、Q(35)，位于 QWERTY 顶部自右向左。起笔均为撇。',
    keysDetail: [
      { key: 'T', code: '31', keyName: '禾', mnemonic: '禾竹一撇斤', roots: ['禾', '竹', '丿', '斤'], tips: '3区1位：单笔画“丿”及禾木旁、竹字头' },
      { key: 'R', code: '32', keyName: '白', mnemonic: '白手看头三二斤', roots: ['白', '手', '扌', '斤'], tips: '3区2位：极其高频的提手旁扌与白' },
      { key: 'E', code: '33', keyName: '月', mnemonic: '月衫乃用家衣底', roots: ['月', '彡', '乃', '用'], tips: '3区3位：月字旁、三撇彡' },
      { key: 'W', code: '34', keyName: '人', mnemonic: '人和八，登祭头', roots: ['人', '亻', '八', '𠂉'], tips: '3区4位：单人旁亻与大人、八' },
      { key: 'Q', code: '35', keyName: '金', mnemonic: '金勺缺点无尾鱼，犬旁留叉多点夕', roots: ['金', '钅', '勹', '儿', '夕', '犭'], tips: '3区5位：金字旁钅、反犬旁犭、夕' }
    ]
  },
  {
    zone: 4,
    name: '4区 · 捺起区',
    stroke: '丶 (捺/点)',
    keys: 'Y - U - I - O - P',
    color: '#ec4899',
    mnemonicHero: '水墨飞花团：以“言”起首，凡是点捺皆在此，落笔生花！',
    description: '4区包括 Y(41)、U(42)、I(43)、O(44)、P(45)，位于右上方。在五笔中，点（丶）一律归为捺笔。',
    keysDetail: [
      { key: 'Y', code: '41', keyName: '言', mnemonic: '言文方广在四一，高头一捺谁人识', roots: ['言', '讠', '文', '方', '广', '丶'], tips: '4区1位：单笔画“丶”及言字旁讠、文、方' },
      { key: 'U', code: '42', keyName: '立', mnemonic: '立辛两点六门病', roots: ['立', '辛', '门', '疒', '丷'], tips: '4区2位：病字旁疒、立、门字框' },
      { key: 'I', code: '43', keyName: '水', mnemonic: '水旁三点水，小雨倒水', roots: ['水', '氵', '小'], tips: '4区3位：极其常用的三点水氵和小' },
      { key: 'O', code: '44', keyName: '火', mnemonic: '火业头，四点米', roots: ['火', '灬', '米'], tips: '4区4位：火字旁与四点底灬、米' },
      { key: 'P', code: '45', keyName: '之', mnemonic: '之字军盖建道底，摘礻(示)衤(衣)', roots: ['辶', '廴', '冖', '宀', '礻', '衤'], tips: '4区5位最右：宝盖头宀、走之底辶、示补偏旁' }
    ]
  },
  {
    zone: 5,
    name: '5区 · 折起区',
    stroke: '𠃍 (各种转折)',
    keys: 'N - B - V - C - X',
    color: '#8b5cf6',
    mnemonicHero: '百转千回团：以“已”带路，弯钩转折如山路十八弯！',
    description: '5区包括 N(51)、B(52)、V(53)、C(54)、X(55)，位于底部键盘。凡带拐角转折笔画皆在此区。',
    keysDetail: [
      { key: 'N', code: '51', keyName: '已', mnemonic: '已半巳满不出己，羽房尸心乙', roots: ['已', '己', '巳', '羽', '尸', '心', '乙'], tips: '5区1位：心字底、尸字头、单折“乙”' },
      { key: 'B', code: '52', keyName: '子', mnemonic: '子耳也，框向上', roots: ['子', '耳', '也', '阝', '卩'], tips: '5区2位：耳朵旁阝、子、也' },
      { key: 'V', code: '53', keyName: '女', mnemonic: '女刀九臼山朝西', roots: ['女', '刀', '九', '彐'], tips: '5区3位：女字旁、刀字头' },
      { key: 'C', code: '54', keyName: '又', mnemonic: '又巴马，丢矢矣', roots: ['又', '巴', '马'], tips: '5区4位：又字旁、巴、马' },
      { key: 'X', code: '55', keyName: '纟', mnemonic: '慈母手中线，幺匕弓纟', roots: ['纟', '幺', '匕', '弓'], tips: '5区5位：绞丝旁纟、弓字旁' }
    ]
  }
];

// ================= 模块 3：末笔识别码 避坑进阶特例 =================
export interface RecogPitfallItem {
  char: string;
  pinyin: string;
  typeDesc: string;
  lastStroke: string;
  recogCode: string;
  analysis: string;
  formula: string;
  alert: string;
}

export const RECOG_PITFALL_LIST: RecogPitfallItem[] = [
  {
    char: '连',
    pinyin: 'lián',
    typeDesc: '半包围(杂合型, 3位)',
    lastStroke: '末笔取被包围部分“车”的悬针竖(2区)',
    recogCode: 'K (23)',
    analysis: '遇到走之底“辶”，末笔不是走之底的捺，而是内部“车”的最后一笔竖！竖(2区) + 杂合(3位) = 23 (K)。',
    formula: '车(L) + 辶(P) + 末笔竖杂合(K) = LPK',
    alert: '⚠️ 铁律：走之底、建字底汉字，末笔一律取“被包围核心部件”的最后一笔！'
  },
  {
    char: '戈',
    pinyin: 'gē',
    typeDesc: '杂合型 (3位)',
    lastStroke: '取主笔撇(3区)，忽略右上点',
    recogCode: 'E (33)',
    analysis: '右上有点的字（如“戈、戊、犬”），末笔不能取右上方的孤悬点，而要取主干结构的最后一撇。撇(3区) + 杂合(3位) = 33 (E)。',
    formula: '戈是键名字，全码直接打 AAAA；而在成字部件中取撇。',
    alert: '⚠️ 铁律：右上孤悬点不算末笔，以主干支撑笔画定末笔！'
  },
  {
    char: '太',
    pinyin: 'tài',
    typeDesc: '杂合型 (3位)',
    lastStroke: '最底部点捺(4区)',
    recogCode: 'I (43)',
    analysis: '大(D) + 丶(Y)。不足4码，底部点捺最后写，算作末笔捺(4区)。杂合结构(3位)，4区3位是 I。',
    formula: '大(D) + 丶(Y) + 43(I) = DYI',
    alert: '💡 提示：末笔在下方的点属于真正书写顺序的末笔。'
  },
  {
    char: '汀',
    pinyin: 'tīng',
    typeDesc: '左右型 (1位)',
    lastStroke: '丁的竖钩(2区)',
    recogCode: 'H (21)',
    analysis: '氵(I) + 丁(S)。不足4码，右侧丁的末笔是竖钩（归竖2区）。左右结构(1位)，2区1位是 H。',
    formula: '氵(I) + 丁(S) + 21(H) = ISH',
    alert: '💡 对比：如果是“沐”，右边是木，末笔是捺(4区)，左右型(1位)就是 41 (Y)！'
  }
];

// ================= 模块 4：简码速查与打法图谱 =================
export interface ShortCodeHero {
  type: 'level-1' | 'level-2' | 'level-3';
  title: string;
  speedMultiplier: string;
  rule: string;
  trick: string;
  examples: { word: string; code: string; strokeSaved: string }[];
}

export const SHORT_CODE_STRATEGIES: ShortCodeHero[] = [
  {
    type: 'level-1',
    title: '一级简码 · 25金刚字（一键封神）',
    speedMultiplier: '击键提速 75%',
    rule: '键盘 25 键，每键对应一个极高频字。敲 1 个字母 + 空格立即出字！',
    trick: '牢记 25 字顺口溜，打这些字若打全码就是犯罪！',
    examples: [
      { word: '一', code: 'G + 空格', strokeSaved: '省3键 (原本 GGGG)' },
      { word: '是', code: 'J + 空格', strokeSaved: '省3键 (原本 JGHU)' },
      { word: '中', code: 'K + 空格', strokeSaved: '省2键 (原本 KHK)' },
      { word: '我', code: 'Q + 空格', strokeSaved: '省3键 (原本 TRNT)' },
      { word: '的', code: 'R + 空格', strokeSaved: '省3键 (原本 RQYY)' }
    ]
  },
  {
    type: 'level-2',
    title: '二级简码 · 速度核心主力军',
    speedMultiplier: '击键提速 50%',
    rule: '取汉字前 2 个字根的代码 + 空格出字（五笔中涵盖了数百个最常用汉字）',
    trick: '打字节奏：“哒哒 + 空格”，指尖像弹钢琴般流畅跳跃！',
    examples: [
      { word: '帮', code: 'DT + 空格', strokeSaved: '省2键 (原本 DTBH)' },
      { word: '理', code: 'GJ + 空格', strokeSaved: '省2键 (原本 GJF)' },
      { word: '现', code: 'GQ + 空格', strokeSaved: '省2键 (原本 GQN)' },
      { word: '明', code: 'JE + 空格', strokeSaved: '省1键 (原本 JEG)' }
    ]
  },
  {
    type: 'level-3',
    title: '三级简码 · 杜绝多余识别码',
    speedMultiplier: '击键提速 25%',
    rule: '取汉字前 3 个字根的代码 + 空格出字。',
    trick: '不需要去费脑子算末笔识别码！直接前三码按空格出字，省心又快速！',
    examples: [
      { word: '华', code: 'WXF + 空格', strokeSaved: '无需判断末笔识别码 J' },
      { word: '想', code: 'SHN + 空格', strokeSaved: '前三字根敲完即上屏' },
      { word: '新', code: 'USR + 空格', strokeSaved: '立木斤直接走起' }
    ]
  }
];

// ================= 模块 5：词组取码口诀与盲打模拟器预设 =================
export interface PhraseFormula {
  type: string;
  formula: string;
  name: string;
  motto: string;
  demo: { phrase: string; split: string; finalCode: string };
}

export const PHRASE_FORMULAS: PhraseFormula[] = [
  {
    type: '2字词',
    formula: '2 + 2 = 4 码',
    name: '双字词规则',
    motto: '各取前二码，平分秋色！',
    demo: { phrase: '中国', split: '中(KH) + 国(LG)', finalCode: 'KHLG' }
  },
  {
    type: '3字词',
    formula: '1 + 1 + 2 = 4 码',
    name: '三字词规则',
    motto: '前两字各抢头彩(1码)，末字压轴扛双码(2码)！',
    demo: { phrase: '计算机', split: '计(Y) + 算(T) + 机(SM)', finalCode: 'YTSM' }
  },
  {
    type: '4字词',
    formula: '1 + 1 + 1 + 1 = 4 码',
    name: '四字成语规则',
    motto: '一人一码不偏不倚，排排坐吃果果！',
    demo: { phrase: '一心一意', split: '一(G) + 心(N) + 一(G) + 意(U)', finalCode: 'GNGU' }
  },
  {
    type: '多字词(5+)',
    formula: '1 + 1 + 1 + 末1 = 4 码',
    name: '长词巨无霸规则',
    motto: '前三字打头阵，不管中间多长，只拉最后一位压阵！',
    demo: { phrase: '中华人民共和国', split: '中(K) + 华(W) + 人(W) + ... + 国(L)', finalCode: 'KWWL' }
  }
];


export const WUBI_RULES: RuleSection[] = [
  {
    id: 'split-principles',
    title: '汉字拆分四项基本原则',
    badge: '趣味核心 01',
    summary: '汉字拆成字根遵循四大准则：书写顺序、取大优先、兼顾直观、能连不交。',
    content: [
      '① 书写顺序：先左后右、先上后下、先外后内、先进后关。像排队过安检，不可跨越笔顺！',
      '② 取大优先：贪吃蛇策略！每次尽量吞下笔画最多、最大的现成字根，使得总字根数最少。',
      '③ 兼顾直观：保留原字骨架视觉美感，避免把自然整体割裂得支离破碎。',
      '④ 能连不交：相连相依是好友，穿身腰斩是大忌！能拆成相接关系的，绝不拆成相交穿透关系。'
    ],
    examples: [
      { word: '天', code: 'GDI', analysis: '【能连不交】一(G) + 大(D)，相接相依；不拆二(F)+人(W)交叉割裂' },
      { word: '果', code: 'JSI', analysis: '【取大优先】曰(J) + 木(S)，整块大字根优先；不拆田+木' },
      { word: '申', code: 'JHK', analysis: '【书写顺序】先写曰(J)，最后一竖悬针贯通(H)，取码 JHK' }
    ]
  },
  {
    id: 'roots-zone',
    title: '字根五区与键位规律',
    badge: '基础规律 02',
    summary: '五笔将除 Z 键外的 25 个英文字母划分为 5 个区，每个区 5 个位，按起笔笔画归类。',
    content: [
      '第 1 区（横起区 G-F-D-S-A）：G=11, F=12, D=13, S=14, A=15。起笔为横（含提）。',
      '第 2 区（竖起区 H-J-K-L-M）：H=21, J=22, K=23, L=24, M=25。起笔为竖（含竖钩）。',
      '第 3 区（撇起区 T-R-E-W-Q）：T=31, R=32, E=33, W=34, Q=35。起笔为撇。',
      '第 4 区（捺起区 Y-U-I-O-P）：Y=41, U=42, I=43, O=44, P=45。起笔为捺（点当作捺）。',
      '第 5 区（折起区 N-B-V-C-X）：N=51, B=52, V=53, C=54, X=55。起笔为折（各类带转折笔画）。',
      'Z 键不属于任何区位，在五笔输入法中充当通配符和自学查询键。'
    ],
    examples: [
      { word: '王', code: 'GGGG', analysis: '1区1位键名字（G），打四下出字' },
      { word: '土', code: 'FFFF', analysis: '1区2位键名字（F），打四下出字' },
      { word: '木', code: 'SSSS', analysis: '1区4位键名字（S），打四下出字' }
    ]
  },
  {
    id: 'recognition-code',
    title: '末笔交叉识别码全解',
    badge: '核心难点 03',
    summary: '当汉字拆分出的字根不足 4 个时，为了区分同码字，在末位追加一个末笔字型识别码。',
    content: [
      '判定公式：识别码键位 = 末笔画所在区(1-5) + 字型结构所在位(1-3)。',
      '字型结构分类：',
      '• 1型（左右型，位1）：如“明、相、江、林”，各部分左右并列或左中右。',
      '• 2型（上下型，位2）：如“字、花、岩、昌”，各部分上下排列或上中下。',
      '• 3型（杂合型，位3）：如“国、同、连、太、由”，全包围、半包围、独体字、交叉重叠。',
      '注意点：对于走之底（辶）、建字底（廴）等包围结构，以被包围部分最后一笔作为全字末笔；带右上点（如戈、犬）以主结构最后一笔为主。'
    ],
    examples: [
      { word: '沐', code: 'ISY', analysis: '氵(I) + 木(S)。不足4码，末笔为木的捺(4区)，左右型(1位) → 识别码为 41(Y)' },
      { word: '汀', code: 'ISH', analysis: '氵(I) + 丁(S)。不足4码，末笔为丁的竖钩(2区)，左右型(1位) → 识别码为 21(H)' },
      { word: '太', code: 'DYI', analysis: '大(D) + 丶(Y)。不足4码，末笔为点捺(4区)，杂合型(3位) → 识别码为 43(I)' }
    ]
  },
  {
    id: 'short-codes',
    title: '简码打法与极速提速秘诀',
    badge: '实战提速 04',
    summary: '五笔极速的核心在于简码：一级简码 25 字一键出字，二级简码两键出字，大幅降低击键量。',
    content: [
      '① 一级简码（25个字）：键盘 25 个字母每键分配一个极高频汉字，按对应字母 + 空格即可出字。',
      '  口诀：“一地在要工，上是中国同，和的有人我，主产不为这，民了大凡以”。',
      '② 二级简码：取该字前两个字根的代码 + 空格出字（如“帮”=DT+空格、“理”=GJ+空格）。',
      '③ 三级简码：取该字前三个字根代码 + 空格出字。',
      '④ 简码优先：熟练五笔打字员打字时，绝不把简码字打成全码，能少按一键就是提速 25%~50%！'
    ],
    examples: [
      { word: '中', code: 'K + 空格', analysis: '一级简码，K 键直出，无需打全码 KHK' },
      { word: '国', code: 'L + 空格', analysis: '一级简码，L 键直出，无需打全码 LGYI' },
      { word: '打', code: 'RS + 空格', analysis: '二级简码，扌(R) + 丁(S) + 空格出字' }
    ]
  },
  {
    id: 'phrase-rules',
    title: '词组编码取码规则',
    badge: '词组进阶 05',
    summary: '五笔打词组是实现 120+ WPM 极速盲打的关键，规则高度统一且永远只打 4 码！',
    content: [
      '① 双字词：取第一个字的前 2 码 + 第二个字的前 2 码 (2 + 2 = 4码)。',
      '② 三字词：取第一个字第 1 码 + 第二个字第 1 码 + 第三个字前 2 码 (1 + 1 + 2 = 4码)。',
      '③ 四字词：取第一、第二、第三、第四个字的第 1 码各一 (1 + 1 + 1 + 1 = 4码)。',
      '④ 多字词（5字及以上）：取第一、第二、第三字及最后一个字的第 1 码 (1 + 1 + 1 + 末1 = 4码)。'
    ],
    examples: [
      { word: '中国', code: 'KHLG', analysis: '中(KH) + 国(LG) = KHLG' },
      { word: '计算机', code: 'YTSM', analysis: '计(Y) + 算(T) + 机(SM) = YTSM' },
      { word: '一心一意', code: 'GGGU', analysis: '一(G) + 心(N) + 一(G) + 意(U) = GNGU' },
      { word: '中华人民共和国', code: 'KWWL', analysis: '中(K) + 华(W) + 人(W) + ... + 国(L) = KWWL' }
    ]
  }
];
