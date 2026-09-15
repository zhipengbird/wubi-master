<template>
  <div 
    class="mizige-box" 
    :class="[
      `size-${size}`, 
      { 'is-active': active, 'is-multi': text && text.length > 1 }
    ]"
  >
    <!-- 传统米字格矢量底纹 -->
    <svg 
      class="mizige-grid-svg" 
      viewBox="0 0 100 100" 
      preserveAspectRatio="none"
    >
      <!-- 外部实线方框 -->
      <rect x="1" y="1" width="98" height="98" fill="none" class="mizige-border-line" />
      <!-- 十字虚线（横中线、竖中线） -->
      <line x1="0" y1="50" x2="100" y2="50" class="mizige-center-line" />
      <line x1="50" y1="0" x2="50" y2="100" class="mizige-center-line" />
      <!-- 米字对角虚线 -->
      <line x1="0" y1="0" x2="100" y2="100" class="mizige-diag-line" />
      <line x1="100" y1="0" x2="0" y2="100" class="mizige-diag-line" />
    </svg>

    <!-- 特殊一体化复合字根（如无尾鱼：⺈+田上下结构一体字根） -->
    <div class="mizige-stack-root" v-if="text === '⺈田'">
      <span class="stack-top">⺈</span>
      <span class="stack-bottom">田</span>
    </div>

    <!-- 祭字头矢量专用字根（W键） -->
    <svg class="mizige-svg-glyph" viewBox="0 0 1024 1024" v-else-if="text === '祭头'">
      <g transform="translate(0, 920) scale(1, -1) translate(0, -320)">
        <path d="M 257 643 Q 287 673 311 704 L 323 722 Q 332 741 378 808 Q 388 821 374 835 Q 337 866 309 863 Q 299 860 300 847 Q 312 757 214 645 Q 205 642 173 600 Q 166 585 180 590 Q 192 591 246 633 L 257 643 Z" fill="currentColor" />
        <path d="M 311 704 Q 323 695 351 700 Q 403 712 406 704 Q 412 686 383 623 Q 358 553 279 460 Q 201 360 73 267 Q 51 254 70 255 Q 205 261 385 525 Q 484 693 487 694 Q 488 695 490 696 Q 503 705 497 717 Q 493 727 441 750 Q 429 756 407 745 Q 382 733 323 722 C 294 716 282 712 311 704 Z" fill="currentColor" />
        <path d="M 246 633 Q 245 626 286 583 Q 301 570 315 569 Q 327 568 332 584 Q 333 596 324 613 Q 315 626 297 631 Q 269 643 257 643 C 243 644 243 644 246 633 Z" fill="currentColor" />
        <path d="M 176 529 Q 209 466 233 460 Q 246 457 255 473 Q 258 486 252 506 Q 237 536 184 554 Q 177 557 173 546 Q 170 539 176 529 Z" fill="currentColor" />
        <path d="M 639 605 Q 736 702 782 731 Q 794 735 793 746 Q 794 758 769 770 Q 750 782 730 794 Q 708 807 694 800 Q 642 778 550 764 Q 529 763 543 745 Q 561 724 584 731 Q 656 758 676 755 Q 692 740 686 728 Q 686 722 627 617 C 612 591 618 584 639 605 Z" fill="currentColor" />
        <path d="M 627 617 Q 599 647 570 681 Q 558 697 540 700 Q 515 700 507 692 Q 504 686 513 681 Q 550 660 574 625 Q 772 361 808 351 Q 853 342 963 364 Q 979 365 985 374 Q 989 381 979 385 Q 820 440 736 513 Q 691 552 639 605 L 627 617 Z" fill="currentColor" />
      </g>
    </svg>

    <!-- 居中汉字或拆解字根 -->
    <span class="mizige-text" v-else>{{ text }}</span>

    <!-- 底部角标提示（如键位字母/顺序） -->
    <span class="mizige-sub-badge" v-if="sub">{{ sub }}</span>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  text?: string;
  size?: 'large' | 'medium' | 'small' | 'mini';
  active?: boolean;
  sub?: string;
}>(), {
  text: '',
  size: 'large',
  active: false,
  sub: ''
});
</script>

<style scoped>
.mizige-box {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--mizige-bg, var(--card-bg));
  box-sizing: border-box;
  user-select: none;
  border-radius: 4px;
  transition: all 0.2s ease;
  overflow: visible;
}

/* 尺寸规格 */
.size-large {
  width: 140px;
  height: 140px;
}
.size-large .mizige-text {
  font-size: 5.2rem;
}
.size-large.is-multi .mizige-text {
  font-size: 2.8rem;
}

.size-medium {
  width: 84px;
  height: 84px;
}
.size-medium .mizige-text {
  font-size: 3.2rem;
}
.size-medium.is-multi .mizige-text {
  font-size: 1.8rem;
}

.size-small {
  width: 52px;
  height: 52px;
}
.size-small .mizige-text {
  font-size: 1.9rem;
}
.size-small.is-multi .mizige-text {
  font-size: 1.15rem;
}

.size-mini {
  width: 38px;
  height: 38px;
}
.size-mini .mizige-text {
  font-size: 1.35rem;
}
.size-mini.is-multi .mizige-text {
  font-size: 0.9rem;
}

/* 米字格 SVG 样式 */
.mizige-grid-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.mizige-border-line {
  stroke: var(--mizige-border, var(--border-color));
  stroke-width: 1.6;
}

.mizige-center-line {
  stroke: var(--mizige-line, var(--border-color));
  stroke-width: 1;
  stroke-dasharray: 4, 3;
}

.mizige-diag-line {
  stroke: var(--mizige-line, var(--border-color));
  stroke-width: 0.8;
  stroke-dasharray: 2, 4;
}

/* 楷体书法风汉字与五笔字根专用字体 */
.mizige-text {
  position: relative;
  z-index: 2;
  font-family: 'WubiUnits', 'Kaiti SC', 'STKaiti', 'KaiTi', 'SimSun', 'Noto Serif SC', serif, system-ui;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* 上下复合一体字根（如无尾鱼：⺈在顶、田在底，上下合为一体） */
.mizige-stack-root {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  line-height: 0.82;
  user-select: none;
  font-family: 'WubiUnits', 'Kaiti SC', 'STKaiti', 'KaiTi', 'SimSun', serif, system-ui;
  font-weight: 700;
  color: var(--text-main);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.size-large .mizige-stack-root .stack-top { font-size: 2.8rem; margin-bottom: -5px; }
.size-large .mizige-stack-root .stack-bottom { font-size: 2.7rem; }

.size-medium .mizige-stack-root .stack-top { font-size: 1.8rem; margin-bottom: -3px; }
.size-medium .mizige-stack-root .stack-bottom { font-size: 1.7rem; }

.size-small .mizige-stack-root .stack-top { font-size: 1.15rem; margin-bottom: -2px; }
.size-small .mizige-stack-root .stack-bottom { font-size: 1.15rem; }

.size-mini .mizige-stack-root .stack-top { font-size: 0.82rem; margin-bottom: -2px; }
.size-mini .mizige-stack-root .stack-bottom { font-size: 0.82rem; }

/* 矢量专用字根 */
.mizige-svg-glyph {
  width: 72%;
  height: 72%;
  color: var(--text-color, #f8fafc);
  z-index: 1;
  pointer-events: none;
}

/* 高亮激活状态 */
.is-active {
  box-shadow: 0 0 16px rgba(56, 189, 248, 0.2);
}
.is-active .mizige-border-line {
  stroke: var(--accent, #38bdf8);
  stroke-width: 2;
}

/* 角标 */
.mizige-sub-badge {
  position: absolute;
  bottom: -6px;
  right: -6px;
  background: var(--accent);
  color: #ffffff;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
  line-height: 1.2;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  font-family: var(--font-mono, monospace);
  z-index: 3;
}
</style>
