<template>
  <div class="lookup-wrapper">
    <!-- 搜索栏区 -->
    <div class="search-box">
      <div class="search-header">
        <div class="search-title-wrap">
          <h2 class="dict-title">📖 五笔全量反查大字典</h2>
          <span class="dict-badge">已收录 28,058+ 常用与全量汉字</span>
          <div class="db-status-pill" :class="{ ready: isDbReady }">
            <span class="db-status-dot"></span>
            <span>{{ isDbReady ? '⚡ IndexedDB 毫秒级字库已就绪' : '⏳ 正在初始化本地字库...' }}</span>
          </div>
        </div>
        <div class="dict-sub">支持任意单字/词组反查、1~4位五笔编码及前缀联想、纯拼音反查，同屏对比 86/98/新世纪 三版拆解全流程</div>
      </div>

      <div class="search-input-wrap">
        <Search class="search-icon" :size="20" />
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="输入汉字、词组、五笔编码（如：KH、KHQN）或拼音（如：pao、wubi）智能反查"
          class="lookup-input"
          autofocus
        />
        <div class="input-actions">
          <span v-if="isLoading" class="loading-spin" title="正在极速检索...">⏳</span>
          <button v-if="searchKeyword" class="clear-btn" @click="searchKeyword = ''">
            <X :size="16" />
          </button>
        </div>
      </div>

      <!-- 快捷热门范例气泡 -->
      <div class="quick-tags">
        <span class="tag-lbl">快捷范例：</span>
        <button
          v-for="item in hotExamples"
          :key="item.label"
          class="quick-word-btn"
          :class="{ 'code-tag': item.type === 'code', 'pinyin-tag': item.type === 'pinyin' }"
          @click="searchKeyword = item.val"
        >
          {{ item.label }}
        </button>
      </div>
    </div>

    <!-- 词组整词编码卡片（当输入包含2个及以上汉字时高亮展示） -->
    <div class="phrase-result-card" v-if="phraseInfo">
      <div class="phrase-header">
        <div class="phrase-left-title">
          <span class="phrase-tag">词组整词编码</span>
          <span class="phrase-word">{{ phraseInfo.phrase }}</span>
        </div>
        <div class="phrase-rule-tip">
          <span class="tip-icon">💡</span>
          <span>{{ phraseInfo.ruleTip }}</span>
        </div>
      </div>

      <div class="phrase-codes-grid">
        <div class="phrase-code-col" :class="{ active: store.version.value === '86' }">
          <div class="p-ver-tag">86 版整词码</div>
          <div class="p-code-highlight">{{ phraseInfo.code86 || '—' }}</div>
        </div>
        <div class="phrase-code-col" :class="{ active: store.version.value === '98' }">
          <div class="p-ver-tag">98 版整词码</div>
          <div class="p-code-highlight">{{ phraseInfo.code98 || '—' }}</div>
        </div>
        <div class="phrase-code-col" :class="{ active: store.version.value === 'newCentury' }">
          <div class="p-ver-tag">新世纪整词码</div>
          <div class="p-code-highlight">{{ phraseInfo.codeNew || '—' }}</div>
        </div>
      </div>

      <!-- 词组取码逐步拆解流程 -->
      <div class="phrase-breakdown-steps" v-if="phraseInfo.breakdown">
        <div class="steps-title">
          <span>当前版本 ({{ store.version.value === '86' ? '86版' : (store.version.value === '98' ? '98版' : '新世纪') }}) 取码拆解：</span>
        </div>
        <div class="steps-row">
          <div 
            v-for="(step, sIdx) in phraseInfo.breakdown.steps" 
            :key="sIdx" 
            class="lookup-step-item"
          >
            <div class="step-char-box">
              <span class="step-ch">{{ step.char }}</span>
              <span class="step-sub">{{ step.desc }}</span>
            </div>
            <span class="step-arrow-icon">➔</span>
            <span class="step-key-badge">{{ step.keys }}键</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 多模态候选字面板（当输入五笔编码或拼音检索出候选字列表时展示） -->
    <div class="candidate-panel" v-if="searchResult.mode === 'code' || searchResult.mode === 'pinyin'">
      <div class="candidate-header">
        <div class="candidate-title">
          <span class="cand-icon">{{ searchResult.mode === 'code' ? '🔤' : '🗣️' }}</span>
          <span class="cand-type">{{ searchResult.mode === 'code' ? '五笔编码 / 前缀联想' : '拼音快速反查' }}</span>
          <span class="cand-keyword">“{{ searchResult.keyword }}”</span>
          <span class="cand-count">共检索到 {{ searchResult.results.length }} 个候选字</span>
        </div>
        <div class="cand-tip">点击下方候选字，即刻查看字根拆解与编码详情</div>
      </div>

      <div class="candidate-grid">
        <button
          v-for="cand in searchResult.results"
          :key="cand.char"
          class="candidate-card-btn"
          :class="{ active: selectedCandidate?.char === cand.char }"
          @click="selectedCandidate = cand"
        >
          <span class="cand-char">{{ cand.char }}</span>
          <div class="cand-meta">
            <span class="cand-code">{{ getFullCode(cand, store.version.value) }}</span>
            <span class="cand-pinyin">{{ cand.pinyin }}</span>
          </div>
          <span 
            class="cand-short-tag" 
            v-if="getShortCode(cand, store.version.value) && getShortCode(cand, store.version.value) !== getFullCode(cand, store.version.value)"
            :title="'简码: ' + getShortCode(cand, store.version.value)"
          >
            {{ getShortCode(cand, store.version.value) }}
          </span>
        </button>
      </div>
    </div>

    <!-- 单字拆分与对比卡片列表 -->
    <div class="results-container" v-if="displayedChars.length">
      <div class="section-divider" v-if="phraseInfo">
        <span>所含单字字根与编码拆解</span>
      </div>
      <div class="section-divider" v-else-if="searchResult.mode === 'code' || searchResult.mode === 'pinyin'">
        <span>候选字「{{ displayedChars[0]?.char }}」字根拆解与版本对比</span>
      </div>

      <div v-for="item in displayedChars" :key="item.char" class="char-result-card">
        <div class="char-left">
          <MiZiGe :text="item.char" size="medium" />
          <div class="pinyin">{{ item.pinyin }}</div>
          <!-- 汉字结构、部首、笔画等基本信息徽标 -->
          <div class="char-meta-info" v-if="item.ids || item.radical || item.strokes">
            <span class="meta-pill struct-pill" v-if="getStructureName(item.ids)" title="汉字结构">{{ getStructureName(item.ids) }}</span>
            <span class="meta-pill" v-if="item.radical" title="部首">部首: {{ item.radical }}</span>
            <span class="meta-pill" v-if="item.strokes" title="总笔画数">{{ item.strokes }}画</span>
          </div>
        </div>

        <div class="char-right">
          <!-- 三版本编码同屏对比 -->
          <div class="versions-comparison">
            <div class="version-row" :class="{ active: store.version.value === '86' }">
              <span class="ver-name">86 版</span>
              <span class="ver-code">
                <template v-if="getRecognitionCode(item, '86') && item.code86.endsWith(getRecognitionCode(item, '86')!) && item.code86.length > (getRoots(item, '86')?.length || 0)">
                  {{ item.code86.slice(0, -1) }}<span class="ver-code-recog" title="末笔字型交叉识别码">{{ getRecognitionCode(item, '86') }}</span>
                </template>
                <template v-else>
                  {{ item.code86 }}
                </template>
              </span>
              <span class="ver-short" v-if="item.short86">简码: {{ item.short86 }}</span>
            </div>
            <div class="version-row" :class="{ active: store.version.value === '98' }">
              <span class="ver-name">98 版</span>
              <span class="ver-code">{{ item.code98 }}</span>
              <span class="ver-short" v-if="item.short98">简码: {{ item.short98 }}</span>
            </div>
            <div class="version-row" :class="{ active: store.version.value === 'newCentury' }">
              <span class="ver-name">新世纪</span>
              <span class="ver-code">{{ item.codeNew }}</span>
              <span class="ver-short" v-if="item.shortNew">简码: {{ item.shortNew }}</span>
            </div>
          </div>

          <!-- 字根拆分流程气泡 (米字格印章风) -->
          <div class="roots-breakdown">
            <span class="roots-lbl">拆字字根：</span>
            <div class="roots-mizige-cells" v-if="getRootSteps(item, store.version.value).length">
              <div 
                v-for="(step, i) in getRootSteps(item, store.version.value)" 
                :key="i" 
                class="root-lookup-cell"
              >
                <MiZiGe :text="step.root" size="mini" />
                <span class="root-code-chip" v-if="step.key">
                  {{ step.key }}键<span v-if="getRootName(step.root)" class="root-sub-title"> ({{ getRootName(step.root) }})</span>
                </span>
              </div>
            </div>
            <div class="empty-roots-tip" v-else>
              <span class="tip-code-chip">全码击键：{{ getFullCode(item, store.version.value) }}</span>
              <span class="tip-sub">（暂无单一字根拆解图谱）</span>
            </div>

            <!-- 末笔识别码（当字根数少于4且有末笔识别码时清晰区分） -->
            <div class="recog-chip-badge" v-if="getRecognitionCode(item, store.version.value)">
              <span class="recog-chip-lbl">末笔识别码:</span>
              <span class="recog-chip-key">{{ getRecognitionCode(item, store.version.value) }}键</span>
              <span class="recog-chip-explain" v-if="getRecognitionCodeExplain(getRecognitionCode(item, store.version.value), item.recognitionFlag)">
                （{{ getRecognitionCodeExplain(getRecognitionCode(item, store.version.value), item.recognitionFlag) }}）
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态或未查到结果 -->
    <div class="empty-state" v-else>
      <div class="empty-icon">{{ searchKeyword.trim() ? '🔍' : '📖' }}</div>
      <div class="empty-title">{{ searchKeyword.trim() ? '未检索到匹配结果' : '查字字典已就绪' }}</div>
      <div class="empty-desc">
        {{ searchKeyword.trim() 
          ? `未检索到与 “${searchKeyword}” 对应的汉字、五笔编码或拼音。可尝试切换五笔版本或精简字母。`
          : '在上方输入框键入任意汉字、词组、五笔编码（如 KH、GGLL）或拼音（如 pao），即可极速反查三版全量编码与拆字全过程。' 
        }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useWubiStore } from '../stores/useWubiStore';
import { 
  WUBI_CHAR_MAP, 
  getRoots, 
  getRootSteps,
  getRootName,
  getFullCode, 
  getShortCode,
  getRecognitionCode,
  getRecognitionCodeExplain,
  getPhraseBreakdown,
  calculatePhraseCode 
} from '../data/wubiDict';
import { searchMultiModal, isDbPopulated, type MultiModalSearchResult } from '../data/wubiDb';
import type { WubiCharData } from '../types/wubi';
import { Search, X } from 'lucide-vue-next';
import MiZiGe from './MiZiGe.vue';

const store = useWubiStore();

const IDS_NAME_MAP: Record<string, string> = {
  '⿰': '左右结构',
  '⿱': '上下结构',
  '⿲': '左中右结构',
  '⿳': '上中下结构',
  '⿴': '全包围结构',
  '⿵': '上三包围',
  '⿶': '下三包围',
  '⿷': '左三包围',
  '⿸': '左上包围',
  '⿹': '右上包围',
  '⿺': '左下包围',
  '⿻': '镶嵌杂合'
};

const getStructureName = (ids?: string): string => {
  if (!ids) return '';
  for (const ch of ids) {
    if (IDS_NAME_MAP[ch]) return IDS_NAME_MAP[ch];
  }
  return '';
};

const getInitialQuery = () => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    return params.get('char') || params.get('q') || '五笔学堂';
  }
  return '五笔学堂';
};

const searchKeyword = ref(getInitialQuery());
const isLoading = ref(false);
const isDbReady = ref(false);
const selectedCandidate = ref<WubiCharData | null>(null);

const hotExamples = [
  { label: '五笔', val: '五笔', type: 'phrase' },
  { label: '学堂', val: '学堂', type: 'phrase' },
  { label: '跑(四码)', val: '跑', type: 'char' },
  { label: 'KH(足部前缀)', val: 'KH', type: 'code' },
  { label: 'ABV(反查匜)', val: 'ABV', type: 'code' },
  { label: 'pao(拼音)', val: 'pao', type: 'pinyin' },
  { label: '匜(疑难)', val: '匜', type: 'char' },
  { label: '鱼(连体)', val: '鱼', type: 'char' },
  { label: '人工智能', val: '人工智能', type: 'phrase' }
];

const searchResult = ref<MultiModalSearchResult>({
  mode: 'empty',
  keyword: '',
  results: []
});

// 词组计算
const phraseInfo = computed(() => {
  const kw = searchKeyword.value.trim().replace(/[^\u4e00-\u9fa5]/g, '');
  if (kw.length < 2) return null;

  const currentBreakdown = getPhraseBreakdown(kw, store.version.value);

  return {
    phrase: kw,
    ruleTip: `${currentBreakdown.ruleName}：${currentBreakdown.ruleDesc}`,
    code86: calculatePhraseCode(kw, '86'),
    code98: calculatePhraseCode(kw, '98'),
    codeNew: calculatePhraseCode(kw, 'newCentury'),
    breakdown: currentBreakdown
  };
});

// 执行多模态搜索
let searchTimer: any = null;
const executeSearch = () => {
  const kw = searchKeyword.value.trim();
  if (!kw) {
    searchResult.value = { mode: 'empty', keyword: '', results: [] };
    selectedCandidate.value = null;
    isLoading.value = false;
    return;
  }

  isLoading.value = true;
  clearTimeout(searchTimer);
  searchTimer = setTimeout(async () => {
    try {
      const res = await searchMultiModal(kw, store.version.value, 60);
      searchResult.value = res;
      if (res.results.length > 0) {
        selectedCandidate.value = res.results[0];
      } else {
        selectedCandidate.value = null;
      }
    } catch (e) {
      console.warn('[WubiLookup] search error:', e);
    } finally {
      isLoading.value = false;
    }
  }, 60);
};

// 监听搜索词及版本切换
watch([searchKeyword, () => store.version.value], () => {
  executeSearch();
}, { immediate: true });

// 显示的汉字拆解卡片列表
const displayedChars = computed<WubiCharData[]>(() => {
  if (searchResult.value.mode === 'char') {
    return searchResult.value.results;
  }
  if (searchResult.value.mode === 'code' || searchResult.value.mode === 'pinyin') {
    if (selectedCandidate.value) {
      return [selectedCandidate.value];
    }
    return searchResult.value.results.slice(0, 1);
  }
  return [];
});

onMounted(async () => {
  isDbReady.value = await isDbPopulated();
  if (!isDbReady.value) {
    const { ensureDictPopulated } = await import('../data/wubiDb');
    ensureDictPopulated().then(() => {
      isDbReady.value = true;
    });
  }
});
</script>

<style scoped>
.lookup-wrapper {
  max-width: 960px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.search-box {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.search-header {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.search-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.dict-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--text-color);
  margin: 0;
}

.dict-badge {
  font-size: 0.78rem;
  padding: 0.2rem 0.6rem;
  background: var(--primary-color);
  color: #fff;
  border-radius: 999px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.db-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  padding: 0.18rem 0.55rem;
  background: rgba(234, 179, 8, 0.12);
  color: #d97706;
  border: 1px solid rgba(234, 179, 8, 0.25);
  border-radius: 999px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.db-status-pill.ready {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border-color: rgba(16, 185, 129, 0.25);
}

.db-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: currentColor;
}

.dict-sub {
  font-size: 0.88rem;
  color: var(--text-muted);
}

.search-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1rem;
  color: var(--text-muted);
  pointer-events: none;
}

.lookup-input {
  width: 100%;
  background: var(--bg-color);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  padding: 0.85rem 3.5rem 0.85rem 2.8rem;
  font-size: 1.15rem;
  color: var(--text-color);
  outline: none;
  transition: all 0.2s ease;
}

.lookup-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
}

.input-actions {
  position: absolute;
  right: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.loading-spin {
  font-size: 0.95rem;
  animation: spin 1s infinite linear;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.clear-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  border-radius: 50%;
}

.clear-btn:hover {
  color: var(--text-color);
  background: var(--border-color);
}

.quick-tags {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  font-size: 0.88rem;
}

.tag-lbl {
  color: var(--text-muted);
}

.quick-word-btn {
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 0.25rem 0.65rem;
  color: var(--text-color);
  font-size: 0.88rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.quick-word-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  transform: translateY(-1px);
}

.quick-word-btn.code-tag {
  border-color: rgba(99, 102, 241, 0.3);
  color: var(--primary-color);
  background: rgba(99, 102, 241, 0.05);
}

.quick-word-btn.pinyin-tag {
  border-color: rgba(16, 185, 129, 0.3);
  color: #10b981;
  background: rgba(16, 185, 129, 0.05);
}

/* 多模态候选字网格面板 */
.candidate-panel {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.candidate-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-color);
}

.candidate-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--text-color);
  flex-wrap: wrap;
}

.cand-type {
  color: var(--primary-color);
  font-weight: 700;
}

.cand-keyword {
  font-family: var(--font-mono, monospace);
  font-weight: 800;
  color: var(--text-color);
}

.cand-count {
  font-size: 0.8rem;
  color: var(--text-muted);
  background: var(--bg-color);
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  border: 1px solid var(--border-color);
}

.cand-tip {
  font-size: 0.78rem;
  color: var(--text-muted);
}

.candidate-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(88px, 1fr));
  gap: 0.65rem;
  max-height: 280px;
  overflow-y: auto;
  padding-right: 0.25rem;
}

.candidate-card-btn {
  position: relative;
  background: var(--bg-color);
  border: 1.5px solid var(--border-color);
  border-radius: 10px;
  padding: 0.6rem 0.4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
}

.candidate-card-btn:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.12);
}

.candidate-card-btn.active {
  border-color: var(--primary-color);
  background: rgba(99, 102, 241, 0.1);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.25);
}

.cand-char {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--text-color);
  line-height: 1.1;
}

.cand-meta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
  width: 100%;
}

.cand-code {
  font-family: var(--font-mono, monospace);
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--primary-color);
  letter-spacing: 0.5px;
}

.cand-pinyin {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.cand-short-tag {
  position: absolute;
  top: 4px;
  right: 4px;
  font-size: 0.62rem;
  font-weight: 700;
  color: #10b981;
  background: rgba(16, 185, 129, 0.15);
  padding: 0.05rem 0.25rem;
  border-radius: 3px;
  font-family: var(--font-mono, monospace);
}

/* 词组整词编码卡片 */
.phrase-result-card {
  background: var(--card-bg);
  border: 2px solid var(--primary-color);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.08);
}

.phrase-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.phrase-left-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.phrase-tag {
  background: var(--primary-color);
  color: #fff;
  font-size: 0.8rem;
  font-weight: 700;
  padding: 0.25rem 0.65rem;
  border-radius: 6px;
}

.phrase-word {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--text-color);
  letter-spacing: 2px;
}

.phrase-rule-tip {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.88rem;
  color: var(--text-muted);
  background: var(--bg-color);
  padding: 0.35rem 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.phrase-codes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.phrase-code-col {
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s ease;
}

.phrase-code-col.active {
  border-color: var(--primary-color);
  background: rgba(99, 102, 241, 0.06);
}

.p-ver-tag {
  font-size: 0.82rem;
  color: var(--text-muted);
  font-weight: 600;
}

.p-code-highlight {
  font-family: var(--font-mono, monospace);
  font-size: 1.8rem;
  font-weight: 800;
  letter-spacing: 4px;
  color: var(--primary-color);
}

.section-divider {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0.5rem 0;
  color: var(--text-muted);
  font-size: 0.9rem;
  font-weight: 600;
}

.section-divider::before,
.section-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border-color);
}

.results-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.char-result-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  display: flex;
  gap: 1.75rem;
  align-items: center;
}

.char-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 85px;
  padding-right: 1.5rem;
  border-right: 1px dashed var(--border-color);
}

.main-char {
  font-size: 3.2rem;
  font-weight: 800;
  color: var(--text-color);
  line-height: 1.1;
}

.pinyin {
  font-size: 1rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
}

.char-meta-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.5rem;
  width: 100%;
}

.meta-pill {
  font-size: 0.72rem;
  color: var(--text-muted);
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  padding: 0.12rem 0.45rem;
  border-radius: 4px;
  white-space: nowrap;
  text-align: center;
  max-width: 110px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.char-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.versions-comparison {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
}

.version-row {
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 0.65rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.version-row.active {
  border-color: var(--primary-color);
  background: rgba(99, 102, 241, 0.08);
}

.ver-name {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-weight: 600;
}

.ver-code {
  font-family: var(--font-mono, monospace);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary-color);
  letter-spacing: 1px;
}

.ver-code-recog {
  color: #f59e0b;
  font-weight: 800;
}

.ver-short {
  font-size: 0.8rem;
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  font-weight: 600;
}

.roots-breakdown {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border-color);
}

.roots-lbl {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.roots-mizige-cells {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.empty-roots-tip {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.82rem;
  color: var(--text-muted);
}

.tip-code-chip {
  font-family: var(--font-mono, monospace);
  font-weight: 700;
  color: var(--primary-color);
  background: rgba(99, 102, 241, 0.08);
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
}

.tip-sub {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.root-lookup-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.root-code-chip {
  font-size: 0.72rem;
  color: var(--primary-color);
  font-weight: 700;
  font-family: var(--font-mono, monospace);
  background: rgba(99, 102, 241, 0.08);
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
}

.recog-chip-badge {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(99, 102, 241, 0.08);
  border: 1px dashed var(--primary-color);
  padding: 0.25rem 0.65rem;
  border-radius: 6px;
}

.recog-chip-lbl {
  font-size: 0.78rem;
  color: var(--text-muted);
}

.recog-chip-key {
  font-family: var(--font-mono, monospace);
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--primary-color);
}

.recog-chip-explain {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 500;
}

/* 词组拆码流程 */
.phrase-breakdown-steps {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  background: var(--bg-color);
  padding: 0.85rem 1rem;
  border-radius: 10px;
  border: 1px solid var(--border-color);
}

.steps-title {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-muted);
}

.steps-row {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex-wrap: wrap;
}

.lookup-step-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.step-char-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 0.2rem 0.5rem;
}

.step-ch {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-color);
}

.step-sub {
  font-size: 0.65rem;
  color: var(--text-muted);
}

.step-arrow-icon {
  color: var(--text-muted);
  font-size: 0.8rem;
}

.step-key-badge {
  font-family: var(--font-mono, monospace);
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--primary-color);
  background: rgba(99, 102, 241, 0.12);
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
}

.empty-state {
  background: var(--card-bg);
  border: 1px dashed var(--border-color);
  border-radius: 16px;
  padding: 4rem 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.empty-icon {
  font-size: 3rem;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-color);
}

.empty-desc {
  font-size: 0.9rem;
  color: var(--text-muted);
  max-width: 420px;
}

@media (max-width: 640px) {
  .char-result-card {
    flex-direction: column;
    align-items: flex-start;
  }
  .char-left {
    border-right: none;
    border-bottom: 1px dashed var(--border-color);
    padding-right: 0;
    padding-bottom: 1rem;
    width: 100%;
  }
}
</style>
