/**
 * useKeyboard - 键盘快捷键管理
 */
import { onMounted, onUnmounted } from 'vue'
import { useEditorStore } from '../stores/editorStore.js'
import { useSceneStore } from '../stores/sceneStore.js'
import { TRANSFORM_MODES, KEY_BINDINGS } from '../config/constants.js'

export function useKeyboard() {
  const editorStore = useEditorStore()
  const sceneStore = useSceneStore()

  function handleKeyDown(event) {
    if (sceneStore.preview || editorStore.isLoading || editorStore.isSceneListVisible || editorStore.isTemplateModalVisible || editorStore.isSaveDialogVisible || editorStore.isExportModalVisible) return
    if (event.target.isContentEditable || event.target.tagName === 'SELECT') return
    // 输入框中不处理快捷键
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return

    if ((event.ctrlKey || event.metaKey) && ['z', 'y'].includes(event.key.toLowerCase())) {
      event.preventDefault()
      if (event.key.toLowerCase() === 'y' || event.shiftKey) sceneStore.redo(); else sceneStore.undo()
      return
    }
    // 变换模式切换
    if (sceneStore.activeObjectId) {
      const key = event.key.toLowerCase()
      if (key === KEY_BINDINGS.TRANSLATE)
        editorStore.setTransformMode(TRANSFORM_MODES.TRANSLATE)
      if (key === KEY_BINDINGS.ROTATE)
        editorStore.setTransformMode(TRANSFORM_MODES.ROTATE)
      if (key === KEY_BINDINGS.SCALE)
        editorStore.setTransformMode(TRANSFORM_MODES.SCALE)
    }

    // 删除选中对象
    if (
      (event.key === 'Delete' || event.key === 'Backspace') &&
      sceneStore.activeObjectId
    ) {
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA')
        return
      sceneStore.deleteActiveObject()
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })
}
