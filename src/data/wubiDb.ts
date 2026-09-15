import Dexie, { type Table } from 'dexie';
import type { WubiCharData, WubiVersion } from '../types/wubi';

export interface DbMetaItem {
  key: string;
  value: any;
}

export class WubiDatabase extends Dexie {
  chars!: Table<WubiCharData, string>;
  meta!: Table<DbMetaItem, string>;

  constructor() {
    super('WubiMasterDB');
    this.version(1).stores({
      chars: 'char, code86, code98, codeNew, pinyin, strokes, radical',
      meta: 'key'
    });
    this.version(2).stores({
      chars: 'char, code86, code98, codeNew, pinyin, pinyinPlain, strokes, radical',
      meta: 'key'
    });
  }
}

export const db = new WubiDatabase();

let isPopulating = false;
let populatePromise: Promise<boolean> | null = null;

/**
 * 检查数据库中是否已写入全量汉字数据
 */
export const isDbPopulated = async (): Promise<boolean> => {
  try {
    const meta = await db.meta.get('populated_v2');
    if (meta && meta.value === true) return true;
    const count = await db.chars.count();
    return count >= 20000;
  } catch (e) {
    console.warn('[WubiDb] isDbPopulated check error:', e);
    return false;
  }
};

/**
 * 确保数据库已初始化并写入全量字库数据（异步后台加载，零阻塞首屏）
 */
export const ensureDictPopulated = async (
  onProgress?: (percent: number) => void
): Promise<boolean> => {
  if (await isDbPopulated()) {
    if (onProgress) onProgress(100);
    return true;
  }

  if (populatePromise) {
    return populatePromise;
  }

  populatePromise = (async () => {
    if (isPopulating) return true;
    isPopulating = true;
    try {
      console.log('[WubiDb] 正在后台异步初始化全量五笔数据库...');
      // 动态载入全量字典模块，实现主包代码分割 (Code-Splitting)
      const { loadFullParsedChars } = await import('./wubiDict');
      const allChars = await loadFullParsedChars();
      const total = allChars.length;
      const CHUNK_SIZE = 2500;

      for (let i = 0; i < total; i += CHUNK_SIZE) {
        const chunk = allChars.slice(i, i + CHUNK_SIZE);
        await db.chars.bulkPut(chunk);
        const percent = Math.min(100, Math.round(((i + chunk.length) / total) * 100));
        if (onProgress) onProgress(percent);
      }

      await db.meta.put({ key: 'populated_v2', value: true });
      await db.meta.put({ key: 'last_sync_time', value: Date.now() });
      console.log(`[WubiDb] 全量五笔数据库写入完成，共计 ${total} 汉字！`);
      return true;
    } catch (err) {
      console.error('[WubiDb] 写入全量五笔数据库失败:', err);
      return false;
    } finally {
      isPopulating = false;
    }
  })();

  return populatePromise;
};

/**
 * 按单个汉字查询（优先查本地 IndexedDB，若无查内存）
 */
export const queryByChar = async (char: string): Promise<WubiCharData | undefined> => {
  try {
    const item = await db.chars.get(char);
    if (item) return item;
  } catch (e) {
    console.warn(`[WubiDb] queryByChar error for ${char}:`, e);
  }
  const { lookupWubiChar } = await import('./wubiDict');
  return lookupWubiChar(char);
};

/**
 * 按完整五笔编码反查汉字（支持 86 / 98 / 新世纪）
 */
export const queryByExactCode = async (
  code: string,
  version: WubiVersion = '86'
): Promise<WubiCharData[]> => {
  try {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return [];
    const indexField = version === '98' ? 'code98' : version === 'newCentury' ? 'codeNew' : 'code86';
    return await db.chars.where(indexField).equals(cleanCode).toArray();
  } catch (e) {
    console.warn('[WubiDb] queryByExactCode error:', e);
    return [];
  }
};

/**
 * 五笔编码前缀实时联想（输入 1~4 位字母，瞬间列出所有候选字）
 */
export const queryByCodePrefix = async (
  prefix: string,
  version: WubiVersion = '86',
  limit = 50
): Promise<WubiCharData[]> => {
  try {
    const cleanPrefix = prefix.trim().toUpperCase();
    if (!cleanPrefix) return [];
    const indexField = version === '98' ? 'code98' : version === 'newCentury' ? 'codeNew' : 'code86';
    return await db.chars
      .where(indexField)
      .startsWith(cleanPrefix)
      .limit(limit)
      .toArray();
  } catch (e) {
    console.warn('[WubiDb] queryByCodePrefix error:', e);
    return [];
  }
};

/**
 * 按拼音检索候选汉字（基于纯字母拼音索引）
 */
export const queryByPinyin = async (
  pinyin: string,
  limit = 50
): Promise<WubiCharData[]> => {
  try {
    const clean = pinyin.trim().toLowerCase();
    if (!clean) return [];
    return await db.chars
      .where('pinyinPlain')
      .startsWith(clean)
      .limit(limit)
      .toArray();
  } catch (e) {
    console.warn('[WubiDb] queryByPinyin error:', e);
    return [];
  }
};

export interface MultiModalSearchResult {
  mode: 'char' | 'code' | 'pinyin' | 'empty';
  keyword: string;
  results: WubiCharData[];
  exactMatch?: WubiCharData;
}

/**
 * 智能多模态搜索调度器：
 * 自动识别用户意图（输入汉字 ➔ 查字；输入编码 ➔ 查码与前缀联想；输入拼音 ➔ 拼音反查）
 */
export const searchMultiModal = async (
  input: string,
  version: WubiVersion = '86',
  limit = 60
): Promise<MultiModalSearchResult> => {
  const kw = input.trim();
  if (!kw) {
    return { mode: 'empty', keyword: '', results: [] };
  }

  // 1. 若包含汉字，按汉字序列提取查询
  const chineseChars = kw.match(/[\u4e00-\u9fa5]/g);
  if (chineseChars && chineseChars.length > 0) {
    const results: WubiCharData[] = [];
    for (const ch of chineseChars) {
      const found = await queryByChar(ch);
      if (found && !results.some(r => r.char === found.char)) {
        results.push(found);
      }
    }
    return {
      mode: 'char',
      keyword: kw,
      results,
      exactMatch: results[0]
    };
  }

  // 2. 若全是纯英文字母
  const isPureAlpha = /^[a-zA-Z]+$/.test(kw);
  if (isPureAlpha) {
    const upper = kw.toUpperCase();

    // 优先按五笔编码检索（1~4 位字母）
    if (upper.length <= 4) {
      // 既查完全相等的全码/简码字，又查以此为前缀的联想字
      const exacts = await queryByExactCode(upper, version);
      const prefixes = await queryByCodePrefix(upper, version, limit);

      // 合并并去重（完全匹配置顶）
      const combined: WubiCharData[] = [...exacts];
      for (const p of prefixes) {
        if (!combined.some(c => c.char === p.char)) {
          combined.push(p);
        }
      }

      // 如果 DB 写入尚未完成或结果偏少，从内存常用字库中补充匹配
      if (combined.length < limit) {
        const { WUBI_CHAR_MAP, getFullCode, getShortCode } = await import('./wubiDict');
        for (const item of WUBI_CHAR_MAP.values()) {
          const code = getFullCode(item, version).toUpperCase();
          const short = (getShortCode(item, version) || '').toUpperCase();
          if (code === upper || short === upper) {
            if (!combined.some(c => c.char === item.char)) combined.unshift(item);
          } else if (code.startsWith(upper) || short.startsWith(upper)) {
            if (!combined.some(c => c.char === item.char)) combined.push(item);
          }
          if (combined.length >= limit) break;
        }
      }

      if (combined.length > 0) {
        return {
          mode: 'code',
          keyword: upper,
          results: combined.slice(0, limit),
          exactMatch: exacts[0] || combined[0]
        };
      }
    }

    // 若按编码查无结果，或字母长度大于4，尝试按拼音检索
    const pLower = kw.toLowerCase();
    let pinyinResults = await queryByPinyin(pLower, limit);

    // 拼音内存 fallback
    if (pinyinResults.length < limit) {
      const { WUBI_CHAR_MAP } = await import('./wubiDict');
      for (const item of WUBI_CHAR_MAP.values()) {
        const plain = item.pinyinPlain || '';
        if (plain.startsWith(pLower) && !pinyinResults.some(r => r.char === item.char)) {
          pinyinResults.push(item);
          if (pinyinResults.length >= limit) break;
        }
      }
    }

    if (pinyinResults.length > 0) {
      return {
        mode: 'pinyin',
        keyword: pLower,
        results: pinyinResults.slice(0, limit),
        exactMatch: pinyinResults[0]
      };
    }
  }

  return { mode: 'empty', keyword: kw, results: [] };
};
