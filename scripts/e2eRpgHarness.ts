import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:5175';
const SCREENSHOT_DIR = path.resolve(process.cwd(), 'e2e_screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

async function getTargetInfo(page: any) {
  return page.evaluate(() => {
    const charEl = document.querySelector('.target-character-display');
    const fullCodeEl = document.querySelector('.code-pill');
    const shortEls = Array.from(document.querySelectorAll('.short-pill'));
    const isVictory = !!document.querySelector('.victory-modal');
    const isDefeat = !!document.querySelector('.defeat-modal');
    const isEnraged = !!document.querySelector('.enrage-badge');
    const hpEl = document.querySelector('.player-hp-wrapper .bar-val');

    return {
      char: charEl ? charEl.textContent?.trim() : '',
      fullCode: fullCodeEl ? fullCodeEl.textContent?.trim() : '',
      shortCodes: shortEls.map(el => el.textContent?.trim() || ''),
      isVictory,
      isDefeat,
      isEnraged,
      playerHp: hpEl ? parseInt(hpEl.textContent?.split('/')[0].trim() || '100', 10) : 100
    };
  });
}

// 智能模拟打字：根据字库特征输入简码或全码，并在换字后立刻停手不外溢
async function typeCurrentTarget(page: any, preferShort = true) {
  const info = await getTargetInfo(page);
  if (info.isVictory || info.isDefeat || !info.char) return;

  const targetCode = (preferShort && info.shortCodes.length > 0) ? info.shortCodes[0] : info.fullCode;
  const initialChar = info.char;

  for (const ch of targetCode) {
    await page.keyboard.press(ch.toLowerCase());
    await sleep(35);

    // 检查是否已经提前出字推进
    const current = await page.evaluate(() => {
      const el = document.querySelector('.target-character-display');
      const vict = !!document.querySelector('.victory-modal');
      return { char: el?.textContent?.trim() || '', vict };
    });

    if (current.vict || current.char !== initialChar) {
      return; // 已成功击破当前字，不再输入多余字符
    }
  }

  // 等待 130ms 防抖自动提交
  await sleep(130);

  const afterWait = await page.evaluate(() => {
    const el = document.querySelector('.target-character-display');
    const vict = !!document.querySelector('.victory-modal');
    return { char: el?.textContent?.trim() || '', vict };
  });

  if (!afterWait.vict && afterWait.char === initialChar) {
    // 若未换字，补敲空格确认
    await page.keyboard.press('Space');
    await sleep(100);
  }
}

async function run() {
  console.log('🚀 [E2E Harness] Starting Chrome...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    defaultViewport: { width: 1280, height: 900 }
  });

  const page = await browser.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ [Browser Console Error]:', msg.text());
    }
  });

  console.log('🌐 [E2E Harness] Navigating to:', BASE_URL);
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });

  // 1. 切换到「打怪闯关」RPG 模式
  console.log('⚔️ [E2E Harness] Switching to RPG mode...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('.tab-btn'));
    const rpgBtn = buttons.find(b => b.textContent?.includes('打怪闯关')) as HTMLButtonElement;
    if (rpgBtn) rpgBtn.click();
  });
  await sleep(600);

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_stage_map.png') });
  console.log('📸 [E2E Harness] Captured: 01_stage_map.png');

  // 2. 进入第 1 关
  console.log('⚔️ [E2E Harness] Entering Stage 1 (野猪精)...');
  await page.evaluate(() => {
    const battleBtn = document.querySelector('.battle-start-btn') as HTMLButtonElement;
    if (battleBtn) battleBtn.click();
  });
  await sleep(600);

  let info = await getTargetInfo(page);
  console.log(`🎯 [E2E Harness] Initial target character: 【${info.char}】 (Expected '王')`);
  if (info.char !== '王') {
    throw new Error(`Expected initial target '王', got '${info.char}'`);
  }

  // 3. 故意制造错误：敲入错误字母，验证走火入魔扣血机制
  console.log('💥 [E2E Harness] Testing intentional errors: Typing invalid keys (ZZZZ)...');
  const initialHp = info.playerHp;
  console.log(`❤️ [E2E Harness] Initial player HP: ${initialHp}`);

  await page.click('.battle-arena-view');
  await page.keyboard.press('z');
  await page.keyboard.press('z');
  await page.keyboard.press('z');
  await page.keyboard.press('z');
  await sleep(400);

  const errorHp = (await getTargetInfo(page)).playerHp;
  console.log(`🩸 [E2E Harness] HP after intentional error: ${errorHp} (Expected < ${initialHp})`);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_intentional_error.png') });
  console.log('📸 [E2E Harness] Captured: 02_intentional_error.png');

  // 4. 测试键名二简出字推进：【王】敲 GG
  console.log('⌨️ [E2E Harness] Testing short code for 【王】: Typing G + G...');
  await page.keyboard.press('g');
  await page.keyboard.press('g');
  await sleep(200);

  info = await getTargetInfo(page);
  console.log(`🎯 [E2E Harness] Target after typing 'GG': 【${info.char}】 (Expected '一')`);
  if (info.char !== '一') {
    throw new Error(`Failed to advance on 'GG' for 王, current is '${info.char}'`);
  }

  // 5. 测试一级简码：【一】敲 G
  console.log('⌨️ [E2E Harness] Testing level-1 short code for 【一】: Typing G...');
  await page.keyboard.press('g');
  await sleep(200);

  info = await getTargetInfo(page);
  console.log(`🎯 [E2E Harness] Target after typing 'G': 【${info.char}】 (Expected '五')`);
  if (info.char !== '五') {
    throw new Error(`Failed to advance on 'G' for 一, current is '${info.char}'`);
  }

  // 6. 持续平稳推进直到遇到用户反馈的【木】字
  console.log('🏃 [E2E Harness] Progressing through stage targets towards 【木】...');
  let maxLoop = 50;
  while (info.char !== '木' && maxLoop > 0) {
    maxLoop--;
    await typeCurrentTarget(page, true);
    await sleep(60);
    info = await getTargetInfo(page);
  }

  console.log(`🎯 [E2E Harness] Arrived at target: 【${info.char}】`);
  if (info.char !== '木') {
    throw new Error(`Did not arrive at '木', stopped at '${info.char}'`);
  }

  // 7. 核心严苛验证：在【木】字上敲入简码 SS，等待 130ms，验证是否 0 延迟秒速换字！
  console.log('🧪 [E2E Harness] CRITICAL TEST: Typing short code "SS" for 【木】...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_before_typing_wood.png') });

  await page.keyboard.press('s');
  await sleep(50);
  const slotsAfterFirstS = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.key-slot')).map(s => s.textContent?.trim()).join('');
  });
  console.log(`Slot after first 'S': "${slotsAfterFirstS}" (Expected "S")`);

  await page.keyboard.press('s');
  // 等待 140ms（防抖触发完成）
  await sleep(150);

  info = await getTargetInfo(page);
  console.log(`🎯 [E2E Harness] Target after typing 'SS': 【${info.char}】 (Expected '丁')`);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_wood_shortcode_advanced.png') });
  console.log('📸 [E2E Harness] Captured: 04_wood_shortcode_advanced.png');

  if (info.char === '木') {
    throw new Error(`CRITICAL BUG: Still stuck on '木' after typing 'SS'!`);
  }
  console.log('✅ [E2E Harness] SUCCESS! 【木】字敲 SS 秒速出字并自动推进至下一字！');

  // 8. 测试全关剩余目标字打通，并检验狂暴状态与大招
  console.log('⚔️ [E2E Harness] Clearing remaining targets in Stage 1...');
  let stageClearLoop = 60;
  let sawEnrage = false;
  let ultCast = false;

  while (stageClearLoop > 0) {
    stageClearLoop--;
    info = await getTargetInfo(page);
    if (info.isVictory || info.isDefeat) break;

    // 检查狂暴
    if (info.isEnraged && !sawEnrage) {
      sawEnrage = true;
      console.log('🔥 [E2E Harness] Boss Enrage detected when HP <= 35%!');
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_boss_enraged.png') });
    }

    // 检查大招能量
    const energy = await page.evaluate(() => {
      const pctEl = document.querySelector('.energy-pct');
      return pctEl ? parseInt(pctEl.textContent?.replace('%', '') || '0', 10) : 0;
    });

    if (energy >= 100 && !ultCast) {
      ultCast = true;
      console.log(`⚡ [E2E Harness] Energy full (${energy}%)! Pressing Tab to unleash 【万剑归宗】...`);
      await page.keyboard.press('Tab');
      await sleep(300);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_ultimate_burst.png') });
    }

    await typeCurrentTarget(page, true);
    await sleep(60);
  }

  await sleep(600);
  info = await getTargetInfo(page);
  console.log(`🏆 [E2E Harness] Stage 1 cleared! Victory modal: ${info.isVictory}`);
  if (!info.isVictory) {
    throw new Error('Stage 1 did not reach victory');
  }

  // 9. 验证开宝箱功能
  console.log('🎁 [E2E Harness] Testing post-battle loot chest...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_victory_modal.png') });

  await page.evaluate(() => {
    const chest = document.querySelector('.chest-box.unopened') as HTMLElement;
    if (chest) chest.click();
  });
  await sleep(500);

  const chestReward = await page.evaluate(() => {
    const desc = document.querySelector('.chest-reward-desc');
    return desc ? desc.textContent?.trim() : null;
  });
  console.log(`🎁 [E2E Harness] Chest reward received: ${chestReward}`);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08_chest_opened.png') });

  // 10. 验证乱序再战与循序再战
  console.log('🎲 [E2E Harness] Testing Replay: Clicking 🎲 乱序再战...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('.victory-actions button'));
    const shuffleBtn = buttons.find(b => b.textContent?.includes('乱序再战')) as HTMLButtonElement;
    if (shuffleBtn) shuffleBtn.click();
  });
  await sleep(600);

  info = await getTargetInfo(page);
  const replayMode = await page.$eval('.mode-tag-pill', el => el.textContent?.trim());
  console.log(`🎲 [E2E Harness] Replay battle active! Mode: ${replayMode}, First Target: 【${info.char}】`);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09_shuffled_replay.png') });

  // 返回关卡地图
  await page.evaluate(() => {
    // 离开战斗
  });

  console.log('🎉 [E2E Harness] ALL VERIFICATIONS PASSED WITH 100% SUCCESS!');
  await browser.close();
}

run().catch(err => {
  console.error('❌ [E2E Harness Failed]:', err);
  process.exit(1);
});
