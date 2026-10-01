<template>
  <div class="library-container">
    <div class="library-tools">
      <div class="search-field"><AppIcon name="search" /><input v-model="query" placeholder="搜索组件…" aria-label="搜索组件" /><button v-if="query" class="icon-button" @click="query = ''" aria-label="清除搜索"><AppIcon name="close" /></button></div>
      <div class="category-filter" aria-label="组件分类"><button v-for="filter in filters" :key="filter.key" :class="{ active: selected === filter.key }" :aria-pressed="selected === filter.key" @click="selected = filter.key">{{ filter.label }}</button></div>
    </div>
    <div class="library-scroll">
      <section v-for="category in categories" :key="category.key">
        <div class="category-header"><span>{{ category.label }}</span><span>{{ category.items.length.toString().padStart(2, '0') }}</span></div>
        <div class="component-grid">
          <button v-for="comp in category.items" :key="comp.componentId || comp.type" class="component-card" draggable="true" :title="comp.description + ' · 点击或拖入画布'" @dragstart="e => onDragStart(e, comp)" @dragend="onDragEnd" @click="$emit('add', comp)">
            <span class="comp-icon"><ComponentGlyph :type="comp.type" /></span><span class="comp-name">{{ comp.name }}</span><AppIcon name="plus" class="add-indicator" />
          </button>
        </div>
      </section>
      <div v-if="!categories.length" class="search-empty"><AppIcon name="search" /><strong>未找到相关组件</strong><span>试试其他关键词或分类</span><button @click="query = ''; selected = 'all'">重置筛选</button></div>
      <p v-else class="library-hint">点击添加，或拖入画布</p>
    </div>
  </div>
</template>
<script setup>
import { computed, ref } from 'vue'
import { componentLibrary, CATEGORY_ORDER } from '../../config/componentLibrary.js'
import { useDragDrop } from '../../composables/useDragDrop.js'
import AppIcon from '../common/AppIcon.vue'
import ComponentGlyph from '../common/ComponentGlyph.vue'
defineEmits(['add'])
const { onDragStart, onDragEnd } = useDragDrop()
const query = ref(''), selected = ref('all')
const filters = [{ key: 'all', label: '全部' }, { key: 'primitive', label: '基础' }, { key: 'structure', label: '结构' }, { key: 'equipment', label: '设备' }, { key: 'other', label: '更多' }]
const categories = computed(() => CATEGORY_ORDER.map(cat => ({ ...cat, label: cat.label.replace(/^[^\p{L}\p{N}]+/u, ''), items: componentLibrary.filter(c => c.category === cat.key && (selected.value === 'all' || selected.value === cat.key || selected.value === 'other' && !['primitive', 'structure', 'equipment'].includes(cat.key)) && (c.name + c.description + c.type).toLowerCase().includes(query.value.trim().toLowerCase())) })).filter(cat => cat.items.length))
</script>
<style scoped>
.library-container { flex: 1; min-height: 0; display: flex; flex-direction: column; }.library-tools { padding: 0 16px 8px; }.search-field { display: flex; align-items: center; height: 34px; padding: 0 10px; background: var(--bg-panel); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-muted); gap: 8px; }.search-field:focus-within { border-color: var(--accent-color); }.search-field>.app-icon { width: 14px; height: 14px; }.search-field input { width: 100%; min-width: 0; background: transparent; border: none; outline: none; color: var(--text-main); font-size: 13px; }.search-field .icon-button { width: 20px; height: 24px; }.category-filter { display: flex; gap: 3px; margin-top: 12px; }.category-filter button { flex: 1; padding: 6px 0; border: none; border-radius: 5px; background: transparent; color: var(--text-muted); cursor: pointer; font-size: 13px; }.category-filter button.active { background: var(--accent-soft); color: var(--accent-color); }.category-filter button:hover { color: var(--text-main); }.library-scroll { flex: 1; min-height: 0; overflow-y: auto; padding: 0 16px; }.category-header { display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: var(--text-main); margin: 14px 0 10px; }.category-header>span:last-child { font: 10px ui-monospace, monospace; color: var(--text-muted); }.component-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }.component-card { position: relative; border: 1px solid var(--border-color); border-radius: 7px; min-height: 79px; background: var(--bg-panel); color: var(--text-main); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 9px; cursor: grab; transition: background .15s, border-color .15s; }.component-card:hover { border-color: var(--accent-border); background: var(--bg-hover); color: var(--accent-color); }.component-card:active { cursor: grabbing; }.comp-icon .app-icon { width: 27px; height: 27px; stroke-width: 1.2; color: var(--text-muted); }.comp-name { font-size: 13px; }.add-indicator { position: absolute; top: 6px; right: 6px; width: 12px; height: 12px; opacity: 0; }.component-card:hover .add-indicator { opacity: 1; }.library-hint { text-align: center; color: var(--text-muted); font-size: 11px; padding: 9px 0; }.search-empty { padding: 35px 5px; display: flex; flex-direction: column; align-items: center; gap: 12px; font-size: 13px; color: var(--text-muted); }.search-empty strong { color: var(--text-main); font-weight: 500; }.search-empty button { border: none; background: transparent; color: var(--accent-color); cursor: pointer; }
</style>
