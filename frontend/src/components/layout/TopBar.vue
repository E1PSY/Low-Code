<template>
  <header class="top-bar">
    <div class="brand"><span class="brand-mark"><AppIcon name="cube" /></span><div><strong>SCENE<span> / </span>STUDIO</strong><small>3D 可视化工作台</small></div></div>
    <div class="document-name"><span class="breadcrumb">工作空间</span><span class="slash">/</span><span :title="sceneName">{{ sceneName || '未命名场景' }}</span><span class="local-badge">本地</span></div>
    <div class="actions">
      <div class="history-actions"><button class="icon-button" :disabled="!scene.canUndo || scene.preview" @click="scene.undo()" title="撤销 · Ctrl+Z" aria-label="撤销"><AppIcon name="undo" /></button><button class="icon-button" :disabled="!scene.canRedo || scene.preview" @click="scene.redo()" title="重做 · Ctrl+Shift+Z" aria-label="重做"><AppIcon name="redo" /></button></div>
      <button class="bar-action" :disabled="scene.preview" @click="$emit('load-scene')"><AppIcon name="folder" /><span>场景</span></button>
      <button class="bar-action" :disabled="scene.preview" @click="$emit('new-scene')"><AppIcon name="template" /><span>模板</span></button>
      <button class="bar-action" @click="$emit('save-scene')"><AppIcon name="save" /><span>保存</span></button>
      <button class="preview-button" :class="{ active: scene.preview }" @click="scene.setPreview(!scene.preview)"><AppIcon :name="scene.preview ? 'edit' : 'play'" />{{ scene.preview ? '返回编辑' : '预览' }}</button>
      <button class="btn-primary export-button" @click="$emit('export')"><AppIcon name="download" /><span>导出代码</span></button>
    </div>
  </header>
</template>
<script setup>
import { useSceneStore } from '../../stores/sceneStore.js'
import AppIcon from '../common/AppIcon.vue'
defineProps({ sceneName: String })
defineEmits(['export', 'new-scene', 'save-scene', 'load-scene'])
const scene = useSceneStore()
</script>
<style scoped>
.top-bar { min-height: 68px; display: flex; align-items: center; gap: 26px; padding: 0 22px; background: var(--bg-panel); border-bottom: 1px solid var(--border-color); z-index: 50; }
.brand { display: flex; gap: 11px; align-items: center; flex-shrink: 0; }.brand-mark { display: grid; place-items: center; width: 34px; height: 38px; background: var(--accent-color); color: #171b30; border-radius: 9px; }.brand-mark .app-icon { width: 24px; height: 24px; }.brand strong { font-size: 13px; font-weight: 700; letter-spacing: 1.8px; }.brand strong span { color: var(--accent-color); }.brand small { display: block; font-size: 11px; color: var(--text-muted); margin-top: 5px; letter-spacing: 2px; }
.document-name { display: flex; align-items: center; gap: 12px; min-width: 0; font-size: 13px; }.document-name>span:nth-child(3) { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 150px; }.breadcrumb,.slash { color: var(--text-muted); }.local-badge { padding: 3px 6px; border: 1px solid var(--border-color); border-radius: 4px; color: var(--text-muted); font-size: 11px; }
.actions { display: flex; align-items: center; gap: 8px; margin-left: auto; flex-shrink: 0; }.history-actions { display: flex; border-right: 1px solid var(--border-color); padding-right: 10px; margin-right: 2px; }.bar-action,.preview-button { display: flex; align-items: center; justify-content: center; gap: 7px; height: 34px; padding: 0 10px; color: var(--text-muted); background: transparent; border: 1px solid transparent; border-radius: 6px; font-size: 13px; cursor: pointer; }.bar-action:hover { color: var(--text-main); background: var(--bg-hover); }.bar-action .app-icon { width: 15px; height: 15px; }.preview-button { border-color: var(--border-color); color: var(--text-main); margin-left: 6px; padding: 0 13px; }.preview-button.active { border-color: var(--accent-color); color: var(--accent-color); }.preview-button .app-icon { width: 14px; height: 14px; }.export-button { height: 34px; font-size: 13px; padding: 0 13px; }
@media(max-width:1200px) { .document-name .breadcrumb,.document-name .slash,.local-badge { display: none; }.top-bar { gap: 18px; padding: 0 16px; } }
@media(max-width:1000px) { .document-name { display: none; } }
@media(max-width:760px) { .top-bar { padding: 12px; gap: 12px; flex-wrap: wrap; }.brand small { display: none; }.brand-mark { width: 28px; height: 28px; }.brand { margin-right: auto; }.brand strong { font-size: 13px; }.actions { width: 100%; margin: 0; justify-content: space-between; gap: 3px; }.history-actions { padding-right: 4px; }.bar-action { padding: 0 7px; }.preview-button { margin-left: 0; padding: 0 8px; }.export-button { padding: 0 9px; } }
.actions button { white-space: nowrap; }
@media(max-width:480px) { .bar-action .app-icon { display: none; }.history-actions .icon-button { width: 27px; }.bar-action { padding: 0 6px; }.export-button { font-size: 13px; }.preview-button { font-size: 13px; } }
</style>
