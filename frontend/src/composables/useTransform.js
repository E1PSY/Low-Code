/**
 * useTransform - 变换控件同步逻辑
 */
import { useEditorStore } from '../stores/editorStore.js'
import { useSceneStore } from '../stores/sceneStore.js'

export function useTransform() {
  const editorStore = useEditorStore()
  const sceneStore = useSceneStore()

  /**
   * 变换手柄拖拽状态变化回调
   */
  function onDraggingChanged(event) {
    const isDraggingNow =
      typeof event === 'boolean' ? event : event?.value ?? false
    editorStore.setOrbitControlsEnabled(!isDraggingNow)

    if (isDraggingNow) sceneStore.beginEdit()
    if (!isDraggingNow) {
      sceneStore.syncTransform()
      sceneStore.endEdit()
    }
  }

  /**
   * 切换变换模式
   */
  function setTransformMode(mode) {
    sceneStore.syncTransform()
    editorStore.setTransformMode(mode)
  }

  /**
   * 点击空白区域取消选中
   */
  function onPointerMissed() {
    sceneStore.syncTransform()
    sceneStore.deselectAll()
  }

  return {
    onDraggingChanged,
    setTransformMode,
    onPointerMissed,
  }
}
