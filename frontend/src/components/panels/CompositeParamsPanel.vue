<template>
  <div class="composite-params" v-if="object && object.type === 'CompositeGroup' && object.meta?.params">
    <div class="prop-group">
      <div class="group-title">组件参数</div>

      <template v-for="(val, key) in object.meta.params" :key="key">
        <!-- 数值参数 → 滑块 -->
        <div class="prop-row" v-if="typeof val === 'number'">
          <label>{{ formatLabel(key) }}</label>
          <div class="prop-content">
            <input :disabled="!object.meta._origChildren"
              type="range"
              class="ui-range"
              :min="rangeMin(key)"
              :max="rangeMax(key)"
              :step="rangeStep(key)"
              :value="val"
              @input="handleParamChange(key, parseFloat($event.target.value))"
            />
            <span class="range-val">{{ val }}</span>
          </div>
        </div>

        <!-- 颜色参数 → 拾色器 -->
        <div class="prop-row" v-if="typeof val === 'string' && val.startsWith('#')">
          <label>{{ formatLabel(key) }}</label>
          <div class="prop-content">
            <span class="color-pick">
              <input :disabled="!object.meta._origChildren" type="color" class="ui-color-picker" :value="val"
                @input="handleParamChange(key, $event.target.value)" />
              <span class="color-hex">{{ val.toUpperCase() }}</span>
            </span>
          </div>
        </div>

        <div class="prop-row" v-if="typeof val === 'string' && !val.startsWith('#')">
          <label>{{ formatLabel(key) }}</label><input :disabled="!object.meta._origChildren" :value="val" @input="handleParamChange(key, $event.target.value)" />
        </div>
        <!-- 布尔参数 → 开关 -->
        <div class="prop-row" v-if="typeof val === 'boolean'">
          <label>{{ formatLabel(key) }}</label>
          <div class="prop-content">
            <label class="toggle-label">
              <input :disabled="!object.meta._origChildren" type="checkbox" :checked="val"
                @change="handleParamChange(key, $event.target.checked)" />
              <span class="toggle-text">{{ val ? '开' : '关' }}</span>
            </label>
          </div>
        </div>
      </template>

      <div class="rebuild-hint">
        {{ object.meta._origChildren ? '滚动上方滑块实时调整参数' : '该自定义组件仅保留快照，参数编辑不可用' }}
      </div>
    </div>

    <!-- 子对象列表 -->
    <div class="prop-group" v-if="object.meta?.childrenResolved?.length">
      <div class="group-title">子对象 ({{ object.meta.childrenResolved.length }})</div>
      <div class="child-list">
        <div v-for="child in object.meta.childrenResolved" :key="child._childId" class="child-item">
          <ComponentGlyph class="child-icon" :type="child.type" />
          <span class="child-name">{{ child.name || child.type }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import ComponentGlyph from '../common/ComponentGlyph.vue'
import { formatLabel, rangeMin, rangeMax, rangeStep, rebuildComposite } from '../../config/componentParameters.js'

const props = defineProps({
  object: { type: Object, required: true },
})



function handleParamChange(key, value) {
  props.object.meta.params[key] = value
  rebuildComposite(props.object)
}
</script>

<style scoped>
.composite-params { padding: 0; }
.prop-group { margin-bottom: 20px; }
.group-title {
  font-size: 0.85rem; font-weight: 600; margin-bottom: 10px;
  padding-bottom: 6px; border-bottom: 1px solid var(--bg-section);
}
.prop-row { display: flex; align-items: center; margin-bottom: 8px; }
.prop-row label {
  width: 30%; font-size: 0.82rem; color: var(--text-muted); flex-shrink: 0;
}
.prop-content { width: 70%; display: flex; align-items: center; gap: 6px; }
.ui-range { flex: 1; accent-color: var(--accent-color); }
.range-val {
  font-size: 0.8rem; color: var(--text-muted); min-width: 28px;
  text-align: right; font-family: monospace;
}
.toggle-label { display: flex; align-items: center; gap: 6px; cursor: pointer; }
.toggle-label input[type='checkbox'] { accent-color: var(--accent-color); width: 16px; height: 16px; }
.toggle-text { font-size: 0.82rem; color: var(--text-main); }
.color-pick { display: flex; align-items: center; gap: 8px; }
.ui-color-picker {
  -webkit-appearance: none; border: none; width: 28px; height: 28px;
  border-radius: 4px; padding: 0; background: none; cursor: pointer;
}
.ui-color-picker::-webkit-color-swatch-wrapper { padding: 0; }
.ui-color-picker::-webkit-color-swatch { border: 1px solid var(--border-color); border-radius: 3px; }
.color-hex { font-size: 0.78rem; color: var(--text-muted); font-family: monospace; }
.rebuild-hint {
  margin-top: 8px; font-size: 0.72rem; color: var(--text-muted); font-style: italic;
}
.child-list { max-height: 150px; overflow-y: auto; }
.child-item {
  display: flex; align-items: center; gap: 8px; padding: 4px 8px;
  border-radius: 4px; font-size: 0.78rem; color: var(--text-muted);
}
.child-icon { font-size: 0.85rem; width: 20px; text-align: center; }
</style>
