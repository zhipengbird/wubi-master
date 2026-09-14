import type { WubiCharData, WubiVersion } from '../types/wubi';
import { KEYBOARD_86, KEYBOARD_98, KEYBOARD_NEW } from './keyboards';
import rawDictData from './wubiFullDict.json';

// 一级简码 25 字标准定义
export const LEVEL_1_CHARS: WubiCharData[] = [
  { char: '一', pinyin: 'yī', code86: 'GGLL', code98: 'GGLL', codeNew: 'GGLL', short86: 'G', short98: 'G', shortNew: 'G', roots86: ['一'], roots98: ['一'], rootsNew: ['一'], type: 'keyname' },
  { char: '地', pinyin: 'dì', code86: 'FBN', code98: 'FBN', codeNew: 'FBN', short86: 'F', short98: 'F', shortNew: 'F', roots86: ['土', '也'], roots98: ['土', '也'], rootsNew: ['土', '也'] },
  { char: '在', pinyin: 'zài', code86: 'DHFD', code98: 'DHFD', codeNew: 'DHFD', short86: 'D', short98: 'D', shortNew: 'D', roots86: ['丆', '丨', '土'], roots98: ['丆', '丨', '土'], rootsNew: ['丆', '丨', '土'] },
  { char: '要', pinyin: 'yào', code86: 'SVF', code98: 'SVF', codeNew: 'SVF', short86: 'S', short98: 'S', shortNew: 'S', roots86: ['覀', '女'], roots98: ['覀', '女'], rootsNew: ['覀', '女'] },
  { char: '工', pinyin: 'gōng', code86: 'AAAA', code98: 'AAAA', codeNew: 'AAAA', short86: 'A', short98: 'A', shortNew: 'A', roots86: ['工'], roots98: ['工'], rootsNew: ['工'], type: 'keyname' },

  { char: '上', pinyin: 'shàng', code86: 'HHGG', code98: 'HHGG', codeNew: 'HHGG', short86: 'H', short98: 'H', shortNew: 'H', roots86: ['上'], roots98: ['上'], rootsNew: ['上'], type: 'keyname' },
  { char: '是', pinyin: 'shì', code86: 'JGHU', code98: 'JGHU', codeNew: 'JGHU', short86: 'J', short98: 'J', shortNew: 'J', roots86: ['日', '一', '龰'], roots98: ['日', '一', '龰'], rootsNew: ['日', '一', '龰'] },
  { char: '中', pinyin: 'zhōng', code86: 'KHK', code98: 'KHK', codeNew: 'KHK', short86: 'K', short98: 'K', shortNew: 'K', roots86: ['口', '丨'], roots98: ['口', '丨'], rootsNew: ['口', '丨'], recognitionCode: 'K' },
  { char: '国', pinyin: 'guó', code86: 'LGYI', code98: 'LGYI', codeNew: 'LGYI', short86: 'L', short98: 'L', shortNew: 'L', roots86: ['囗', '王', '丶'], roots98: ['囗', '王', '丶'], rootsNew: ['囗', '王', '丶'] },
  { char: '同', pinyin: 'tóng', code86: 'MGKD', code98: 'MGKD', codeNew: 'MGKD', short86: 'M', short98: 'M', shortNew: 'M', roots86: ['冂', '一', '口'], roots98: ['冂', '一', '口'], rootsNew: ['冂', '一', '口'] },

  { char: '和', pinyin: 'hé', code86: 'TKG', code98: 'TKG', codeNew: 'TKG', short86: 'T', short98: 'T', shortNew: 'T', roots86: ['禾', '口'], roots98: ['禾', '口'], rootsNew: ['禾', '口'], recognitionCode: 'G' },
  { char: '的', pinyin: 'de', code86: 'RQYY', code98: 'RQYY', codeNew: 'RQYY', short86: 'R', short98: 'R', shortNew: 'R', roots86: ['白', '勹', '丶'], roots98: ['白', '勹', '丶'], rootsNew: ['白', '勹', '丶'] },
  { char: '有', pinyin: 'yǒu', code86: 'DEF', code98: 'DEF', codeNew: 'DEF', short86: 'E', short98: 'E', shortNew: 'E', roots86: ['𠂇', '月'], roots98: ['𠂇', '月'], rootsNew: ['𠂇', '月'] },
  { char: '人', pinyin: 'rén', code86: 'WWWW', code98: 'WWWW', codeNew: 'WWWW', short86: 'W', short98: 'W', shortNew: 'W', roots86: ['人'], roots98: ['人'], rootsNew: ['人'], type: 'keyname' },
  { char: '我', pinyin: 'wǒ', code86: 'TRNT', code98: 'TRNT', codeNew: 'TRNT', short86: 'Q', short98: 'Q', shortNew: 'Q', roots86: ['丿', '扌', '戈'], roots98: ['丿', '扌', '戈'], rootsNew: ['丿', '扌', '戈'] },

  { char: '主', pinyin: 'zhǔ', code86: 'YGD', code98: 'YGD', codeNew: 'YGD', short86: 'Y', short98: 'Y', shortNew: 'Y', roots86: ['丶', '王'], roots98: ['丶', '王'], rootsNew: ['丶', '王'], recognitionCode: 'D' },
  { char: '产', pinyin: 'chǎn', code86: 'UTE', code98: 'UTE', codeNew: 'UTE', short86: 'U', short98: 'U', shortNew: 'U', roots86: ['立', '丿', '厂'], roots98: ['立', '丿', '厂'], rootsNew: ['立', '丿', '厂'], recognitionCode: 'E' },
  { char: '不', pinyin: 'bù', code86: 'GII', code98: 'DHI', codeNew: 'DHI', short86: 'I', short98: 'I', shortNew: 'I', roots86: ['一', '⺌'], roots98: ['丆', '丨'], rootsNew: ['丆', '丨'] },
  { char: '为', pinyin: 'wèi', code86: 'YLYI', code98: 'YLYI', codeNew: 'YLYI', short86: 'O', short98: 'O', shortNew: 'O', roots86: ['丶', '力', '丶'], roots98: ['丶', '力', '丶'], rootsNew: ['丶', '力', '丶'] },
  { char: '这', pinyin: 'zhè', code86: 'YPI', code98: 'YPI', codeNew: 'YPI', short86: 'P', short98: 'P', shortNew: 'P', roots86: ['文', '辶'], roots98: ['文', '辶'], rootsNew: ['文', '辶'], recognitionCode: 'I' },

  { char: '民', pinyin: 'mín', code86: 'NAV', code98: 'NAV', codeNew: 'NAV', short86: 'N', short98: 'N', shortNew: 'N', roots86: ['尸', '𠄌'], roots98: ['尸', '𠄌'], rootsNew: ['尸', '𠄌'] },
  { char: '了', pinyin: 'le', code86: 'BNH', code98: 'BNH', codeNew: 'BNH', short86: 'B', short98: 'B', shortNew: 'B', roots86: ['㇇', '亅'], roots98: ['㇇', '亅'], rootsNew: ['㇇', '亅'], recognitionCode: 'H' },
  { char: '大', pinyin: 'dà', code86: 'DDDD', code98: 'DDDD', codeNew: 'DDDD', short86: 'V', short98: 'V', shortNew: 'V', roots86: ['大'], roots98: ['大'], rootsNew: ['大'], type: 'keyname' },
  { char: '凡', pinyin: 'fán', code86: 'MYI', code98: 'MYI', codeNew: 'MYI', short86: 'C', short98: 'C', shortNew: 'C', roots86: ['几', '丶'], roots98: ['几', '丶'], rootsNew: ['几', '丶'], recognitionCode: 'I' },
  { char: '以', pinyin: 'yǐ', code86: 'NYWY', code98: 'NYWY', codeNew: 'NYWY', short86: 'X', short98: 'X', shortNew: 'X', roots86: ['𠄌', '丶', '人'], roots98: ['𠄌', '丶', '人'], rootsNew: ['𠄌', '丶', '人'] },
];

// 经典键名字库
export const KEY_NAME_CHARS: WubiCharData[] = [
  { char: '王', pinyin: 'wáng', code86: 'GGGG', code98: 'GGGG', codeNew: 'GGGG', roots86: ['王'], roots98: ['王'], rootsNew: ['王'], type: 'keyname' },
  { char: '土', pinyin: 'tǔ', code86: 'FFFF', code98: 'FFFF', codeNew: 'FFFF', roots86: ['土'], roots98: ['土'], rootsNew: ['土'], type: 'keyname' },
  { char: '大', pinyin: 'dà', code86: 'DDDD', code98: 'DDDD', codeNew: 'DDDD', short86: 'V', short98: 'V', shortNew: 'V', roots86: ['大'], roots98: ['大'], rootsNew: ['大'], type: 'keyname' },
  { char: '木', pinyin: 'mù', code86: 'SSSS', code98: 'SSSS', codeNew: 'SSSS', roots86: ['木'], roots98: ['木'], rootsNew: ['木'], type: 'keyname' },
  { char: '工', pinyin: 'gōng', code86: 'AAAA', code98: 'AAAA', codeNew: 'AAAA', short86: 'A', short98: 'A', shortNew: 'A', roots86: ['工'], roots98: ['工'], rootsNew: ['工'], type: 'keyname' },

  { char: '目', pinyin: 'mù', code86: 'HHHH', code98: 'HHHH', codeNew: 'HHHH', roots86: ['目'], roots98: ['目'], rootsNew: ['目'], type: 'keyname' },
  { char: '日', pinyin: 'rì', code86: 'JJJJ', code98: 'JJJJ', codeNew: 'JJJJ', roots86: ['日'], roots98: ['日'], rootsNew: ['日'], type: 'keyname' },
  { char: '口', pinyin: 'kǒu', code86: 'KKKK', code98: 'KKKK', codeNew: 'KKKK', roots86: ['口'], roots98: ['口'], rootsNew: ['口'], type: 'keyname' },
  { char: '田', pinyin: 'tián', code86: 'LLLL', code98: 'LLLL', codeNew: 'LLLL', roots86: ['田'], roots98: ['田'], rootsNew: ['田'], type: 'keyname' },
  { char: '山', pinyin: 'shān', code86: 'MMMM', code98: 'MMMM', codeNew: 'MMMM', roots86: ['山'], roots98: ['山'], rootsNew: ['山'], type: 'keyname' },

  { char: '禾', pinyin: 'hé', code86: 'TTTT', code98: 'TTTT', codeNew: 'TTTT', roots86: ['禾'], roots98: ['禾'], rootsNew: ['禾'], type: 'keyname' },
  { char: '白', pinyin: 'bái', code86: 'RRRR', code98: 'RRRR', codeNew: 'RRRR', roots86: ['白'], roots98: ['白'], rootsNew: ['白'], type: 'keyname' },
  { char: '月', pinyin: 'yuè', code86: 'EEEE', code98: 'EEEE', codeNew: 'EEEE', roots86: ['月'], roots98: ['月'], rootsNew: ['月'], type: 'keyname' },
  { char: '人', pinyin: 'rén', code86: 'WWWW', code98: 'WWWW', codeNew: 'WWWW', short86: 'W', short98: 'W', shortNew: 'W', roots86: ['人'], roots98: ['人'], rootsNew: ['人'], type: 'keyname' },
  { char: '金', pinyin: 'jīn', code86: 'QQQQ', code98: 'QQQQ', codeNew: 'QQQQ', roots86: ['金'], roots98: ['金'], rootsNew: ['金'], type: 'keyname' },

  { char: '言', pinyin: 'yán', code86: 'YYYY', code98: 'YYYY', codeNew: 'YYYY', roots86: ['言'], roots98: ['言'], rootsNew: ['言'], type: 'keyname' },
  { char: '立', pinyin: 'lì', code86: 'UUUU', code98: 'UUUU', codeNew: 'UUUU', roots86: ['立'], roots98: ['立'], rootsNew: ['立'], type: 'keyname' },
  { char: '水', pinyin: 'shuǐ', code86: 'IIII', code98: 'IIII', codeNew: 'IIII', roots86: ['水'], roots98: ['水'], rootsNew: ['水'], type: 'keyname' },
  { char: '火', pinyin: 'huǒ', code86: 'OOOO', code98: 'OOOO', codeNew: 'OOOO', roots86: ['火'], roots98: ['火'], rootsNew: ['火'], type: 'keyname' },
  { char: '之', pinyin: 'zhī', code86: 'PPPP', code98: 'PPPP', codeNew: 'PPPP', roots86: ['之'], roots98: ['之'], rootsNew: ['之'], type: 'keyname' },

  { char: '已', pinyin: 'yǐ', code86: 'NNNN', code98: 'NNNN', codeNew: 'NNNN', roots86: ['已'], roots98: ['已'], rootsNew: ['已'], type: 'keyname' },
  { char: '子', pinyin: 'zǐ', code86: 'BBBB', code98: 'BBBB', codeNew: 'BBBB', roots86: ['子'], roots98: ['子'], rootsNew: ['子'], type: 'keyname' },
  { char: '女', pinyin: 'nǚ', code86: 'VVVV', code98: 'VVVV', codeNew: 'VVVV', roots86: ['女'], roots98: ['女'], rootsNew: ['女'], type: 'keyname' },
  { char: '又', pinyin: 'yòu', code86: 'CCCC', code98: 'CCCC', codeNew: 'CCCC', roots86: ['又'], roots98: ['又'], rootsNew: ['又'], type: 'keyname' },
  { char: '纟', pinyin: 'sī', code86: 'XXXX', code98: 'XXXX', codeNew: 'XXXX', roots86: ['纟'], roots98: ['纟'], rootsNew: ['纟'], type: 'keyname' }
];

// 高频二级简码精选集（采用标准拆解字根，精准对齐按键）
export const LEVEL_2_CHARS: WubiCharData[] = [
  { char: '把', pinyin: 'bǎ', code86: 'RCN', code98: 'RCN', codeNew: 'RCN', short86: 'RC', short98: 'RC', shortNew: 'RC', roots86: ['扌', '巴'], roots98: ['扌', '巴'], rootsNew: ['扌', '巴'] },
  { char: '打', pinyin: 'dǎ', code86: 'RSH', code98: 'RSH', codeNew: 'RSH', short86: 'RS', short98: 'RS', shortNew: 'RS', roots86: ['扌', '丁'], roots98: ['扌', '丁'], rootsNew: ['扌', '丁'] },
  { char: '帮', pinyin: 'bāng', code86: 'DTBH', code98: 'DTBH', codeNew: 'DTBH', short86: 'DT', short98: 'DT', shortNew: 'DT', roots86: ['大', '丰', '阝', '巾'], roots98: ['大', '丰', '阝', '巾'], rootsNew: ['大', '丰', '阝', '巾'] },
  { char: '进', pinyin: 'jìn', code86: 'FJPK', code98: 'FJPK', codeNew: 'FJPK', short86: 'FJ', short98: 'FJ', shortNew: 'FJ', roots86: ['二', '刂', '辶'], roots98: ['二', '刂', '辶'], rootsNew: ['二', '刂', '辶'] },
  { char: '理', pinyin: 'lǐ', code86: 'GJFG', code98: 'GJFG', codeNew: 'GJFG', short86: 'GJ', short98: 'GJ', shortNew: 'GJ', roots86: ['王', '日', '土'], roots98: ['王', '日', '土'], rootsNew: ['王', '日', '土'] },
  { char: '现', pinyin: 'xiàn', code86: 'GMQN', code98: 'GMQN', codeNew: 'GMQN', short86: 'GM', short98: 'GM', shortNew: 'GM', roots86: ['王', '冂', '儿'], roots98: ['王', '冂', '儿'], rootsNew: ['王', '冂', '儿'] },
  { char: '要', pinyin: 'yào', code86: 'SVF', code98: 'SVF', codeNew: 'SVF', short86: 'SV', short98: 'SV', shortNew: 'SV', roots86: ['覀', '女'], roots98: ['覀', '女'], rootsNew: ['覀', '女'] },
  { char: '样', pinyin: 'yàng', code86: 'SUDH', code98: 'SUH', codeNew: 'SUGH', short86: 'SU', short98: 'SU', shortNew: 'SU', roots86: ['木', '䒑', '羊底'], roots98: ['木', '羊'], rootsNew: ['木', '羊'] },
  { char: '条', pinyin: 'tiáo', code86: 'TSU', code98: 'TSU', codeNew: 'TSU', short86: 'TS', short98: 'TH', shortNew: 'TH', roots86: ['夂', '木'], roots98: ['夂', '木'], rootsNew: ['夂', '木'] },
  { char: '料', pinyin: 'liào', code86: 'OUFH', code98: 'OUFH', codeNew: 'OUFH', short86: 'OU', short98: 'OU', shortNew: 'OU', roots86: ['米', '斗'], roots98: ['米', '斗'], rootsNew: ['米', '斗'] },
  { char: '点', pinyin: 'diǎn', code86: 'HKOU', code98: 'HKOU', codeNew: 'HKOU', short86: 'HK', short98: 'HK', shortNew: 'HK', roots86: ['卜', '口', '灬'], roots98: ['卜', '口', '灬'], rootsNew: ['卜', '口', '灬'] },
  { char: '明', pinyin: 'míng', code86: 'JEG', code98: 'JEG', codeNew: 'JEG', short86: 'JE', short98: 'JE', shortNew: 'JE', roots86: ['日', '月'], roots98: ['日', '月'], rootsNew: ['日', '月'] },
  { char: '时', pinyin: 'shí', code86: 'JFY', code98: 'JFY', codeNew: 'JFY', short86: 'JF', short98: 'JF', shortNew: 'JF', roots86: ['日', '寸'], roots98: ['日', '寸'], rootsNew: ['日', '寸'] },
  { char: '唱', pinyin: 'chàng', code86: 'KJJG', code98: 'KJJG', codeNew: 'KJJG', short86: 'KJ', short98: 'KJ', shortNew: 'KJ', roots86: ['口', '日', '日'], roots98: ['口', '日', '日'], rootsNew: ['口', '日', '日'] },
  { char: '叫', pinyin: 'jiào', code86: 'KNHH', code98: 'KNHH', codeNew: 'KNHH', short86: 'KN', short98: 'KN', shortNew: 'KN', roots86: ['口', '丩'], roots98: ['口', '丩'], rootsNew: ['口', '丩'] },
  { char: '动', pinyin: 'dòng', code86: 'FCLN', code98: 'FCLN', codeNew: 'FCLN', short86: 'FC', short98: 'FC', shortNew: 'FC', roots86: ['二', '厶', '力'], roots98: ['二', '厶', '力'], rootsNew: ['二', '厶', '力'] },
  { char: '西', pinyin: 'xī', code86: 'SGHG', code98: 'SGHG', codeNew: 'SGHG', short86: 'SG', short98: 'SG', shortNew: 'SG', roots86: ['覀'], roots98: ['覀'], rootsNew: ['覀'] },
  { char: '节', pinyin: 'jié', code86: 'ABJ', code98: 'ABJ', codeNew: 'ABJ', short86: 'AB', short98: 'AB', shortNew: 'AB', roots86: ['艹', '卩'], roots98: ['艹', '卩'], rootsNew: ['艹', '卩'] },
  { char: '花', pinyin: 'huā', code86: 'AWXB', code98: 'AWXB', codeNew: 'AWXB', short86: 'AW', short98: 'AW', shortNew: 'AW', roots86: ['艹', '亻', '匕'], roots98: ['艹', '亻', '匕'], rootsNew: ['艹', '亻', '匕'] },
  { char: '草', pinyin: 'cǎo', code86: 'AJJ', code98: 'AJJ', codeNew: 'AJJ', short86: 'AJ', short98: 'AJ', shortNew: 'AJ', roots86: ['艹', '日', '十'], roots98: ['艹', '日', '十'], rootsNew: ['艹', '日', '十'] },
  { char: '间', pinyin: 'jiān', code86: 'UJD', code98: 'UJD', codeNew: 'UJD', short86: 'UJ', short98: 'UJ', shortNew: 'UJ', roots86: ['门', '日'], roots98: ['门', '日'], rootsNew: ['门', '日'] },
  { char: '法', pinyin: 'fǎ', code86: 'IFCY', code98: 'IFCY', codeNew: 'IFCY', short86: 'IF', short98: 'IF', shortNew: 'IF', roots86: ['氵', '土', '厶'], roots98: ['氵', '土', '厶'], rootsNew: ['氵', '土', '厶'] },
  { char: '清', pinyin: 'qīng', code86: 'IGEG', code98: 'IGEG', codeNew: 'IGEG', short86: 'IG', short98: 'IG', shortNew: 'IG', roots86: ['氵', '龶', '月'], roots98: ['氵', '龶', '月'], rootsNew: ['氵', '龶', '月'] },
  { char: '江', pinyin: 'jiāng', code86: 'IAG', code98: 'IAG', codeNew: 'IAG', short86: 'IA', short98: 'IA', shortNew: 'IA', roots86: ['氵', '工'], roots98: ['氵', '工'], rootsNew: ['氵', '工'] },
  { char: '海', pinyin: 'hǎi', code86: 'ITXU', code98: 'ITXU', codeNew: 'ITXU', short86: 'IT', short98: 'IT', shortNew: 'IT', roots86: ['氵', '𠂉', '母'], roots98: ['氵', '𠂉', '母'], rootsNew: ['氵', '𠂉', '母'] },
  { char: '情', pinyin: 'qíng', code86: 'NGEG', code98: 'NGEG', codeNew: 'NGEG', short86: 'NG', short98: 'NG', shortNew: 'NG', roots86: ['忄', '龶', '月'], roots98: ['忄', '龶', '月'], rootsNew: ['忄', '龶', '月'] },
  { char: '快', pinyin: 'kuài', code86: 'NNWY', code98: 'NNWY', codeNew: 'NNWY', short86: 'NN', short98: 'NN', shortNew: 'NN', roots86: ['忄', '𠃍', '人'], roots98: ['忄', '𠃍', '人'], rootsNew: ['忄', '𠃍', '人'] },
  { char: '建', pinyin: 'jiàn', code86: 'VFHP', code98: 'VGPK', codeNew: 'VGPK', short86: 'VF', short98: 'VG', shortNew: 'VG', roots86: ['彐', '二', '丨', '廴'], roots98: ['聿', '一', '廴'], rootsNew: ['聿', '一', '廴'] },
  { char: '红', pinyin: 'hóng', code86: 'XAG', code98: 'XAG', codeNew: 'XAG', short86: 'XA', short98: 'XA', shortNew: 'XA', roots86: ['纟', '工'], roots98: ['纟', '工'], rootsNew: ['纟', '工'] },
  { char: '线', pinyin: 'xiàn', code86: 'XGT', code98: 'XGAY', codeNew: 'XFXY', short86: 'XG', short98: 'XG', shortNew: 'XF', roots86: ['纟', '戋'], roots98: ['纟', '戋'], rootsNew: ['纟', '戋'] }
];

// 全局五笔大字典 Map（涵盖 28,058 汉字）
export const WUBI_CHAR_MAP = new Map<string, WubiCharData>();

// 先注册手工精修字根的简码字与键名字
LEVEL_1_CHARS.forEach(item => WUBI_CHAR_MAP.set(item.char, item));
KEY_NAME_CHARS.forEach(item => {
  if (!WUBI_CHAR_MAP.has(item.char)) WUBI_CHAR_MAP.set(item.char, item);
});
LEVEL_2_CHARS.forEach(item => {
  if (!WUBI_CHAR_MAP.has(item.char)) WUBI_CHAR_MAP.set(item.char, item);
});

// 加载全量词典数据 [char, pinyin, c86, c98, cNew, s86, s98, sNew, r86, r98, r06]
const parsedFullChars: WubiCharData[] = (rawDictData as Array<[
  string, string, string, string, string, string, string, string, string[], string[], string[]
]>).map(r => {
  const char = r[0];
  const existing = WUBI_CHAR_MAP.get(char);
  if (existing) {
    return existing;
  }
  const item: WubiCharData = {
    char,
    pinyin: r[1],
    code86: r[2],
    code98: r[3] || r[2],
    codeNew: r[4] || r[2],
    short86: r[5] || undefined,
    short98: r[6] || undefined,
    shortNew: r[7] || undefined,
    roots86: r[8] || [],
    roots98: r[9] || [],
    rootsNew: r[10] || []
  };
  WUBI_CHAR_MAP.set(char, item);
  return item;
});

// 常用字级分类导出
export const COMMON_500_CHARS: WubiCharData[] = parsedFullChars.slice(0, 500);
export const COMMON_1500_CHARS: WubiCharData[] = parsedFullChars.slice(0, 1500);
export const COMMON_2500_CHARS: WubiCharData[] = parsedFullChars.slice(0, 2500);
export const COMMON_3500_CHARS: WubiCharData[] = parsedFullChars.slice(0, 3500);
export const COMMON_CHARS: WubiCharData[] = COMMON_3500_CHARS;

// 根据汉字反查五笔数据
export const lookupWubiChar = (char: string): WubiCharData | undefined => {
  return WUBI_CHAR_MAP.get(char);
};

// 获取某版本下的全码
export const getFullCode = (charData: WubiCharData, version: WubiVersion): string => {
  switch (version) {
    case '98':
      return charData.code98;
    case 'newCentury':
      return charData.codeNew;
    case '86':
    default:
      return charData.code86;
  }
};

// 获取某版本下的简码（若无则返回全码）
export const getShortCode = (charData: WubiCharData, version: WubiVersion): string | undefined => {
  switch (version) {
    case '98':
      return charData.short98 || charData.code98;
    case 'newCentury':
      return charData.shortNew || charData.codeNew;
    case '86':
    default:
      return charData.short86 || charData.code86;
  }
};

export interface RootStep {
  root: string; // 拆解字根，例如 '⺌'
  key: string;  // 对应按键，例如 'I'
}

export interface CharBreakdownInfo {
  roots: string[];          // 真实拆字字根，例如 ['⺌', '冖', '口', '土']
  rootSteps: RootStep[];    // 精确对应的字根与按键列表 [{ root: '⺌', key: 'I' }, ...]
  recognitionCode?: string; // 末笔字型交叉识别码，例如 'B'
}

/**
 * 深入解析单字的标准字根拆解与末笔识别码
 */
export const getCharBreakdown = (charData: WubiCharData, version: WubiVersion): CharBreakdownInfo => {
  let roots: string[] = [];
  switch (version) {
    case '98':
      roots = charData.roots98 || [];
      break;
    case 'newCentury':
      roots = charData.rootsNew || [];
      break;
    case '86':
    default:
      roots = charData.roots86 || [];
      break;
  }

  const fullCode = getFullCode(charData, version).toUpperCase();

  // 是否属于键名字 (如 工 AAAA, 王 GGGG) 或 单笔画 (如 一 GGLL, 乙 NNLL)
  const isKeyName = charData.type === 'keyname' || 
    (roots.length === 1 && fullCode.length === 4 && fullCode[0] === fullCode[1] && fullCode[1] === fullCode[2] && fullCode[2] === fullCode[3]) ||
    ['GGLL', 'HHLL', 'TTLL', 'YYLL', 'NNLL'].includes(fullCode);

  if (roots && roots.length > 0) {
    let recognitionCode: string | undefined = undefined;
    // 识别码判定：
    // 只有当拆出字根少于 4 个、非键名/单笔画、且全码长度大于字根数时，全码末位才为交叉识别码
    if (!isKeyName && roots.length < 4 && fullCode.length > roots.length) {
      recognitionCode = fullCode[fullCode.length - 1];
    }

    const rootSteps: RootStep[] = roots.map((r, i) => ({
      root: r,
      key: fullCode[i] || ''
    }));

    return {
      roots,
      rootSteps,
      recognitionCode
    };
  }

  // 兜底回退：若该字非常生僻无字根数据，按字母对应键位提示
  const kb = version === '98' ? KEYBOARD_98 : (version === 'newCentury' ? KEYBOARD_NEW : KEYBOARD_86);
  const derived: string[] = [];
  const rootSteps: RootStep[] = [];
  for (let i = 0; i < fullCode.length; i++) {
    const key = fullCode[i];
    const info = kb[key];
    const name = info?.keyName || key;
    derived.push(name);
    rootSteps.push({ root: name, key });
  }
  return {
    roots: derived,
    rootSteps
  };
};

// 获取某版本下的拆字字根
export const getRoots = (charData: WubiCharData, version: WubiVersion): string[] => {
  return getCharBreakdown(charData, version).roots;
};

// 获取某版本下的字根与按键步骤对
export const getRootSteps = (charData: WubiCharData, version: WubiVersion): RootStep[] => {
  return getCharBreakdown(charData, version).rootSteps;
};

// 获取某版本下的末笔识别码
export const getRecognitionCode = (charData: WubiCharData, version: WubiVersion): string | undefined => {
  return getCharBreakdown(charData, version).recognitionCode || charData.recognitionCode;
};

/**
 * 词组取码拆解结构
 */
export interface PhraseCharStep {
  char: string;         // 汉字，如 '日'
  index: number;        // 汉字序号 (1-indexed)
  keys: string;         // 该汉字贡献的按键编码，如 'J'
  charFullCode: string; // 该汉字自身全码，如 'JJJJ'
  desc: string;         // 取码规则说明，如 '取首码' 或 '取前两码'
}

export interface PhraseBreakdownInfo {
  phrase: string;
  code: string;
  ruleName: string;     // 如 '四字词取码规则'
  ruleDesc: string;     // 如 '前三字各取首码 + 末字首码'
  steps: PhraseCharStep[];
}

/**
 * 智能解析任意中文词组在指定五笔版本下的取码拆解
 */
export const getPhraseBreakdown = (phrase: string, version: WubiVersion = '86'): PhraseBreakdownInfo => {
  const chars = Array.from(phrase.replace(/[^\u4e00-\u9fa5]/g, ''));
  const fullCode = calculatePhraseCode(phrase, version).toUpperCase();

  const getCharFull = (ch: string) => {
    const item = lookupWubiChar(ch);
    return item ? getFullCode(item, version).toUpperCase() : '';
  };

  const steps: PhraseCharStep[] = [];

  if (chars.length === 2) {
    const c1 = getCharFull(chars[0]);
    const c2 = getCharFull(chars[1]);
    steps.push({
      char: chars[0],
      index: 1,
      keys: c1.slice(0, 2),
      charFullCode: c1,
      desc: '取前2码'
    });
    steps.push({
      char: chars[1],
      index: 2,
      keys: c2.slice(0, 2),
      charFullCode: c2,
      desc: '取前2码'
    });
    return {
      phrase,
      code: fullCode,
      ruleName: '双字词取码规则',
      ruleDesc: '第1字取前两码 + 第2字取前两码',
      steps
    };
  }

  if (chars.length === 3) {
    const c1 = getCharFull(chars[0]);
    const c2 = getCharFull(chars[1]);
    const c3 = getCharFull(chars[2]);
    steps.push({
      char: chars[0],
      index: 1,
      keys: c1.slice(0, 1),
      charFullCode: c1,
      desc: '取首码'
    });
    steps.push({
      char: chars[1],
      index: 2,
      keys: c2.slice(0, 1),
      charFullCode: c2,
      desc: '取首码'
    });
    steps.push({
      char: chars[2],
      index: 3,
      keys: c3.slice(0, 2),
      charFullCode: c3,
      desc: '取前2码'
    });
    return {
      phrase,
      code: fullCode,
      ruleName: '三字词取码规则',
      ruleDesc: '第1、2字各取首码 + 第3字取前两码',
      steps
    };
  }

  // 4字及以上长词
  const c1 = getCharFull(chars[0]);
  const c2 = getCharFull(chars[1]);
  const c3 = getCharFull(chars[2]);
  const cLast = getCharFull(chars[chars.length - 1]);

  steps.push({
    char: chars[0],
    index: 1,
    keys: c1.slice(0, 1),
    charFullCode: c1,
    desc: '取首码'
  });
  steps.push({
    char: chars[1],
    index: 2,
    keys: c2.slice(0, 1),
    charFullCode: c2,
    desc: '取首码'
  });
  steps.push({
    char: chars[2],
    index: 3,
    keys: c3.slice(0, 1),
    charFullCode: c3,
    desc: '取首码'
  });
  steps.push({
    char: chars[chars.length - 1],
    index: chars.length,
    keys: cLast.slice(0, 1),
    charFullCode: cLast,
    desc: '末字首码'
  });

  return {
    phrase,
    code: fullCode,
    ruleName: chars.length === 4 ? '四字词取码规则' : '多字长词取码规则',
    ruleDesc: chars.length === 4 ? '前三字各取首码 + 末字首码' : '前三字各取首码 + 末字首码',
    steps
  };
};

/**
 * 计算任意中文词组在指定五笔版本下的标准四位整词编码
 */
export const calculatePhraseCode = (phrase: string, version: WubiVersion = '86'): string => {
  const chars = Array.from(phrase.replace(/[^\u4e00-\u9fa5]/g, ''));
  if (chars.length === 0) return '';
  if (chars.length === 1) {
    const item = lookupWubiChar(chars[0]);
    return item ? getFullCode(item, version) : '';
  }

  const getCharFull = (ch: string) => {
    const item = lookupWubiChar(ch);
    return item ? getFullCode(item, version).toUpperCase() : '';
  };

  if (chars.length === 2) {
    const c1 = getCharFull(chars[0]);
    const c2 = getCharFull(chars[1]);
    if (!c1 || !c2) return '';
    return (c1.slice(0, 2) + c2.slice(0, 2)).slice(0, 4);
  }

  if (chars.length === 3) {
    const c1 = getCharFull(chars[0]);
    const c2 = getCharFull(chars[1]);
    const c3 = getCharFull(chars[2]);
    if (!c1 || !c2 || !c3) return '';
    return (c1.slice(0, 1) + c2.slice(0, 1) + c3.slice(0, 2)).slice(0, 4);
  }

  // 四字及以上（4+ 词组）
  const c1 = getCharFull(chars[0]);
  const c2 = getCharFull(chars[1]);
  const c3 = getCharFull(chars[2]);
  const cLast = getCharFull(chars[chars.length - 1]);
  if (!c1 || !c2 || !c3 || !cLast) return '';
  return (c1.slice(0, 1) + c2.slice(0, 1) + c3.slice(0, 1) + cLast.slice(0, 1)).slice(0, 4);
};
