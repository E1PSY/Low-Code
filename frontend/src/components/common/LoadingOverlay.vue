<template>
  <div class="global-loading" v-if="editorStore.isLoading">
    <div class="spinner"></div>
    <p>{{ editorStore.loadingMessage }}</p>
    <progress v-if="editorStore.loadingProgress !== null" :value="editorStore.loadingProgress" max="100" :aria-label="editorStore.loadingMessage" />
    <span v-if="editorStore.loadingProgress !== null">{{ editorStore.loadingProgress }}%</span>
    <button v-if="editorStore.cancelLoading" class="btn-secondary" @click="editorStore.cancelLoading()">取消导入</button>
  </div>
</template>

<script setup>
import { useEditorStore } from '../../stores/editorStore.js'

const editorStore = useEditorStore()
</script>

<style scoped>
.global-loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 99999;
  color: var(--text-main);
}
.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: var(--accent-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.loading-subtext {
  margin-top: 10px;
  color: var(--text-muted);
  font-size: 0.85rem;
}
</style>
