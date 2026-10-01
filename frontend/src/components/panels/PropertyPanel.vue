<template>
  <div class="props-container">
    <div class="inspector-tabs" role="tablist" aria-label="对象配置"><button v-for="(tab, index) in tabs" :key="tab.id" :id="'tab-' + tab.id" role="tab" :aria-selected="activeTab === tab.id" :tabindex="activeTab === tab.id ? 0 : -1" @keydown.right.prevent="focusTab(index + 1)" @keydown.left.prevent="focusTab(index - 1)" @keydown.home.prevent="focusTab(0)" @keydown.end.prevent="focusTab(tabs.length - 1)" :aria-controls="'pane-' + tab.id" @click="activeTab = tab.id">{{ tab.label }}</button></div>
    <div class="inspector-scroll">
    <div v-show="activeTab === 'properties'" id="pane-properties" role="tabpanel" aria-labelledby="tab-properties">
    <!-- 基础属性 -->
    <div class="prop-group">
      <div class="group-title">基础信息</div>
      <div class="prop-row"><label>名称</label><div class="prop-content"><input type="text" class="ui-input" :value="object.name" @input="e => object.name = e.target.value" /></div></div>
      <div class="prop-row"><label>类型</label><div class="prop-content"><span class="readonly-tag">{{ object.type }}</span></div></div>
      <div class="prop-row" v-if="object.type === 'Model'"><label>模型源</label><div class="prop-content"><input type="text" class="ui-input" :value="object.assetName || object.url" readonly title="已保存的模型文件或资源地址" /></div></div>
    </div>

    <!-- 变换属性 -->
    <div class="prop-group">
      <div class="group-title">空间变换</div>
      <div class="prop-row"><label>位置</label><div class="prop-content vec3-group">
        <div class="vec3-item"><span class="axis-label r">X</span><input type="number" step="0.5" class="ui-input" :value="object.position[0]" @input="e => object.position[0] = parseFloat(e.target.value) || 0" /></div>
        <div class="vec3-item"><span class="axis-label g">Y</span><input type="number" step="0.5" class="ui-input" :value="object.position[1]" @input="e => object.position[1] = parseFloat(e.target.value) || 0" /></div>
        <div class="vec3-item"><span class="axis-label b">Z</span><input type="number" step="0.5" class="ui-input" :value="object.position[2]" @input="e => object.position[2] = parseFloat(e.target.value) || 0" /></div>
      </div></div>
      <div class="prop-row"><label>旋转</label><div class="prop-content vec3-group">
        <div class="vec3-item"><span class="axis-label r">X</span><input type="number" step="0.1" class="ui-input" :value="object.rotation[0]" @input="e => object.rotation[0] = parseFloat(e.target.value) || 0" /></div>
        <div class="vec3-item"><span class="axis-label g">Y</span><input type="number" step="0.1" class="ui-input" :value="object.rotation[1]" @input="e => object.rotation[1] = parseFloat(e.target.value) || 0" /></div>
        <div class="vec3-item"><span class="axis-label b">Z</span><input type="number" step="0.1" class="ui-input" :value="object.rotation[2]" @input="e => object.rotation[2] = parseFloat(e.target.value) || 0" /></div>
      </div></div>
      <div class="prop-row"><label>缩放</label><div class="prop-content vec3-group">
        <div class="vec3-item"><span class="axis-label r">X</span><input type="number" step="0.1" min="0.01" class="ui-input" :value="object.scale[0]" @input="e => object.scale[0] = Math.max(0.01, parseFloat(e.target.value) || 0.01)" /></div>
        <div class="vec3-item"><span class="axis-label g">Y</span><input type="number" step="0.1" min="0.01" class="ui-input" :value="object.scale[1]" @input="e => object.scale[1] = Math.max(0.01, parseFloat(e.target.value) || 0.01)" /></div>
        <div class="vec3-item"><span class="axis-label b">Z</span><input type="number" step="0.1" min="0.01" class="ui-input" :value="object.scale[2]" @input="e => object.scale[2] = Math.max(0.01, parseFloat(e.target.value) || 0.01)" /></div>
      </div></div>
    </div>

    <!-- 动画属性 -->
    <div class="prop-group" v-if="object.type === 'Model' && object.animations && object.animations.length > 0">
      <div class="group-title">模型动画</div>
      <div class="prop-row"><label>当前动作</label><div class="prop-content"><select class="ui-input" v-model="object.activeAnimation"><option value="">停止动作</option><option v-for="anim in object.animations" :key="anim" :value="anim">{{ anim }}</option></select></div></div>
    </div>

    <!-- 材质属性 -->
    <div class="prop-group" v-if="object.color !== undefined">
      <div class="group-title">材质外观</div>
      <div class="prop-row"><label>颜色</label><div class="prop-content color-picker-wrapper"><input type="color" class="ui-color-picker" v-model="object.color" /><span class="color-hex">{{ object.color.toUpperCase() }}</span></div></div>
    </div>

    <!-- 组件参数化（CompositeGroup 专属） -->
    <CompositeParamsPanel v-if="object.type === 'CompositeGroup'" :object="object" />

    <!-- 交互行为 -->


    <!-- 数据绑定 -->


    <!-- TextSprite 属性 -->
    <div class="prop-group" v-if="object.type === 'TextSprite'">
      <div class="group-title">文字内容</div>
      <div class="prop-row"><label>文字</label><div class="prop-content"><input type="text" class="ui-input" v-model="object.text" /></div></div>
      <div class="prop-row"><label>字号</label><div class="prop-content"><input type="number" min="12" max="128" step="2" class="ui-input" :value="object.fontSize" @input="object.fontSize = Math.max(12, Math.min(128, Number($event.target.value) || 48))" /></div></div>
      <div class="prop-row"><label>颜色</label><div class="prop-content color-picker-wrapper"><input type="color" class="ui-color-picker" v-model="object.textColor" /><span class="color-hex">{{ object.textColor.toUpperCase() }}</span></div></div>
      <div class="prop-row"><label>背景</label><div class="prop-content"><input type="text" class="ui-input" v-model="object.bgColor" placeholder="transparent / #hex" /></div></div>
      <div class="prop-row"><label>加粗</label><div class="prop-content"><label class="toggle-label"><input type="checkbox" v-model="object.bold" /></label></div></div>
    </div>

    </div>
    <div v-show="activeTab === 'interactions'" id="pane-interactions" role="tabpanel" aria-labelledby="tab-interactions"><p class="panel-note">设置对象响应方式，在预览中体验效果。</p><InteractionPanel :object="object" /></div>
    <div v-show="activeTab === 'data'" id="pane-data" role="tabpanel" aria-labelledby="tab-data"><p class="panel-note">连接数据，让场景中的属性随数值变化。</p><BindingPanel :object="object" /></div>
    </div>
    <!-- 删除 -->
    <div class="prop-group delete-group">
      <button class="btn-danger" @click="$emit('delete')"><AppIcon name="trash" /> 删除对象</button>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import AppIcon from '../common/AppIcon.vue'
const activeTab = ref('properties')
const tabs = [{id: 'properties', label: '属性'}, {id: 'interactions', label: '交互'}, {id: 'data', label: '数据'}]
function focusTab(index) { activeTab.value = tabs[(index + tabs.length) % tabs.length].id; nextTick(() => document.getElementById('tab-' + activeTab.value)?.focus()) }
import InteractionPanel from './InteractionPanel.vue'
import BindingPanel from './BindingPanel.vue'
import CompositeParamsPanel from './CompositeParamsPanel.vue'

defineProps({ object: { type: Object, required: true } })
defineEmits(['delete'])
</script>

<style scoped>
.props-container { min-height: 0; flex: 1; display: flex; flex-direction: column; }
.inspector-tabs { display: flex; padding: 0 16px; gap: 20px; border-bottom: 1px solid var(--border-color); flex-shrink: 0; }.inspector-tabs button { border: none; border-bottom: 2px solid transparent; background: none; color: var(--text-muted); padding: 0 5px 12px; font-size: 13px; cursor: pointer; }.inspector-tabs button[aria-selected="true"] { color: var(--accent-color); border-bottom-color: var(--accent-color); }.inspector-scroll { min-height: 0; overflow-y: auto; flex: 1; padding: 20px 16px 0; }.panel-note { margin: 0 0 20px; font-size: 13px; line-height: 1.7; color: var(--text-muted); }
.prop-group { margin-bottom: 24px; }
.group-title { font-size: 0.85rem; font-weight: 600; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid var(--bg-section); }
.prop-row { display: flex; align-items: center; margin-bottom: 10px; }
.prop-row label { width: 25%; font-size: 0.85rem; color: var(--text-muted); flex-shrink: 0; }
.prop-content { width: 75%; }
.ui-input { width: 100%; padding: 6px 10px; background-color: var(--bg-section); border: 1px solid transparent; color: var(--text-main); border-radius: 4px; font-size: 0.85rem; outline: none; box-sizing: border-box; text-overflow: ellipsis; }
.ui-input:focus { border-color: var(--accent-color); background-color: var(--bg-panel); }
.ui-input[type='number']::-webkit-inner-spin-button, .ui-input[type='number']::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
.ui-input[type='number'] { -moz-appearance: textfield; padding-left: 18px; padding-right: 2px; text-align: left; font-size: 0.8rem; letter-spacing: -0.5px; }
.readonly-tag { display: inline-block; padding: 4px 8px; background-color: var(--bg-section); border-radius: 4px; font-size: 0.8rem; color: var(--text-muted); }
.vec3-group { display: flex; gap: 6px; }
.vec3-item { position: relative; display: flex; flex: 1; }
.axis-label { position: absolute; left: 6px; top: 50%; transform: translateY(-50%); font-size: 0.7rem; font-weight: bold; pointer-events: none; }
.axis-label.r { color: #ef4444; } .axis-label.g { color: #22c55e; } .axis-label.b { color: #3b82f6; }
.color-picker-wrapper { display: flex; align-items: center; gap: 10px; }
.ui-color-picker { -webkit-appearance: none; border: none; width: 32px; height: 32px; border-radius: 4px; padding: 0; background: none; cursor: pointer; }
.ui-color-picker::-webkit-color-swatch-wrapper { padding: 0; }
.ui-color-picker::-webkit-color-swatch { border: 1px solid var(--border-color); border-radius: 4px; }
.color-hex { font-size: 0.85rem; color: var(--text-muted); font-family: monospace; }
.delete-group { margin: 0; padding: 12px 16px; border-top: 1px solid var(--border-color); }
.btn-danger { width: 100%; display: flex; justify-content: center; align-items: center; gap: 8px; background-color: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid #ef4444; padding: 10px; border-radius: 8px; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; }
.btn-danger:hover { background-color: #ef4444; color: var(--text-main); }
.icon { font-size: 0.9rem; }
</style>
