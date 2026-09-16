<template>
  <div class="app-root">
    <!-- 顶部综合导航 -->
    <Navbar />

    <!-- 核心功能视图区域 -->
    <main class="main-content">
      <transition name="fade" mode="out-in">
        <!-- 1. 打字特训模式 -->
        <!-- 1. 打字特训模式 -->
        <section v-if="store.activeTab.value === 'practice'" key="practice">
          <TypeEngine />
        </section>

        <!-- 2. 五笔修仙打怪闯关 RPG -->
        <section v-else-if="store.activeTab.value === 'rpg'" key="rpg">
          <RpgAdventure />
        </section>

        <!-- 3. 完整文章长文实战 -->
        <section v-else-if="store.activeTab.value === 'article'" key="article">
          <ArticlePractice />
        </section>

        <!-- 4. 极速打字追逐赛 -->
        <section v-else-if="store.activeTab.value === 'game'" key="game">
          <TypingChaseGame />
        </section>

        <!-- 4. 五笔字根大键盘全景 -->
        <section v-else-if="store.activeTab.value === 'keyboard'" key="keyboard" class="keyboard-view">
          <div class="view-intro">
            <h2 class="view-title">交互式五笔字根大键盘</h2>
            <p class="view-desc">
              五大区位科学分布，支持 86版 / 98版 / 新世纪版 实时切换。鼠标轻触任意键位，查看对应字根表、键名汉字与助记口诀。
            </p>
          </div>
          <VirtualKeyboard />
        </section>

        <!-- 4. 拆字规则指南与识别码互动推导 -->
        <section v-else-if="store.activeTab.value === 'rules'" key="rules">
          <RuleTutorial />
        </section>

        <!-- 5. 五笔字典反查 -->
        <section v-else-if="store.activeTab.value === 'lookup'" key="lookup">
          <WubiLookup />
        </section>

        <!-- 6. 错题生字本 -->
        <section v-else-if="store.activeTab.value === 'mistakes'" key="mistakes">
          <MistakeNotebook />
        </section>
      </transition>
    </main>

    <!-- 底部版权与说明 -->
    <footer class="app-footer">
      <div class="footer-container">
        <span>五笔打字学堂 · Wubi Master &copy; 2026</span>
        <span class="footer-dot">·</span>
        <span>支持 86 / 98 / 新世纪三版编码</span>
        <span class="footer-dot">·</span>
        <span>简码优先 · 看字打全码 · 长文题库实战</span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useWubiStore } from './stores/useWubiStore';
import Navbar from './components/Navbar.vue';
import TypeEngine from './components/TypeEngine.vue';
import RpgAdventure from './components/RpgAdventure.vue';
import ArticlePractice from './components/ArticlePractice.vue';
import TypingChaseGame from './components/TypingChaseGame.vue';
import VirtualKeyboard from './components/VirtualKeyboard.vue';
import RuleTutorial from './components/RuleTutorial.vue';
import WubiLookup from './components/WubiLookup.vue';
import MistakeNotebook from './components/MistakeNotebook.vue';

const store = useWubiStore();

onMounted(() => {
  // 设置初始主题
  document.documentElement.setAttribute('data-theme', store.theme.value);

  // 后台闲时异步初始化 IndexedDB 全量五笔字库（零阻塞首屏渲染与交互）
  if (typeof window !== 'undefined') {
    const startPopulate = () => {
      import('./data/wubiDb').then(({ ensureDictPopulated, applyDbCorrections }) => {
        ensureDictPopulated();
        // 将精修字根（EXPERT_CORRECTED_CHARS）同步写回 IndexedDB，
        // 以 corrections_v1 标记防止重复执行（仅首次运行 < 5ms）
        applyDbCorrections();
      }).catch(err => {
        console.warn('[App] ensureDictPopulated error:', err);
      });
    };

    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => startPopulate(), { timeout: 3000 });
    } else {
      setTimeout(startPopulate, 1000);
    }
  }
});
</script>

<style scoped>
.app-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
}

.main-content {
  flex: 1;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 1.5rem;
}

.keyboard-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.view-intro {
  text-align: center;
  max-width: 680px;
}

.view-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--text-main);
}

.view-desc {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-top: 6px;
  line-height: 1.6;
}

.app-footer {
  border-top: 1px solid var(--border-color);
  padding: 1rem 1.5rem;
  background: var(--card-bg);
  margin-top: auto;
}

.footer-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 0.8rem;
  color: var(--text-muted);
  flex-wrap: wrap;
}

.footer-dot {
  opacity: 0.4;
}

/* 页面切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
