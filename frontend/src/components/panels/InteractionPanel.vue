<template>
  <div class="interaction-container">
    <!-- ===== 点击交互 ===== -->
    <div class="prop-group">
      <div class="group-title">点击交互</div>
      <div class="prop-row">
        <label>启用</label>
        <div class="prop-content">
          <label class="toggle-label">
            <input type="checkbox" v-model="object.interactions.onClick.enabled" />
            <span class="toggle-text">{{ object.interactions.onClick.enabled ? '开' : '关' }}</span>
          </label>
        </div>
      </div>
      <template v-if="object.interactions.onClick.enabled">
        <div class="prop-row">
          <label>动作</label>
          <div class="prop-content">
            <select class="ui-input" v-model="object.interactions.onClick.action">
              <option v-for="act in clickActions" :key="act.value" :value="act.value">{{ act.label }}</option>
            </select>
          </div>
        </div>
        <!-- highlight -->
        <div class="prop-row" v-if="object.interactions.onClick.action === 'highlight'">
          <label>高亮色</label>
          <div class="prop-content"><span class="color-pick"><input type="color" class="ui-color-picker" v-model="object.interactions.onClick.highlightColor" /><span class="color-hex">{{ object.interactions.onClick.highlightColor.toUpperCase() }}</span></span></div>
        </div>
        <!-- animate -->
        <div class="prop-row" v-if="object.interactions.onClick.action === 'animate'">
          <label>动画名</label>
          <div class="prop-content">
            <select class="ui-input" v-model="object.interactions.onClick.animationName">
              <option value="">无</option>
              <option v-for="anim in (object.animations || [])" :key="anim" :value="anim">{{ anim }}</option>
            </select>
          </div>
        </div>
        <!-- moveTo -->
        <div class="prop-row" v-if="object.interactions.onClick.action === 'moveTo'">
          <label>目标</label>
          <div class="prop-content vec3-group">
            <div class="vec3-item"><span class="axis-label r">X</span><input type="number" step="0.5" class="ui-input" v-model.number="object.interactions.onClick.moveToPosition[0]" /></div>
            <div class="vec3-item"><span class="axis-label g">Y</span><input type="number" step="0.5" class="ui-input" v-model.number="object.interactions.onClick.moveToPosition[1]" /></div>
            <div class="vec3-item"><span class="axis-label b">Z</span><input type="number" step="0.5" class="ui-input" v-model.number="object.interactions.onClick.moveToPosition[2]" /></div>
          </div>
        </div>
        <div class="prop-row" v-if="object.interactions.onClick.action === 'moveTo'">
          <label>过渡(ms)</label>
          <div class="prop-content">
            <input type="number" step="100" min="200" max="5000" class="ui-input" v-model.number="object.interactions.onClick.tweenDuration" />
          </div>
        </div>
        <!-- changeColor -->
        <div class="prop-row" v-if="object.interactions.onClick.action === 'changeColor'">
          <label>目标色</label>
          <div class="prop-content"><span class="color-pick"><input type="color" class="ui-color-picker" v-model="object.interactions.onClick.targetColor" /><span class="color-hex">{{ object.interactions.onClick.targetColor.toUpperCase() }}</span></span></div>
        </div>
      </template>
    </div>

    <!-- ===== 悬停交互 ===== -->
    <div class="prop-group">
      <div class="group-title">悬停交互</div>
      <div class="prop-row">
        <label>启用</label>
        <div class="prop-content">
          <label class="toggle-label">
            <input type="checkbox" v-model="object.interactions.onHover.enabled" />
            <span class="toggle-text">{{ object.interactions.onHover.enabled ? '开' : '关' }}</span>
          </label>
        </div>
      </div>
      <template v-if="object.interactions.onHover.enabled">
        <div class="prop-row">
          <label>动作</label>
          <div class="prop-content">
            <select class="ui-input" v-model="object.interactions.onHover.action">
              <option v-for="act in hoverActions" :key="act.value" :value="act.value">{{ act.label }}</option>
            </select>
          </div>
        </div>
        <div class="prop-row" v-if="object.interactions.onHover.action === 'highlight' || object.interactions.onHover.action === 'emissive'">
          <label>高亮色</label>
          <div class="prop-content"><span class="color-pick"><input type="color" class="ui-color-picker" v-model="object.interactions.onHover.highlightColor" /><span class="color-hex">{{ object.interactions.onHover.highlightColor.toUpperCase() }}</span></span></div>
        </div>
        <div class="prop-row" v-if="object.interactions.onHover.action === 'scaleUp'">
          <label>倍数</label>
          <div class="prop-content">
            <input type="number" step="0.01" min="1" max="2" class="ui-input" v-model.number="object.interactions.onHover.scaleMultiplier" />
          </div>
        </div>
      </template>
    </div>

    <!-- ===== 自动旋转 ===== -->
    <div class="prop-group">
      <div class="group-title">自动旋转</div>
      <div class="prop-row">
        <label>启用</label>
        <div class="prop-content">
          <label class="toggle-label">
            <input type="checkbox" v-model="object.interactions.autoRotate.enabled" />
            <span class="toggle-text">{{ object.interactions.autoRotate.enabled ? '开' : '关' }}</span>
          </label>
        </div>
      </div>
      <template v-if="object.interactions.autoRotate.enabled">
        <div class="prop-row">
          <label>速度</label>
          <div class="prop-content">
            <input type="range" min="0.1" max="5" step="0.1" class="ui-range" v-model.number="object.interactions.autoRotate.speed" />
            <span class="range-val">{{ object.interactions.autoRotate.speed }}</span>
          </div>
        </div>
        <div class="prop-row">
          <label>旋转轴</label>
          <div class="prop-content">
            <select class="ui-input" v-model="object.interactions.autoRotate.axis">
              <option v-for="ax in axes" :key="ax.value" :value="ax.value">{{ ax.label }}</option>
            </select>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { CLICK_ACTIONS, HOVER_ACTIONS, ROTATE_AXES } from '../../config/interactions.js'

defineProps({ object: { type: Object, required: true } })

const clickActions = CLICK_ACTIONS
const hoverActions = HOVER_ACTIONS
const axes = ROTATE_AXES
</script>

<style scoped>
.interaction-container { padding: 0; }
.prop-group { margin-bottom: 20px; }
.group-title { font-size: 0.85rem; font-weight: 600; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid var(--bg-section); }
.prop-row { display: flex; align-items: center; margin-bottom: 8px; }
.prop-row label { width: 30%; font-size: 0.82rem; color: var(--text-muted); flex-shrink: 0; }
.prop-content { width: 70%; display: flex; align-items: center; gap: 6px; }
.ui-input { width: 100%; padding: 5px 8px; background-color: var(--bg-section); border: 1px solid transparent; color: var(--text-main); border-radius: 4px; font-size: 0.8rem; outline: none; box-sizing: border-box; }
.ui-input:focus { border-color: var(--accent-color); background-color: var(--bg-panel); }
.ui-input[type='number']::-webkit-inner-spin-button, .ui-input[type='number']::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
.ui-range { flex: 1; accent-color: var(--accent-color); }
.range-val { font-size: 0.8rem; color: var(--text-muted); min-width: 28px; text-align: right; font-family: monospace; }
.toggle-label { display: flex; align-items: center; gap: 6px; cursor: pointer; }
.toggle-label input[type='checkbox'] { accent-color: var(--accent-color); width: 16px; height: 16px; }
.toggle-text { font-size: 0.82rem; color: var(--text-main); }
.vec3-group { display: flex; gap: 4px; width: 100%; }
.vec3-item { position: relative; display: flex; flex: 1; }
.axis-label { position: absolute; left: 5px; top: 50%; transform: translateY(-50%); font-size: 0.65rem; font-weight: bold; pointer-events: none; z-index: 1; }
.axis-label.r { color: #ef4444; } .axis-label.g { color: #22c55e; } .axis-label.b { color: #3b82f6; }
.color-pick { display: flex; align-items: center; gap: 8px; }
.ui-color-picker { -webkit-appearance: none; border: none; width: 28px; height: 28px; border-radius: 4px; padding: 0; background: none; cursor: pointer; }
.ui-color-picker::-webkit-color-swatch-wrapper { padding: 0; }
.ui-color-picker::-webkit-color-swatch { border: 1px solid var(--border-color); border-radius: 3px; }
.color-hex { font-size: 0.78rem; color: var(--text-muted); font-family: monospace; }
</style>
