import Dexie, { type Table } from 'dexie';
import type { WubiCharData, WubiVersion, MistakeRecord } from '../types/wubi';

export interface DbMetaItem {
  key: string;
  value: any;
}

export class WubiDatabase extends Dexie {
  chars!: Table<WubiCharData, string>;
  meta!: Table<DbMetaItem, string>;
  mistakes!: Table<MistakeRecord, string>;

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
    this.version(3).stores({
      chars: 'char, code86, code98, codeNew, pinyin, pinyinPlain, strokes, radical',
      meta: 'key',
      mistakes: 'char, count, lastErrorTime'
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
 * 将内存精修字典（EXPERT_CORRECTED_CHARS + normalizeRoots 修正）同步回 IndexedDB。
 * 使用 corrections_v1 标记防止重复执行；每次新增精修时升级版本号。
 * 仅更新受影响字符，耗时极短（< 5ms）。
 */
export const applyDbCorrections = async (): Promise<void> => {
  try {
    const CORRECTIONS_KEY = 'corrections_v1';
    const already = await db.meta.get(CORRECTIONS_KEY);
    if (already && already.value === true) return;

    const { WUBI_CHAR_MAP, EXPERT_CORRECTED_CHARS } = await import('./wubiDict');

    // 自动纳入所有 EXPERT_CORRECTED_CHARS 专家校准字，以及 normalizeRoots 规则7纠正的业/亚部字
    const RULE_CORRECTED_CHARS = [
      '晋', '亚', '业', '恶', '严', '哑', '娅', '垩', '垭', '戬', '桠', '痖', '鄑', '挜'
    ];
    const allTargetChars = new Set([
      ...RULE_CORRECTED_CHARS,
      ...EXPERT_CORRECTED_CHARS.map(c => c.char)
    ]);

    const toUpdate: WubiCharData[] = [];
    for (const ch of allTargetChars) {
      const corrected = WUBI_CHAR_MAP.get(ch);
      if (corrected) toUpdate.push(corrected);
    }

    if (toUpdate.length > 0) {
      await db.chars.bulkPut(toUpdate);
      console.log(`[WubiDb] 精修字根补丁已写入 IndexedDB，共更新 ${toUpdate.length} 字`);
    }

    await db.meta.put({ key: CORRECTIONS_KEY, value: true });
  } catch (e) {
    console.warn('[WubiDb] applyDbCorrections error:', e);
  }
};

/**
 * 按单个汉字查询。
 * 优先级：内存 WUBI_CHAR_MAP（含 EXPERT_CORRECTED_CHARS 精修）> IndexedDB 缓存 > 兜底
 * 这样可保证字根纠正等精修数据永远生效，不被旧 DB 缓存覆盖。
 */
export const queryByChar = async (char: string): Promise<WubiCharData | undefined> => {
  // 1. 优先查内存精修字典（EXPERT_CORRECTED_CHARS 已在模块初始化时写入 WUBI_CHAR_MAP）
  const { WUBI_CHAR_MAP, lookupWubiChar } = await import('./wubiDict');
  const inMemory = WUBI_CHAR_MAP.get(char);
  if (inMemory) return inMemory;

  // 2. 内存不存在（生僻字），再查 IndexedDB
  try {
    const item = await db.chars.get(char);
    if (item) return item;
  } catch (e) {
    console.warn(`[WubiDb] queryByChar error for ${char}:`, e);
  }

  // 3. 兜底：从全量内存字典查
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

/**
 * 获取 IndexedDB 中全部错题，默认按最近出错时间倒序排列
 */
export const getDbMistakes = async (): Promise<MistakeRecord[]> => {
  try {
    return await db.mistakes.orderBy('lastErrorTime').reverse().toArray();
  } catch (err) {
    console.warn('[WubiDb] 获取数据库错题失败:', err);
    return [];
  }
};

/**
 * 记录/更新错题至 IndexedDB
 */
export const saveDbMistake = async (
  char: string,
  errorCode: string,
  correctCode: string,
  roots: string[]
): Promise<MistakeRecord> => {
  try {
    const existing = await db.mistakes.get(char);
    const now = Date.now();
    let record: MistakeRecord;
    if (existing) {
      const errorCodes = existing.errorCodes.includes(errorCode)
        ? existing.errorCodes
        : [...existing.errorCodes, errorCode];
      record = {
        ...existing,
        count: existing.count + 1,
        lastErrorTime: now,
        errorCodes,
        correctCode: correctCode || existing.correctCode,
        roots: (roots && roots.length > 0) ? roots : existing.roots
      };
    } else {
      record = {
        char,
        errorCodes: errorCode ? [errorCode] : [],
        correctCode,
        roots: roots || [],
        count: 1,
        lastErrorTime: now
      };
    }
    await db.mistakes.put(record);
    return record;
  } catch (err) {
    console.warn('[WubiDb] 写入错题至数据库失败:', err);
    return {
      char,
      errorCodes: errorCode ? [errorCode] : [],
      correctCode,
      roots: roots || [],
      count: 1,
      lastErrorTime: Date.now()
    };
  }
};

/**
 * 从 IndexedDB 移除错题（已掌握）
 */
export const removeDbMistake = async (char: string): Promise<void> => {
  try {
    await db.mistakes.delete(char);
  } catch (err) {
    console.warn('[WubiDb] 从数据库移除错题失败:', err);
  }
};

/**
 * 清空 IndexedDB 所有错题
 */
export const clearDbMistakes = async (): Promise<void> => {
  try {
    await db.mistakes.clear();
  } catch (err) {
    console.warn('[WubiDb] 清空数据库错题失败:', err);
  }
};

/**
 * 将旧版 localStorage 错题平滑自动迁移到 IndexedDB（仅首次无感执行，零数据丢失）
 */
export const migrateMistakesFromLocalStorage = async (): Promise<MistakeRecord[]> => {
  try {
    const migrated = await db.meta.get('mistakes_migrated_v1');
    if (migrated && migrated.value === true) {
      return await getDbMistakes();
    }

    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('wubi_mistakes') : null;
    if (raw) {
      const list: MistakeRecord[] = JSON.parse(raw);
      if (Array.isArray(list) && list.length > 0) {
        await db.mistakes.bulkPut(list);
        console.log(`[WubiDb] 成功从 localStorage 自动迁移 ${list.length} 条错题至 IndexedDB！`);
      }
    }

    await db.meta.put({ key: 'mistakes_migrated_v1', value: true });
    return await getDbMistakes();
  } catch (err) {
    console.warn('[WubiDb] 迁移 localStorage 错题至数据库失败:', err);
    return [];
  }
};
