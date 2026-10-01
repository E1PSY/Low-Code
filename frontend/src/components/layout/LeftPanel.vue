<template>
  <aside aria-label="组件与场景" class="side-panel left-panel" v-if="editorStore.isLeftPanelOpen">
    <!-- 组件库区域 -->
    <div class="panel-section library-section">
      <div class="section-header">
        <span class="panel-title"><AppIcon name="template" />组件库</span>
        <button class="icon-button" @click="editorStore.toggleLeftPanel" title="收起组件库" aria-label="收起组件库"><AppIcon name="left" /></button>
      </div>

      <ModelUploader />

      <ComponentLibrary @add="(comp) => $emit('addComponent', comp)" />
    </div>

    <div class="panel-divider"></div>

    <!-- 场景大纲区域 -->
    <div class="panel-section outline-section">
      <SceneOutline
        :objects="sceneObjects"
        :active-id="activeId"
        @select="(id) => $emit('select', id)"
      />
    </div>
  </aside>
</template>

<script setup>
import AppIcon from '../common/AppIcon.vue'
import { useEditorStore } from '../../stores/editorStore.js'
import ComponentLibrary from '../panels/ComponentLibrary.vue'
import SceneOutline from '../panels/SceneOutline.vue'
import ModelUploader from '../model/ModelUploader.vue'

defineProps({
  sceneObjects: { type: Array, required: true },
  activeId: { type: String, default: null },
})

defineEmits(['addComponent', 'select'])

const editorStore = useEditorStore()
</script>

<style scoped>
.side-panel { width: 264px; background: var(--bg-panel); display: flex; flex-direction: column; flex-shrink: 0; z-index: 30; min-height: 0; }.left-panel { border-right: 1px solid var(--border-color); }.panel-section { display: flex; flex-direction: column; overflow: hidden; min-height: 0; }.library-section { flex: 1; }.outline-section { height: 29%; min-height: 145px; max-height: 270px; }.panel-divider { height: 1px; background: var(--border-color); flex-shrink: 0; }.section-header { height: 52px; padding: 0 16px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }.panel-title { font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 9px; }.panel-title .app-icon { width: 15px; height: 15px; color: var(--text-muted); }
@media(max-width:1100px) { .side-panel { width: 240px; } }
@media(max-width:960px) { .side-panel { position: absolute; top: 0; bottom: 0; left: 0; width: min(288px, 86vw); box-shadow: 15px 0 45px #23314d14; } }
</style>
