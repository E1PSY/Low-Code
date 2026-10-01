<template>
  <div class="editor-layout">
    <LoadingOverlay />

    <TopBar :scene-name="sceneStorage.currentSceneName.value"
      @export="handleExport"
      @new-scene="editorStore.showTemplateModal"
      @save-scene="handleSaveScene"
      @load-scene="editorStore.showSceneList"
    />

    <div v-if="modelError" class="model-error" role="alert">模型加载失败：{{ modelError }} <button @click="modelError = ''">关闭</button></div>
    <div class="main-workspace">
      <button v-if="compact && !sceneStore.preview && (editorStore.isLeftPanelOpen || editorStore.isRightPanelOpen)" class="panel-scrim" aria-label="关闭侧栏" @click="editorStore.isLeftPanelOpen = false; editorStore.isRightPanelOpen = false"></button>
      <LeftPanel v-if="!sceneStore.preview"
        :scene-objects="sceneStore.objects"
        :active-id="sceneStore.activeObjectId"
        @add-component="handleAddComponent"
        @select="handleSelect"
      />

      <SceneCanvas />

      <RightPanel v-if="!sceneStore.preview"
        :active-object="sceneStore.activeObject"
        @delete="handleDelete"
      />
    </div>

    <footer class="status-bar">
      <div class="save-status" :class="sceneStorage.saveStatus.value" role="status"><span class="status-dot"></span>{{ sceneStorage.saveStatus.value === 'error' ? '自动保存失败：' + sceneStorage.saveError.value : sceneStorage.saveStatus.value === 'pending' ? '正在保存更改…' : sceneStorage.saveStatus.value === 'saved' ? '所有更改已保存' : '本地场景' }}</div>
      <div class="status-context"><span>{{ sceneStore.objects.length }} 个对象</span><span>{{ sceneStore.preview ? '预览模式' : '编辑模式' }}</span></div>
      <div class="status-help"><span><kbd>W</kbd> 移动</span><span><kbd>E</kbd> 旋转</span><span><kbd>R</kbd> 缩放</span><span class="status-divider"></span><span>Ctrl / ⌘ + Z 撤销</span></div>
    </footer>

    <ExportModal
      v-if="editorStore.isExportModalVisible"
      :code="generatedCode"
      @download="downloadZip"
    />

    <TemplateSelector v-if="editorStore.isTemplateModalVisible" />

    <SceneManager
      v-if="editorStore.isSceneListVisible"
      :scene-list="sceneStorage.sceneList.value"
      @close="editorStore.hideSceneList"
      @load="handleLoadScene"
      @delete="handleDeleteScene"
      @export-file="handleExportFile"
      @autosave-load="handleLoadAutoSave"
      @import-file="handleImportFile"
    />

    <SaveDialog
      v-if="editorStore.isSaveDialogVisible"
      v-model="editorStore.currentSceneName"
      :object-count="sceneStore.objects.length"
      @close="editorStore.hideSaveDialog"
      @confirm="handleConfirmSave"
    />
  </div>
</template>

<script setup>
import './styles/editor.css'
import { onMounted, onUnmounted, ref, defineAsyncComponent } from 'vue'
import { useEditorStore } from './stores/editorStore.js'
import { useSceneStore } from './stores/sceneStore.js'
import { useKeyboard } from './composables/useKeyboard.js'
import { useCodeExport } from './composables/useCodeExport.js'
import { useSceneStorage } from './composables/useSceneStorage.js'

import TopBar from './components/layout/TopBar.vue'
import LeftPanel from './components/layout/LeftPanel.vue'
import RightPanel from './components/layout/RightPanel.vue'
import SceneCanvas from './components/scene/SceneCanvas.vue'
import LoadingOverlay from './components/common/LoadingOverlay.vue'
const ExportModal = defineAsyncComponent(() => import('./components/export/ExportModal.vue'))
const TemplateSelector = defineAsyncComponent(() => import('./components/templates/TemplateSelector.vue'))
const SceneManager = defineAsyncComponent(() => import('./components/scene/SceneManager.vue'))
const SaveDialog = defineAsyncComponent(() => import('./components/scene/SaveDialog.vue'))

const editorStore = useEditorStore()
const sceneStore = useSceneStore()
const sceneStorage = useSceneStorage()
const compactQuery = window.matchMedia('(max-width: 960px)')
const compact = ref(compactQuery.matches)
function applyCompact(event) {
  compact.value = event.matches
  editorStore.isLeftPanelOpen = !event.matches
  editorStore.isRightPanelOpen = !event.matches
}
if (compact.value) applyCompact(compactQuery)
compactQuery.addEventListener('change', applyCompact)
onUnmounted(() => compactQuery.removeEventListener('change', applyCompact))
const modelError = ref('')
const onModelError = event => { modelError.value = event.detail }
window.addEventListener('model-load-error', onModelError)
onUnmounted(() => window.removeEventListener('model-load-error', onModelError))

const { exportCode: doExport, downloadZip, generatedCode } = useCodeExport()
useKeyboard()

// ========== 初始化 ==========

onMounted(() => {
  // 启用自动保存
  try { sceneStorage.loadAutoSave() }
  catch (error) { alert('恢复场景失败: ' + error.message) }
  sceneStorage.enableAutoSave()
})

// ========== 场景持久化 ==========

function handleSaveScene() {
  sceneStore.syncTransform()
  editorStore.currentSceneName = sceneStorage.currentSceneName.value || ''
  editorStore.showSaveDialog()
}

function handleConfirmSave() {
  const name = editorStore.currentSceneName || '未命名场景'
  try {
    sceneStorage.saveScene(name)
    editorStore.hideSaveDialog()
  } catch (error) { alert(error.message) }
}

function handleLoadScene(id) {
  try {
    sceneStorage.loadSceneById(id)
    editorStore.hideSceneList()
  } catch (error) { alert('加载失败: ' + error.message) }
}

function handleDeleteScene(id) {
  if (confirm('确定要删除这个场景吗？此操作不可恢复。')) {
    sceneStorage.deleteScene(id)
  }
}

async function handleExportFile() {
  sceneStore.syncTransform()
  try {
    await sceneStorage.exportToFile(sceneStorage.currentSceneName.value || '场景')
    editorStore.hideSceneList()
  } catch (error) { alert('导出失败: ' + error.message) }
}

function handleLoadAutoSave() {
  try {
  if (sceneStorage.loadAutoSave()) {
    editorStore.hideSceneList()
  } else {
    alert('没有可用的自动保存')
  }
  } catch (error) { alert('恢复失败: ' + error.message) }
}

function handleImportFile(file) {
  sceneStorage.importFromFile(file).then(() => {
    editorStore.hideSceneList()
  }).catch((err) => {
    alert('导入失败: ' + err.message)
  })
}

// ========== 原有操作 ==========

function handleExport() { doExport() }

function handleAddComponent(comp) {
  sceneStore.syncTransform()
  const meta = comp.meta ? { params: JSON.parse(JSON.stringify(comp.meta.params)), children: comp.meta.children } : null
  sceneStore.addObject(comp.type, comp.name, { meta })
  sceneStorage.scheduleAutoSave()
}
function handleSelect(id) { sceneStore.selectObject(id) }
function handleDelete() {
  sceneStore.deleteActiveObject()
  sceneStorage.scheduleAutoSave()
}
</script>

<style scoped>
.editor-layout { display: flex; flex-direction: column; height: 100dvh; background: var(--bg-app); color: var(--text-main); }
.main-workspace { position: relative; display: flex; flex: 1; min-height: 0; overflow: hidden; }
.status-bar { min-height: 31px; display: flex; align-items: center; gap: 20px; padding: 0 16px; background: var(--bg-panel); border-top: 1px solid var(--border-color); font-size: 11px; color: var(--text-muted); z-index: 40; }.save-status { display: flex; align-items: center; gap: 7px; min-width: 0; }.status-dot { width: 5px; height: 5px; background: #778198; border-radius: 50%; flex-shrink: 0; }.saved .status-dot { background: #70c9ab; }.pending .status-dot { background: #ddb577; }.error { color: #f1a0a0; }.error .status-dot { background: #f1a0a0; }.status-context { display: flex; gap: 16px; }.status-help { margin-left: auto; display: flex; align-items: center; gap: 16px; }.status-help>span { display: flex; gap: 5px; align-items: center; }.status-help kbd { border: none; padding: 0; background: none; min-width: auto; }.status-divider { width: 1px; height: 12px; background: var(--border-color); }.panel-scrim { position: absolute; inset: 0; background: #080c1677; border: none; z-index: 25; cursor: pointer; }.model-error { display: flex; justify-content: space-between; padding: 10px 18px; background: #4b2930; color: #ffd1d4; font-size: 13px; }.model-error button { background: none; color: inherit; border: none; cursor: pointer; }
@media(max-width:960px) { .status-help { display: none; }.status-context { margin-left: auto; } }
@media(max-width:480px) { .status-context>span:last-child { display: none; }.status-bar { gap: 10px; } }
</style>
