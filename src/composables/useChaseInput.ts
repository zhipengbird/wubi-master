import { ref, computed, type Ref, type ComputedRef } from 'vue';
import type { WubiCharData, CommitMode } from '../types/wubi';
import { getAllValidCodes } from '../data/wubiDict';
import { matchChineseStream } from '../utils/phraseMatching';
import { soundPlayer } from '../utils/audio';
import { useWubiStore } from '../stores/useWubiStore';

export interface UseChaseInputOptions {
  targetChars: Ref<WubiCharData[]>;
  playerIndex: Ref<number>;
  gameState: Ref<'idle' | 'running' | 'finished' | 'failed'>;
  commitMode: Ref<CommitMode>;
  gameCharsList: ComputedRef<string[]>;
  onSuccess: (step?: number) => void;
  onError: () => void;
  onKeystroke?: () => void;
}

export function useChaseInput(options: UseChaseInputOptions) {
  const {
    targetChars,
    playerIndex,
    gameState,
    commitMode,
    gameCharsList,
    onSuccess,
    onError,
    onKeystroke
  } = options;

  const store = useWubiStore();
  const hiddenInputRef = ref<HTMLInputElement | null>(null);
  const inputBuffer = ref<string>('');
  const isComposingRef = ref(false);
  const composingText = ref('');
  const hasInputError = ref<boolean>(false);
  let lastCommittedText = '';

  const displayInput = computed(() => {
    return (inputBuffer.value || composingText.value).slice(0, 4);
  });

  const focusHiddenInput = () => {
    hiddenInputRef.value?.focus();
  };

  const resetInput = () => {
    inputBuffer.value = '';
    composingText.value = '';
    hasInputError.value = false;
    if (hiddenInputRef.value) {
      hiddenInputRef.value.value = '';
    }
  };

  // 验证输入是否与当前字匹配（支持全码与简码任意输入，拒绝偏废）
  const verifyCurrentInput = (forceSpace: boolean) => {
    const currentItem = targetChars.value[playerIndex.value];
    if (!currentItem) return;

    const currentBuf = (inputBuffer.value || composingText.value).trim().toUpperCase();
    if (!currentBuf) {
      hasInputError.value = false;
      return;
    }

    // 1. 汉字直接比对
    if (currentBuf === currentItem.char) {
      onSuccess(1);
      return;
    }

    const validCodes = getAllValidCodes(currentItem.char, store.version.value);
    const fullCode = validCodes.full || '';
    const shortCodes = validCodes.shorts;

    // 2. 全码命中（打出4位全码，或敲空格出字，立即成功）
    if (currentBuf === fullCode) {
      if (commitMode.value === 'auto' || forceSpace || currentBuf.length >= 4) {
        onSuccess(1);
        return;
      }
    }

    // 3. 简码命中（支持一简、二简、三简）
    if (shortCodes.includes(currentBuf)) {
      if (forceSpace || commitMode.value === 'auto') {
        onSuccess(1);
        return;
      }
    }

    if (forceSpace) {
      onError();
      return;
    }

    // 4. 前缀合法性（只要是全码或简码的前缀，均不报红）
    const isPrefix = validCodes.all.some(code => code.startsWith(currentBuf));
    hasInputError.value = !isPrefix;
  };

  // 统一汉字上屏提交处理逻辑（完美支持单个汉字及多字词组流式上屏）
  const processChineseCommit = (text: string) => {
    lastCommittedText = text;
    inputBuffer.value = '';
    composingText.value = '';
    if (hiddenInputRef.value) {
      hiddenInputRef.value.value = '';
    }

    const cleanChars = Array.from(text).filter(c => !/\r|\n/.test(c));
    if (cleanChars.length === 0) return;

    const res = matchChineseStream(cleanChars, gameCharsList.value, playerIndex.value);
    if (res.targetAdvancedCount > 0) {
      onSuccess(res.targetAdvancedCount);
    }

    if (!res.isAllMatched) {
      onError();
    }
  };

  // 键盘特殊功能键处理 (退格、回车、空格)
  const handleKeyDown = (e: KeyboardEvent) => {
    if (gameState.value !== 'running') return;

    const key = e.key;

    // 忽略控制键
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    // 退格删除（IME 组字期间交给 IME 处理）
    if (key === 'Backspace') {
      if (isComposingRef.value) return;
      if (inputBuffer.value.length > 0 || composingText.value.length > 0) {
        e.preventDefault();
        inputBuffer.value = inputBuffer.value.slice(0, -1);
        composingText.value = '';
        if (hiddenInputRef.value) {
          hiddenInputRef.value.value = inputBuffer.value;
        }
        hasInputError.value = false;
        soundPlayer.playKey(store.audio.value, false, false);
      }
      return;
    }

    // 空格键提交出字：IME 组字期间也允许穿透（用 composingText 出字）
    if (key === ' ' || key === 'Spacebar') {
      e.preventDefault();
      if (composingText.value) {
        inputBuffer.value = composingText.value;
        composingText.value = '';
        if (hiddenInputRef.value) hiddenInputRef.value.value = '';
      }
      if (!inputBuffer.value.trim()) return;
      verifyCurrentInput(true);
      return;
    }

    // IME 组字期间，其他按键（字母等）交给输入法
    if (isComposingRef.value) return;

    // 回车清空
    if (key === 'Enter') {
      e.preventDefault();
      inputBuffer.value = '';
      composingText.value = '';
      if (hiddenInputRef.value) {
        hiddenInputRef.value.value = '';
      }
      hasInputError.value = false;
      return;
    }
  };

  // 输入法组合开始
  const handleCompositionStart = () => {
    isComposingRef.value = true;
    composingText.value = '';
    hasInputError.value = false;
  };

  const handleCompositionUpdate = (e: CompositionEvent) => {
    isComposingRef.value = true;
    hasInputError.value = false;
    composingText.value = (e.data || (hiddenInputRef.value?.value || '')).replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4);
  };

  // 输入法组合结束
  const handleCompositionEnd = (e: CompositionEvent) => {
    isComposingRef.value = false;
    const committedData = (e.data || (hiddenInputRef.value ? hiddenInputRef.value.value : '')).trim();
    composingText.value = '';
    if (hiddenInputRef.value) hiddenInputRef.value.value = '';
    if (committedData) {
      if (/[\u4e00-\u9fa5]/.test(committedData)) {
        processChineseCommit(committedData);
      } else {
        inputBuffer.value = committedData.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4);
        verifyCurrentInput(true);
      }
    }
  };

  // 统一原生输入处理：兼顾汉字选词与纯英文编码
  const handleNativeInput = (e: Event) => {
    if (gameState.value !== 'running') return;

    const target = e.target as HTMLInputElement;
    const val = target.value;

    // 1. 若包含汉字，属于输入法选字上屏
    if (/[\u4e00-\u9fa5]/.test(val)) {
      if (lastCommittedText && val.trim() === lastCommittedText) {
        lastCommittedText = '';
        target.value = '';
        return;
      }
      processChineseCommit(val.trim());
      target.value = '';
      return;
    }

    // 2. 若处于输入法组字阶段，提取组合中的字母实时展示
    if (isComposingRef.value || (e as InputEvent).isComposing) {
      hasInputError.value = false;
      composingText.value = val.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4);
      return;
    }

    // 3. 纯英文五笔编码
    lastCommittedText = '';
    composingText.value = '';
    const clean = val.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4);
    inputBuffer.value = clean;
    target.value = clean;
    if (onKeystroke) {
      onKeystroke();
    }
    soundPlayer.playKey(store.audio.value, false, false);
    verifyCurrentInput(false);

    if (inputBuffer.value === '') {
      target.value = '';
    }
  };

  return {
    hiddenInputRef,
    inputBuffer,
    composingText,
    isComposingRef,
    hasInputError,
    displayInput,
    focusHiddenInput,
    resetInput,
    verifyCurrentInput,
    handleKeyDown,
    handleCompositionStart,
    handleCompositionUpdate,
    handleCompositionEnd,
    handleNativeInput
  };
}
