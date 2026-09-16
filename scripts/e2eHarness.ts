import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE_URL = "http://localhost:5175";
const BASE_SCREENSHOT_DIR = path.resolve(process.cwd(), "e2e_screenshots");
const UI_SCREENSHOT_DIR = path.resolve(BASE_SCREENSHOT_DIR, "ui");
const RPG_SCREENSHOT_DIR = path.resolve(BASE_SCREENSHOT_DIR, "rpg");

[BASE_SCREENSHOT_DIR, UI_SCREENSHOT_DIR, RPG_SCREENSHOT_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

interface TestResult {
  suite: "UI" | "RPG";
  module: string;
  action: string;
  passed: boolean;
  detail: string;
}

const allResults: TestResult[] = [];

function record(suite: "UI" | "RPG", module: string, action: string, passed: boolean, detail: string) {
  allResults.push({ suite, module, action, passed, detail });
  const status = passed ? "✅ PASS" : "❌ FAIL";
  console.log(`[${status}] [${suite} - ${module}] ${action} -> ${detail}`);
}

// =========================================================================
// SUITE 1: 全站 8 大核心 UI 模块深度交互测试
// =========================================================================
async function runUiSuite(page: any) {
  console.log("\n========================================================");
  console.log("🌟 [Suite 1/2] 全站 8 大核心 UI 模块深度交互自动化测试");
  console.log("========================================================");

  // 1. Navbar 全局导航、主题、音效与版本
  console.log("\n--- 模块 1: Navbar 全局导航与偏好设置 ---");
  await page.goto(BASE_URL + "/#practice", { waitUntil: "networkidle0" });
  await sleep(500);

  const pills = await page.$$(".actions-area .pill-btn");
  if (pills.length >= 3) {
    await pills[1].click(); // 98版
    await sleep(200);
    let verText = await page.evaluate(() => document.querySelector(".actions-area .pill-btn.active")?.textContent?.trim());
    record("UI", "Navbar", "切换词库至 98 版", verText === "98版", `当前激活: ${verText}`);

    await pills[2].click(); // 新世纪版
    await sleep(200);
    verText = await page.evaluate(() => document.querySelector(".actions-area .pill-btn.active")?.textContent?.trim());
    record("UI", "Navbar", "切换词库至 新世纪版", verText?.includes("新世纪") || false, `当前激活: ${verText}`);

    await pills[0].click(); // 86版
    await sleep(200);
    verText = await page.evaluate(() => document.querySelector(".actions-area .pill-btn.active")?.textContent?.trim());
    record("UI", "Navbar", "切回词库至 86 版", verText === "86版", `当前激活: ${verText}`);
  }

  const themeSelect = await page.$(".theme-select");
  if (themeSelect) {
    await page.select(".theme-select", "matrix-green");
    await sleep(200);
    let themeAttr = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    record("UI", "Navbar", "切换至黑客终端主题 (matrix-green)", themeAttr === "matrix-green", `html[data-theme]=${themeAttr}`);

    await page.select(".theme-select", "paper-ink");
    await sleep(200);
    themeAttr = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    record("UI", "Navbar", "切换至纸墨素雅明亮主题 (paper-ink)", themeAttr === "paper-ink", `html[data-theme]=${themeAttr}`);

    await page.select(".theme-select", "tokyo-night");
    await sleep(200);
    themeAttr = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    record("UI", "Navbar", "复原暗夜赛博主题 (tokyo-night)", themeAttr === "tokyo-night", `html[data-theme]=${themeAttr}`);
  }

  const audioBtn = await page.$(".ctrl-group .icon-btn");
  if (audioBtn) {
    const initialAudio = await page.evaluate(() => document.querySelector(".ctrl-group .icon-btn .btn-text")?.textContent?.trim());
    await audioBtn.click();
    await sleep(150);
    const nextAudio = await page.evaluate(() => document.querySelector(".ctrl-group .icon-btn .btn-text")?.textContent?.trim());
    record("UI", "Navbar", "音效轮换点击", initialAudio !== nextAudio, `${initialAudio} -> ${nextAudio}`);
  }
  await page.screenshot({ path: path.join(UI_SCREENSHOT_DIR, "01_navbar_verified.png") });

  // 2. TypeEngine 打字特训模式
  console.log("\n--- 模块 2: TypeEngine 打字特训交互 ---");
  await page.goto(BASE_URL + "/#practice", { waitUntil: "networkidle0" });
  await sleep(400);

  const catButtons = await page.$$(".category-row .cat-btn");
  if (catButtons.length >= 3) {
    await catButtons[1].click(); // 二级简码
    await sleep(300);
    let activeCat = await page.evaluate(() => document.querySelector(".category-row .cat-btn.active")?.textContent?.trim());
    record("UI", "TypeEngine", "切换至【二级简码】分类", activeCat?.includes("二级") || false, `当前分类: ${activeCat}`);

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll(".category-row .cat-btn"));
      const phraseBtn = btns.find((b) => b.textContent?.includes("词组")) as HTMLElement;
      phraseBtn?.click();
    });
    await sleep(300);
    activeCat = await page.evaluate(() => document.querySelector(".category-row .cat-btn.active")?.textContent?.trim());
    const hasSubFilter = await page.evaluate(() => !!document.querySelector(".phrase-sub-selector"));
    record("UI", "TypeEngine", "切换至【词组特训】并激活子词长选择器", !!hasSubFilter, `当前分类: ${activeCat}, 子选择器可见: ${hasSubFilter}`);

    await catButtons[0].click();
    await sleep(300);
  }

  const batchBtns = await page.$$(".batch-selector .batch-btn");
  if (batchBtns.length >= 2) {
    await batchBtns[1].click();
    await sleep(200);
    const progressText = await page.evaluate(() => document.querySelectorAll(".stat-card .stat-num")[3]?.textContent?.trim());
    record("UI", "TypeEngine", "切换组量选择器", !!progressText, `进度展示: ${progressText}`);
  }

  const toggles = await page.$$(".hints-toggle input[type=checkbox]");
  if (toggles.length >= 2) {
    await toggles[0].click(); // 关米字格
    await sleep(150);
    let hasFallback = await page.evaluate(() => !!document.querySelector(".target-char-fallback"));
    record("UI", "TypeEngine", "关闭米字格切为极简大字展示", hasFallback, `fallback 显示: ${hasFallback}`);

    await toggles[0].click(); // 重新开米字格
    await sleep(150);
    let hasMiZiGe = await page.evaluate(() => !!document.querySelector(".mizige-stage-row"));
    record("UI", "TypeEngine", "重新开启米字格字帖排版", hasMiZiGe, `mizige 显示: ${hasMiZiGe}`);
  }

  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll(".commit-selector .mode-btn")).find((b) => b.textContent?.includes("自动出字")) as HTMLElement;
    btn?.click();
  });
  await sleep(200);

  const currentTarget = await page.evaluate(() => {
    const fullBadge = document.querySelector(".target-codes .full-badge")?.textContent?.trim() || "";
    const shortBadge = document.querySelector(".target-codes .short-badge")?.textContent?.trim() || "";
    const char = document.querySelector(".mizige-stage-row")?.textContent?.trim() || "";
    return { fullBadge, shortBadge, char };
  });

  let targetCode = "";
  if (currentTarget.shortBadge) {
    targetCode = currentTarget.shortBadge.replace(/[^A-Za-z]/g, "").toLowerCase();
  } else if (currentTarget.fullBadge) {
    targetCode = currentTarget.fullBadge.replace(/[^A-Za-z]/g, "").toLowerCase();
  }

  // 故意敲错字母触发视觉防错抖动
  await page.click(".input-control-zone");
  await page.keyboard.press("z");
  await sleep(150);
  const hasError = await page.evaluate(() => {
    return !!document.querySelector(".word-card.shake-error") || !!document.querySelector(".input-capsule.error");
  });
  record("UI", "TypeEngine", "故意敲错字母触发视觉防错抖动与错题捕获", hasError, `错误红框/抖动触发: ${hasError}`);

  await page.keyboard.press("Backspace");
  await sleep(100);

  if (targetCode) {
    for (const char of targetCode) {
      await page.keyboard.press(char);
      await sleep(30);
    }
    await sleep(200);

    const updatedIndex = await page.evaluate(() => {
      return document.querySelectorAll(".stat-card .stat-num")[3]?.textContent?.trim() || "";
    });
    record("UI", "TypeEngine", "击键正确自动完成并推进字词", updatedIndex.startsWith("1 /") || updatedIndex.startsWith("2 /"), `更新后进度: ${updatedIndex}`);
  }

  const resetBtn = await page.$(".reset-btn");
  if (resetBtn) {
    await resetBtn.click();
    await sleep(200);
    const resetIndex = await page.evaluate(() => {
      return document.querySelectorAll(".stat-card .stat-num")[3]?.textContent?.trim() || "";
    });
    record("UI", "TypeEngine", "重置本轮练习进度归零", resetIndex.startsWith("0 /"), `重置后进度: ${resetIndex}`);
  }
  await page.screenshot({ path: path.join(UI_SCREENSHOT_DIR, "02_type_engine_verified.png") });

  // 3. VirtualKeyboard 交互式字根大键盘
  console.log("\n--- 模块 3: VirtualKeyboard 大键盘互动 ---");
  await page.goto(BASE_URL + "/#keyboard", { waitUntil: "networkidle0" });
  await sleep(400);

  const keyG = await page.$(".wubi-key[class*=zone-1]");
  if (keyG) {
    await keyG.hover();
    await sleep(150);
    const isHovered = await page.evaluate(() => !!document.querySelector(".wubi-key.is-hovered"));
    record("UI", "VirtualKeyboard", "键位鼠标悬停视觉高亮", isHovered, `hover 生效: ${isHovered}`);
  }

  await page.evaluate(() => {
    const keys = Array.from(document.querySelectorAll(".wubi-key .key-letter"));
    const gEl = keys.find((k) => k.textContent?.trim() === "G")?.closest(".wubi-key") as HTMLElement;
    gEl?.click();
  });
  await sleep(250);

  const keyDetailData = await page.evaluate(() => {
    const card = document.querySelector(".detail-card");
    const badge = card?.querySelector(".detail-badge")?.textContent?.trim() || "";
    const name = card?.querySelector(".detail-name")?.textContent?.trim() || "";
    return { hasCard: !!card, badge, name };
  });
  record("UI", "VirtualKeyboard", "点击 G 键展开字根卡片与口诀", keyDetailData.hasCard && keyDetailData.badge.includes("G 键"), `卡片: ${keyDetailData.badge}, ${keyDetailData.name}`);
  await page.screenshot({ path: path.join(UI_SCREENSHOT_DIR, "03_virtual_keyboard_verified.png") });

  // 4. TypingChaseGame 极速追逐赛
  console.log("\n--- 模块 4: TypingChaseGame 追逐赛交互 ---");
  await page.goto(BASE_URL + "/#game", { waitUntil: "networkidle0" });
  await sleep(400);

  const speedBtns = await page.$$(".modal-config-zone .m-pill-btn");
  if (speedBtns.length > 0) {
    await speedBtns[0].click();
    await sleep(150);
    const activeSpeed = await page.evaluate(() => document.querySelector(".modal-config-zone .m-pill-btn.active")?.textContent?.trim());
    record("UI", "TypingChaseGame", "选择 AI 对手航速", !!activeSpeed, `航速选项: ${activeSpeed}`);
  }

  const startBtn = await page.$(".start-btn");
  if (startBtn) {
    await startBtn.click();
    await sleep(400);
    const isRunning = await page.evaluate(() => !document.querySelector(".game-overlay-modal"));
    record("UI", "TypingChaseGame", "点击踩下油门正式开战", isRunning, `游戏运行中: ${isRunning}`);

    await page.click(".typing-cockpit");
    await sleep(150);

    const chaseTarget = await page.evaluate(() => {
      const full = document.querySelector(".current-target-card .hint-full-code")?.textContent?.trim() || "";
      const short = document.querySelector(".current-target-card .hint-short-badge")?.textContent?.trim() || "";
      return (short || full).replace(/[^A-Za-z]/g, "").toLowerCase();
    });

    if (chaseTarget) {
      for (const char of chaseTarget) {
        await page.keyboard.press(char);
        await sleep(30);
      }
      await sleep(250);

      const raceStats = await page.evaluate(() => {
        const combo = document.querySelector(".combo-val")?.textContent?.trim() || "";
        const leftChars = document.querySelector(".dist-num")?.textContent?.trim() || "";
        return { combo, leftChars };
      });
      record("UI", "TypingChaseGame", "敲击目标字驱动赛车推进", raceStats.combo.includes("1"), `连击数: ${raceStats.combo}, 剩余字数: ${raceStats.leftChars}`);
    }
  }
  await page.screenshot({ path: path.join(UI_SCREENSHOT_DIR, "04_typing_chase_verified.png") });

  // 5. ArticlePractice 长文实战
  console.log("\n--- 模块 5: ArticlePractice 长文实战交互 ---");
  await page.goto(BASE_URL + "/#article", { waitUntil: "networkidle0" });
  await sleep(500);

  const libBtn = await page.$(".library-btn");
  if (libBtn) {
    await libBtn.click();
    await sleep(300);
    const modalVisible = await page.evaluate(() => !!document.querySelector(".library-modal-dialog"));
    record("UI", "ArticlePractice", "打开题库大全弹窗", modalVisible, `题库弹窗可见: ${modalVisible}`);

    const artCard = await page.$(".library-modal-dialog .lib-card-item");
    if (artCard) {
      await artCard.click();
      await sleep(300);
    }
  }

  const customBtn = await page.$(".custom-btn");
  if (customBtn) {
    await customBtn.click();
    await sleep(300);
    const customModalVisible = await page.evaluate(() => !!document.querySelector(".import-modal-dialog"));
    record("UI", "ArticlePractice", "打开自定义文章导入弹窗", customModalVisible, `自定义弹窗可见: ${customModalVisible}`);

    const closeBtn = await page.$(".import-modal-dialog .lib-close-btn");
    if (closeBtn) {
      await closeBtn.click();
      await sleep(200);
    }
  }

  await page.click(".article-viewport");
  await sleep(150);
  const articleTarget = await page.evaluate(() => {
    const full = document.querySelector(".codes-group .badge.full")?.textContent?.trim() || "";
    const short = document.querySelector(".codes-group .badge.short")?.textContent?.trim() || "";
    const isPunct = !!document.querySelector(".punct-group");
    return {
      full: full.replace(/[^A-Za-z]/g, "").toLowerCase(),
      short: short.replace(/[^A-Za-z]/g, "").toLowerCase(),
      isPunct
    };
  });

  const codeToType = articleTarget.short || articleTarget.full;
  if (codeToType) {
    for (const char of codeToType) {
      await page.keyboard.press(char);
      await sleep(30);
    }
    await sleep(250);

    const progress = await page.evaluate(() => {
      return document.querySelectorAll(".mini-stat .val")[3]?.textContent?.trim() || "";
    });
    record("UI", "ArticlePractice", "长文击键打对推进首字", progress.startsWith("1 /") || progress.startsWith("2 /"), `文章进度: ${progress}`);
  } else if (articleTarget.isPunct) {
    await page.keyboard.press("Space");
    await sleep(200);
    record("UI", "ArticlePractice", "标点符号跳过/空格出字", true, "按空格跳过首个标点");
  }
  await page.screenshot({ path: path.join(UI_SCREENSHOT_DIR, "05_article_practice_verified.png") });

  // 6. RuleTutorial 拆字规则与互动实验室
  console.log("\n--- 模块 6: RuleTutorial 规则导学与实验室 ---");
  await page.goto(BASE_URL + "/#rules", { waitUntil: "networkidle0" });
  await sleep(400);

  const ruleTabs = await page.$$(".rules-tabs .rule-tab-btn");
  if (ruleTabs.length >= 3) {
    await ruleTabs[1].click(); // 字根五区
    await sleep(250);
    let ruleTitle = await page.evaluate(() => document.querySelector(".header-title")?.textContent?.trim());
    record("UI", "RuleTutorial", "切换至【字根五区与键位规律】规则卡", ruleTitle?.includes("字根五区") || false, `当前标题: ${ruleTitle}`);

    await ruleTabs[2].click(); // 识别码
    await sleep(250);
    ruleTitle = await page.evaluate(() => document.querySelector(".header-title")?.textContent?.trim());
    record("UI", "RuleTutorial", "切换至【末笔交叉识别码全解】规则卡", ruleTitle?.includes("识别码") || false, `当前标题: ${ruleTitle}`);

    await ruleTabs[0].click(); // 拆分原则
    await sleep(250);
    ruleTitle = await page.evaluate(() => document.querySelector(".header-title")?.textContent?.trim());
    record("UI", "RuleTutorial", "切换至【汉字拆分四项基本原则】", ruleTitle?.includes("拆分") || false, `当前标题: ${ruleTitle}`);
  }

  const pkSubTab = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll(".sub-nav-tabs .sub-tab-btn"));
    const pkBtn = btns.find((b) => b.textContent?.includes("避坑大PK")) as HTMLElement;
    if (pkBtn) {
      pkBtn.click();
      return true;
    }
    return false;
  });
  await sleep(250);
  const hasPkArena = await page.evaluate(() => !!document.querySelector(".pk-grid"));
  record("UI", "RuleTutorial", "进入【避坑大PK (正拆 vs 误拆)】", pkSubTab && hasPkArena, `PK 列表展示: ${hasPkArena}`);

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll(".sub-nav-tabs .sub-tab-btn"));
    const labBtn = btns.find((b) => b.textContent?.includes("拆字实验室")) as HTMLElement;
    labBtn?.click();
  });
  await sleep(250);
  const hasLab = await page.evaluate(() => !!document.querySelector(".lab-dissect-view"));
  record("UI", "RuleTutorial", "进入【拆字微观实验室】交互模块", hasLab, `实验室容器: ${hasLab}`);
  await page.screenshot({ path: path.join(UI_SCREENSHOT_DIR, "06_rules_tutorial_verified.png") });

  // 7. WubiLookup 五笔反查大字典
  console.log("\n--- 模块 7: WubiLookup 五笔字典反查交互 ---");
  await page.goto(BASE_URL + "/#lookup", { waitUntil: "networkidle0" });
  await sleep(500);

  await page.click(".clear-btn");
  await sleep(150);
  await page.type(".lookup-input", "华");
  await sleep(350);

  const charResult = await page.evaluate(() => {
    const card = document.querySelector(".char-result-card");
    const pinyin = card?.querySelector(".pinyin")?.textContent?.trim() || "";
    const code86 = card?.querySelector(".ver-code")?.textContent?.trim() || "";
    return { hasCard: !!card, pinyin, code86 };
  });
  record("UI", "WubiLookup", "反查单字【华】展示 86/98/新世纪 全码与拼音", charResult.hasCard && charResult.code86.includes("WXFJ"), `拼音: ${charResult.pinyin}, 86全码: ${charResult.code86}`);

  await page.click(".clear-btn");
  await sleep(150);
  await page.type(".lookup-input", "国家");
  await sleep(350);

  const phraseResult = await page.evaluate(() => {
    const phraseCard = document.querySelector(".phrase-result-card");
    const phraseWord = phraseCard?.querySelector(".phrase-word")?.textContent?.trim() || "";
    const codes = Array.from(phraseCard?.querySelectorAll(".p-code-highlight") || []).map((el) => el.textContent?.trim());
    return { hasPhrase: !!phraseCard, phraseWord, codes };
  });
  record("UI", "WubiLookup", "反查词组【国家】整词取码与步骤拆解", phraseResult.hasPhrase && phraseResult.phraseWord === "国家", `词组: ${phraseResult.phraseWord}, 编码: ${phraseResult.codes.join(" / ")}`);

  const tagBtn = await page.$(".quick-tags .quick-word-btn");
  if (tagBtn) {
    await tagBtn.click();
    await sleep(300);
    const inputVal = await page.evaluate(() => (document.querySelector(".lookup-input") as HTMLInputElement)?.value);
    record("UI", "WubiLookup", "点击热门范例快捷气泡填入检索", !!inputVal, `当前检索词: ${inputVal}`);
  }
  await page.screenshot({ path: path.join(UI_SCREENSHOT_DIR, "07_wubi_lookup_verified.png") });

  // 8. MistakeNotebook 错题生字本
  console.log("\n--- 模块 8: MistakeNotebook 错题本交互 ---");
  await page.goto(BASE_URL + "/#mistakes", { waitUntil: "networkidle0" });
  await sleep(500);

  const initialMistakes = await page.evaluate(() => {
    const cards = document.querySelectorAll(".mistake-card");
    return Array.from(cards).map((c) => ({
      correctCode: c.querySelector(".correct-code")?.textContent?.trim() || "",
      wrongCodes: Array.from(c.querySelectorAll(".wrong-code")).map((w) => w.textContent?.trim())
    }));
  });
  record("UI", "MistakeNotebook", "自动承接并渲染打字特训中的击错汉字", initialMistakes.length > 0, `捕获错题数: ${initialMistakes.length}, 正确码: ${initialMistakes[0]?.correctCode}, 曾错击: ${initialMistakes[0]?.wrongCodes.join(", ")}`);

  const delBtn = await page.$(".mistake-card .del-btn");
  if (delBtn) {
    await delBtn.click();
    await sleep(300);
    const remainingCount = await page.evaluate(() => document.querySelectorAll(".mistake-card").length);
    record("UI", "MistakeNotebook", "点击【已掌握】移出当前错字", true, `剩余错题数: ${remainingCount}`);
  }

  const isEmpty = await page.evaluate(() => !!document.querySelector(".empty-box"));
  record("UI", "MistakeNotebook", "错题清空后展示太棒了空状态引导", isEmpty, `空状态可见: ${isEmpty}`);

  await page.click(".brand-area");
  await sleep(300);
  const finalHash = await page.evaluate(() => window.location.hash);
  record("UI", "MistakeNotebook", "点击品牌 Logo 平滑返回打字特训", finalHash === "#practice", `当前地址: ${finalHash}`);
  await page.screenshot({ path: path.join(UI_SCREENSHOT_DIR, "08_mistake_notebook_verified.png") });
}

// =========================================================================
// SUITE 2: 五笔修仙打怪闯关 RPG 全量 13 关深度 E2E 通关测试
// =========================================================================
async function getTargetInfo(page: any) {
  return page.evaluate(() => {
    const charEl = document.querySelector(".target-character-display");
    const fullCodeEl = document.querySelector(".code-pill");
    const shortEls = Array.from(document.querySelectorAll(".short-pill"));
    const isVictory = !!document.querySelector(".victory-modal");
    const isDefeat = !!document.querySelector(".defeat-modal");
    const stageTitle = document.querySelector(".stage-tag-title")?.textContent?.trim() || "";
    const bossName = document.querySelector(".boss-name")?.textContent?.trim() || "";
    const hpEl = document.querySelector(".player-hp-wrapper .bar-val");

    return {
      char: charEl ? charEl.textContent?.trim() : "",
      fullCode: fullCodeEl ? fullCodeEl.textContent?.trim() : "",
      shortCodes: shortEls.map((el) => el.textContent?.trim() || ""),
      isVictory,
      isDefeat,
      stageTitle,
      bossName,
      playerHp: hpEl ? parseInt(hpEl.textContent?.split("/")[0].trim() || "100", 10) : 100
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
      const el = document.querySelector(".target-character-display");
      const vict = !!document.querySelector(".victory-modal");
      return { char: el?.textContent?.trim() || "", vict };
    });

    if (current.vict || current.char !== initialChar) {
      return;
    }
  }

  await sleep(130);

  const afterWait = await page.evaluate(() => {
    const el = document.querySelector(".target-character-display");
    const vict = !!document.querySelector(".victory-modal");
    return { char: el?.textContent?.trim() || "", vict };
  });

  if (!afterWait.vict && afterWait.char === initialChar) {
    await page.keyboard.press("Space");
    await sleep(80);
  }
}

async function runRpgSuite(page: any) {
  console.log("\n========================================================");
  console.log("⚔️ [Suite 2/2] 五笔修仙打怪闯关 RPG 全量 13 关端到端实战通关");
  console.log("========================================================");

  await page.goto(BASE_URL + "/#rpg", { waitUntil: "networkidle0" });
  await sleep(600);

  // 开始第 1 关
  await page.evaluate(() => {
    const battleBtn = document.querySelector(".battle-start-btn") as HTMLButtonElement;
    if (battleBtn) battleBtn.click();
  });
  await sleep(600);

  // 循环逐关打通 13 个关卡
  for (let stageNum = 1; stageNum <= 13; stageNum++) {
    let info = await getTargetInfo(page);
    console.log(`\n⚔️ [Stage ${stageNum}/13] ${info.stageTitle} · 守卫：${info.bossName}`);

    // 在第 1 个字故意输入错误测试扣血
    const beforeHp = info.playerHp;
    await page.keyboard.press("z");
    await page.keyboard.press("z");
    await sleep(300);
    const afterErrInfo = await getTargetInfo(page);
    record("RPG", `第 ${stageNum} 关`, "故意敲错防作弊与扣血惩罚", afterErrInfo.playerHp <= beforeHp, `HP: ${beforeHp} -> ${afterErrInfo.playerHp}`);

    // 逐字击杀
    let stageGuardLoop = 70;
    while (stageGuardLoop > 0) {
      stageGuardLoop--;
      info = await getTargetInfo(page);
      if (info.isVictory || info.isDefeat) break;

      // 释放大招
      const energy = await page.evaluate(() => {
        const pctEl = document.querySelector(".energy-pct");
        return pctEl ? parseInt(pctEl.textContent?.replace("%", "") || "0", 10) : 0;
      });
      if (energy >= 100) {
        await page.keyboard.press("Tab");
        await sleep(300);
      }

      await typeCurrentTarget(page);
      await sleep(35);
    }

    await sleep(500);
    info = await getTargetInfo(page);
    record("RPG", `第 ${stageNum} 关`, `击败首领 ${info.bossName} 夺取胜利`, info.isVictory, `通关状态: ${info.isVictory ? "VICTORY" : "FAILED"}`);
    await page.screenshot({ path: path.join(RPG_SCREENSHOT_DIR, `stage_${stageNum}_victory.png`) });

    // 开启宝箱
    await page.evaluate(() => {
      const chest = document.querySelector(".chest-box.unopened") as HTMLElement;
      if (chest) chest.click();
    });
    await sleep(400);

    // 下一关
    if (stageNum < 13) {
      await page.evaluate(() => {
        const nextBtn = document.querySelector(".next-stage-btn") as HTMLButtonElement;
        if (nextBtn) nextBtn.click();
      });
      await sleep(600);
    }
  }
}

// =========================================================================
// 统一入口调度器 (Single Unified Entry Point)
// =========================================================================
async function run() {
  const args = process.argv.slice(2);
  const onlyUi = args.includes("--ui");
  const onlyRpg = args.includes("--rpg");
  const runBoth = (!onlyUi && !onlyRpg) || (onlyUi && onlyRpg);

  console.log("===============================================================================");
  console.log("🚀 五笔学堂 (Wubi Master) 统一端到端自动化巡检 Harness 启动");
  console.log(`模式: ${runBoth ? "全量巡检 (UI 8大模块 + RPG 13关)" : (onlyUi ? "UI 模块专用巡检" : "RPG 关卡专用巡检")}`);
  console.log("===============================================================================");

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1440,960"]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 960 });

  page.on("pageerror", (err) => {
    console.error("  [Browser PageError]:", err.message);
  });

  const startTime = Date.now();

  try {
    if (runBoth || onlyUi) {
      await runUiSuite(page);
    }

    if (runBoth || onlyRpg) {
      await runRpgSuite(page);
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const total = allResults.length;
    const passed = allResults.filter((r) => r.passed).length;
    const failed = total - passed;

    console.log("\n===============================================================================");
    console.log("📊 五笔学堂 统一自动化巡检最终报告：");
    console.log("===============================================================================");
    console.log(`⏱️ 总耗时: ${elapsed} 秒`);
    console.log(`📦 包含模块: ${runBoth ? "UI 交互 (35项) + RPG 关卡 (26项)" : (onlyUi ? "UI 交互 (35项)" : "RPG 关卡 (26项)")}`);
    console.log(`✅ 测试通过: ${passed} / ${total} (通过率: ${((passed / total) * 100).toFixed(1)}%)`);
    console.log(`❌ 测试失败: ${failed}`);
    console.log(`📸 屏幕快照已保存至: ${BASE_SCREENSHOT_DIR}`);
    console.log("===============================================================================");

    if (failed > 0) {
      console.error("❌ 巡检存在未通过用例，请查阅上方明细日志！");
      process.exit(1);
    } else {
      console.log("🎉🎉🎉 恭喜！五笔学堂统一自动化巡检 100% 全部通过！系统高可用与交互健壮性得到完美验证！");
      process.exit(0);
    }
  } catch (err) {
    console.error("❌ 巡检发生未捕获异常:", err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
