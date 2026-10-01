// Models are committed before being referenced by a scene.
let database
function openDatabase() {
  if (!database) database = new Promise((resolve, reject) => {
    const request = indexedDB.open('lowcode-assets', 1)
    request.onupgradeneeded = () => request.result.createObjectStore('assets', { keyPath: 'id' })
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(new Error('无法打开模型数据库: ' + request.error?.message))
  }).catch(error => { database = null; throw error })
  return database
}
async function transaction(mode, action) {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('assets', mode)
    const request = action(tx.objectStore('assets'))
    tx.oncomplete = () => resolve(request.result)
    tx.onerror = tx.onabort = () => reject(new Error('模型存储失败: ' + (tx.error?.message || request.error?.message || '事务中断')))
  })
}
export async function putAsset(blob, name, id = crypto.randomUUID()) {
  await transaction('readwrite', store => store.put({ id, name, blob }))
  return { assetId: id, assetName: name }
}
export async function getAsset(id) {
  const asset = await transaction('readonly', store => store.get(id))
  if (!asset) throw new Error('找不到本地模型，请重新导入: ' + id)
  return asset
}
export async function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('读取模型文件失败'))
    reader.readAsDataURL(blob)
  })
}
export async function fetchBlob(url, options) {
  const response = await fetch(url, options)
  if (!response.ok) throw new Error('模型资源读取失败 (' + response.status + '): ' + url)
  return response.blob()
}

// Inline GLTF dependencies so one stored Blob is sufficient after a reload.
export async function makePortableAsset(blob, name, resolveResource) {
  if (!name.toLowerCase().endsWith('.gltf')) return blob
  const document = JSON.parse(await blob.text())
  if (document.asset?.version !== '2.0') throw new Error('仅支持 glTF 2.0 模型')
  for (const resource of [...(document.buffers || []), ...(document.images || [])]) {
    if (!resource.uri || resource.uri.startsWith('data:')) continue
    if (!resolveResource) throw new Error('GLTF 缺少外部资源，请同时选择贴图和 .bin 文件，或上传完整 ZIP')
    resource.uri = await blobToDataURL(await resolveResource(resource.uri))
  }
  return new Blob([JSON.stringify(document)], { type: 'model/gltf+json' })
}
export async function readModelAsset(obj) {
  if (obj.assetId) return getAsset(obj.assetId)
  if (!obj.url) throw new Error('模型没有可用的文件: ' + obj.name)
  const name = obj.assetName || (obj.url.split('?')[0].toLowerCase().endsWith('.gltf') ? 'model.gltf' : 'model.glb')
  const blob = await makePortableAsset(await fetchBlob(obj.url), name, uri => fetchBlob(new URL(uri, obj.url).href))
  return { name, blob }
}
export async function acquireModelURL(obj) {
  if (!obj.assetId) return { url: obj.url, release() {} }
  const { blob } = await getAsset(obj.assetId)
  const url = URL.createObjectURL(blob)
  return { url, release: () => URL.revokeObjectURL(url) }
}

export async function deleteAsset(id) { await transaction('readwrite', store => store.delete(id)) }
