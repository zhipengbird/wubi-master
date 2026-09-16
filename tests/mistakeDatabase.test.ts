import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';

describe('错题本 IndexedDB 数据库及无损迁移测试', () => {
  let db: any;
  let getDbMistakes: any;
  let saveDbMistake: any;
  let removeDbMistake: any;
  let clearDbMistakes: any;
  let migrateMistakesFromLocalStorage: any;

  beforeEach(async () => {
    const wubiDb = await import('../src/data/wubiDb');
    db = wubiDb.db;
    getDbMistakes = wubiDb.getDbMistakes;
    saveDbMistake = wubiDb.saveDbMistake;
    removeDbMistake = wubiDb.removeDbMistake;
    clearDbMistakes = wubiDb.clearDbMistakes;
    migrateMistakesFromLocalStorage = wubiDb.migrateMistakesFromLocalStorage;

    await clearDbMistakes();
    await db.meta.delete('mistakes_migrated_v1');
  });

  it('一、基础 CRUD 功能验证 > 新增错题应成功持久化且主键为汉字', async () => {
    const record = await saveDbMistake('极', 'SN', 'SE', ['木', '及']);
    expect(record.char).toBe('极');
    expect(record.count).toBe(1);
    expect(record.correctCode).toBe('SE');
    expect(record.errorCodes).toEqual(['SN']);
    expect(record.roots).toEqual(['木', '及']);

    const list = await getDbMistakes();
    expect(list.length).toBe(1);
    expect(list[0].char).toBe('极');
  });

  it('二、累加更新测试 > 再次击错同个字时频次累加、更新时间并合并击错编码', async () => {
    await saveDbMistake('速', 'GK', 'GKI', ['束', '辶']);
    const updated = await saveDbMistake('速', 'SK', 'GKI', ['束', '辶']);

    expect(updated.count).toBe(2);
    expect(updated.errorCodes).toContain('GK');
    expect(updated.errorCodes).toContain('SK');
    expect(updated.errorCodes.length).toBe(2);

    const fromDb = await db.mistakes.get('速');
    expect(fromDb?.count).toBe(2);
  });

  it('三、错题移出（已掌握）测试 > 删除指定单字应从数据库中移出', async () => {
    await saveDbMistake('凹', 'H', 'MMGD', ['凹']);
    await saveDbMistake('凸', 'H', 'HGG', ['凸']);
    expect((await getDbMistakes()).length).toBe(2);

    await removeDbMistake('凹');
    const listAfter = await getDbMistakes();
    expect(listAfter.length).toBe(1);
    expect(listAfter[0].char).toBe('凸');
  });

  it('四、清空全部错题测试 > clearDbMistakes 彻底重置表数据', async () => {
    await saveDbMistake('汉', 'I', 'ICY', ['氵', '又']);
    await saveDbMistake('字', 'P', 'PBF', ['宀', '子']);
    expect((await getDbMistakes()).length).toBe(2);

    await clearDbMistakes();
    expect((await getDbMistakes()).length).toBe(0);
  });

  it('五、平滑无损自动迁移测试 > 从 localStorage 迁移老数据至 IndexedDB', async () => {
    const mockStorage: Record<string, string> = {
      wubi_mistakes: JSON.stringify([
        { char: '赵', errorCodes: ['FH'], correctCode: 'FHQ', roots: ['走', '乂'], count: 3, lastErrorTime: 1000 },
        { char: '钱', errorCodes: ['Q'], correctCode: 'QGG', roots: ['钅', '戋'], count: 1, lastErrorTime: 2000 }
      ])
    };

    (globalThis as any).localStorage = {
      getItem: (key: string) => mockStorage[key] || null,
      setItem: (key: string, val: string) => { mockStorage[key] = val; },
      removeItem: (key: string) => { delete mockStorage[key]; }
    };

    const migrated = await migrateMistakesFromLocalStorage();
    expect(migrated.length).toBe(2);

    const zhao = await db.mistakes.get('赵');
    expect(zhao).toBeDefined();
    expect(zhao?.count).toBe(3);
    expect(zhao?.correctCode).toBe('FHQ');

    const meta = await db.meta.get('mistakes_migrated_v1');
    expect(meta?.value).toBe(true);
  });
});
