/**
 * 编辑器 UI 状态管理 (Pinia)
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useEditorStore = defineStore('editor', () => {
  const isLeftPanelOpen = ref(true)
  const isRightPanelOpen = ref(true)
  const isExportModalVisible = ref(false)
  const isTemplateModalVisible = ref(false)
  const isLoading = ref(false)
  const loadingProgress = ref(null)
  const cancelLoading = ref(null)
  const loadingMessage = ref('')
  const transformMode = ref('translate')
  const isDragging = ref(false)
  const isDragOver = ref(false)
  const orbitControlsEnabled = ref(true)

  // 场景持久化
  var isSceneListVisible = ref(false);
  var isSaveDialogVisible = ref(false);
  var currentSceneName = ref('');
  var navMode = ref('edit');

  function toggleLeftPanel() { isLeftPanelOpen.value = !isLeftPanelOpen.value; if (isLeftPanelOpen.value && window.matchMedia('(max-width: 960px)').matches) isRightPanelOpen.value = false }
  function toggleRightPanel() { isRightPanelOpen.value = !isRightPanelOpen.value; if (isRightPanelOpen.value && window.matchMedia('(max-width: 960px)').matches) isLeftPanelOpen.value = false }
  function showExportModal() { isExportModalVisible.value = true }
  function hideExportModal() { isExportModalVisible.value = false }
  function showTemplateModal() { isTemplateModalVisible.value = true }
  function hideTemplateModal() { isTemplateModalVisible.value = false }

  function startLoading(msg = '加载中...') { isLoading.value = true; loadingMessage.value = msg }
  function stopLoading() { isLoading.value = false; loadingMessage.value = ''; loadingProgress.value = null; cancelLoading.value = null }
  function setTransformMode(mode) { transformMode.value = mode }
  function setDragging(v) { isDragging.value = v }
  function setDragOver(v) { isDragOver.value = v }
  function setOrbitControlsEnabled(v) { orbitControlsEnabled.value = v }

  function showSceneList() { isSceneListVisible.value = true; }
  function hideSceneList() { isSceneListVisible.value = false; }
  function showSaveDialog() { isSaveDialogVisible.value = true; }
  function hideSaveDialog() { isSaveDialogVisible.value = false; }
  function setNavMode(mode) { navMode.value = mode; }

  return {
    isLeftPanelOpen, isRightPanelOpen,
    isExportModalVisible, isTemplateModalVisible,
    isLoading, loadingMessage, loadingProgress, cancelLoading, transformMode,
    isDragging, isDragOver, orbitControlsEnabled,
    isSceneListVisible, isSaveDialogVisible, currentSceneName,
    navMode,
    toggleLeftPanel, toggleRightPanel,
    showExportModal, hideExportModal,
    showTemplateModal, hideTemplateModal,
    startLoading, stopLoading, setTransformMode,
    setDragging, setDragOver, setOrbitControlsEnabled,
    showSceneList, hideSceneList,
    showSaveDialog, hideSaveDialog,
    setNavMode,
  }
})
