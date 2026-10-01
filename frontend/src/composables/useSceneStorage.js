import { ref, watch, getCurrentScope, onScopeDispose } from 'vue'
import { useSceneStore } from '../stores/sceneStore.js'
import { resetCounters } from '../config/bindings.js'
import { createDocument, parseDocument, walkObjects } from '../utils/sceneDocument.js'
import { readModelAsset, blobToDataURL, putAsset } from '../utils/assetStorage.js'

const SCENE_KEY = 'vue_blender_scenes'
const AUTO_KEY = 'vue_blender_autosave'

export function useSceneStorage({ autoDelay = 1500, maxDelay = 5000 } = {}) {
  const sceneStore = useSceneStore()
  const sceneList = ref(readList())
  const currentSceneName = ref('')
  const saveStatus = ref('ready')
  const saveError = ref('')
  let timer, maxTimer, stopWatching
  let saving = false
  let dirty = false

  function readList() {
    try {
      const list = JSON.parse(localStorage.getItem(SCENE_KEY) || '[]')
      return Array.isArray(list) ? list : []
    } catch { return [] }
  }
  function serializeScene(name) {
    return JSON.stringify(createDocument(sceneStore.objects, name || currentSceneName.value || '未命名场景'), null, 2)
  }
  function deserializeAndLoad(input) {
    // Validate the entire document before replacing the current scene.
    const data = parseDocument(input)
    saving = true
    try {
      resetCounters()
      sceneStore.replaceObjects(data.objects)
      currentSceneName.value = data.name || '未命名场景'
    } finally { saving = false }
    scheduleAutoSave()
    return true
  }
  function clearTimers() {
    clearTimeout(timer)
    clearTimeout(maxTimer)
    timer = maxTimer = undefined
  }
  function scheduleAutoSave() {
    if (saving) return
    dirty = true
    saveStatus.value = 'pending'
    clearTimeout(timer)
    timer = setTimeout(saveAutoSave, autoDelay)
    // Continuously changing bindings must not postpone saving forever.
    if (!maxTimer) maxTimer = setTimeout(saveAutoSave, maxDelay)
  }
  function saveAutoSave() {
    clearTimers()
    saving = true
    try {
      sceneStore.syncTransform()
      localStorage.setItem(AUTO_KEY, serializeScene())
      dirty = false
      saveStatus.value = 'saved'
      saveError.value = ''
      return true
    } catch (error) {
      saveStatus.value = 'error'
      saveError.value = error.message
      return false
    } finally { saving = false }
  }
  function flushAutoSave() { if (dirty) saveAutoSave() }
  function enableAutoSave() {
    if (stopWatching) return
    stopWatching = watch(() => sceneStore.objects, scheduleAutoSave, { deep: true, flush: 'sync' })
    globalThis.window?.addEventListener('pagehide', flushAutoSave)
    globalThis.window?.addEventListener('beforeunload', flushAutoSave)
  }
  function disableAutoSave() {
    stopWatching?.()
    stopWatching = undefined
    flushAutoSave()
    clearTimers()
    globalThis.window?.removeEventListener('pagehide', flushAutoSave)
    globalThis.window?.removeEventListener('beforeunload', flushAutoSave)
  }
  if (getCurrentScope()) onScopeDispose(disableAutoSave)

  function loadAutoSave() {
    const raw = localStorage.getItem(AUTO_KEY)
    return raw ? deserializeAndLoad(raw) : false
  }
  function saveScene(name) {
    sceneStore.syncTransform()
    const data = createDocument(sceneStore.objects, name || currentSceneName.value || '未命名场景')
    const list = sceneList.value.map(item => ({ ...item }))
    const existing = list.find(item => item.name === data.name)
    data.id = existing?.id || 'scene_' + crypto.randomUUID()
    data.createdAt = existing?.createdAt || data.createdAt
    data.updatedAt = new Date().toISOString()
    const summary = { id: data.id, name: data.name, createdAt: data.createdAt, updatedAt: data.updatedAt, objectCount: data.objects.length }
    const index = list.findIndex(item => item.id === data.id)
    if (index < 0) list.push(summary)
    else list[index] = summary
    const key = 'scene_data_' + data.id
    const previous = localStorage.getItem(key)
    try {
      localStorage.setItem(key, JSON.stringify(data))
      localStorage.setItem(SCENE_KEY, JSON.stringify(list))
    } catch (error) {
      if (previous === null) localStorage.removeItem(key)
      else localStorage.setItem(key, previous)
      throw new Error('保存失败，可能是浏览器存储空间不足: ' + error.message)
    }
    sceneList.value = list
    currentSceneName.value = data.name
    saveAutoSave()
    return true
  }
  function loadSceneById(id) {
    const raw = localStorage.getItem('scene_data_' + id)
    if (!raw) throw new Error('找不到保存的场景')
    return deserializeAndLoad(raw)
  }
  function deleteScene(id) {
    const list = sceneList.value.filter(item => item.id !== id)
    localStorage.setItem(SCENE_KEY, JSON.stringify(list))
    localStorage.removeItem('scene_data_' + id)
    sceneList.value = list
  }

  async function portableDocument(name) {
    sceneStore.syncTransform()
    const data = createDocument(sceneStore.objects, name || currentSceneName.value)
    const models = []
    walkObjects(data.objects, obj => { if (obj.type === 'Model') models.push(obj) })
    const assets = {}
    const seen = new Map()
    for (const obj of models) {
      const key = obj.assetId || obj.url
      let id = seen.get(key)
      if (!id) {
        const asset = await readModelAsset(obj)
        id = obj.assetId || crypto.randomUUID()
        assets[id] = { name: asset.name, data: await blobToDataURL(asset.blob) }
        seen.set(key, id)
      }
      obj.assetId = id
      delete obj.url
    }
    return { ...data, assets }
  }
  async function exportToFile(name) {
    const data = await portableDocument(name)
    const url = URL.createObjectURL(new Blob([JSON.stringify(data)], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = (name || currentSceneName.value || 'scene') + '.json'
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  async function importFromFile(file) {
    const data = parseDocument(await file.text())
    const remap = new Map()
    const models = []
    walkObjects(data.objects, obj => { if (obj.type === 'Model') models.push(obj) })
    // Use fresh IDs so importing a file cannot overwrite assets used by other scenes.
    for (const obj of models) {
      const embedded = data.assets?.[obj.assetId]
      if (embedded) {
        if (!remap.has(obj.assetId)) {
          if (typeof embedded.data !== 'string' || !embedded.data.startsWith('data:')) throw new Error('无效的内嵌模型文件')
          const response = await fetch(embedded.data)
          const stored = await putAsset(await response.blob(), embedded.name)
          remap.set(obj.assetId, stored)
        }
        Object.assign(obj, remap.get(obj.assetId))
        delete obj.url
      } else {
        // Validate legacy references before replacing the current scene.
        await readModelAsset(obj)
      }
    }
    return deserializeAndLoad(data)
  }
  return { sceneList, currentSceneName, saveStatus, saveError, serializeScene, deserializeAndLoad,
    enableAutoSave, disableAutoSave, scheduleAutoSave, saveAutoSave, loadAutoSave, saveScene,
    loadSceneById, deleteScene, exportToFile, importFromFile, portableDocument }
}
