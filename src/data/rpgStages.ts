import type { DungeonStage, RealmTitle, RpgItem } from '../types/rpg';

export const REALM_TITLES: RealmTitle[] = [
  {
    tier: 'scholar',
    name: '练气期 · 见习书童',
    minLevel: 1,
    badge: '📜',
    color: '#38bdf8',
    buffDescription: '字根初醒：基础生命值 +0，伤害倍率 1.0x'
  },
  {
    tier: 'ranger',
    name: '筑基期 · 识码游侠',
    minLevel: 10,
    badge: '⚔️',
    color: '#34d399',
    buffDescription: '气脉初成：基础攻击力 +20%，暴击率 +5%'
  },
  {
    tier: 'swordsman',
    name: '结丹期 · 破阵剑修',
    minLevel: 20,
    badge: '🗡️',
    color: '#fbbf24',
    buffDescription: '凝气成剑：怪物攻击准备时间延长 10%，连击伤害加成 +25%'
  },
  {
    tier: 'grandmaster',
    name: '元婴期 · 词海宗师',
    minLevel: 30,
    badge: '👑',
    color: '#c084fc',
    buffDescription: '宗师气场：初始拥有 1 层金钟罩，双字及成语伤害翻倍'
  },
  {
    tier: 'celestial',
    name: '化神期 · 盲打键仙',
    minLevel: 40,
    badge: '⚡',
    color: '#f43f5e',
    buffDescription: '天人合一：连击暴击无上限，解锁键仙无双全屏闪电特效'
  }
];

export const RPG_ITEMS: RpgItem[] = [
  {
    id: 'shield',
    name: '护体金钟罩',
    icon: '🛡️',
    description: '每场战斗可免疫 1 次击错或超时扣血反击',
    cost: 50,
    owned: 2,
    effectType: 'shield'
  },
  {
    id: 'slow',
    name: '时光定身符',
    icon: '⏳',
    description: '战斗中怪物攻击倒计时速度减慢 50%，从容思考编码',
    cost: 40,
    owned: 1,
    effectType: 'slow'
  },
  {
    id: 'crit',
    name: '乾坤暴击丹',
    icon: '⚡',
    description: '接下来 5 次正确击键必定触发 2.5 倍致命暴击',
    cost: 60,
    owned: 1,
    effectType: 'crit'
  }
];

export const DUNGEON_STAGES: DungeonStage[] = [
  // ================= 卷一：字根觉醒篇 (零基础) =================
  {
    id: 'stage-1',
    volume: 1,
    volumeTitle: '卷一 · 字根觉醒',
    title: '第一关 · 横区青草坡 (1区 G-A)',
    subtitle: '认识王土大木工，斩灭起笔为横的生灵',
    category: 'roots',
    recommendedRealm: '练气期 Lv.1',
    monster: {
      id: 'm-grass-beast',
      name: '王旁青头怪',
      title: '横区初级巡逻怪',
      avatar: '🌱',
      maxHp: 80,
      attackIntervalMs: 6500,
      attackPower: 10,
      quote: '“G王旁青头兼五一，F土士二干十寸雨！尔等休想跨过 1 区！”',
      themeColor: '#0284c7'
    },
    targets: ['王', '土', '大', '木', '工', '青', '干', '石', '寸', '雨', '戈', '五'],
    requiredExp: 0,
    rewardExp: 80,
    rewardCoins: 30,
    tipSnippet: '💡 横区口诀：G王旁青头 F土士二干 D大犬三羊 S木丁西 A工戈草头'
  },
  {
    id: 'stage-2',
    volume: 1,
    volumeTitle: '卷一 · 字根觉醒',
    title: '第二关 · 竖区古石林 (2区 H-M)',
    subtitle: '击破目具虎皮怪，掌握起笔为竖之字根',
    category: 'roots',
    recommendedRealm: '练气期 Lv.3',
    monster: {
      id: 'm-stone-scorpion',
      name: '目具虎皮兽',
      title: '竖区重甲守护魔',
      avatar: '🦂',
      maxHp: 100,
      attackIntervalMs: 6000,
      attackPower: 12,
      quote: '“H目具上止卜虎皮，J日早两竖与虫依，我的硬甲可不怕敲击！”',
      themeColor: '#059669'
    },
    targets: ['目', '日', '口', '田', '山', '具', '止', '早', '虫', '车', '力', '贝'],
    requiredExp: 60,
    rewardExp: 100,
    rewardCoins: 40,
    tipSnippet: '💡 竖区口诀：H目具上止卜虎皮 J日早两竖与虫依 K口川 L田甲方框四车力 M山由贝下峰躯'
  },
  {
    id: 'stage-3',
    volume: 1,
    volumeTitle: '卷一 · 字根觉醒',
    title: '第三关 · 撇区幽竹海 (3区 T-Q)',
    subtitle: '迎战禾竹一撇蛟，驯服起笔为撇的敏捷妖兽',
    category: 'roots',
    recommendedRealm: '练气期 Lv.5',
    monster: {
      id: 'm-bamboo-dragon',
      name: '禾竹一撇蛟',
      title: '撇区竹影灵妖',
      avatar: '🎋',
      maxHp: 120,
      attackIntervalMs: 5500,
      attackPower: 14,
      quote: '“T禾竹一撇斤字当，R白手看头三二斤！看剑走龙蛇！”',
      themeColor: '#d97706'
    },
    targets: ['禾', '白', '月', '人', '金', '竹', '手', '看', '乃', '八', '勺', '反'],
    requiredExp: 150,
    rewardExp: 120,
    rewardCoins: 50,
    tipSnippet: '💡 撇区口诀：T禾竹一撇斤 R白手看头三二斤 E月彡乃用家衣底 W人和八 Q金勺缺点无尾鱼'
  },
  {
    id: 'stage-4',
    volume: 1,
    volumeTitle: '卷一 · 字根觉醒',
    title: '第四关 · 捺区赤炎谷 (4区 Y-P)',
    subtitle: '言文方广破烈火，四点米之字定乾坤',
    category: 'roots',
    recommendedRealm: '练气期 Lv.7',
    monster: {
      id: 'm-fire-drake',
      name: '言文方广火龙',
      title: '捺区地心炎魔',
      avatar: '🔥',
      maxHp: 140,
      attackIntervalMs: 5200,
      attackPower: 16,
      quote: '“Y言文方广在四一，U立辛两点六门疒，烈焰之下谁能盲打？！”',
      themeColor: '#e11d48'
    },
    targets: ['言', '立', '水', '火', '之', '文', '方', '辛', '门', '米', '道', '底'],
    requiredExp: 260,
    rewardExp: 150,
    rewardCoins: 60,
    tipSnippet: '💡 捺区口诀：Y言文方广 U立辛两点六门疒 I水旁三点水 O火业四点米 P之字军盖建道底'
  },
  {
    id: 'stage-5',
    volume: 1,
    volumeTitle: '卷一 · 字根觉醒',
    title: '第五关 · 折区深暗渊 (5区 N-X)',
    subtitle: '女刀九臼破死局，子耳了也化坚冰',
    category: 'roots',
    recommendedRealm: '练气期 Lv.8',
    monster: {
      id: 'm-abyss-fiend',
      name: '九臼折天魔',
      title: '折区深渊魔督',
      avatar: '🌌',
      maxHp: 160,
      attackIntervalMs: 5000,
      attackPower: 18,
      quote: '“N已半巳满不出己，V女刀九臼山朝西！折笔变化多端，你可认得？！”',
      themeColor: '#9333ea'
    },
    targets: ['已', '子', '女', '又', '弓', '耳', '刀', '九', '臼', '巴', '马', '匕'],
    requiredExp: 400,
    rewardExp: 180,
    rewardCoins: 70,
    tipSnippet: '💡 折区口诀：N已半巳满不出己 B子耳了也框向上 V女刀九臼 C又巴马 X慈母衣示弓匕'
  },
  {
    id: 'stage-6',
    volume: 1,
    volumeTitle: '卷一 · 字根觉醒',
    title: '守关Boss · 廿五天王殿 (一简极速试炼)',
    subtitle: '一键一字！连斩二十五有一级简码，突破筑基之境！',
    category: 'roots',
    recommendedRealm: '筑基突破试炼',
    monster: {
      id: 'boss-level1-king',
      name: '一简至尊 · 廿五天王',
      title: '字根觉醒境终极守关Boss',
      avatar: '👑',
      maxHp: 250,
      attackIntervalMs: 4500,
      attackPower: 22,
      quote: '“吾乃一简至尊！按一键即出一字，你可能在吾狂暴攻势下全部一击必杀？！”',
      themeColor: '#f59e0b'
    },
    targets: [
      '一', '地', '在', '要', '工',
      '上', '是', '中', '国', '同',
      '和', '的', '有', '人', '我',
      '主', '产', '不', '为', '这',
      '民', '了', '子', '经', '发'
    ],
    requiredExp: 550,
    rewardExp: 300,
    rewardCoins: 120,
    tipSnippet: '💡 一简秘传：G一 F地 D在 S要 A工 H上 J是 K中 L国 M同 T和 R的 E有 W人 Q我 Y主 U产 I不 O为 P这 N民 B了 V子 C经 X发'
  },

  // ================= 卷二：拆字破阵篇 (进阶中) =================
  {
    id: 'stage-7',
    volume: 2,
    volumeTitle: '卷二 · 拆字破阵',
    title: '第七关 · 成字字根阵 (报户头实战)',
    subtitle: '本身成字的特殊字根，键名报户头+首笔次笔末笔破阵',
    category: 'breakdown',
    recommendedRealm: '筑基期 Lv.11',
    monster: {
      id: 'm-golem-roots',
      name: '报户头石巨人',
      title: '成字字根矩阵核心',
      avatar: '🗿',
      maxHp: 220,
      attackIntervalMs: 4800,
      attackPower: 20,
      quote: '“打成字字根，需先报户头！键名先敲一下，再补首笔次笔与末笔！”',
      themeColor: '#64748b'
    },
    targets: ['干', '寸', '雨', '西', '石', '车', '手', '止', '心', '门', '八', '方', '辛'],
    requiredExp: 800,
    rewardExp: 220,
    rewardCoins: 80,
    tipSnippet: '💡 成字字根规则：键名所在键 + 第一笔代码 + 第二笔代码 + 最后一笔代码（不足4码敲空格）'
  },
  {
    id: 'stage-8',
    volume: 2,
    volumeTitle: '卷二 · 拆字破阵',
    title: '第八关 · 二级简码谷 (日常高频打字提速)',
    subtitle: '只需敲击两键加空格即可出字，日常打字最常用加速利器',
    category: 'breakdown',
    recommendedRealm: '筑基期 Lv.14',
    monster: {
      id: 'm-swift-wolf',
      name: '疾风二简狼',
      title: '高频简码迅捷兽',
      avatar: '🐺',
      maxHp: 280,
      attackIntervalMs: 4200,
      attackPower: 22,
      quote: '“两击即走！我的速度非寻常全码可比，快用二级简码跟上我的节奏！”',
      themeColor: '#0ea5e9'
    },
    targets: ['吧', '帮', '报', '笔', '边', '参', '操', '草', '查', '朝', '唱', '超', '成', '城', '赤', '传', '窗', '答', '达', '带', '单', '但', '岛', '道', '得', '等', '低', '底', '点', '店'],
    requiredExp: 1000,
    rewardExp: 260,
    rewardCoins: 90,
    tipSnippet: '💡 二级简码前两码即为字根编码，配合空格直接上屏，能大幅节省 50% 击键！'
  },
  {
    id: 'stage-9',
    volume: 2,
    volumeTitle: '卷二 · 拆字破阵',
    title: '第九关 · 黄金准则试炼 (破除拆字纠结)',
    subtitle: '取大优先、能连不交、能散不连、兼顾直观',
    category: 'breakdown',
    recommendedRealm: '结丹突破试炼',
    monster: {
      id: 'm-break-god',
      name: '拆字千手邪神',
      title: '汉字结构迷魂守卫',
      avatar: '🎭',
      maxHp: 320,
      attackIntervalMs: 4000,
      attackPower: 25,
      quote: '“汉字拆解多迷障，连还是交？散还是连？唯有参悟黄金准则方能伤我！”',
      themeColor: '#a855f7'
    },
    targets: ['天', '丰', '自', '尺', '严', '昼', '夷', '申', '充', '毕', '本', '果', '更', '未'],
    requiredExp: 1250,
    rewardExp: 320,
    rewardCoins: 110,
    tipSnippet: '💡 四大黄金准则：①取大优先 ②能连不交 ③能散不连 ④兼顾直观'
  },
  {
    id: 'stage-10',
    volume: 2,
    volumeTitle: '卷二 · 拆字破阵',
    title: '守关Boss · 识别码千幻之塔 (末笔字型交叉判定)',
    subtitle: '左右型/上下型/杂合型？末笔为横竖撇捺折？破除五笔进阶最大心魔！',
    category: 'breakdown',
    recommendedRealm: '结丹期大圆满',
    monster: {
      id: 'boss-code-lord',
      name: '识别码千幻魔君',
      title: '拆字破阵境终极守关Boss',
      avatar: '🔮',
      maxHp: 400,
      attackIntervalMs: 3800,
      attackPower: 28,
      quote: '“不足4个字根的汉字，必须附加吾之末笔字型交叉识别码！算错区位便化为灰烬！”',
      themeColor: '#ec4899'
    },
    targets: ['卡', '午', '生', '各', '少', '召', '边', '沐', '汀', '肚', '辽', '囚', '困', '汉', '字'],
    requiredExp: 1550,
    rewardExp: 450,
    rewardCoins: 160,
    tipSnippet: '💡 末笔识别码金律：字型(左右1/上下2/杂合3) + 末笔笔画(横1/竖2/撇3/捺4/折5) = 键位区位！'
  },

  // ================= 卷三：词海飞升篇 (提速期) =================
  {
    id: 'stage-11',
    volume: 3,
    volumeTitle: '卷三 · 词海飞升',
    title: '第十一关 · 双字并蒂林 (高频词组狂飙)',
    subtitle: '前二+次二！用系统五笔整词上屏或纯英文字母敲出 4 码秒杀！',
    category: 'phrases',
    recommendedRealm: '元婴期 Lv.31',
    monster: {
      id: 'm-twin-stars',
      name: '词海双子星魔',
      title: '高频双词狂澜主',
      avatar: '♊',
      maxHp: 450,
      attackIntervalMs: 3600,
      attackPower: 30,
      quote: '“我们乃双生合体！单字击打慢如蜗牛，唯有双字词码方能瞬破我们护盾！”',
      themeColor: '#3b82f6'
    },
    targets: ['中国', '人民', '我们', '发展', '工作', '国家', '可以', '社会', '经济', '建设', '国际', '合作', '开始', '问题', '学习', '提高'],
    requiredExp: 2000,
    rewardExp: 400,
    rewardCoins: 150,
    tipSnippet: '💡 双字词规则：首字取前2码，次字取前2码，组合成4码（如“中国”：K(口)+H(目) + L(田)+G(一) = KHLG）'
  },
  {
    id: 'stage-12',
    volume: 3,
    volumeTitle: '卷三 · 词海飞升',
    title: '第十二关 · 四象成语峰 (各取首码大连击)',
    subtitle: '成语各取首码，四键一成语，刀刀暴击！',
    category: 'phrases',
    recommendedRealm: '元婴期 Lv.36',
    monster: {
      id: 'm-idiom-titan',
      name: '四象成语尊者',
      title: '中华成语守护巨灵',
      avatar: '🗿',
      maxHp: 550,
      attackIntervalMs: 3400,
      attackPower: 34,
      quote: '“四字成语，一字一码！四键连击，气贯长虹！”',
      themeColor: '#10b981'
    },
    targets: ['一心一意', '自强不息', '欣欣向荣', '守正创新', '络绎不绝', '坚定不移', '奋发图强', '日新月异', '循序渐进', '继往开来'],
    requiredExp: 2500,
    rewardExp: 500,
    rewardCoins: 180,
    tipSnippet: '💡 四字词/成语规则：一二三四字各取第一码（如“自强不息”：自(T)+强(X)+不(D)+息(T) = TXDT）'
  },
  {
    id: 'stage-13',
    volume: 3,
    volumeTitle: '卷三 · 词海飞升',
    title: '终极天劫 · 苍穹键仙决战 (千字长文巨龙)',
    subtitle: '飞升化神之战！击退万钧龙息，问鼎【五笔键仙】最高荣耀！',
    category: 'phrases',
    recommendedRealm: '化神飞升大天劫',
    monster: {
      id: 'boss-celestial-dragon',
      name: '苍穹键仙 · 太古青龙',
      title: '修仙境至高神龙守卫',
      avatar: '🐉',
      maxHp: 750,
      attackIntervalMs: 3000,
      attackPower: 38,
      quote: '“亿万人欲问鼎键仙之位，终困于盲打心障！今日让吾见证尔等真正的五笔通天神技！”',
      themeColor: '#ef4444'
    },
    targets: [
      '山不在高', '有仙则名', '水不在深', '有龙则灵',
      '斯是陋室', '惟吾德馨', '苔痕上阶绿', '草色入帘青',
      '谈笑有鸿儒', '往来无白丁', '可以调素琴', '阅金经',
      '无丝竹之乱耳', '无案牍之劳形', '南阳诸葛庐', '西蜀子云亭'
    ],
    requiredExp: 3200,
    rewardExp: 1000,
    rewardCoins: 500,
    tipSnippet: '💡 飞升秘录：长文之中单字、词组、标点行云流水，保持 Combo 连击触发无限暴击！'
  }
];

export function getRealmTitle(level: number): RealmTitle {
  for (let i = REALM_TITLES.length - 1; i >= 0; i--) {
    if (level >= REALM_TITLES[i].minLevel) {
      return REALM_TITLES[i];
    }
  }
  return REALM_TITLES[0];
}

export function calculateRequiredExp(level: number): number {
  // 经典 RPG 平滑经验曲线
  return Math.floor(100 * Math.pow(1.15, level - 1));
}
