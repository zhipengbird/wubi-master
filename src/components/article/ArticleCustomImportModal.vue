<template>
  <div class="modal-backdrop" v-if="show" @click.self="$emit('close')">
    <div class="modal-dialog import-modal-dialog">
      <div class="import-modal-header">
        <div class="import-header-title">
          <h3 class="modal-heading">📝 导入文章练习题库</h3>
          <span class="import-badge">支持两种导入方式</span>
        </div>
        <button class="lib-close-btn" @click="$emit('close')">
          <X :size="20" />
        </button>
      </div>

      <!-- 导入模式切换 Tab -->
      <div class="import-tabs">
        <button
          class="import-tab-btn"
          :class="{ active: customImportMode === 'file' }"
          @click="customImportMode = 'file'"
        >
          <Upload :size="16" />
          <span>本地选文件导入 (.txt / .md)</span>
        </button>
        <button
          class="import-tab-btn"
          :class="{ active: customImportMode === 'paste' }"
          @click="customImportMode = 'paste'"
        >
          <Clipboard :size="16" />
          <span>手动粘贴正文</span>
        </button>
      </div>

      <!-- 方式一：文件拖拽/选取导入 -->
      <div class="file-upload-zone" v-if="customImportMode === 'file'">
        <input
          ref="fileInputRef"
          type="file"
          accept=".txt,.md,.text"
          class="hidden-file-input"
          @change="handleFileUpload"
        />
        <div
          class="drop-box"
          :class="{ 'has-file': uploadedFileName }"
          @click="triggerFileInput"
          @dragover.prevent
          @drop.prevent="handleFileDrop"
        >
          <div class="drop-icon-wrap">
            <FileText :size="36" v-if="uploadedFileName" class="file-icon-ready" />
            <Upload :size="36" v-else class="file-icon-idle" />
          </div>
          <div class="drop-texts">
            <span class="drop-primary" v-if="uploadedFileName">已加载文件：{{ uploadedFileName }}</span>
            <span class="drop-primary" v-else>点击选取电脑文件，或直接将文件拖拽至此</span>
            <span class="drop-sub">支持 UTF-8 编码的 .txt 纯文本或 .md 格式文件</span>
          </div>
        </div>
      </div>

      <!-- 通用设置：标题与正文预览/手动粘贴 -->
      <div class="import-fields">
        <div class="field-item">
          <label class="field-lbl">文章标题（选填，默认读取文件名或自拟）：</label>
          <input
            v-model="customTitle"
            type="text"
            placeholder="请输入或自定文章标题（如：公司公文通报、经典美文练习等）"
            class="custom-input-title"
          />
        </div>

        <div class="field-item">
          <div class="field-lbl-row">
            <label class="field-lbl">
              {{ customImportMode === 'file' ? '导入文件正文预览（可微调修改）：' : '请粘贴文章正文：' }}
            </label>
            <span class="char-counter-tag" v-if="customText">共 {{ customText.length }} 字</span>
          </div>
          <textarea
            v-model="customText"
            rows="7"
            :placeholder="customImportMode === 'file' ? '选择文件后此处将自动显示文本内容，亦可手动编辑...' : '请在此粘贴您想打字练习的任意中文篇章、新闻或小说段落...'"
            class="custom-textarea"
          ></textarea>
        </div>
      </div>

      <div class="modal-btns">
        <button class="btn-cancel" @click="$emit('close')">取消</button>
        <button class="btn-submit" :disabled="!customText.trim()" @click="onApply">
          立即生成打字题
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Upload, Clipboard, FileText, X } from 'lucide-vue-next';

defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'apply', payload: { title: string; text: string }): void;
}>();

const customImportMode = ref<'file' | 'paste'>('file');
const customTitle = ref<string>('');
const customText = ref<string>('');
const uploadedFileName = ref<string>('');
const fileInputRef = ref<HTMLInputElement | null>(null);

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const readFileContent = (file: File) => {
  if (!file) return;
  const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
  uploadedFileName.value = file.name;
  if (!customTitle.value.trim()) {
    customTitle.value = fileNameWithoutExt;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const result = e.target?.result;
    if (typeof result === 'string') {
      customText.value = result.trim();
    }
  };
  reader.readAsText(file, 'UTF-8');
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  if (files && files.length > 0) {
    readFileContent(files[0]);
  }
};

const handleFileDrop = (event: DragEvent) => {
  const files = event.dataTransfer?.files;
  if (files && files.length > 0) {
    readFileContent(files[0]);
  }
};

const onApply = () => {
  if (!customText.value.trim()) return;
  emit('apply', {
    title: customTitle.value.trim() || '自定义导入文章',
    text: customText.value.trim()
  });
  // 重置状态
  customText.value = '';
  customTitle.value = '';
  uploadedFileName.value = '';
};
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(4px);
  padding: 1rem;
}

.modal-dialog {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  width: 100%;
  max-width: 680px;
  padding: 2rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
  animation: modalIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  max-height: 90vh;
  overflow-y: auto;
}

@keyframes modalIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.import-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.import-header-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.modal-heading {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--text-main);
}

.import-badge {
  font-size: 0.75rem;
  padding: 2px 8px;
  background: var(--accent-subtle, rgba(56, 189, 248, 0.15));
  color: var(--accent);
  border-radius: 9999px;
  font-weight: 600;
}

.lib-close-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
}

.import-tabs {
  display: flex;
  gap: 8px;
  background: var(--bg-primary);
  padding: 4px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  margin-bottom: 1.25rem;
}

.import-tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.import-tab-btn.active {
  background: var(--accent);
  color: #ffffff;
}

.file-upload-zone {
  margin-bottom: 1.25rem;
}

.hidden-file-input {
  display: none;
}

.drop-box {
  border: 2px dashed var(--border-color);
  border-radius: 12px;
  padding: 1.75rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  cursor: pointer;
  background: var(--bg-primary);
  transition: all 0.2s;
}

.drop-box:hover {
  border-color: var(--accent);
  background: var(--accent-subtle, rgba(56, 189, 248, 0.05));
}

.drop-box.has-file {
  border-color: var(--success, #10b981);
  background: rgba(16, 185, 129, 0.05);
}

.drop-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-icon-ready {
  color: var(--success, #10b981);
}

.file-icon-idle {
  color: var(--text-muted);
}

.drop-texts {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.drop-primary {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-main);
}

.drop-sub {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.import-fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.field-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: left;
}

.field-lbl-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.field-lbl {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted);
}

.char-counter-tag {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--accent);
  font-weight: 700;
}

.custom-input-title, .custom-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-main);
  font-size: 0.95rem;
  outline: none;
  box-sizing: border-box;
}

.custom-input-title:focus, .custom-textarea:focus {
  border-color: var(--accent);
}

.custom-textarea {
  resize: vertical;
  line-height: 1.6;
}

.modal-btns {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn-cancel, .btn-submit {
  padding: 0.65rem 1.25rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
}

.btn-cancel {
  background: var(--bg-primary);
  color: var(--text-muted);
  border: 1px solid var(--border-color);
}

.btn-submit {
  background: var(--accent);
  color: #ffffff;
}

.btn-submit:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
