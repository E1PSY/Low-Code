<template>
  <div class="upload-section">
    <button class="btn-upload" @click="triggerUpload">
      <AppIcon name="upload" /><span>导入 3D 模型<small>GLB · GLTF · BLEND · ZIP</small></span><AppIcon name="plus" class="upload-plus" />
    </button>
    <input type="file" ref="fileInput"
      accept=".blend,.zip,.glb,.gltf,.bin,.png,.jpg,.jpeg,.webp,.ktx2" multiple
      style="display: none"
      @change="handleFileUpload" />
  </div>
</template>

<script setup>
import AppIcon from '../common/AppIcon.vue'
import { ref } from 'vue'
import { useModelUpload } from '../../composables/useModelUpload.js'
const { triggerUpload: doTrigger, handleFileUpload: doUpload } = useModelUpload()
const fileInput = ref(null)
function triggerUpload() { doTrigger(fileInput) }
function handleFileUpload(event) { doUpload(event) }
</script>

<style scoped>
.upload-section { padding: 0 16px 14px; }.btn-upload { width: 100%; display: flex; align-items: center; gap: 11px; padding: 12px; background: var(--bg-section); color: var(--accent-color); border: 1px dashed var(--accent-border); border-radius: 7px; cursor: pointer; text-align: left; transition: border-color .15s, background .15s; }.btn-upload:hover { border-color: var(--accent-color); background: var(--bg-hover); }.btn-upload span { font-size: 13px; }.btn-upload small { display: block; margin-top: 5px; color: var(--text-muted); font-size: 11px; letter-spacing: .6px; }.upload-plus { margin-left: auto; width: 14px; height: 14px; }
</style>
