<template>
  <div class="transform-toolbar" v-if="activeObject" role="toolbar" aria-label="变换工具">
    <button v-for="tool in tools" :key="tool.mode" :class="{ active: editorStore.transformMode === tool.mode }" :aria-pressed="editorStore.transformMode === tool.mode" @click="$emit('setMode', tool.mode)" :title="tool.label + ' (' + tool.key + ')'" :aria-label="tool.label"><AppIcon :name="tool.icon" /><span>{{ tool.label }}</span><kbd>{{ tool.key }}</kbd></button>
  </div>
</template>
<script setup>
import { useEditorStore } from '../../stores/editorStore.js'
import AppIcon from '../common/AppIcon.vue'
defineProps({ activeObject: Object })
defineEmits(['setMode'])
const editorStore = useEditorStore()
const tools = [{mode: 'translate', label: '移动', key: 'W', icon: 'move'}, {mode: 'rotate', label: '旋转', key: 'E', icon: 'rotate'}, {mode: 'scale', label: '缩放', key: 'R', icon: 'scale'}]
</script>
<style scoped>
.transform-toolbar { position: absolute; width: max-content; max-width: calc(100% - 24px); top: 62px; left: 50%; transform: translateX(-50%); display: flex; gap: 3px; padding: 5px; background: var(--bg-panel); border: 1px solid var(--border-color); border-radius: 8px; box-shadow: 0 8px 24px #23314d14; z-index: 15; }.transform-toolbar button { white-space: nowrap; flex-shrink: 0; display: flex; align-items: center; gap: 7px; border: none; border-radius: 5px; padding: 7px 9px; background: transparent; color: var(--text-muted); font-size: 13px; cursor: pointer; }.transform-toolbar button.active { color: var(--accent-color); background: var(--accent-soft); }.transform-toolbar button:hover { color: var(--accent-color); }.transform-toolbar .app-icon { width: 15px; height: 15px; }.transform-toolbar kbd { padding: 1px 3px; font-size: 11px; min-width: 12px; opacity: .6; }
@media(max-width:1100px) { .transform-toolbar kbd { display: none; } }
</style>
