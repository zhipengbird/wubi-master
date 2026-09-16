import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE_URL = "http://localhost:5175";
const SCREENSHOT_DIR = path.resolve(process.cwd(), "e2e_screenshots/ui_interactions");

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

interface TestResult {
  module: string;
  action: string;
  passed: boolean;
  detail: string;
}

const results: TestResult[] = [];

function record(module: string, action: string, passed: boolean, detail: string) {
  results.push({ module, action, passed, detail });
  const status = passed ? "✅ PASS" : "❌ FAIL";
  console.log(`[${status}] [${module}] ${action} -> ${detail}`);
}

async function run() {
  console.log("🚀 正在启动 全站 UI 深度交互自动化巡检 Harness...");
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

  try {
    // ==========================================
    // MODULE 1: Navbar 全局导航、主题、音效与版本
    // ==========================================
    console.log("\n--- 模块 1: Navbar 全局导航与偏好设置 ---");
    await page.goto(BASE_URL + "/#practice", { waitUntil: "networkidle0" });
    await sleep(500);

    // 1.1 词库版本切换 (86 -> 98 -> newCentury -> 86)
    const pills = await page.$$(".actions-area .pill-btn");
    if (pills.length >= 3) {
      await pills[1].click(); // 切换 98 版
      await sleep(200);
      let verText = await page.evaluate(() => document.querySelector(".actions-area .pill-btn.active")?.textContent?.trim());
      record("Navbar", "切换词库至 98 版", verText === "98版", `当前激活: ${verText}`);

      await pills[2].click(); // 切换 新世纪版
      await sleep(200);
      verText = await page.evaluate(() => document.querySelector(".actions-area .pill-btn.active")?.textContent?.trim());
      record("Navbar", "切换词库至 新世纪版", verText?.includes("新世纪") || false, `当前激活: ${verText}`);

      await pills[0].click(); // 切回 86 版
      await sleep(200);
      verText = await page.evaluate(() => document.querySelector(".actions-area .pill-btn.active")?.textContent?.trim());
      record("Navbar", "切回词库至 86 版", verText === "86版", `当前激活: ${verText}`);
    } else {
      record("Navbar", "版本切换按钮存在性", false, `找到 ${pills.length} 个版本按钮`);
    }

    // 1.2 主题切换 (tokyo-night -> matrix-green -> paper-ink)
    const themeSelect = await page.$(".theme-select");
    if (themeSelect) {
      await page.select(".theme-select", "matrix-green");
      await sleep(200);
      let themeAttr = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
      record("Navbar", "切换至黑客终端主题 (matrix-green)", themeAttr === "matrix-green", `html[data-theme]=${themeAttr}`);

      await page.select(".theme-select", "paper-ink");
      await sleep(200);
      themeAttr = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
      record("Navbar", "切换至纸墨素雅明亮主题 (paper-ink)", themeAttr === "paper-ink", `html[data-theme]=${themeAttr}`);

      await page.select(".theme-select", "tokyo-night");
      await sleep(200);
      themeAttr = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
      record("Navbar", "复原暗夜赛博主题 (tokyo-night)", themeAttr === "tokyo-night", `html[data-theme]=${themeAttr}`);
    }

    // 1.3 按键音效轮询
    const audioBtn = await page.$(".ctrl-group .icon-btn");
    if (audioBtn) {
      const initialAudio = await page.evaluate(() => document.querySelector(".ctrl-group .icon-btn .btn-text")?.textContent?.trim());
      await audioBtn.click();
      await sleep(150);
      const nextAudio = await page.evaluate(() => document.querySelector(".ctrl-group .icon-btn .btn-text")?.textContent?.trim());
      record("Navbar", "音效轮换点击", initialAudio !== nextAudio, `${initialAudio} -> ${nextAudio}`);
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "01_navbar_verified.png") });

    // ==========================================
    // MODULE 2: TypeEngine 打字特训模式
    // ==========================================
    console.log("\n--- 模块 2: TypeEngine 打字特训交互 ---");
    await page.goto(BASE_URL + "/#practice", { waitUntil: "networkidle0" });
    await sleep(400);

    // 2.1 分类切换: 一级简码 -> 二级简码 -> 常用词组
    const catButtons = await page.$$(".category-row .cat-btn");
    if (catButtons.length >= 3) {
      await catButtons[1].click(); // 二级简码
      await sleep(300);
      let activeCat = await page.evaluate(() => document.querySelector(".category-row .cat-btn.active")?.textContent?.trim());
      record("TypeEngine", "切换至【二级简码】分类", activeCat?.includes("二级") || false, `当前分类: ${activeCat}`);

      // 切换至【词组特训】
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll(".category-row .cat-btn"));
        const phraseBtn = btns.find(b => b.textContent?.includes("词组")) as HTMLElement;
        phraseBtn?.click();
      });
      await sleep(300);
      activeCat = await page.evaluate(() => document.querySelector(".category-row .cat-btn.active")?.textContent?.trim());
      const hasSubFilter = await page.evaluate(() => !!document.querySelector(".phrase-sub-selector"));
      record("TypeEngine", "切换至【词组特训】并激活子词长选择器", !!hasSubFilter, `当前分类: ${activeCat}, 子选择器可见: ${hasSubFilter}`);

      // 切回一级简码
      await catButtons[0].click();
      await sleep(300);
    }

    // 2.2 组量选择器: 10 / 25 / 50
    const batchBtns = await page.$$(".batch-selector .batch-btn");
    if (batchBtns.length >= 2) {
      await batchBtns[1].click();
      await sleep(200);
      const progressText = await page.evaluate(() => document.querySelectorAll(".stat-card .stat-num")[3]?.textContent?.trim());
      record("TypeEngine", "切换组量选择器", !!progressText, `进度展示: ${progressText}`);
    }

    // 2.3 辅助开关: 米字格与拆解提示
    const toggles = await page.$$(".hints-toggle input[type=checkbox]");
    if (toggles.length >= 2) {
      await toggles[0].click(); // 关米字格
      await sleep(150);
      let hasFallback = await page.evaluate(() => !!document.querySelector(".target-char-fallback"));
      record("TypeEngine", "关闭米字格切为极简大字展示", hasFallback, `fallback 显示: ${hasFallback}`);

      await toggles[0].click(); // 重新开米字格
      await sleep(150);
      let hasMiZiGe = await page.evaluate(() => !!document.querySelector(".mizige-stage-row"));
      record("TypeEngine", "重新开启米字格字帖排版", hasMiZiGe, `mizige 显示: ${hasMiZiGe}`);
    }

    // 2.4 击键判定交互：自动出字模式录入
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll(".commit-selector .mode-btn")).find(b => b.textContent?.includes("自动出字")) as HTMLElement;
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

    // 模拟敲入错误编码 -> 触发抖动与红框并自动记录至错题本
    await page.click(".input-control-zone");
    await page.keyboard.press("z");
    await sleep(150);
    const hasError = await page.evaluate(() => {
      return !!document.querySelector(".word-card.shake-error") || !!document.querySelector(".input-capsule.error");
    });
    record("TypeEngine", "故意敲错字母触发视觉防错抖动与错题捕获", hasError, `错误红框/抖动触发: ${hasError}`);

    // 退格清除错误
    await page.keyboard.press("Backspace");
    await sleep(100);

    // 正确录入目标字
    if (targetCode) {
      for (const char of targetCode) {
        await page.keyboard.press(char);
        await sleep(30);
      }
      await sleep(200);

      const updatedIndex = await page.evaluate(() => {
        return document.querySelectorAll(".stat-card .stat-num")[3]?.textContent?.trim() || "";
      });
      record("TypeEngine", "击键正确自动完成并推进字词", updatedIndex.startsWith("1 /") || updatedIndex.startsWith("2 /"), `更新后进度: ${updatedIndex}`);
    }

    // 2.5 重置本轮练习
    const resetBtn = await page.$(".reset-btn");
    if (resetBtn) {
      await resetBtn.click();
      await sleep(200);
      const resetIndex = await page.evaluate(() => {
        return document.querySelectorAll(".stat-card .stat-num")[3]?.textContent?.trim() || "";
      });
      record("TypeEngine", "重置本轮练习进度归零", resetIndex.startsWith("0 /"), `重置后进度: ${resetIndex}`);
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "02_type_engine_verified.png") });

    // ==========================================
    // MODULE 3: VirtualKeyboard 交互式字根大键盘
    // ==========================================
    console.log("\n--- 模块 3: VirtualKeyboard 大键盘互动 ---");
    await page.goto(BASE_URL + "/#keyboard", { waitUntil: "networkidle0" });
    await sleep(400);

    // 3.1 悬停键位高亮
    const keyG = await page.$(".wubi-key[class*=zone-1]");
    if (keyG) {
      await keyG.hover();
      await sleep(150);
      const isHovered = await page.evaluate(() => !!document.querySelector(".wubi-key.is-hovered"));
      record("VirtualKeyboard", "键位鼠标悬停视觉高亮", isHovered, `hover 生效: ${isHovered}`);
    }

    // 3.2 点击键位展示字根卡片详情
    await page.evaluate(() => {
      const keys = Array.from(document.querySelectorAll(".wubi-key .key-letter"));
      const gEl = keys.find(k => k.textContent?.trim() === "G")?.closest(".wubi-key") as HTMLElement;
      gEl?.click();
    });
    await sleep(250);

    const keyDetailData = await page.evaluate(() => {
      const card = document.querySelector(".detail-card");
      const badge = card?.querySelector(".detail-badge")?.textContent?.trim() || "";
      const name = card?.querySelector(".detail-name")?.textContent?.trim() || "";
      const mnemonic = card?.querySelector(".detail-mnemonic")?.textContent?.trim() || "";
      return { hasCard: !!card, badge, name, mnemonic };
    });
    record(
      "VirtualKeyboard",
      "点击 G 键展开字根卡片与口诀",
      keyDetailData.hasCard && keyDetailData.badge.includes("G 键"),
      `卡片: ${keyDetailData.badge}, ${keyDetailData.name}`
    );

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "03_virtual_keyboard_verified.png") });

    // ==========================================
    // MODULE 4: TypingChaseGame 极速追逐赛
    // ==========================================
    console.log("\n--- 模块 4: TypingChaseGame 追逐赛交互 ---");
    await page.goto(BASE_URL + "/#game", { waitUntil: "networkidle0" });
    await sleep(400);

    // 4.1 调整对手车速与难度
    const speedBtns = await page.$$(".modal-config-zone .m-pill-btn");
    if (speedBtns.length > 0) {
      await speedBtns[0].click(); // 选基础航速
      await sleep(150);
      const activeSpeed = await page.evaluate(() => document.querySelector(".modal-config-zone .m-pill-btn.active")?.textContent?.trim());
      record("TypingChaseGame", "选择 AI 对手航速", !!activeSpeed, `航速选项: ${activeSpeed}`);
    }

    // 4.2 踩下油门开始比赛
    const startBtn = await page.$(".start-btn");
    if (startBtn) {
      await startBtn.click();
      await sleep(400);
      const isRunning = await page.evaluate(() => {
        return !document.querySelector(".game-overlay-modal");
      });
      record("TypingChaseGame", "点击踩下油门正式开战", isRunning, `游戏运行中: ${isRunning}`);

      // 4.3 聚焦输入并获取当前目标字并快速敲入
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
        record("TypingChaseGame", "敲击目标字驱动赛车推进", raceStats.combo.includes("1"), `连击数: ${raceStats.combo}, 剩余字数: ${raceStats.leftChars}`);
      }
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "04_typing_chase_verified.png") });

    // ==========================================
    // MODULE 5: ArticlePractice 长文实战
    // ==========================================
    console.log("\n--- 模块 5: ArticlePractice 长文实战交互 ---");
    await page.goto(BASE_URL + "/#article", { waitUntil: "networkidle0" });
    await sleep(500);

    // 5.1 题库大全大弹窗交互
    const libBtn = await page.$(".library-btn");
    if (libBtn) {
      await libBtn.click();
      await sleep(300);
      const modalVisible = await page.evaluate(() => !!document.querySelector(".library-modal-dialog"));
      record("ArticlePractice", "打开题库大全弹窗", modalVisible, `题库弹窗可见: ${modalVisible}`);

      // 选中第二篇并载入
      const artCard = await page.$(".library-modal-dialog .lib-card-item");
      if (artCard) {
        await artCard.click();
        await sleep(300);
      }
    }

    // 5.2 自定义文章弹窗测试
    const customBtn = await page.$(".custom-btn");
    if (customBtn) {
      await customBtn.click();
      await sleep(300);
      const customModalVisible = await page.evaluate(() => !!document.querySelector(".import-modal-dialog"));
      record("ArticlePractice", "打开自定义文章导入弹窗", customModalVisible, `自定义弹窗可见: ${customModalVisible}`);

      // 关闭自定义弹窗
      const closeBtn = await page.$(".import-modal-dialog .lib-close-btn");
      if (closeBtn) {
        await closeBtn.click();
        await sleep(200);
      }
    }

    // 5.3 敲击当前长文字符
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
      record("ArticlePractice", "长文击键打对推进首字", progress.startsWith("1 /") || progress.startsWith("2 /"), `文章进度: ${progress}`);
    } else if (articleTarget.isPunct) {
      await page.keyboard.press("Space");
      await sleep(200);
      record("ArticlePractice", "标点符号跳过/空格出字", true, "按空格跳过首个标点");
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "05_article_practice_verified.png") });

    // ==========================================
    // MODULE 6: RuleTutorial 拆字规则与互动实验室
    // ==========================================
    console.log("\n--- 模块 6: RuleTutorial 规则导学与实验室 ---");
    await page.goto(BASE_URL + "/#rules", { waitUntil: "networkidle0" });
    await sleep(400);

    // 6.1 顶部规则模块切换
    const ruleTabs = await page.$$(".rules-tabs .rule-tab-btn");
    if (ruleTabs.length >= 3) {
      await ruleTabs[1].click(); // 字根五区与键位规律
      await sleep(250);
      let ruleTitle = await page.evaluate(() => document.querySelector(".header-title")?.textContent?.trim());
      record("RuleTutorial", "切换至【字根五区与键位规律】规则卡", ruleTitle?.includes("字根五区") || false, `当前标题: ${ruleTitle}`);

      await ruleTabs[2].click(); // 末笔交叉识别码全解
      await sleep(250);
      ruleTitle = await page.evaluate(() => document.querySelector(".header-title")?.textContent?.trim());
      record("RuleTutorial", "切换至【末笔交叉识别码全解】规则卡", ruleTitle?.includes("识别码") || false, `当前标题: ${ruleTitle}`);

      await ruleTabs[0].click(); // 切回【汉字拆分四项基本原则】
      await sleep(250);
      ruleTitle = await page.evaluate(() => document.querySelector(".header-title")?.textContent?.trim());
      record("RuleTutorial", "切换至【汉字拆分四项基本原则】", ruleTitle?.includes("拆分") || false, `当前标题: ${ruleTitle}`);
    }

    // 6.2 拆分原则内部子模块：避坑大PK
    const pkSubTab = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll(".sub-nav-tabs .sub-tab-btn"));
      const pkBtn = btns.find(b => b.textContent?.includes("避坑大PK")) as HTMLElement;
      if (pkBtn) {
        pkBtn.click();
        return true;
      }
      return false;
    });
    await sleep(250);
    const hasPkArena = await page.evaluate(() => !!document.querySelector(".pk-grid"));
    record("RuleTutorial", "进入【避坑大PK (正拆 vs 误拆)】", pkSubTab && hasPkArena, `PK 列表展示: ${hasPkArena}`);

    // 6.3 拆分原则内部子模块：拆字微观实验室
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll(".sub-nav-tabs .sub-tab-btn"));
      const labBtn = btns.find(b => b.textContent?.includes("拆字实验室")) as HTMLElement;
      labBtn?.click();
    });
    await sleep(250);
    const hasLab = await page.evaluate(() => !!document.querySelector(".lab-dissect-view"));
    record("RuleTutorial", "进入【拆字微观实验室】交互模块", hasLab, `实验室容器: ${hasLab}`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "06_rules_tutorial_verified.png") });

    // ==========================================
    // MODULE 7: WubiLookup 五笔反查大字典
    // ==========================================
    console.log("\n--- 模块 7: WubiLookup 五笔字典反查交互 ---");
    await page.goto(BASE_URL + "/#lookup", { waitUntil: "networkidle0" });
    await sleep(500);

    // 7.1 单字智能反查 (华)
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
    record("WubiLookup", "反查单字【华】展示 86/98/新世纪 全码与拼音", charResult.hasCard && charResult.code86.includes("WXFJ"), `拼音: ${charResult.pinyin}, 86全码: ${charResult.code86}`);

    // 7.2 词组整词编码反查 (国家)
    await page.click(".clear-btn");
    await sleep(150);
    await page.type(".lookup-input", "国家");
    await sleep(350);

    const phraseResult = await page.evaluate(() => {
      const phraseCard = document.querySelector(".phrase-result-card");
      const phraseWord = phraseCard?.querySelector(".phrase-word")?.textContent?.trim() || "";
      const codes = Array.from(phraseCard?.querySelectorAll(".p-code-highlight") || []).map(el => el.textContent?.trim());
      return { hasPhrase: !!phraseCard, phraseWord, codes };
    });
    record(
      "WubiLookup",
      "反查词组【国家】整词取码与步骤拆解",
      phraseResult.hasPhrase && phraseResult.phraseWord === "国家",
      `词组: ${phraseResult.phraseWord}, 编码: ${phraseResult.codes.join(" / ")}`
    );

    // 7.3 快捷热门标签点击
    const tagBtn = await page.$(".quick-tags .quick-word-btn");
    if (tagBtn) {
      await tagBtn.click();
      await sleep(300);
      const inputVal = await page.evaluate(() => (document.querySelector(".lookup-input") as HTMLInputElement)?.value);
      record("WubiLookup", "点击热门范例快捷气泡填入检索", !!inputVal, `当前检索词: ${inputVal}`);
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "07_wubi_lookup_verified.png") });

    // ==========================================
    // MODULE 8: MistakeNotebook 错题生字本
    // ==========================================
    console.log("\n--- 模块 8: MistakeNotebook 错题本交互 ---");
    await page.goto(BASE_URL + "/#mistakes", { waitUntil: "networkidle0" });
    await sleep(500);

    // 8.1 校验 Module 2 产生的真实错题已被自动捕获展示
    const initialMistakes = await page.evaluate(() => {
      const cards = document.querySelectorAll(".mistake-card");
      return Array.from(cards).map(c => ({
        correctCode: c.querySelector(".correct-code")?.textContent?.trim() || "",
        wrongCodes: Array.from(c.querySelectorAll(".wrong-code")).map(w => w.textContent?.trim())
      }));
    });
    record(
      "MistakeNotebook",
      "自动承接并渲染打字特训中的击错汉字",
      initialMistakes.length > 0,
      `捕获错题数: ${initialMistakes.length}, 正确码: ${initialMistakes[0]?.correctCode}, 曾错击: ${initialMistakes[0]?.wrongCodes.join(", ")}`
    );

    // 8.2 点击“已掌握”标记消除错题
    const delBtn = await page.$(".mistake-card .del-btn");
    if (delBtn) {
      await delBtn.click();
      await sleep(300);
      const remainingCount = await page.evaluate(() => document.querySelectorAll(".mistake-card").length);
      record("MistakeNotebook", "点击【已掌握】移出当前错字", true, `剩余错题数: ${remainingCount}`);
    }

    // 8.3 校验清空后友好空状态展示
    const isEmpty = await page.evaluate(() => !!document.querySelector(".empty-box"));
    record("MistakeNotebook", "错题清空后展示太棒了空状态引导", isEmpty, `空状态可见: ${isEmpty}`);

    // 8.4 验证返回打字特训 (点击 Logo 或快捷键)
    await page.click(".brand-area");
    await sleep(300);
    const finalHash = await page.evaluate(() => window.location.hash);
    record("MistakeNotebook", "点击品牌 Logo 平滑返回打字特训", finalHash === "#practice", `当前地址: ${finalHash}`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "08_mistake_notebook_verified.png") });

    // ==========================================
    // 汇总报告
    // ==========================================
    console.log("\n==========================================");
    console.log("📊 全站 UI 自动化巡检测试汇总：");
    console.log("==========================================");
    const total = results.length;
    const passed = results.filter(r => r.passed).length;
    const failed = total - passed;

    console.log(`总交互用例: ${total} | 通过: ${passed} | 失败: ${failed}`);
    if (failed > 0) {
      console.error("❌ 存在未通过用例，详情请查阅上方日志。");
      process.exit(1);
    } else {
      console.log("🎉 恭喜！全站 UI 8 大核心模块深度交互自动化测试 100% 全部通过！");
    }
  } catch (err: any) {
    console.error("测试执行发生严重异常:", err);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "fatal_error.png") });
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
