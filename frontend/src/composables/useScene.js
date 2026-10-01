/**
 * useScene - 场景通用操作（便捷封装）
 * 提供场景对象操作的便捷方法
 */
import { useSceneStore } from '../stores/sceneStore.js'

export function useScene() {
  const sceneStore = useSceneStore()

  function onClickAdd(component) {
    sceneStore.syncTransform()
    sceneStore.addObject(component.type, component.name)
  }

  function selectObject(id) {
    sceneStore.selectObject(id)
  }

  return {
    onClickAdd,
    selectObject,
    sceneObjects: sceneStore.objects,
    activeObject: sceneStore.activeObject,
    activeObjectId: sceneStore.activeObjectId,
    setObjectRef: sceneStore.setObjectRef,
    activeMeshRef: sceneStore.activeMeshRef,
  }
}
