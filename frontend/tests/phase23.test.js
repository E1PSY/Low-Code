import test from 'node:test'
import assert from 'node:assert/strict'
import { createPinia, setActivePinia, disposePinia } from 'pinia'
import { effectScope, nextTick } from 'vue'
import { Group, Mesh, BoxGeometry, MeshStandardMaterial, SphereGeometry } from 'three'
import { useSceneStore } from '../src/stores/sceneStore.js'
import { createHistory } from '../src/utils/history.js'
import { createFrameScheduler } from '../src/runtime/frameScheduler.js'
import { createDocument } from '../src/utils/sceneDocument.js'
import { componentLibrary } from '../src/config/componentLibrary.js'
import { componentRegistry, geometryFor } from '../src/config/componentRegistry.js'
import { rebuildComposite } from '../src/config/componentParameters.js'
import { useInteractions } from '../src/composables/useInteractions.js'
import { useDataBinding } from '../src/composables/useDataBinding.js'

function session() {
  const pinia = createPinia(); setActivePinia(pinia)
  return { store: useSceneStore(), close: () => disposePinia(pinia) }
}
function clock() {
  let id = 0, now = 0
  const frames = new Map(), events = new Map()
  const doc = { hidden: false, addEventListener: (key, cb) => events.set(key, cb), removeEventListener: key => events.delete(key) }
  const scheduler = createFrameScheduler({ request: cb => { frames.set(++id, cb); return id }, cancel: id => frames.delete(id), document: doc })
  return { scheduler, frames, events, doc,
    advance(ms = 100) { now += ms; const pending = [...frames.values()]; frames.clear(); pending.forEach(cb => cb(now)) },
    visibility(hidden) { doc.hidden = hidden; events.get('visibilitychange')?.() },
  }
}
test('registry derives primitive library, defaults and quality geometry', () => {
  for (const entry of Object.values(componentRegistry).filter(d => d.kind === 'mesh')) {
    assert.ok(componentLibrary.some(c => c.type === entry.type))
    assert.ok(entry.defaults && geometryFor(entry.type))
  }
  const low = new SphereGeometry(...geometryFor('Sphere', 'low')[1])
  const high = new SphereGeometry(...geometryFor('Sphere', 'high')[1])
  assert.ok(low.index.count < high.index.count / 4)
  low.dispose(); high.dispose()
})
test('history coalesces a gesture, restores additions/deletions/parameters, and discards redo branches', () => {
  const { store, close } = session()
  try {
    store.addObject('Box', 'before', { position: [0,0,0] })
    store.beginEdit()
    for (let i = 0; i < 50; i++) store.objects[0].position[0] = i
    store.objects[0].name = 'after'; store.endEdit()
    store.undo(); assert.equal(store.objects[0].name, 'before'); assert.equal(store.objects[0].position[0], 0)
    store.redo(); assert.equal(store.objects[0].position[0], 49)
    store.selectObject(store.objects[0].id); store.deleteActiveObject()
    assert.equal(store.objects.length, 0); store.undo(); assert.equal(store.objects[0].name, 'after')
    store.undo(); store.objects[0].name = 'branch'; store.flushHistory(); assert.equal(store.canRedo, false)
    const definition = componentLibrary.find(c => c.type === 'CompositeGroup')
    store.addObject(definition.type, definition.name, { meta: definition.meta })
    const object = store.objects[1], original = JSON.stringify(object.meta.childrenResolved)
    store.beginEdit(); const key = Object.keys(object.meta.params).find(k => typeof object.meta.params[k] === 'number')
    object.meta.params[key] *= 2; rebuildComposite(object); store.endEdit()
    store.undo(); assert.equal(JSON.stringify(store.objects[1].meta.childrenResolved.map(c => c.position)), JSON.stringify(JSON.parse(original).map(c => c.position)))
    assert.equal(typeof store.objects[1].meta._origChildren, 'function')
  } finally { close() }
})
test('scene replacement is one undo step and preview writes cannot alter document or redo', () => {
  const { store, close } = session()
  try {
    store.addObject('Box', 'original')
    const original = JSON.stringify(createDocument(store.objects).objects)
    store.replaceObjects([]); store.undo(); assert.equal(JSON.stringify(createDocument(store.objects).objects), original)
    assert.equal(store.canRedo, true)
    store.setPreview(true); store.runtimeObjects[0].position[0] = 999; store.runtimeObjects[0].color = '#ff0000'
    store.deleteActiveObject(); store.addObject('Sphere'); store.syncTransform()
    assert.equal(JSON.stringify(createDocument(store.objects).objects), original)
    store.setPreview(false); assert.equal(store.canRedo, true); store.redo(); assert.equal(store.objects.length, 0)
  } finally { close() }
})
test('history bounds memory and retained undo depth', () => {
  const history = createHistory('a', 2)
  history.commit('b'); history.commit('c'); history.commit('d')
  assert.equal(history.undo(), 'c'); assert.equal(history.undo(), 'b'); assert.equal(history.undo(), undefined)
  const bounded = createHistory('', 100, 16)
  bounded.commit('12345'); bounded.commit('67890'); assert.equal(bounded.canUndo, false)
})
test('scheduler shares one frame, sleeps without subscribers, pauses hidden tabs and releases listeners', () => {
  const c = clock(); let elapsed = 0, calls = 0
  assert.equal(c.frames.size, 0)
  const stop1 = c.scheduler.subscribe(dt => { elapsed += dt; calls++ }), stop2 = c.scheduler.subscribe(() => {})
  assert.equal(c.frames.size, 1); c.advance(); c.advance(); assert.equal(calls, 2)
  c.visibility(true); assert.equal(c.frames.size, 0)
  c.visibility(false); c.advance(10000); assert.equal(elapsed, 0.1)
  stop1(); stop2(); assert.equal(c.frames.size, 0)
  c.scheduler.dispose(); assert.equal(c.events.size, 0); assert.equal(c.scheduler.subscriberCount, 0)
})
test('shared runtime runs bindings/rotation only when active and all work stops on disposal', async () => {
  const { store, close } = session(), c = clock(), scope = effectScope()
  try {
    const original = store.addObject('Box', 'runtime', { position: [0,0,0] })
    original.interactions.autoRotate.enabled = true
    original.interactions.onClick = { enabled: true, action: 'moveTo', moveToPosition: [3,4,5], tweenDuration: 200 }
    original.binding = { enabled: true, targetProp: 'positionY', dataSource: 'sine', min: 0, max: 1, speed: 1, format: '{value}' }
    store.flushHistory(); const document = JSON.stringify(createDocument(store.objects).objects)
    store.setPreview(true)
    const root = new Group(), mesh = new Mesh(new BoxGeometry(), new MeshStandardMaterial()); root.add(mesh)
    store.setObjectRef(original.id, root)
    const { interaction, binding } = scope.run(() => ({ interaction: useInteractions(null, c.scheduler), binding: useDataBinding(c.scheduler) }))
    interaction.startAutoRotateLoop(); binding.start(); await nextTick()
    assert.equal(c.frames.size, 1)
    c.advance(); c.advance(); assert.ok(root.rotation.y > 0); assert.ok(store.runtimeObjects[0].position[1] > 0)
    binding.stop(); interaction.handleObjectClick(store.runtimeObjects[0]); c.advance(); c.advance(); c.advance()
    assert.deepEqual(store.runtimeObjects[0].position, [3,4,5])
    assert.equal(JSON.stringify(createDocument(store.objects).objects), document)
    interaction.stopAutoRotateLoop(); assert.equal(c.scheduler.subscriberCount, 0)
    mesh.geometry.dispose(); mesh.material.dispose()
  } finally { scope.stop(); c.scheduler.dispose(); close() }
})
