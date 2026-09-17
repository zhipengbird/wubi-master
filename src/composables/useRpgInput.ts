import { ref, computed, type Ref, type ComputedRef } from 'vue';
import type { TargetCodesResult } from '../data/wubiDict';
import type { CommitMode } from '../types/wubi';

export interface UseRpgInputOptions {
  currentTargetText: ComputedRef<string>;
  currentTargetCodes: ComputedRef<TargetCodesResult>;
  commitMode: Ref<CommitMode>;
  isSingleKeyStage?: ComputedRef<boolean>;
  canCastUltimate?: ComputedRef<boolean>;
  onCastUltimate?: () => void;
  onHit: (matchedLen: number) => void;
  onError: () => void;
}

export function useRpgInput(options: UseRpgInputOptions) {
  const {
    currentTargetText,
    currentTargetCodes,
    commitMode,
    isSingleKeyStage,
    canCastUltimate,
    onCastUltimate,
    onHit,
    onError
  } = options;

  // 输入捕获与状态
  const hiddenInputRef = ref<HTMLInputElement | null>(null);
  const rawInput = ref<string>('');
  const isComposing = ref<boolean>(false);
  const composingText = ref<string>('');
  const inputKeys = ref<string[]>([]);

  // 活跃显示的输入字符槽（优先展示 IME 组字中的拼音/字母，否则展示物理键入编码）
  const activeInputChars = computed<string[]>(() => {
    if (composingText.value) {
      return composingText.value.slice(0, 4).split('');
    }
    return inputKeys.value;
  });

  let lastImeCommitText = '';

  // 聚焦隐藏输入框
  const focusHiddenInput = () => {
    hiddenInputRef.value?.focus();
  };

  // 重置输入缓冲区
  const resetInput = () => {
    inputKeys.value = [];
    rawInput.value = '';
    composingText.value = '';
    if (hiddenInputRef.value) {
      hiddenInputRef.value.value = '';
    }
  };

  // 4 码秒出或单键模式自动判定
  const checkAutoCommit = () => {
    const typed = inputKeys.value.join('');
    const codes = currentTargetCodes.value;

    // 1. 敲满 4 码且命中合法编码（全码或已知合法编码）-> 直接瞬间命中（0 延迟盲打，免敲空格）
    if (typed.length >= 4 && codes.all.includes(typed)) {
      onHit(typed.length);
      return;
    }

    // 2. 敲满 4 码且不匹配任何合法编码 -> 立即报错走火入魔
    if (typed.length >= 4 && !codes.all.includes(typed)) {
      onError();
      return;
    }

    // 3. 一级简码关卡（一键一字）或 auto 模式：单键/简码即刻出字
    if (commitMode.value === 'auto' || isSingleKeyStage?.value) {
      if (codes.shorts.includes(typed) || typed === codes.full) {
        onHit(typed.length);
        return;
      }
    }
  };

  // 敲击空格触发显式提交
  const checkAndCommit = () => {
    let typed = (composingText.value || inputKeys.value.join('')).toUpperCase();

    // 兜底：如果 composingText 和 inputKeys 都空，从 input 框原始值里取
    if (!typed && hiddenInputRef.value) {
      const raw = hiddenInputRef.value.value.trim().toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
      if (raw) {
        inputKeys.value = raw.split('');
        typed = raw;
      }
    }

    if (!typed) return;
    const codes = currentTargetCodes.value;

    // 敲简码或全码后按空格，只要属于合法编码集（全码、一简、二简、三简），直接判定破阵！
    if (codes.all.includes(typed)) {
      onHit(typed.length);
    } else {
      onError();
    }
  };

  // 键盘事件处理
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      if (canCastUltimate?.value && onCastUltimate) {
        onCastUltimate();
      }
      return;
    }

    if (e.key === 'Backspace') {
      e.preventDefault();
      if (isComposing.value) {
        // IME 组字期间退格：由 IME 自己处理
        return;
      }
      if (inputKeys.value.length > 0) {
        inputKeys.value.pop();
      }
      const rem = inputKeys.value.join('');
      rawInput.value = rem;
      if (hiddenInputRef.value) {
        hiddenInputRef.value.value = rem;
      }
      return;
    }

    if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      // 空格键：无论 IME 是否组字，都尝试出字（isComposing=true 时用 composingText；false 时用 inputKeys）
      const typed = (composingText.value || inputKeys.value.join('')).toUpperCase();
      if (!typed) return;
      checkAndCommit();
      return;
    }

    // 字母键：IME 组字期间交给输入法处理，不重复累积
    if (isComposing.value) return;

    if (/^[a-zA-Z]$/.test(e.key)) {
      e.preventDefault();
      const key = e.key.toUpperCase();

      if (inputKeys.value.length < 4) {
        inputKeys.value.push(key);
        const cur = inputKeys.value.join('');
        rawInput.value = cur;
        if (hiddenInputRef.value) {
          hiddenInputRef.value.value = cur;
        }
        checkAutoCommit();
      }
    }
  };

  // 输入法 Composition 支持
  const onCompositionStart = () => {
    isComposing.value = true;
  };

  const onCompositionUpdate = (e: CompositionEvent) => {
    isComposing.value = true;
    composingText.value = (e.data || '').replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4);
  };

  const onCompositionEnd = (e: CompositionEvent) => {
    isComposing.value = false;
    const committedText = (e.data || '').trim();
    resetInput();

    if (!committedText) return;
    lastImeCommitText = committedText;

    // 判定 1：汉字命中当前目标汉字
    if (committedText.includes(currentTargetText.value)) {
      onHit(4);
      return;
    }

    // 判定 2：字母编码命中（若用户用输入法打出了英文大写编码上屏）
    const upper = committedText.toUpperCase();
    if (currentTargetCodes.value.all.includes(upper)) {
      onHit(upper.length);
      return;
    }

    // 错字走火入魔
    onError();
  };

  // 原生 Input 输入事件（兼容 IME 选词后直接触发 input 或字母直接上屏）
  const onNativeInput = (e: Event) => {
    if (isComposing.value) return;
    const target = e.target as HTMLInputElement;
    const val = target.value.trim();
    if (!val) return;

    if (lastImeCommitText && val === lastImeCommitText) {
      lastImeCommitText = '';
      target.value = '';
      return;
    }
    lastImeCommitText = '';

    // 汉字命中当前目标
    if (val.includes(currentTargetText.value)) {
      onHit(4);
      resetInput();
      return;
    }

    const upper = val.toUpperCase();

    // 字母全码/简码命中
    if (currentTargetCodes.value.all.includes(upper)) {
      onHit(upper.length);
      resetInput();
      return;
    }

    // 字母未命中：把字母同步到 inputKeys，让 checkAutoCommit 继续判定
    // 防止 IME 绕过 onKeyDown 时字母丢失
    const letters = upper.replace(/[^A-Z]/g, '').slice(0, 4);
    if (letters && letters !== inputKeys.value.join('')) {
      inputKeys.value = letters.split('');
      checkAutoCommit();
    }
  };

  return {
    hiddenInputRef,
    rawInput,
    inputKeys,
    composingText,
    isComposing,
    activeInputChars,
    focusHiddenInput,
    resetInput,
    checkAutoCommit,
    checkAndCommit,
    onKeyDown,
    onNativeInput,
    onCompositionStart,
    onCompositionUpdate,
    onCompositionEnd
  };
}
