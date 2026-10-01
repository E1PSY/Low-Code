<template>
  <main class="viewport-area" :class="{ 'is-dragover': editorStore.isDragOver }">
    <div class="viewport-header">
      <div class="viewport-context"><span class="view-indicator"></span><span>{{ sceneStore.preview ? '交互预览' : '场景视图' }}</span><span class="view-tag">透视</span></div>
      <div class="viewport-actions">
        <button v-if="!sceneStore.preview" class="icon-button" :aria-pressed="editorStore.isLeftPanelOpen" @click="editorStore.toggleLeftPanel" title="组件库" aria-label="切换组件库"><AppIcon name="template" /></button>
        <button class="icon-button" @click="resetView" title="重置视角" aria-label="重置视角"><AppIcon name="cube" /></button>
        <button v-if="!sceneStore.preview" class="icon-button" :aria-pressed="editorStore.isRightPanelOpen" @click="editorStore.toggleRightPanel" title="属性检查器" aria-label="切换属性检查器"><AppIcon name="sliders" /></button>
      </div>
    </div>

    <div v-if="!sceneStore.preview" class="drop-shield" :class="{ 'is-active': editorStore.isDragging }"
      @dragenter.prevent="editorStore.setDragOver(true)"
      @dragover.prevent="editorStore.setDragOver(true)"
      @dragleave.prevent="editorStore.setDragOver(false)"
      @drop="onDrop"></div>

    <TransformToolbar
      v-if="activeObject && !sceneStore.preview"
      :active-object="activeObject"
      @set-mode="setTransformMode"
    />

    <div class="canvas-surface">
    <TresCanvas :dpr="QUALITY_PRESETS[quality].dpr" ref="tresCanvasRef" clear-color="#f2f4f7" @pointer-missed="onPointerMissed">
      <TresPerspectiveCamera ref="cameraRef" :position="[5, 5, 5]" :look-at="[0, 0, 0]" />
      <OrbitControls
        ref="orbitControlsRef"
        make-default
        :enabled="editorStore.orbitControlsEnabled"
      />
      <TresAmbientLight :intensity="0.8" />
      <TresGridHelper v-if="!sceneStore.preview" :args="[20, 20, '#c1c8d3', '#dce1e8']" />
      <ManagedTransformControls
        v-if="activeMeshRef && !sceneStore.preview"
        :object="activeMeshRef"
        :mode="editorStore.transformMode"
        @dragging="onDraggingChanged"
      />

      <InteractionBridge :on-register="onRegisterApi" />

      <SceneNode v-for="obj in sceneStore.runtimeObjects" :key="sceneStore.revision + obj.id" :obj="obj"
        :handlers="handlers" />
    </TresCanvas>
    </div>

    <div class="viewport-footer">
      <span class="navigation-hint">拖动旋转 <span>·</span> 滚轮缩放</span>
      <div class="performance-controls"><button class="performance-toggle" :aria-expanded="showStats" @click="showStats = !showStats" title="查看渲染性能">性能</button><label><select v-model="quality" aria-label="画质"><option v-for="(preset, key) in QUALITY_PRESETS" :value="key" :key="key">{{ preset.label }}画质</option></select></label></div>
    </div>
    <div v-if="showStats" class="performance-readout">绘制 {{ stats.calls }} · 三角形 {{ stats.triangles }}<br />几何体 {{ stats.geometries }} · 纹理 {{ stats.textures }}</div>
    <div class="drag-overlay" v-if="objects.length === 0 && !sceneStore.preview">
      <div class="hint-box"><span class="empty-scene-icon"><AppIcon name="cube" /></span><span class="empty-eyebrow">YOUR NEXT DIMENSION</span><h1>从一个想法，到一个场景</h1><p>从组件库添加形状，或导入自己的 3D 模型。<br />搭建、配置交互，再让它在预览中动起来。</p><div class="empty-actions"><button class="btn-primary" @click="sceneStore.addObject('Box', '立方体')"><AppIcon name="plus" />添加第一个对象</button><button class="btn-secondary" @click="editorStore.showTemplateModal()">浏览模板<AppIcon name="right" /></button></div><span class="empty-tip">无需编写代码，即可开始创作</span></div>
    </div>
  </main>
</template>

<script setup>
import { computed, defineComponent, provide, onUnmounted, shallowRef, ref } from 'vue'
import AppIcon from '../common/AppIcon.vue'
import { QUALITY_PRESETS } from '../../config/componentRegistry.js'
import { useTres } from '@tresjs/core'
import { useEditorStore } from '../../stores/editorStore.js'
import { useSceneStore } from '../../stores/sceneStore.js'
import { useDragDrop } from '../../composables/useDragDrop.js'
import { useTransform } from '../../composables/useTransform.js'
import { useSceneRuntime } from '../../composables/useSceneRuntime.js'
import { OrbitControls } from '@tresjs/cientos'
import { storeToRefs } from 'pinia'
import ManagedTransformControls from './ManagedTransformControls.vue'
import TransformToolbar from './TransformToolbar.vue'
import SceneNode from './SceneNode.vue'


const quality = ref('standard')
const showStats = ref(false)
provide('sceneQuality', quality)
const stats = ref({ calls: 0, triangles: 0, geometries: 0, textures: 0 })
const editorStore = useEditorStore()
const sceneStore = useSceneStore()
const { onDrop } = useDragDrop()
const { onDraggingChanged, setTransformMode: doSetMode, onPointerMissed: doPointerMissed } = useTransform()
const { objects, activeObject, activeMeshRef } = storeToRefs(sceneStore)

const interactionApi = shallowRef(null)
const { handlers } = useSceneRuntime(interactionApi, computed(() => sceneStore.preview))

const onRegisterApi = (api) => { interactionApi.value = api }

const InteractionBridge = defineComponent({
  name: 'InteractionBridge',
  props: { onRegister: Function },
  setup(props) {
    const { camera, renderer, controls } = useTres()
    props.onRegister?.({ camera, controls })
    const timer = setInterval(() => {
      if (document.hidden) return
      const info = renderer.info
      stats.value = { calls: info.render.calls, triangles: info.render.triangles, ...info.memory }
    }, 1000)
    onUnmounted(() => clearInterval(timer))
    return () => null
  },
})

const cameraRef = ref(null)
const orbitControlsRef = ref(null)
const tresCanvasRef = ref(null)

function resetView() {
  const api = interactionApi.value
  const camera = api?.camera?.value || api?.camera
  const controls = api?.controls?.value || api?.controls
  camera?.position.set(5, 5, 5)
  controls?.target?.set(0, 0, 0)
  camera?.lookAt(0, 0, 0)
  controls?.update()
}
function setTransformMode(mode) { doSetMode(mode) }
function onPointerMissed() { if (!sceneStore.preview) doPointerMissed() }


</script>

<style scoped>
.viewport-area { flex: 1; min-width: 0; position: relative; background: var(--bg-app); overflow: hidden; }.viewport-area.is-dragover { box-shadow: inset 0 0 0 2px var(--accent-color); }.viewport-header { position: relative; z-index: 16; height: 44px; padding: 0 18px; display: flex; align-items: center; justify-content: space-between; background: var(--bg-panel); border-bottom: 1px solid var(--border-color); }.viewport-context { display: flex; align-items: center; gap: 9px; font-size: 13px; color: var(--text-main); }.view-indicator { width: 5px; height: 5px; border-radius: 50%; background: var(--accent-color); }.view-tag { margin-left: 8px; padding-left: 12px; border-left: 1px solid var(--border-color); color: var(--text-muted); font-size: 11px; }.viewport-actions { display: flex; gap: 4px; }.viewport-actions button[aria-pressed="true"] { color: var(--accent-color); }.canvas-surface { position: absolute; top: 44px; bottom: 0; left: 0; right: 0; }.canvas-surface :deep(canvas) { width: 100% !important; height: 100% !important; outline: none; display: block; }.drop-shield { position: absolute; top: 44px; bottom: 0; left: 0; right: 0; z-index: 20; pointer-events: none; }.drop-shield.is-active { pointer-events: auto; background: #91a7ff0a; border: 2px dashed #93aaff; }.viewport-footer { position: absolute; bottom: 14px; left: 18px; right: 18px; display: flex; align-items: center; justify-content: space-between; gap: 10px; z-index: 10; pointer-events: none; }.navigation-hint { font-size: 11px; color: var(--text-muted); background: var(--bg-app); padding: 5px 0; }.navigation-hint span { margin: 0 8px; }.performance-controls { display: flex; gap: 10px; align-items: center; pointer-events: auto; font-size: 11px; }.performance-toggle { padding: 5px 7px; border: none; border-radius: 4px; background: var(--bg-section); color: var(--text-muted); font-size: 11px; cursor: pointer; }.performance-controls select { border: 1px solid var(--border-color); border-radius: 4px; padding: 4px 7px; background: var(--bg-section); color: var(--text-muted); font-size: 11px; }.performance-readout { position: absolute; bottom: 51px; right: 18px; z-index: 10; background: var(--bg-panel); border: 1px solid var(--border-color); padding: 9px 13px; border-radius: 6px; font: 10px/1.9 ui-monospace, monospace; color: var(--text-muted); }.drag-overlay { position: absolute; top: 44px; left: 0; right: 0; bottom: 46px; display: flex; align-items: center; justify-content: center; pointer-events: none; }.hint-box { text-align: center; padding: 25px; max-width: 520px; }.empty-scene-icon { display: inline-flex; align-items: center; justify-content: center; width: 62px; height: 62px; border: 1px solid var(--border-color); border-radius: 17px; background: var(--bg-section); color: var(--accent-color); margin-bottom: 25px; box-shadow: 0 12px 40px #23314d14; }.empty-scene-icon .app-icon { width: 34px; height: 34px; stroke-width: 1.2; }.empty-eyebrow { display: block; letter-spacing: 3px; font-size: 11px; color: var(--accent-color); }.hint-box h1 { font-size: clamp(20px, 2vw, 27px); font-weight: 500; letter-spacing: 1px; color: var(--text-main); margin: 14px 0; }.hint-box p { font-size: 13px; line-height: 2; color: var(--text-muted); }.empty-actions { display: flex; justify-content: center; gap: 10px; margin-top: 25px; pointer-events: auto; }.empty-actions button { font-size: 13px; }.empty-actions .app-icon { width: 14px; height: 14px; }.empty-tip { display: block; font-size: 11px; color: var(--text-muted); margin-top: 20px; }
@media(max-width:1100px) { .navigation-hint { display: none; }.performance-controls { margin-left: auto; } }
@media(max-width:480px) { .hint-box { padding: 20px 10px; }.empty-actions { gap: 8px; }.empty-actions button { padding: 9px 10px; } }
</style>
