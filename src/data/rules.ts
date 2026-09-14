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

export const WUBI_RULES: RuleSection[] = [
  {
    id: 'roots-zone',
    title: '字根五区与键位规律',
    badge: '基础篇 01',
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
    id: 'split-principles',
    title: '汉字拆分四项基本原则',
    badge: '拆字篇 02',
    summary: '汉字拆成字根遵循四大准则：书写顺序、取大优先、兼顾直观、能连不交。',
    content: [
      '① 书写顺序：先左后右、先上后下、先外后内、先横后竖、先进后关。',
      '② 取大优先：在保证笔画正确的原则下，每次尽量拆出包含笔画最多、最大的已知字根。',
      '③ 兼顾直观：字根之间要相对完整自然，避免硬性割裂容易辨识的结构。',
      '④ 能连不交：能拆成相连关系的字根，绝不拆成相交关系的字根。相连如“天”=一+大，相交如交叉穿越。'
    ],
    examples: [
      { word: '明', code: 'JEG', analysis: '左右结构：日(J) + 月(E) + 识别码(G)' },
      { word: '春', code: 'DWJ', analysis: '上下结构：三(D) + 人(W) + 日(J)' },
      { word: '华', code: 'WXFJ', analysis: '上下结构：亻(W) + 匕(X) + 十(F) + 识别码(J)' }
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
