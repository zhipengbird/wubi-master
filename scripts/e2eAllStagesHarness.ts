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
    const stageTitle = document.querySelector('.stage-tag-title')?.textContent?.trim() || '';
    const bossName = document.querySelector('.boss-name')?.textContent?.trim() || '';
    const hpEl = document.querySelector('.player-hp-wrapper .bar-val');

    return {
      char: charEl ? charEl.textContent?.trim() : '',
      fullCode: fullCodeEl ? fullCodeEl.textContent?.trim() : '',
      shortCodes: shortEls.map(el => el.textContent?.trim() || ''),
      isVictory,
      isDefeat,
      stageTitle,
      bossName,
      playerHp: hpEl ? parseInt(hpEl.textContent?.split('/')[0].trim() || '100', 10) : 100
    };
  });
}

async function typeCurrentTarget(page: any) {
  const info = await getTargetInfo(page);
  if (info.isVictory || info.isDefeat || !info.char) return;

  const targetCode = info.shortCodes.length > 0 ? info.shortCodes[0] : info.fullCode;
  const initialChar = info.char;

  for (const ch of targetCode) {
    await page.keyboard.press(ch.toLowerCase());
    await sleep(25);

    const current = await page.evaluate(() => {
      const el = document.querySelector('.target-character-display');
      const vict = !!document.querySelector('.victory-modal');
      return { char: el?.textContent?.trim() || '', vict };
    });

    if (current.vict || current.char !== initialChar) {
      return;
    }
  }

  await sleep(130);

  const afterWait = await page.evaluate(() => {
    const el = document.querySelector('.target-character-display');
    const vict = !!document.querySelector('.victory-modal');
    return { char: el?.textContent?.trim() || '', vict };
  });

  if (!afterWait.vict && afterWait.char === initialChar) {
    await page.keyboard.press('Space');
    await sleep(80);
  }
}

async function run() {
  console.log('🚀 [All Stages E2E] Starting Chrome...');
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

  console.log('🌐 [All Stages E2E] Navigating to:', BASE_URL);
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });

  // 切换到 RPG 模式
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('.tab-btn'));
    const rpgBtn = buttons.find(b => b.textContent?.includes('打怪闯关')) as HTMLButtonElement;
    if (rpgBtn) rpgBtn.click();
  });
  await sleep(600);

  // 开始第 1 关
  await page.evaluate(() => {
    const battleBtn = document.querySelector('.battle-start-btn') as HTMLButtonElement;
    if (battleBtn) battleBtn.click();
  });
  await sleep(600);

  // 循环打通 13 个关卡
  for (let stageNum = 1; stageNum <= 13; stageNum++) {
    let info = await getTargetInfo(page);
    console.log(`\n======================================================`);
    console.log(`⚔️ [Stage ${stageNum}] ${info.stageTitle} · 守卫：${info.bossName}`);
    console.log(`======================================================`);

    // 在每一关第 1 个字故意制造一次错误，检验该关的错误反馈
    console.log(`💥 [Stage ${stageNum}] Testing intentional error on first character 【${info.char}】...`);
    const beforeHp = info.playerHp;
    await page.keyboard.press('z');
    await page.keyboard.press('z');
    await page.keyboard.press('z');
    await page.keyboard.press('z');
    await sleep(350);

    const afterErrInfo = await getTargetInfo(page);
    console.log(`🩸 [Stage ${stageNum}] HP after error: ${afterErrInfo.playerHp} (Before: ${beforeHp})`);

    // 持续输入通关该关卡
    let targetCounter = 0;
    let stageGuardLoop = 70;

    while (stageGuardLoop > 0) {
      stageGuardLoop--;
      info = await getTargetInfo(page);
      if (info.isVictory || info.isDefeat) break;

      // 如果有大招能量则按 Tab 释放大招
      const energy = await page.evaluate(() => {
        const pctEl = document.querySelector('.energy-pct');
        return pctEl ? parseInt(pctEl.textContent?.replace('%', '') || '0', 10) : 0;
      });
      if (energy >= 100) {
        console.log(`⚡ [Stage ${stageNum}] Unleashing 【万剑归宗】大招斩灭！`);
        await page.keyboard.press('Tab');
        await sleep(300);
      }

      await typeCurrentTarget(page);
      targetCounter++;
      await sleep(40);
    }

    await sleep(600);
    info = await getTargetInfo(page);
    if (!info.isVictory) {
      throw new Error(`Stage ${stageNum} failed to achieve victory! Info: ${JSON.stringify(info)}`);
    }

    console.log(`🏆 [Stage ${stageNum}] VICTORY! Successfully defeated ${info.bossName}!`);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `stage_${stageNum}_victory.png`) });

    // 开宝箱
    await page.evaluate(() => {
      const chest = document.querySelector('.chest-box.unopened') as HTMLElement;
      if (chest) chest.click();
    });
    await sleep(400);

    if (stageNum < 13) {
      console.log(`➡️ [Stage ${stageNum}] Entering next stage...`);
      await page.evaluate(() => {
        const nextBtn = document.querySelector('.next-stage-btn') as HTMLButtonElement;
        if (nextBtn) nextBtn.click();
      });
      await sleep(600);
    } else {
      console.log(`👑 [All Stages E2E] CONGRATULATIONS! Fully completed all 13 stages!`);
    }
  }

  console.log('\n🎉🎉🎉 [All Stages E2E] ALL 13 STAGES COMPLETED & VERIFIED WITH 100% SUCCESS!');
  await browser.close();
}

run().catch(err => {
  console.error('❌ [All Stages E2E Failed]:', err);
  process.exit(1);
});
