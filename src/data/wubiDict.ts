import type { WubiCharData, WubiVersion } from '../types/wubi';
import { KEYBOARD_86, KEYBOARD_98, KEYBOARD_NEW } from './keyboards';
import { rawCommonDictData } from './wubiCommonDictData';
import { charMetaData } from './charMetaData';

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
  { char: '发', pinyin: 'fā', code86: 'NTCY', code98: 'NTCY', codeNew: 'NTCY', short86: 'V', short98: 'V', shortNew: 'V', roots86: ['𠃌', '丿', '㇇', '丶'], roots98: ['𠃌', '丿', '㇇', '丶'], rootsNew: ['𠃌', '丿', '㇇', '丶'] },
  { char: '以', pinyin: 'yǐ', code86: 'NYWY', code98: 'NYWY', codeNew: 'NYWY', short86: 'C', short98: 'C', shortNew: 'C', roots86: ['𠄌', '丶', '人'], roots98: ['𠄌', '丶', '人'], rootsNew: ['𠄌', '丶', '人'] },
  { char: '经', pinyin: 'jīng', code86: 'XCAG', code98: 'XCAG', codeNew: 'XCAG', short86: 'X', short98: 'X', shortNew: 'X', roots86: ['纟', '㇇', '工', '一'], roots98: ['纟', '㇇', '工', '一'], rootsNew: ['纟', '㇇', '工', '一'] },
];

// 经典键名字库
export const KEY_NAME_CHARS: WubiCharData[] = [
  { char: '王', pinyin: 'wáng', code86: 'GGGG', code98: 'GGGG', codeNew: 'GGGG', roots86: ['王'], roots98: ['王'], rootsNew: ['王'], type: 'keyname' },
  { char: '土', pinyin: 'tǔ', code86: 'FFFF', code98: 'FFFF', codeNew: 'FFFF', roots86: ['土'], roots98: ['土'], rootsNew: ['土'], type: 'keyname' },
  { char: '大', pinyin: 'dà', code86: 'DDDD', code98: 'DDDD', codeNew: 'DDDD', short86: 'DD', short98: 'DD', shortNew: 'DD', roots86: ['大'], roots98: ['大'], rootsNew: ['大'], type: 'keyname' },
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

// 核心高频疑难字专家校准库（修正原拆分库历史缺陷与笔画混淆）
export const EXPERT_CORRECTED_CHARS: WubiCharData[] = [
  // 匜：A 键字根“匚” + B 键字根“也” + 末笔识别码 V (末笔折+杂合型 53=V)
  {
    char: '匜',
    pinyin: 'yí',
    code86: 'ABV',
    code98: 'ABV',
    codeNew: 'ABV',
    short86: 'AB',
    short98: 'AB',
    shortNew: 'AB',
    roots86: ['匚', '也'],
    roots98: ['匚', '也'],
    rootsNew: ['匚', '也'],
    recognitionCode: 'V',
    recognitionFlag: '折·杂合〔乛 ⿻〕',
    ids: '⿷匚也',
    strokes: 5,
    radical: '匚'
  },
  // 鱼：Q 键字根“无尾鱼”(\ue131，即⺈+田连体字根) + G 键字根“一”(底横) + 末笔识别码 F (末笔横+上下型 12=F)
  {
    char: '鱼',
    pinyin: 'yú',
    code86: 'QGF',
    code98: 'QGF',
    codeNew: 'QGF',
    short86: 'Q',
    short98: 'Q',
    shortNew: 'Q',
    roots86: ['⺈田', '一'],
    roots98: ['⺈田', '一'],
    rootsNew: ['⺈田', '一'],
    recognitionCode: 'F',
    recognitionFlag: '横·上下〔一 ⿱〕',
    ids: '⿳⺈田一',
    strokes: 8,
    radical: '鱼（魚）'
  },
  // 鲜：Q 键字根“无尾鱼” + G 键字根“一” + U 键字根“䒑” + D 键字根“羊底”
  {
    char: '鲜',
    pinyin: 'xiān',
    code86: 'QGUD',
    code98: 'QGUD',
    codeNew: 'QGUD',
    short86: 'QG',
    short98: 'QG',
    shortNew: 'QG',
    roots86: ['⺈田', '一', '䒑', '羊底'],
    roots98: ['⺈田', '一', '䒑', '羊底'],
    rootsNew: ['⺈田', '一', '䒑', '羊底'],
    ids: '⿰鱼羊',
    strokes: 14,
    radical: '鱼（魚）'
  },
  // 骨：M 键字根“骨字头”(冎) + E 键字根“月” + 末笔识别码 F (末笔横+上下型 12=F)
  {
    char: '骨',
    pinyin: 'gǔ',
    code86: 'MEF',
    code98: 'MEF',
    codeNew: 'MEF',
    short86: 'ME',
    short98: 'ME',
    shortNew: 'ME',
    roots86: ['冎', '月'],
    roots98: ['冎', '月'],
    rootsNew: ['冎', '月'],
    recognitionCode: 'F',
    recognitionFlag: '横·上下〔一 ⿱〕',
    ids: '⿱冎月',
    strokes: 9,
    radical: '骨'
  },
  // 物：T 键字根“丿” + R 键字根“扌” + Q 键字根“勹” + R 键字根“彡”
  {
    char: '物',
    pinyin: 'wù',
    code86: 'TRQR',
    code98: 'TRQR',
    codeNew: 'TRQR',
    short86: 'TRQ',
    short98: 'TRQ',
    shortNew: 'TRQ',
    roots86: ['丿', '扌', '勹', '彡'],
    roots98: ['丿', '扌', '勹', '彡'],
    rootsNew: ['丿', '扌', '勹', '彡'],
    ids: '⿰牜勿',
    strokes: 8,
    radical: '牛'
  },
  // 然：Q 键字根“⺼”(肉月旁) + D 键字根“犬” + O 键字根“灬” + 末笔识别码 U (末笔点+上下型 42=U)
  {
    char: '然',
    pinyin: 'rán',
    code86: 'QDOU',
    code98: 'QDOU',
    codeNew: 'QDYO',
    short86: 'QD',
    short98: 'QD',
    shortNew: 'QD',
    roots86: ['⺼', '犬', '灬'],
    roots98: ['⺼', '犬', '灬'],
    rootsNew: ['⺼', '犬', '灬'],
    recognitionCode: 'U',
    recognitionFlag: '捺·上下〔丶 ⿱〕',
    ids: '⿱⿰⺼犬灬',
    strokes: 12,
    radical: '火（灬）'
  },
  // 觉：I 键字根“⺌”(学字头) + P 键字根“冖” + M 键字根“冂” + Q 键字根“儿”
  {
    char: '觉',
    pinyin: 'jué',
    code86: 'IPMQ',
    code98: 'IPMQ',
    codeNew: 'IPMQ',
    short86: 'IPM',
    short98: 'IPM',
    shortNew: 'IPM',
    roots86: ['⺌', '冖', '冂', '儿'],
    roots98: ['⺌', '冖', '冂', '儿'],
    rootsNew: ['⺌', '冖', '冂', '儿'],
    ids: '⿱⺌冖见',
    strokes: 9,
    radical: '见'
  },
  // 击：F 键字根“二”(击字头) + M 键字根“凵” + 末笔识别码 K (末笔竖+杂合型 23=K)
  {
    char: '击',
    pinyin: 'jī',
    code86: 'FMK',
    code98: 'FMK',
    codeNew: 'FMK',
    short86: 'FM',
    short98: 'FM',
    shortNew: 'FM',
    roots86: ['二', '凵'],
    roots98: ['二', '凵'],
    rootsNew: ['二', '凵'],
    recognitionCode: 'K',
    recognitionFlag: '竖·杂合〔丨 ⿻〕',
    strokes: 5,
    radical: '凵'
  },
  // 象：Q 键字根“⺈” + J 键字根“日” + E 键字根“豕” + 末笔识别码 U (末笔捺+杂合型 43=U)
  {
    char: '象',
    pinyin: 'xiàng',
    code86: 'QJEU',
    code98: 'QJEU',
    codeNew: 'QJEU',
    short86: 'QJE',
    short98: 'QJE',
    shortNew: 'QJE',
    roots86: ['⺈', '日', '豕'],
    roots98: ['⺈', '日', '豕'],
    rootsNew: ['⺈', '日', '豕'],
    recognitionCode: 'U',
    recognitionFlag: '捺·杂合〔丶 ⿻〕',
    strokes: 11,
    radical: '豕'
  },
  // 求：86版 十(F) + 氺(I) + 丶(Y) + 识别码 I
  {
    char: '求',
    pinyin: 'qiú',
    code86: 'FIYI',
    code98: 'GIYI',
    codeNew: 'GIYI',
    short86: 'FIY',
    short98: 'GI',
    shortNew: 'GI',
    roots86: ['十', '氺', '丶'],
    roots98: ['一', '氺', '丶'],
    rootsNew: ['一', '氺', '丶'],
    recognitionCode: 'I'
  },
  // 牛：撇两横(R) + 丨(H) + 识别码 K (杂合竖 23)
  {
    char: '牛',
    pinyin: 'niú',
    code86: 'RHK',
    code98: 'RHK',
    codeNew: 'RHK',
    short86: 'RH',
    short98: 'RH',
    shortNew: 'RH',
    roots86: ['𠂉', '丨'],
    roots98: ['𠂉', '丨'],
    rootsNew: ['𠂉', '丨'],
    recognitionCode: 'K'
  },
  // 年：撇两横(R) + 丨(H) + 十(F) + 识别码 K
  {
    char: '年',
    pinyin: 'nián',
    code86: 'RHFK',
    code98: 'TGJ',
    codeNew: 'RHFK',
    short86: 'RH',
    short98: 'TG',
    shortNew: 'RH',
    roots86: ['𠂉', '丨', '十'],
    roots98: ['⺧', '丨', '十'],
    rootsNew: ['𠂉', '丨', '十'],
    recognitionCode: 'K'
  },
  // 失：撇两横(R) + 人(W) + 识别码 I
  {
    char: '失',
    pinyin: 'shī',
    code86: 'RWI',
    code98: 'RWI',
    codeNew: 'RWI',
    short86: 'RW',
    short98: 'RW',
    shortNew: 'RW',
    roots86: ['𠂉', '人'],
    roots98: ['𠂉', '人'],
    rootsNew: ['𠂉', '人'],
    recognitionCode: 'I'
  },
  // 气：撇两横(R) + 乙(N) + 识别码 B
  {
    char: '气',
    pinyin: 'qì',
    code86: 'RNB',
    code98: 'RNB',
    codeNew: 'RNB',
    short86: 'RN',
    short98: 'RN',
    shortNew: 'RN',
    roots86: ['𠂉', '乙'],
    roots98: ['𠂉', '乙'],
    rootsNew: ['𠂉', '乙'],
    recognitionCode: 'B'
  },
  // 尤：𠂇(D) + ㇟(N) + 识别码 V (杂合撇捺 13)
  {
    char: '尤',
    pinyin: 'yóu',
    code86: 'DNV',
    code98: 'DNV',
    codeNew: 'DNV',
    short86: 'DN',
    short98: 'DN',
    shortNew: 'DN',
    roots86: ['𠂇', '㇟'],
    roots98: ['𠂇', '㇟'],
    rootsNew: ['𠂇', '㇟'],
    recognitionCode: 'V'
  },
  // 母：母字框⺟(X) + 一(G) + ⺀(U) + 识别码 I
  {
    char: '母',
    pinyin: 'mǔ',
    code86: 'XGUI',
    code98: 'XGUI',
    codeNew: 'XGUI',
    short86: 'XG',
    short98: 'XG',
    shortNew: 'XG',
    roots86: ['⺟', '一', '⺀'],
    roots98: ['⺟', '一', '⺀'],
    rootsNew: ['⺟', '一', '⺀'],
    recognitionCode: 'I'
  },
  // 具：具字头(H) + 八(W) + 识别码 U
  {
    char: '具',
    pinyin: 'jù',
    code86: 'HWU',
    code98: 'HWU',
    codeNew: 'HWU',
    short86: 'HW',
    short98: 'HW',
    shortNew: 'HW',
    roots86: ['目', '八'],
    roots98: ['目', '八'],
    rootsNew: ['目', '八'],
    recognitionCode: 'U'
  },
  // 直：十(F) + 具字头(H) + 识别码 F
  {
    char: '直',
    pinyin: 'zhí',
    code86: 'FHF',
    code98: 'FHF',
    codeNew: 'FHF',
    short86: 'FH',
    short98: 'FH',
    shortNew: 'FH',
    roots86: ['十', '目'],
    roots98: ['十', '目'],
    rootsNew: ['十', '目'],
    recognitionCode: 'F'
  },
  // 祭：W 键字根“祭字头” + F 键字根“二” + I 键字根“小” + 末笔识别码 U (末笔点+上下型 42=U)
  {
    char: '祭',
    pinyin: 'jì',
    code86: 'WFIU',
    code98: 'WFIU',
    codeNew: 'WFIU',
    short86: 'WF',
    short98: 'WF',
    shortNew: 'WF',
    roots86: ['祭头', '二', '小'],
    roots98: ['祭头', '二', '小'],
    rootsNew: ['祭头', '二', '小'],
    recognitionCode: 'U',
    recognitionFlag: '捺·上下〔丶 ⿱〕',
    ids: '⿱祭头示',
    strokes: 11,
    radical: '示（礻⺬）'
  },
  // 蔡：A 键字根“艹” + W 键字根“祭字头” + F 键字根“二” + I 键字根“小”
  {
    char: '蔡',
    pinyin: 'cài',
    code86: 'AWFI',
    code98: 'AWFI',
    codeNew: 'AWFI',
    short86: 'AWF',
    short98: 'AWF',
    shortNew: 'AWF',
    roots86: ['艹', '祭头', '二', '小'],
    roots98: ['艹', '祭头', '二', '小'],
    rootsNew: ['艹', '祭头', '二', '小'],
    ids: '⿱艹祭',
    strokes: 14,
    radical: '艸（艹）'
  },
  // 察：P 键字根“宀” + W 键字根“祭字头” + F 键字根“二” + I 键字根“小”
  {
    char: '察',
    pinyin: 'chá',
    code86: 'PWFI',
    code98: 'PWFI',
    codeNew: 'PWFI',
    short86: 'PWF',
    short98: 'PWF',
    shortNew: 'PWF',
    roots86: ['宀', '祭头', '二', '小'],
    roots98: ['宀', '祭头', '二', '小'],
    rootsNew: ['宀', '祭头', '二', '小'],
    ids: '⿱宀祭',
    strokes: 14,
    radical: '宀'
  },
  // 擦：R 键字根“扌” + P 键字根“宀” + W 键字根“祭字头” + I 键字根“小”
  {
    char: '擦',
    pinyin: 'cā',
    code86: 'RPWI',
    code98: 'RPWI',
    codeNew: 'RPWI',
    short86: 'RPW',
    short98: 'RPW',
    shortNew: 'RPW',
    roots86: ['扌', '宀', '祭头', '小'],
    roots98: ['扌', '宀', '祭头', '小'],
    rootsNew: ['扌', '宀', '祭头', '小'],
    ids: '⿰扌察',
    strokes: 17,
    radical: '手（扌龵）'
  },
  // 跑：口(K) + 止(H) + 勹(Q) + 巳(N)，全码 KHQN，四码全满无末笔识别码
  {
    char: '跑',
    pinyin: 'pǎo',
    code86: 'KHQN',
    code98: 'KHQN',
    codeNew: 'KHQN',
    short86: 'KHQ',
    short98: 'KHQ',
    shortNew: 'KHQ',
    roots86: ['口', '止', '勹', '巳'],
    roots98: ['口', '止', '勹', '巳'],
    rootsNew: ['口', '止', '勹', '巳'],
    ids: '⿰足包',
    strokes: 12,
    radical: '足（⻊）'
  },
  // 刺：86版 一(G) + 冂(M) + 小(I) + 刂(J) 全码 GMIJ；98版 木(S) + 冂(M) + 刂(J) + 识别码H 全码 SMJH
  {
    char: '刺',
    pinyin: 'cì',
    code86: 'GMIJ',
    code98: 'SMJH',
    codeNew: 'GMIJ',
    short86: 'GMI',
    short98: 'SMJ',
    shortNew: 'GMI',
    roots86: ['一', '冂', '小', '刂'],
    roots98: ['木', '冂', '刂'],
    rootsNew: ['一', '冂', '小', '刂'],
    ids: '⿰朿刂',
    strokes: 8,
    radical: '刀（刂）'
  },
  // 卌：一(G) + 四竖(L) + 识别码 K
  {
    char: '卌',
    pinyin: 'xì',
    code86: 'GLK',
    code98: 'GLK',
    codeNew: 'GLK',
    short86: 'GL',
    short98: 'GL',
    shortNew: 'GL',
    roots86: ['一', '丨'],
    roots98: ['一', '丨'],
    rootsNew: ['一', '丨'],
    recognitionCode: 'K'
  },
  // 示字旁 礻 (P)
  {
    char: '礻',
    pinyin: 'shì',
    code86: 'PYI',
    code98: 'PYI',
    codeNew: 'PYI',
    short86: 'PY',
    short98: 'PY',
    shortNew: 'PY',
    roots86: ['礻'],
    roots98: ['礻'],
    rootsNew: ['礻'],
    recognitionCode: 'I'
  },
  // 衣字旁 衤 (P)
  {
    char: '衤',
    pinyin: 'yī',
    code86: 'PUI',
    code98: 'PUI',
    codeNew: 'PUI',
    short86: 'PU',
    short98: 'PU',
    shortNew: 'PU',
    roots86: ['衤'],
    roots98: ['衤'],
    rootsNew: ['衤'],
    recognitionCode: 'I'
  }
];

// 汉字元数据字典映射 [ids, strokes, radical, flag]
const charMetaMap = charMetaData as unknown as Record<string, [string, number, string, string]>;

/**
 * 拼音去调与特殊字符规范化（如 shàng -> shang, nǚ -> nv）
 */
export const stripTones = (str: string): string => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ü/g, 'v')
    .toLowerCase();
};

// 规范化部首显示，去除生僻扩展区不可渲染字符，确保所有主流字体无豆腐块
const cleanRadical = (rad: string): string => {
  if (!rad) return rad;
  return rad
    .replace('玉（𤣩王）', '玉（王）')
    .replace('足（𧾷）', '足（⻊）')
    .replace('疋（𤴔）', '疋')
    .replace('臼（𦥑）', '臼');
};

const attachMeta = (item: WubiCharData) => {
  if (!item.pinyinPlain && item.pinyin) {
    item.pinyinPlain = stripTones(item.pinyin);
  }
  if (item.radical) item.radical = cleanRadical(item.radical);
  const meta = charMetaMap[item.char];
  if (meta) {
    if (!item.ids && meta[0]) item.ids = meta[0];
    if (!item.strokes && meta[1]) item.strokes = meta[1];
    if (!item.radical && meta[2]) item.radical = cleanRadical(meta[2]);
    if (!item.recognitionFlag && meta[3]) item.recognitionFlag = meta[3];
  }
};

// 鱼部及含鱼汉字特征集（统一升级为 Q 键一体化字根 [⺈田]）
const FISH_CHARS = new Set([
  '鱼', '鲁', '鲜', '鲍', '渔', '癣', '鳞', '鲤', '鲸', '鲫', '鳗', '鳄', '蓟', '鱿', '鳕', '噜',
  '橹', '鲈', '鲛', '鳍', '鳝', '撸', '鲢', '鳃', '鲳', '鲶', '鲑', '鲟', '鲲', '鳎', '鳟', '鲇',
  '鲷', '鲎', '鳊', '鳅', '鳜', '鲆', '鲅', '鲔', '藓', '鳙', '鲽', '稣', '鲥', '鲠', '鲵', '鲭',
  '鲋', '鲮', '鲱', '鲩', '鲣', '鳐', '鳏', '鲐', '鲂', '鲞', '鲧', '鳡', '鳓', '鲃', '鲻', '镥',
  '鳔', '鲀', '鳢', '鳇', '鲦', '鲡', '鲕', '鲚', '鲴', '鲰', '鲒', '鲺', '鲙', '鲼', '鳉', '鳆',
  '澛', '鲉', '鲊', '鱾', '鳋', '鲌', '鳚', '鲪', '鲯', '鲘', '鲿', '鲹', '鳀', '鳠', '鳣', '鲗',
  '鱽', '鲏', '鲖', '鳤', '鳒', '鳁', '鳑', '鲝', '鳂', '鳛', '䲠', '鲬', '鳈', '鲾', '䲡', '䲟'
]);

// 祭字头特征字集（W键，祭、蔡、察、擦等字上部部件，严格区别于登字头 癶）
const JI_HEAD_CHARS = new Set([
  '蔡', '祭', '察', '擦', '嚓', '際', '檫', '镲', '漈', '礤', '瘵', '縩', '傺', '穄', '鰶', '鑔', '磜'
]);

/**
 * 全局字根规范化过滤器：
 * 1. 鱼部字自动合成为标准 Q 键一体化字根 [⺈田]（上下叠合，对应无尾鱼）；
 * 2. 骨部字规范为 M 键 冎 (骨字头) + E 键 月；
 * 3. 区分登字头(癶)与祭字头(祭头)：蔡、祭、察、擦等字 W 键字根修正为祭字头；
 * 4. 展开轻/径(LCAG/TCAG)被吞并的工/一等字根；
 * 5. 展开泽/译(ICFH/YCFH)生僻字根为标准 又+十；
 * 6. 将 Ext-G/F/C 和 PUA 乱码生僻字替换为全平台兼容的纯正五笔字根。
 */
export const normalizeRoots = (char: string, code: string, roots: string[]): string[] => {
  if (!roots || !roots.length) return [];
  let res = [...roots];

  // 1. 鱼部及含鱼汉字：Q 键对应统一升级为一体化字根 [⺈田]
  if (code && code.includes('QG') && (FISH_CHARS.has(char) || char.includes('鱼') || char.includes('魚'))) {
    for (let i = 0; i < res.length - 1; i++) {
      if (res[i] === '⺈' && res[i + 1] === '一') {
        res[i] = '⺈田';
        break;
      }
    }
  }

  // 2. 骨部字规范为 M 键 冎 (骨字头) + E 键 月
  if (res.length >= 2 && res[0] === '冂' && res[1] === '冃' && (char === '骨' || char.includes('骨') || (code && code.startsWith('ME')))) {
    res[0] = '冎';
    res[1] = '月';
  }

  // 3. 区分登字头(癶)与祭字头(祭头)：蔡、祭、察、擦等字 W 键字根为祭字头
  if (code && code.includes('W') && (JI_HEAD_CHARS.has(char) || char.includes('祭'))) {
    for (let i = 0; i < res.length; i++) {
      if (res[i] === '癶' || res[i] === '𠂊') {
        res[i] = '祭头';
      }
    }
  }

  // 4. 足字旁(𧾷/⻊)：在 86 版五笔中由 口(K) + 止(H) 构成，展开修复 111 个足部字的字根错位
  if (code && code.startsWith('KH') && res.length > 0 && (res[0] === '𧾷' || res[0] === '⻊')) {
    res.splice(0, 1, '口', '止');
  }

  // 5. 革字旁(革)：在 86 版五笔中由 廿(A) + 十(F) 构成，展开修复 24 个革部字的字根错位
  if (code && code.startsWith('AF') && res.length > 0 && res[0] === '革') {
    res.splice(0, 1, '廿', '十');
  }

  // 6. 展开/规范复合扩展字与冷门乱码字形
  const newRes: string[] = [];
  for (const r of res) {
    if (r === '𢀖') {
      newRes.push('㇇', '工', '一');
    } else if (r === '𠬤') {
      newRes.push('又', '十');
    } else if (r === '𡭔') {
      newRes.push('小');
    } else if (r === '𱼀') {
      newRes.push('⺼');
    } else if (r === '𭕄') {
      newRes.push('⺌');
    } else if (r === '𰀁') {
      newRes.push('二');
    } else if (r === '𰀪') {
      newRes.push('彡');
    } else if (r === '\uE816') {
      newRes.push('𠂇');
    } else if (r === '\uE818') {
      newRes.push('𠃌');
    } else if (r === '\uE848') {
      newRes.push('⻊');
    } else if (r === '\uE81C') {
      newRes.push('⺈');
    } else if (r === '𫩏') {
      newRes.push('日');
    } else if (r === '𧰨') {
      newRes.push('豕');
    } else if (r === '𧾷') {
      newRes.push('⻊');
    } else if (r === '𫶧') {
      newRes.push('川');
    } else if (r === '𤣩') {
      newRes.push('王');
    } else if (r === '𦥑') {
      newRes.push('臼');
    } else {
      newRes.push(r);
    }
  }
  return newRes;
};

// 先注册手工精修字根的简码字、键名字与专家校准字
LEVEL_1_CHARS.forEach(item => { attachMeta(item); WUBI_CHAR_MAP.set(item.char, item); });
KEY_NAME_CHARS.forEach(item => {
  if (!WUBI_CHAR_MAP.has(item.char)) { attachMeta(item); WUBI_CHAR_MAP.set(item.char, item); }
});
LEVEL_2_CHARS.forEach(item => {
  if (!WUBI_CHAR_MAP.has(item.char)) { attachMeta(item); WUBI_CHAR_MAP.set(item.char, item); }
});
EXPERT_CORRECTED_CHARS.forEach(item => {
  attachMeta(item);
  WUBI_CHAR_MAP.set(item.char, item);
});

export type RawDictTuple = [
  string, string, string, string, string, string, string, string, string[], string[], string[]
];

export const parseRawEntry = (r: RawDictTuple): WubiCharData => {
  const char = r[0];
  const existing = WUBI_CHAR_MAP.get(char);
  if (existing) {
    attachMeta(existing);
    return existing;
  }
  const c86 = r[2];
  const c98 = r[3] || r[2];
  const cNew = r[4] || r[2];
  const item: WubiCharData = {
    char,
    pinyin: r[1],
    pinyinPlain: stripTones(r[1]),
    code86: c86,
    code98: c98,
    codeNew: cNew,
    short86: r[5] || undefined,
    short98: r[6] || undefined,
    shortNew: r[7] || undefined,
    roots86: normalizeRoots(char, c86, r[8] || []),
    roots98: normalizeRoots(char, c98, r[9] || []),
    rootsNew: normalizeRoots(char, cNew, r[10] || [])
  };
  attachMeta(item);
  WUBI_CHAR_MAP.set(char, item);
  return item;
};

// 预加载并解析首屏 3,500 常用核心字库（极速启动，零延迟输入）
const parsedCommonChars: WubiCharData[] = (rawCommonDictData as unknown as RawDictTuple[]).map(parseRawEntry);

// 常用字级分类导出
export const COMMON_500_CHARS: WubiCharData[] = parsedCommonChars.slice(0, 500);
export const COMMON_1500_CHARS: WubiCharData[] = parsedCommonChars.slice(0, 1500);
export const COMMON_2500_CHARS: WubiCharData[] = parsedCommonChars.slice(0, 2500);
export const COMMON_3500_CHARS: WubiCharData[] = parsedCommonChars.slice(0, 3500);
export const COMMON_CHARS: WubiCharData[] = COMMON_3500_CHARS;

let fullParsedCharsCache: WubiCharData[] | null = null;

/**
 * 异步动态加载并解析全量 28,058 汉字字典（用于写入本地 IndexedDB 及后台字库补齐）
 */
export const loadFullParsedChars = async (): Promise<WubiCharData[]> => {
  if (fullParsedCharsCache) return fullParsedCharsCache;
  const { rawDictData } = await import('./wubiFullDictData');
  const allChars = (rawDictData as unknown as RawDictTuple[]).map(parseRawEntry);
  fullParsedCharsCache = allChars;
  return allChars;
};

// 根据汉字同步反查五笔数据（优先内存常用字库）
export const lookupWubiChar = (char: string): WubiCharData | undefined => {
  return WUBI_CHAR_MAP.get(char);
};

/**
 * 异步全量反查五笔数据（内存若无，则自动向本地 IndexedDB 检索并实时回填内存）
 */
export const lookupWubiCharAsync = async (char: string): Promise<WubiCharData | undefined> => {
  const syncFound = WUBI_CHAR_MAP.get(char);
  if (syncFound) return syncFound;
  try {
    const { queryByChar } = await import('./wubiDb');
    const dbFound = await queryByChar(char);
    if (dbFound) {
      WUBI_CHAR_MAP.set(char, dbFound);
      return dbFound;
    }
  } catch (e) {
    console.warn('[wubiDict] lookupWubiCharAsync failed for', char, e);
  }
  return undefined;
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

// 部件文字描述标签到标准单一汉字字根字符的规范映射
export const ROOT_GLYPH_NORMALIZE: Record<string, string> = {
  '水侧': '氺',
  '氺侧': '氺',
  '牛前': '𠂉',
  '京头': '亠',
  '尤前': '𠂇',
  '艮下': '𧘇',
  '艮底': '𧘇',
  '羊后': '羊',
  '乐头': '𠂉',
  '立头': '立',
  '光头': '⺌',
  '具头': '目',
  '隹右': '主',
  '兴头': '⺍',
  '長头': '髟',
  '四竖': '丨',
  '鱼头': '⺈',
  '衣示旁': '礻',
  '马前': '马',
  '乡前': '幺',
  '舟底': '丹',
  '祭头': '祭头',
  '母框': '⺟',
  '皮前': '皮',
  '虎头': '虍',
  '互框': '互',
  '咼头': '冂',
  '骨头': '冎',
  '革后': '十',
  '凸头': '凸',
  '県头': '目',
  '豸头': '爫',
  '豸底': '豕',
  '犭前': '犭',
  '𬼖框': '勹',
  '婁头': '曲',
  '虛底头': '业',
  '蒐中': '甶',
  '无尾鱼': '⺈田',
  '祭字头': '祭头'
};

// 特殊/易混淆字根直观中文注释映射
export const ROOT_NAME_MAP: Record<string, string> = {
  '⺈田': '无尾鱼',
  '\ue131': '无尾鱼',
  '⺈': '鱼头/角头',
  '祭头': '祭字头',
  '冎': '骨字头',
  '⺼': '肉月旁',
  '⺌': '小字头',
  '⺍': '学字头',
  '豕': '豕字底',
  '癶': '登字头',
  '虍': '虎字头',
  '⻊': '足字旁',
  '𠂉': '撇两横',
  '𠂇': '左字头',
  '氺': '水侧',
  '龰': '止底',
  '覀': '西字头',
  '彐': '雪底',
  '纟': '绞丝旁',
  '匚': '区字框',
  '也': '也字根',
  '彡': '三撇'
};

export const getRootName = (root: string): string => {
  return ROOT_NAME_MAP[root] || '';
};

/**
 * 深入解析单字的标准字根拆解与末笔识别码
 */
export const getCharBreakdown = (charData: WubiCharData, version: WubiVersion): CharBreakdownInfo => {
  let rawRoots: string[] = [];
  switch (version) {
    case '98':
      rawRoots = charData.roots98 || [];
      break;
    case 'newCentury':
      rawRoots = charData.rootsNew || [];
      break;
    case '86':
    default:
      rawRoots = charData.roots86 || [];
      break;
  }

  // 规范化字根标签，将“水侧”等描述性词语转换为对应标准字形“氺”
  const roots = rawRoots.map(r => ROOT_GLYPH_NORMALIZE[r] || r);

  const fullCode = getFullCode(charData, version).toUpperCase();

  // 是否属于键名字 (如 工 AAAA, 王 GGGG) 或 单笔画 (如 一 GGLL, 乙 NNLL)
  const isKeyName = charData.type === 'keyname' || 
    (roots.length === 1 && fullCode.length === 4 && fullCode[0] === fullCode[1] && fullCode[1] === fullCode[2] && fullCode[2] === fullCode[3]) ||
    ['GGLL', 'HHLL', 'TTLL', 'YYLL', 'NNLL'].includes(fullCode);

  if (roots && roots.length > 0) {
    let recognitionCode: string | undefined = undefined;
    // 识别码判定：
    // 1. 汉字拆出 4 个或 4 个以上字根时，各码均为真实字根，绝无末笔识别码！
    // 2. 只有当拆出字根少于 4 个、非键名/单笔画、且全码长度大于字根数时，全码末位才为交叉识别码
    if (!isKeyName && roots.length < 4 && fullCode.length > roots.length) {
      recognitionCode = charData.recognitionCode || fullCode[fullCode.length - 1];
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

  // 严正规避：生僻字若无确切字根数据，绝不捏造假字根（严禁把 A/B/V 盲目伪造成 工/子/女）
  return {
    roots: [],
    rootSteps: [],
    recognitionCode: charData.recognitionCode || (charData.recognitionFlag && fullCode.length < 4 ? fullCode[fullCode.length - 1] : undefined)
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
  return getCharBreakdown(charData, version).recognitionCode;
};

// 五笔末笔字型交叉识别码规则明细映射
const RECOGNITION_EXPLAIN_MAP: Record<string, string> = {
  'G': '末笔横 · 左右型',
  'F': '末笔横 · 上下型',
  'D': '末笔横 · 杂合型',
  'H': '末笔竖 · 左右型',
  'J': '末笔竖 · 上下型',
  'K': '末笔竖 · 杂合型',
  'T': '末笔撇 · 左右型',
  'R': '末笔撇 · 上下型',
  'E': '末笔撇 · 杂合型',
  'Y': '末笔点 · 左右型',
  'U': '末笔点 · 上下型',
  'I': '末笔点 · 杂合型',
  'N': '末笔折 · 左右型',
  'B': '末笔折 · 上下型',
  'V': '末笔折 · 杂合型',
};

// 获取识别码的字型与末笔拆解说明（优先展示权威规则描述，如“折·杂合〔乛 ⿻〕”或“末笔折 · 杂合型”）
export const getRecognitionCodeExplain = (code: string | undefined, flag?: string): string => {
  if (flag) return flag;
  if (!code) return '';
  return RECOGNITION_EXPLAIN_MAP[code.toUpperCase()] || '';
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
