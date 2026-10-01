import { onScopeDispose } from 'vue'
import { convertModel } from '../utils/conversionClient.js'
import { API_BASE_URL } from '../config/constants.js'
import { useEditorStore } from '../stores/editorStore.js'
import { useSceneStore } from '../stores/sceneStore.js'
import { putAsset, deleteAsset, makePortableAsset, fetchBlob } from '../utils/assetStorage.js'

export function useModelUpload() {
  const editorStore = useEditorStore()
  const sceneStore = useSceneStore()
  let activeController
  onScopeDispose(() => activeController?.abort())
  function triggerUpload(fileInputRef) {
    sceneStore.syncTransform()
    fileInputRef?.value?.click()
  }
  async function handleFileUpload(event) {
    const files = [...(event.target.files || [])]
    const file = files.find(item => /\.(glb|gltf|blend|zip)$/i.test(item.name))
    if (!file) { alert('请选择模型文件及其贴图，或完整 ZIP'); return }
    const controller = new AbortController()
    activeController = controller
    const signal = controller.signal
    editorStore.startLoading('正在导入并保存模型...')
    editorStore.cancelLoading = () => controller.abort()
    const progress = (message, value) => { editorStore.loadingMessage = message; editorStore.loadingProgress = value }
    try {
      let name = file.name
      let blob
      if (/\.(glb|gltf)$/i.test(name)) {
        const resources = new Map(files.map(item => [(item.webkitRelativePath || item.name).replace(/\\/g, '/'), item]))
        blob = await makePortableAsset(file, name, async uri => {
          const normalized = decodeURIComponent(uri).replace(/^\.\//, '')
          const resource = resources.get(normalized) || resources.get(normalized.split('/').pop())
          if (!resource) throw new Error('缺少模型资源: ' + uri + '。请同时选择依赖文件，或上传完整 ZIP。')
          return resource
        })
      } else {
        const result = await convertModel(file, { signal, progress })
        const url = new URL(API_BASE_URL + result.url, window.location.href).href
        name = result.fileName || result.filename || 'model.glb'
        blob = await makePortableAsset(await fetchBlob(url, { signal }), name, uri => fetchBlob(new URL(uri, url).href, { signal }))
      }
      signal.throwIfAborted()
      progress('保存本地模型', null)
      const asset = await putAsset(blob, name)
      if (signal.aborted) { await deleteAsset(asset.assetId); signal.throwIfAborted() }
      sceneStore.syncTransform()
      sceneStore.addModelObject(file.name, '', asset)
    } catch (error) {
      if (!signal.aborted && error.name !== 'AbortError') alert('导入失败: ' + error.message)
    } finally {
      activeController = undefined
      editorStore.stopLoading()
      event.target.value = ''
    }
  }
  return { triggerUpload, handleFileUpload }
}
