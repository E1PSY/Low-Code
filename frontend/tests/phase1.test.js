import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { createPinia, setActivePinia } from 'pinia'
import { effectScope } from 'vue'
import 'fake-indexeddb/auto'
import { createSceneObject, createCompositeObject } from '../src/utils/objectFactory.js'
import { componentLibrary } from '../src/config/componentLibrary.js'
import { TEMPLATES } from '../src/config/templates.js'
import { createDocument, parseDocument } from '../src/utils/sceneDocument.js'
import { useSceneStore } from '../src/stores/sceneStore.js'
import { useSceneStorage } from '../src/composables/useSceneStorage.js'
import { putAsset, getAsset, acquireModelURL, makePortableAsset } from '../src/utils/assetStorage.js'
import { generatePortableProject, prepareProject } from '../src/utils/projectExporter.js'
import { parse } from '@babel/parser'

globalThis.FileReader = class {
  readAsDataURL(blob) {
    blob.arrayBuffer().then(bytes => {
      this.result = 'data:' + (blob.type || 'application/octet-stream') + ';base64,' + Buffer.from(bytes).toString('base64')
      this.onload?.()
    }, error => { this.error = error; this.onerror?.() })
  }
}
function session(options) {
  const memory = new Map()
  globalThis.localStorage = {
    getItem: key => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, value),
    removeItem: key => memory.delete(key),
  }
  setActivePinia(createPinia())
  const scope = effectScope()
  const store = useSceneStore()
  const storage = scope.run(() => useSceneStorage(options))
  return { store, storage, memory, close: () => scope.stop() }
}
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

test('all component-library composites retain parameters, children, identities and rebuild functions', () => {
  for (const component of componentLibrary.filter(c => c.type === 'CompositeGroup')) {
    const object = createCompositeObject(component)
    object.name = '用户修改了名称'
    const document = createDocument([object])
    assert.ok(document.objects[0].meta.componentId)
    const restored = parseDocument(JSON.stringify(document)).objects[0]
    assert.equal(restored.id, object.id)
    assert.deepEqual(restored.meta.params, object.meta.params)
    assert.equal(restored.meta.childrenResolved.length, object.meta.childrenResolved.length)
    assert.equal(typeof restored.meta._origChildren, 'function')
    assert.deepEqual(restored.meta._origChildren(restored.meta.params), object.meta._origChildren(object.meta.params))
  }
})

test('all templates survive serialization and validation', () => {
  const { store, storage, close } = session()
  try {
    for (const template of TEMPLATES) {
      store.loadTemplate(template)
      const expected = store.objects.length
      storage.deserializeAndLoad(storage.serializeScene(template.name))
      assert.equal(store.objects.length, expected)
    }
  } finally { close() }
})

test('invalid imports cannot clear or partially replace the active scene', () => {
  const { store, storage, close } = session()
  try {
    const object = store.addObject('Box', 'keep')
    assert.throws(() => storage.deserializeAndLoad(JSON.stringify({ version: 3, objects: [
      createSceneObject('Sphere'), { type: 'Box', position: [0, 'bad', 0] },
    ] })), /变换/)
    assert.equal(store.objects[0].id, object.id)
    assert.throws(() => parseDocument({ version: 999, objects: [] }), /版本/)
    assert.throws(() => parseDocument({ version: 2, objects: [{ type: 'CompositeGroup' }] }), /旧场景/)
  } finally { close() }
})

test('autosave tracks property changes, preserves empty scenes and flushes on disposal', async () => {
  const { store, storage, memory, close } = session({ autoDelay: 10, maxDelay: 30 })
  try {
    store.addObject('Box', 'box')
    storage.enableAutoSave()
    store.objects[0].color = '#123456'
    await sleep(40)
    assert.equal(JSON.parse(memory.get('vue_blender_autosave')).objects[0].color, '#123456')
    store.objects[0].position[0] = 5
    await sleep(40)
    assert.equal(JSON.parse(memory.get('vue_blender_autosave')).objects[0].position[0], 5)
    store.clearScene()
    await sleep(40)
    assert.deepEqual(JSON.parse(memory.get('vue_blender_autosave')).objects, [])
    store.addObject('Sphere', 'pending')
  } finally { close() }
  assert.equal(JSON.parse(memory.get('vue_blender_autosave')).objects[0].type, 'Sphere')
})

test('continuous edits save within maxDelay; storage errors surface without destroying the scene', async () => {
  const { store, storage, memory, close } = session({ autoDelay: 100, maxDelay: 30 })
  try {
    store.addObject('Box')
    storage.enableAutoSave()
    const interval = setInterval(() => store.objects[0].position[0]++, 5)
    await sleep(55)
    clearInterval(interval)
    assert.ok(memory.has('vue_blender_autosave'))
    localStorage.setItem = () => { throw new Error('quota') }
    assert.equal(storage.saveAutoSave(), false)
    assert.equal(storage.saveStatus.value, 'error')
    assert.match(storage.saveError.value, /quota/)
    assert.equal(store.objects.length, 1)
  } finally { close() }
})

test('local model bytes persist independently of object URLs', async () => {
  const stored = await putAsset(new Blob(['model bytes']), 'model.glb')
  const first = await acquireModelURL(stored)
  first.release()
  const second = await acquireModelURL(stored)
  assert.notEqual(first.url, second.url)
  assert.equal(await (await fetch(second.url)).text(), 'model bytes')
  second.release()
  assert.equal(await (await getAsset(stored.assetId)).blob.text(), 'model bytes')
})

test('GLTF external buffers and textures become self-contained; missing resources fail clearly', async () => {
  const file = new Blob([JSON.stringify({ asset: { version: '2.0' }, buffers: [{ uri: 'mesh.bin' }], images: [{ uri: 'texture.png' }] })])
  await assert.rejects(makePortableAsset(file, 'model.gltf'), /缺少外部资源/)
  const portable = await makePortableAsset(file, 'model.gltf', uri => Promise.resolve(new Blob([uri])))
  const parsed = JSON.parse(await portable.text())
  assert.ok(parsed.buffers[0].uri.startsWith('data:'))
  assert.equal(await (await fetch(parsed.images[0].uri)).text(), 'texture.png')
})

test('portable scene files embed assets and import under fresh asset IDs', async () => {
  const { store, storage, close } = session()
  try {
    const asset = await putAsset(new Blob(['portable model']), 'model.glb')
    store.addModelObject('model', '', asset)
    const portable = await storage.portableDocument('portable')
    assert.ok(portable.assets[asset.assetId].data.startsWith('data:'))
    await storage.importFromFile(new Blob([JSON.stringify(portable)]))
    assert.notEqual(store.objects[0].assetId, asset.assetId)
    assert.equal(await (await getAsset(store.objects[0].assetId)).blob.text(), 'portable model')
  } finally { close() }
})

test('export keeps nested geometry, interaction configs and arbitrary text as JSON data', async () => {
  const component = componentLibrary.find(c => c.type === 'CompositeGroup')
  const group = createCompositeObject(component)
  group.interactions.onClick = { enabled: true, action: 'moveTo', moveToPosition: [1,2,3] }
  const text = 'first\nsecond "quote" \\' + "' </script>\u2028"
  const sprite = createSceneObject('TextSprite', 'label', { text })
  const sources = { 'src/components/scene/SceneCanvas.vue': '<template />' }
  const files = generatePortableProject([group, sprite], sources)
  const data = JSON.parse(files['src/scene.json'])
  assert.equal(data.objects[1].text, text)
  assert.equal(data.objects[0].meta.childrenResolved.length, group.meta.childrenResolved.length)
  assert.equal(data.objects[0].interactions.onClick.action, 'moveTo')
  for (const [name, content] of Object.entries(files)) if (name.endsWith('.js')) parse(content, { sourceType: 'module' })
  assert.throws(() => generatePortableProject([{type: 'Unknown'}], sources), /不支持/)
})

test('ZIP project assets use relative paths and deduplicate repeated model references', async () => {
  const asset = await putAsset(new Blob(['zip model']), 'model.glb')
  const models = [createSceneObject('Model', 'one', asset), createSceneObject('Model', 'two', asset)]
  const files = await prepareProject(models, { 'src/components/scene/SceneCanvas.vue': '<template />' }, {
    readDecoder: async () => new Uint8Array([1]),
  })
  assert.equal(Object.keys(files).filter(key => key.startsWith('public/assets/')).length, 1)
  const data = JSON.parse(files['src/scene.json'])
  assert.equal(data.objects[0].url, 'assets/model-0.glb')
  assert.equal(data.objects[0].assetId, undefined)
  assert.equal(new TextDecoder().decode(files['public/assets/model-0.glb']), 'zip model')
})
