<template>
  <aside @focusin="sceneStore.beginEdit()" @focusout="sceneStore.endEdit()" @change="sceneStore.endEdit()" aria-label="属性检查器" class="side-panel right-panel" v-if="editorStore.isRightPanelOpen">
    <div class="section-header">
      <span class="panel-title"><AppIcon name="sliders" />属性检查器</span>
      <button class="icon-button" @click="editorStore.toggleRightPanel" title="收起属性检查器" aria-label="收起属性检查器"><AppIcon name="right" /></button>
    </div>

    <div v-if="activeObject" class="selection-card"><span class="selection-icon"><ComponentGlyph :type="activeObject.type" /></span><div><strong>{{ activeObject.name }}</strong><span>{{ activeObject.type }}</span></div><span class="selection-badge">已选中</span></div>
    <PropertyPanel
      v-if="activeObject"
      :object="activeObject"
      @delete="$emit('delete')"
    />

    <div v-else class="empty-state">
      <div class="empty-icon"><AppIcon name="cursor" /></div><h3>让每个细节就位</h3><p>在画布或场景大纲中选择对象，<br />即可调整它的外观与行为。</p><div class="empty-shortcuts"><span><kbd>W</kbd> 移动</span><span><kbd>E</kbd> 旋转</span><span><kbd>R</kbd> 缩放</span></div>
    </div>
  </aside>
</template>

<script setup>
import AppIcon from '../common/AppIcon.vue'
import ComponentGlyph from '../common/ComponentGlyph.vue'
import { useEditorStore } from '../../stores/editorStore.js'
import { useSceneStore } from '../../stores/sceneStore.js'
const sceneStore = useSceneStore()
import PropertyPanel from '../panels/PropertyPanel.vue'

defineProps({
  activeObject: { type: Object, default: null },
})

defineEmits(['delete'])

const editorStore = useEditorStore()
</script>

<style scoped>
.side-panel { width: 296px; background: var(--bg-panel); display: flex; flex-direction: column; flex-shrink: 0; min-height: 0; z-index: 30; }.right-panel { border-left: 1px solid var(--border-color); }.section-header { min-height: 52px; padding: 0 16px; display: flex; align-items: center; justify-content: space-between; }.panel-title { display: flex; gap: 8px; align-items: center; font-size: 13px; font-weight: 600; }.panel-title .app-icon { width: 15px; height: 15px; color: var(--text-muted); }.selection-card { display: flex; align-items: center; gap: 10px; margin: 0 16px 16px; padding: 12px; background: var(--bg-section); border: 1px solid var(--border-color); border-radius: 7px; }.selection-icon { color: var(--accent-color); display: grid; place-items: center; width: 28px; flex-shrink: 0; }.selection-card>div { min-width: 0; }.selection-card strong { display: block; font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }.selection-card div>span { color: var(--text-muted); font-size: 11px; display: block; margin-top: 4px; }.selection-badge { margin-left: auto; font-size: 11px; color: var(--accent-color); flex-shrink: 0; }.empty-state { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px 16px 110px; text-align: center; }.empty-icon { display: grid; place-items: center; width: 58px; height: 58px; border-radius: 16px; background: var(--bg-section); border: 1px solid var(--border-color); transform: rotate(-7deg); color: var(--text-muted); margin-bottom: 14px; }.empty-icon .app-icon { width: 28px; height: 28px; }.empty-state h3 { font-size: 13px; font-weight: 500; color: var(--text-main); margin-bottom: 2px; }.empty-state p { font-size: 13px; line-height: 1.9; color: var(--text-muted); }.empty-shortcuts { display: flex; gap: 13px; margin-top: 24px; color: var(--text-muted); font-size: 11px; }.empty-shortcuts span { display: flex; flex-direction: column; gap: 8px; align-items: center; }
@media(max-width:1100px) { .side-panel { width: 268px; } }
@media(max-width:960px) { .side-panel { position: absolute; top: 0; bottom: 0; right: 0; width: min(296px, 86vw); box-shadow: -15px 0 45px #23314d14; } }
</style>
