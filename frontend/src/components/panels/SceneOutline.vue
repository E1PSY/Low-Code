<template>
  <section class="outline-wrapper" aria-label="场景大纲">
    <div class="outline-header"><div><AppIcon name="layers" />场景大纲 <span class="count-badge">{{ objects.length }}</span></div><span class="outline-caption">LAYERS</span></div>
    <div class="scene-tree">
      <div v-if="!objects.length" class="empty-text">还没有对象<span>从组件库添加，开始搭建场景</span></div>
      <div v-for="obj in objects" :key="obj.id" class="tree-group">
        <div class="tree-row" :class="{ active: obj.id === activeId }">
          <button v-if="obj.meta?.childrenResolved?.length" class="expand-button" @click="toggle(obj.id)" :aria-label="(collapsed.has(obj.id) ? '展开 ' : '收起 ') + obj.name" :aria-expanded="!collapsed.has(obj.id)"><AppIcon :name="collapsed.has(obj.id) ? 'right' : 'down'" /></button><span v-else class="expand-spacer"></span>
          <button class="tree-item" @click="$emit('select', obj.id)" :aria-pressed="obj.id === activeId"><ComponentGlyph :type="obj.type" /><span class="tree-name" :title="obj.name">{{ obj.name }}</span><span class="object-dot"></span></button>
        </div>
        <div v-if="!collapsed.has(obj.id) && obj.meta?.childrenResolved" class="tree-children"><button v-for="(child, index) in obj.meta.childrenResolved" :key="child.id || index" class="tree-child" @click="$emit('select', obj.id)"><ComponentGlyph :type="child.type" /><span>{{ child.name || child.type }}</span></button></div>
      </div>
    </div>
  </section>
</template>
<script setup>
import { ref } from 'vue'
import AppIcon from '../common/AppIcon.vue'
import ComponentGlyph from '../common/ComponentGlyph.vue'
defineProps({ objects: { type: Array, required: true }, activeId: String })
defineEmits(['select'])
const collapsed = ref(new Set())
function toggle(id) { const next = new Set(collapsed.value); if (next.has(id)) next.delete(id); else next.add(id); collapsed.value = next }
</script>
<style scoped>
.outline-wrapper { display: flex; flex-direction: column; min-height: 0; height: 100%; }.outline-header { padding: 17px 16px 12px; display: flex; align-items: center; justify-content: space-between; font-size: 13px; }.outline-header>div { display: flex; gap: 8px; align-items: center; }.outline-header .app-icon { width: 14px; color: var(--text-muted); }.count-badge { font: 10px ui-monospace, monospace; background: var(--bg-section); padding: 2px 5px; border-radius: 4px; color: var(--text-main); }.outline-caption { font-size: 11px; letter-spacing: 1px; color: var(--text-muted); }.scene-tree { overflow-y: auto; flex: 1; padding: 0 8px 12px; }.tree-row { display: flex; align-items: center; border: 1px solid transparent; border-radius: 5px; margin: 2px 0; }.tree-row:hover { background: var(--bg-section); }.tree-row.active { background: var(--accent-soft); border-color: var(--accent-border); }.expand-button,.expand-spacer { width: 24px; flex-shrink: 0; }.expand-button { color: var(--text-muted); border: none; background: transparent; display: grid; place-items: center; padding: 0; cursor: pointer; }.expand-button .app-icon { width: 12px; height: 12px; }.tree-item { display: flex; align-items: center; gap: 9px; width: 100%; min-width: 0; height: 32px; padding: 0 10px 0 0; border: none; background: transparent; color: var(--text-main); text-align: left; cursor: pointer; font-size: 13px; }.tree-item>.app-icon { width: 14px; height: 14px; color: var(--text-muted); }.tree-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }.object-dot { width: 4px; height: 4px; border-radius: 50%; margin-left: auto; background: var(--text-muted); flex-shrink: 0; }.active .object-dot { background: var(--accent-color); }.tree-children { margin-left: 29px; padding-left: 10px; border-left: 1px solid var(--border-color); }.tree-child { display: flex; align-items: center; gap: 8px; padding: 6px 4px; border: none; background: transparent; color: var(--text-muted); font-size: 11px; cursor: pointer; width: 100%; text-align: left; }.tree-child:hover { color: var(--accent-color); }.tree-child>.app-icon { width: 12px; height: 12px; }.tree-child span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }.empty-text { padding: 24px 8px; color: var(--text-muted); font-size: 13px; text-align: center; }.empty-text span { display: block; font-size: 11px; color: var(--text-muted); margin-top: 8px; }
</style>
