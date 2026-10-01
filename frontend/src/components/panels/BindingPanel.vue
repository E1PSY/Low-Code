<template>
  <div class="binding-container">
    <div class="prop-group">
      <div class="group-title">数据绑定</div>
      <div class="prop-row">
        <label>启用</label>
        <div class="prop-content">
          <label class="toggle-label">
            <input type="checkbox" v-model="object.binding.enabled" />
            <span class="toggle-text">{{ object.binding.enabled ? '开' : '关' }}</span>
          </label>
        </div>
      </div>
      <template v-if="object.binding.enabled">
        <div class="prop-row">
          <label>目标属性</label>
          <div class="prop-content">
            <select class="ui-input" v-model="object.binding.targetProp">
              <option v-for="b in bindableProps" :key="b.value" :value="b.value">{{ b.label }}</option>
            </select>
          </div>
        </div>
        <div class="prop-row" v-if="object.binding.targetProp !== 'none'">
          <label>数据源</label>
          <div class="prop-content">
            <select class="ui-input" v-model="object.binding.dataSource">
              <option v-for="s in dataSources" :key="s.value" :value="s.value">{{ s.label }}</option>
            </select>
          </div>
        </div>
        <!-- 数值型绑定：min/max/speed -->
        <template v-if="isNumericBinding(object.binding.targetProp)">
          <div class="prop-row">
            <label>最小值</label>
            <div class="prop-content"><input type="number" step="0.1" class="ui-input" v-model.number="object.binding.min" /></div>
          </div>
          <div class="prop-row">
            <label>最大值</label>
            <div class="prop-content"><input type="number" step="0.1" class="ui-input" v-model.number="object.binding.max" /></div>
          </div>
          <div class="prop-row">
            <label>速度</label>
            <div class="prop-content"><input type="range" min="0.1" max="5" step="0.1" class="ui-range" v-model.number="object.binding.speed" /><span class="range-val">{{ object.binding.speed }}</span></div>
          </div>
        </template>
        <!-- 文本绑定：显示格式 -->
        <div class="prop-row" v-if="object.binding.targetProp === 'text'">
          <label>显示格式</label>
          <div class="prop-content"><input type="text" class="ui-input" v-model="object.binding.format" placeholder="{value}" /></div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { BINDABLE_PROPS, DATA_SOURCES } from '../../config/bindings.js'

defineProps({ object: { type: Object, required: true } })

const bindableProps = BINDABLE_PROPS
const dataSources = DATA_SOURCES

function isNumericBinding(prop) {
  return prop && prop !== 'none' && prop !== 'text'
}
</script>

<style scoped>
.binding-container { padding: 0; }
.prop-group { margin-bottom: 20px; }
.group-title { font-size: 0.85rem; font-weight: 600; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid var(--bg-section); }
.prop-row { display: flex; align-items: center; margin-bottom: 8px; }
.prop-row label { width: 30%; font-size: 0.82rem; color: var(--text-muted); flex-shrink: 0; }
.prop-content { width: 70%; display: flex; align-items: center; gap: 6px; }
.ui-input { width: 100%; padding: 5px 8px; background-color: var(--bg-section); border: 1px solid transparent; color: var(--text-main); border-radius: 4px; font-size: 0.8rem; outline: none; box-sizing: border-box; }
.ui-input:focus { border-color: var(--accent-color); background-color: var(--bg-panel); }
.ui-range { flex: 1; accent-color: var(--accent-color); }
.range-val { font-size: 0.8rem; color: var(--text-muted); min-width: 28px; text-align: right; font-family: monospace; }
.toggle-label { display: flex; align-items: center; gap: 6px; cursor: pointer; }
.toggle-label input[type='checkbox'] { accent-color: var(--accent-color); width: 16px; height: 16px; }
.toggle-text { font-size: 0.82rem; color: var(--text-main); }
</style>
