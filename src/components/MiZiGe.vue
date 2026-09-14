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

    <!-- 居中汉字或拆解字根 -->
    <span class="mizige-text">{{ text }}</span>

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

/* 楷体书法风汉字 */
.mizige-text {
  position: relative;
  z-index: 2;
  font-family: 'Kaiti SC', 'STKaiti', 'KaiTi', 'SimSun', 'Noto Serif SC', serif, system-ui;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
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
