/**
 * 场景数据状态管理 (Pinia)
 * 管理场景对象 CRUD、选中状态、模板加载
 */
import { defineStore } from 'pinia'
import { ref, computed, shallowReactive, watch, onScopeDispose } from 'vue'
import { resolveObject3D, clampScale } from '../utils/threeHelpers.js'
import { createSceneObject, createModelObject } from '../utils/objectFactory.js'
import { createHistory } from '../utils/history.js'
import { createDocument, parseDocument, serializeObject } from '../utils/sceneDocument.js'
import { resetCounters } from '../config/bindings.js'

export const useSceneStore = defineStore('scene', () => {
  const objects = ref([])
  const activeObjectId = ref(null)
  const objectRefs = shallowReactive(new Map())

  const revision = ref(0)
  const preview = ref(false)
  const previewObjects = ref([])
  const runtimeObjects = computed(() => preview.value ? previewObjects.value : objects.value)
  const snapshot = () => JSON.stringify(objects.value.map(serializeObject))
  const history = createHistory(snapshot())
  const canUndo = ref(false), canRedo = ref(false)
  let restoring = false, timer, dirty = false, editing = false
  function updateHistoryState() { canUndo.value = history.canUndo || dirty; canRedo.value = history.canRedo && !dirty }
  function flushHistory() {
    clearTimeout(timer)
    if (dirty) { history.commit(snapshot()); dirty = false }
    updateHistoryState()
  }
  watch(objects, () => {
    if (restoring) return
    dirty = true; updateHistoryState(); clearTimeout(timer)
    if (!editing) timer = setTimeout(flushHistory, 400)
  }, { deep: true, flush: 'sync' })
  onScopeDispose(() => clearTimeout(timer))
  function beginEdit() { flushHistory(); editing = true }
  function endEdit() { editing = false; flushHistory() }
  function restore(value) {
    if (value === undefined) return
    restoring = true
    try { objects.value = parseDocument({ version: 3, objects: JSON.parse(value) }).objects; objectRefs.clear(); revision.value++; activeObjectId.value = null }
    finally { restoring = false; updateHistoryState() }
  }
  function undo() { if (preview.value) return; flushHistory(); restore(history.undo()) }
  function redo() { if (preview.value) return; flushHistory(); restore(history.redo()) }
  function replaceObjects(items) {
    flushHistory(); objects.value = items; objectRefs.clear(); revision.value++; activeObjectId.value = null; flushHistory()
  }
  function setPreview(value) {
    if (value === preview.value) return
    if (value) { syncTransform(); flushHistory(); previewObjects.value = parseDocument(createDocument(objects.value)).objects }
    else previewObjects.value = []
    objectRefs.clear(); revision.value++; activeObjectId.value = null; resetCounters(); preview.value = value
  }

  const activeObject = computed(() =>
    objects.value.find((obj) => obj.id === activeObjectId.value) || null
  )

  const activeMeshRef = computed(() => {
    if (!activeObjectId.value) return null
    return resolveObject3D(objectRefs.get(activeObjectId.value))
  })

  function setObjectRef(id, el) {
    if (el) objectRefs.set(id, el)
    else objectRefs.delete(id)
  }

  function addObject(type, name, overrides) {
    if (preview.value) return
    flushHistory()
    const obj = createSceneObject(type, name, overrides || {})
    objects.value.push(obj)
    activeObjectId.value = obj.id
    flushHistory()
    return obj
  }

  function addModelObject(fileName, url, overrides = {}) {
    if (preview.value) return
    flushHistory()
    const obj = createModelObject(fileName, url, overrides)
    objects.value.push(obj)
    activeObjectId.value = obj.id
    flushHistory()
    return obj
  }

  function selectObject(id) {
    activeObjectId.value = id
  }

  function deselectAll() {
    activeObjectId.value = null
  }

  function deleteActiveObject() {
    if (preview.value || !activeObjectId.value) return
    flushHistory()
    objectRefs.delete(activeObjectId.value)
    objects.value = objects.value.filter(function(obj) { return obj.id !== activeObjectId.value })
    activeObjectId.value = null
    flushHistory()
  }

  function syncTransform() {
    if (preview.value) return
    if (!activeObject.value || !activeMeshRef.value) return
    var mesh = activeMeshRef.value
    var obj = activeObject.value
    // mutate arrays in-place so Vue doesn't see a new ref and re-mount the TresMesh
    var px = Number(mesh.position.x.toFixed(3))
    var py = Number(mesh.position.y.toFixed(3))
    var pz = Number(mesh.position.z.toFixed(3))
    obj.position[0] = px; obj.position[1] = py; obj.position[2] = pz
    var rx = Number(mesh.rotation.x.toFixed(3))
    var ry = Number(mesh.rotation.y.toFixed(3))
    var rz = Number(mesh.rotation.z.toFixed(3))
    obj.rotation[0] = rx; obj.rotation[1] = ry; obj.rotation[2] = rz
    obj.scale[0] = clampScale(Number(mesh.scale.x.toFixed(3)))
    obj.scale[1] = clampScale(Number(mesh.scale.y.toFixed(3)))
    obj.scale[2] = clampScale(Number(mesh.scale.z.toFixed(3)))
  }

  function clearScene() { if (!preview.value) replaceObjects([]) }
  function loadTemplate(template) {
    if (preview.value) return
    resetCounters()
    replaceObjects(template.generate().map(item => createSceneObject(item.type, item.name, item)))
  }

  return {
    objects, preview, revision, runtimeObjects, setPreview, replaceObjects, canUndo, canRedo, undo, redo, flushHistory, beginEdit, endEdit,
    activeObjectId: activeObjectId,
    objectRefs: objectRefs,
    activeObject: activeObject,
    activeMeshRef: activeMeshRef,
    setObjectRef: setObjectRef,
    addObject: addObject,
    addModelObject: addModelObject,
    selectObject: selectObject,
    deselectAll: deselectAll,
    deleteActiveObject: deleteActiveObject,
    syncTransform: syncTransform,
    clearScene: clearScene,
    loadTemplate: loadTemplate,
  }
})
