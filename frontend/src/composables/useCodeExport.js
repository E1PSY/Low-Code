import { shallowRef } from 'vue'
import { useSceneStore } from '../stores/sceneStore.js'
import { useEditorStore } from '../stores/editorStore.js'

export function useCodeExport() {
  const sceneStore = useSceneStore()
  const editorStore = useEditorStore()
  const generatedCode = shallowRef(null)
  async function exportCode() {
    sceneStore.syncTransform()
    editorStore.startLoading('正在打包场景和模型资源…')
    try {
      const [{ prepareProject }, { runtimeSources }] = await Promise.all([import('../utils/projectExporter.js'), import('../export/runtimeSources.js')])
      generatedCode.value = await prepareProject(sceneStore.objects, runtimeSources, {
        readDecoder: async name => {
          const response = await fetch(import.meta.env.BASE_URL + 'draco/' + name)
          if (!response.ok) throw new Error('模型解码器读取失败: ' + name)
          return new Uint8Array(await response.arrayBuffer())
        },
      })
      editorStore.showExportModal()
    } catch (error) {
      alert('导出失败: ' + error.message)
    } finally { editorStore.stopLoading() }
  }
  async function downloadZip() {
    if (!generatedCode.value) return
    editorStore.startLoading('正在生成 ZIP…')
    try {
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()
      for (const [path, content] of Object.entries(generatedCode.value)) zip.file(path, content)
      const url = URL.createObjectURL(await zip.generateAsync({ type: 'blob' }))
      const a = document.createElement('a')
      a.href = url
      a.download = 'tresjs-scene.zip'
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (error) { alert('ZIP 生成失败: ' + error.message) }
    finally { editorStore.stopLoading() }
  }
  return { exportCode, downloadZip, generatedCode }
}
