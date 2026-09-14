import type { KeyRootInfo, WubiVersion } from '../types/wubi';

// 86版键盘字根表
export const KEYBOARD_86: Record<string, KeyRootInfo> = {
  // 1区：横起笔 G F D S A
  'G': {
    key: 'G', zone: 1, position: 1, code: '11', keyName: '王',
    mnemonic: '王旁青头戋五一',
    mainRoots: ['王', '青头', '戋', '五', '一'],
    allRoots: ['王', '龶', '戋', '五', '一', '丆', '玨'],
    notes: '横起第一位，纯单笔画为“一”'
  },
  'F': {
    key: 'F', zone: 1, position: 2, code: '12', keyName: '土',
    mnemonic: '土士二干十寸雨',
    mainRoots: ['土', '士', '二', '干', '十', '寸', '雨'],
    allRoots: ['土', '士', '二', '干', '十', '寸', '雨', '革', '镸', '未'],
    notes: '包含泥土、土地以及二、干、十'
  },
  'D': {
    key: 'D', zone: 1, position: 3, code: '13', keyName: '大',
    mnemonic: '大犬三羊古石厂',
    mainRoots: ['大', '犬', '三', '羊', '古', '石', '厂'],
    allRoots: ['大', '犬', '三', '羊', '古', '石', '厂', '髟', '隺', '百'],
    notes: '包含大、石、厂等字根'
  },
  'S': {
    key: 'S', zone: 1, position: 4, code: '14', keyName: '木',
    mnemonic: '木丁西',
    mainRoots: ['木', '丁', '西'],
    allRoots: ['木', '丁', '西', '覀', '朩'],
    notes: '纯木部及丁、西字根'
  },
  'A': {
    key: 'A', zone: 1, position: 5, code: '15', keyName: '工',
    mnemonic: '工戈草头右框七',
    mainRoots: ['工', '戈', '艹', '匚', '七'],
    allRoots: ['工', '戈', '艹', '匚', '七', '廿', '弋', '牙'],
    notes: '包含草字头艹与工、戈'
  },

  // 2区：竖起笔 H J K L M
  'H': {
    key: 'H', zone: 2, position: 1, code: '21', keyName: '目',
    mnemonic: '目具上止卜虎皮',
    mainRoots: ['目', '止', '卜', '虎', '皮'],
    allRoots: ['目', '具', '上', '止', '卜', '虍', '皮', '丨', '亅'],
    notes: '竖起第一位，单笔画为“丨”'
  },
  'J': {
    key: 'J', zone: 2, position: 2, code: '22', keyName: '日',
    mnemonic: '日早两竖与虫依',
    mainRoots: ['日', '早', '刂', '虫'],
    allRoots: ['日', '早', '刂', '虫', '曰', '臨头'],
    notes: '包含日、早、立刀旁刂、虫'
  },
  'K': {
    key: 'K', zone: 2, position: 3, code: '23', keyName: '口',
    mnemonic: '口与川，字根稀',
    mainRoots: ['口', '川'],
    allRoots: ['口', '川', '囗'],
    notes: '主要包含口部字根'
  },
  'L': {
    key: 'L', zone: 2, position: 4, code: '24', keyName: '田',
    mnemonic: '田甲方框四车力',
    mainRoots: ['田', '甲', '四', '车', '力'],
    allRoots: ['田', '甲', '罒', '四', '车', '力', '皿', '申'],
    notes: '包含田、四字头罒、车、力'
  },
  'M': {
    key: 'M', zone: 2, position: 5, code: '25', keyName: '山',
    mnemonic: '山由贝，下峰峙',
    mainRoots: ['山', '由', '贝'],
    allRoots: ['山', '由', '贝', '几', '冂'],
    notes: '包含山、由、贝、几等'
  },

  // 3区：撇起笔 T R E W Q
  'T': {
    key: 'T', zone: 3, position: 1, code: '31', keyName: '禾',
    mnemonic: '禾竹一撇双人立，反文条头共三匕',
    mainRoots: ['禾', '竹', '彳', '攵', '夂'],
    allRoots: ['禾', '竹', '彳', '攵', '夂', '丿', '彡'],
    notes: '撇起第一位，单笔画为“丿”'
  },
  'R': {
    key: 'R', zone: 3, position: 2, code: '32', keyName: '白',
    mnemonic: '白手看头三二斤',
    mainRoots: ['白', '手', '扌', '斤'],
    allRoots: ['白', '手', '扌', '斤', '气', '丘'],
    notes: '包含提手旁扌、白、斤'
  },
  'E': {
    key: 'E', zone: 3, position: 3, code: '33', keyName: '月',
    mnemonic: '月彡乃用家衣底',
    mainRoots: ['月', '彡', '乃', '用', '衣底'],
    allRoots: ['月', '彡', '乃', '用', '豕', '豸'],
    notes: '包含肉月旁、月、用、家底'
  },
  'W': {
    key: 'W', zone: 3, position: 4, code: '34', keyName: '人',
    mnemonic: '人和八，登祭头',
    mainRoots: ['人', '亻', '八'],
    allRoots: ['人', '亻', '八', '入', '癶'],
    notes: '包含单人旁亻、八'
  },
  'Q': {
    key: 'Q', zone: 3, position: 5, code: '35', keyName: '金',
    mnemonic: '金勺缺点无尾鱼，犬旁留叉儿夕氏',
    mainRoots: ['金', '钅', '勹', '儿', '夕', '氏'],
    allRoots: ['金', '钅', '勹', '儿', '夕', '氏', '犭', '角'],
    notes: '包含金字旁钅、反犬旁犭、夕'
  },

  // 4区：捺/点起笔 Y U I O P
  'Y': {
    key: 'Y', zone: 4, position: 1, code: '41', keyName: '言',
    mnemonic: '言文方广点在先，十点一家寨',
    mainRoots: ['言', '讠', '文', '方', '广'],
    allRoots: ['言', '讠', '文', '方', '广', '丶', '主'],
    notes: '捺起第一位，单笔画为点“丶”'
  },
  'U': {
    key: 'U', zone: 4, position: 2, code: '42', keyName: '立',
    mnemonic: '立辛两点病门疒',
    mainRoots: ['立', '辛', '冫', '疒', '门'],
    allRoots: ['立', '辛', '冫', '疒', '门', '丬'],
    notes: '包含两点水冫、病字旁疒、门'
  },
  'I': {
    key: 'I', zone: 4, position: 3, code: '43', keyName: '水',
    mnemonic: '水旁三点水',
    mainRoots: ['水', '氵', '小'],
    allRoots: ['水', '氵', '小', '氺'],
    notes: '包含三点水氵和小'
  },
  'O': {
    key: 'O', zone: 4, position: 4, code: '44', keyName: '火',
    mnemonic: '火业头，四点米',
    mainRoots: ['火', '灬', '米'],
    allRoots: ['火', '灬', '米', '业'],
    notes: '包含火、四点底灬、米'
  },
  'P': {
    key: 'P', zone: 4, position: 5, code: '45', keyName: '之',
    mnemonic: '之字军盖建道底，摘礻(示)衤(衣)',
    mainRoots: ['之', '辶', '宀', '冖', '廴', '礻', '衤'],
    allRoots: ['之', '辶', '宀', '冖', '廴', '礻', '衤'],
    notes: '走之旁辶、宝盖头宀、示字旁礻、衣字旁衤'
  },

  // 5区：折起笔 N B V C X
  'N': {
    key: 'N', zone: 5, position: 1, code: '51', keyName: '已',
    mnemonic: '已半巳满不出己，左框折尸心和羽',
    mainRoots: ['已', '巳', '己', '尸', '心', '忄', '羽'],
    allRoots: ['已', '巳', '己', '尸', '心', '忄', '羽', '乙', '𠃍'],
    notes: '折起第一位，包含心、竖心旁忄、羽'
  },
  'B': {
    key: 'B', zone: 5, position: 2, code: '52', keyName: '子',
    mnemonic: '子耳也，框向上',
    mainRoots: ['子', '耳', '也', '阝'],
    allRoots: ['子', '耳', '也', '阝', '凵', '皮'],
    notes: '双耳旁阝、子、耳、也'
  },
  'V': {
    key: 'V', zone: 5, position: 3, code: '53', keyName: '女',
    mnemonic: '女刀九臼山朝西',
    mainRoots: ['女', '刀', '九', '臼'],
    allRoots: ['女', '刀', '九', '臼', '巛'],
    notes: '包含女字旁、刀、九、臼'
  },
  'C': {
    key: 'C', zone: 5, position: 4, code: '54', keyName: '又',
    mnemonic: '又巴马，丢矢矣',
    mainRoots: ['又', '巴', '马'],
    allRoots: ['又', '巴', '马', '厶', '纟'],
    notes: '包含又、巴、马、绞丝旁纟（部分字）'
  },
  'X': {
    key: 'X', zone: 5, position: 5, code: '55', keyName: '纟',
    mnemonic: '慈母衣母弓和匕，幼无力',
    mainRoots: ['纟', '弓', '匕'],
    allRoots: ['纟', '弓', '匕', '幺', '母'],
    notes: '主要包含绞丝旁纟、弓、匕'
  },
  'Z': {
    key: 'Z', zone: 0, position: 0, code: '通配', keyName: '通配/查询',
    mnemonic: '万能通配学习键，可代替任意未知字根',
    mainRoots: ['通配符 *', '查询 ?', '学习键'],
    allRoots: ['通配符 *', '查询 ?', '学习键', '万能键'],
    notes: '五笔中唯一不分配固定字根的英文字母。遇到不认识或拆不出的字根时，可用 Z 代替该位置编码。'
  }
};

// 98版键盘字根差异表（98版码元调整：规范字形，减少重码）
export const KEYBOARD_98: Record<string, KeyRootInfo> = {
  ...KEYBOARD_86,
  'G': {
    key: 'G', zone: 1, position: 1, code: '11', keyName: '王',
    mnemonic: '王旁青头五一提',
    mainRoots: ['王', '青头', '五', '一', '提'],
    allRoots: ['王', '青头', '五', '一', '提', '戋'],
    notes: '98版明确提画属于1区'
  },
  'D': {
    key: 'D', zone: 1, position: 3, code: '13', keyName: '大',
    mnemonic: '大犬三羊古石厂',
    mainRoots: ['大', '犬', '三', '羊头', '古', '石', '厂'],
    allRoots: ['大', '犬', '三', '羊', '古', '石', '厂'],
    notes: '98版羊头码元归类更规范'
  },
  'M': {
    key: 'M', zone: 2, position: 5, code: '25', keyName: '山',
    mnemonic: '山由贝，骨下峙',
    mainRoots: ['山', '由', '贝', '骨头'],
    allRoots: ['山', '由', '贝', '几', '骨头'],
    notes: '98版调整骨字头为M'
  },
  'O': {
    key: 'O', zone: 4, position: 4, code: '44', keyName: '火',
    mnemonic: '火业头，四点底',
    mainRoots: ['火', '灬', '米'],
    allRoots: ['火', '灬', '米', '业头'],
    notes: '98版四点底归O'
  }
};

// 新世纪版键盘字根表（第三代：字根更符合规范汉字笔顺）
export const KEYBOARD_NEW: Record<string, KeyRootInfo> = {
  ...KEYBOARD_98,
  'G': {
    key: 'G', zone: 1, position: 1, code: '11', keyName: '王',
    mnemonic: '王旁青头五一',
    mainRoots: ['王', '青头', '五', '一'],
    allRoots: ['王', '青头', '五', '一', '戋'],
    notes: '新世纪第三代规范'
  },
  'F': {
    key: 'F', zone: 1, position: 2, code: '12', keyName: '土',
    mnemonic: '土士二干十寸雨',
    mainRoots: ['土', '士', '二', '干', '十', '寸', '雨'],
    allRoots: ['土', '士', '二', '干', '十', '寸', '雨', '革'],
    notes: '规范笔画归位'
  },
  'H': {
    key: 'H', zone: 2, position: 1, code: '21', keyName: '目',
    mnemonic: '目具上止卜虎皮',
    mainRoots: ['目', '止', '卜', '虎', '皮'],
    allRoots: ['目', '上', '止', '卜', '虎', '皮', '丨'],
    notes: '竖起第一键'
  }
};

export const getKeyboardByVersion = (version: WubiVersion): Record<string, KeyRootInfo> => {
  switch (version) {
    case '98':
      return KEYBOARD_98;
    case 'newCentury':
      return KEYBOARD_NEW;
    case '86':
    default:
      return KEYBOARD_86;
  }
};

// 区位名称及主笔画
export const ZONE_CONFIG = {
  1: { name: '横起区 (1区)', stroke: '一 (提)', keys: ['G', 'F', 'D', 'S', 'A'], color: 'var(--zone-1)' },
  2: { name: '竖起区 (2区)', stroke: '丨 (竖钩)', keys: ['H', 'J', 'K', 'L', 'M'], color: 'var(--zone-2)' },
  3: { name: '撇起区 (3区)', stroke: '丿', keys: ['T', 'R', 'E', 'W', 'Q'], color: 'var(--zone-3)' },
  4: { name: '捺起区 (4区)', stroke: '丶 (捺/点)', keys: ['Y', 'U', 'I', 'O', 'P'], color: 'var(--zone-4)' },
  5: { name: '折起区 (5区)', stroke: '𠃍 (各种折)', keys: ['N', 'B', 'V', 'C', 'X'], color: 'var(--zone-5)' }
};
