import fs from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'
import { componentLibrary } from '../src/config/componentLibrary.js'
import { createCompositeObject, createSceneObject } from '../src/utils/objectFactory.js'
import { prepareProject } from '../src/utils/projectExporter.js'

const frontend = fileURLToPath(new URL('../', import.meta.url))
const sourceFiles = {
  'src/runtime/frameScheduler.js': 'src/runtime/frameScheduler.js',
  'src/config/componentRegistry.js': 'src/config/componentRegistry.js',
  'src/composables/useSceneRuntime.js': 'src/composables/useSceneRuntime.js',

  'src/components/scene/SceneCanvas.vue': 'src/export/SceneCanvas.vue',
  'src/components/scene/SceneNode.vue': 'src/components/scene/SceneNode.vue',
  'src/components/model/AnimatedModel.vue': 'src/components/model/AnimatedModel.vue',
  'src/stores/sceneStore.js': 'src/export/sceneStore.js',
  'src/utils/assetStorage.js': 'src/export/assetStorage.js',
  'src/utils/threeHelpers.js': 'src/utils/threeHelpers.js',
  'src/composables/useInteractions.js': 'src/composables/useInteractions.js',
  'src/composables/useDataBinding.js': 'src/composables/useDataBinding.js',
  'src/config/bindings.js': 'src/config/bindings.js',
}
const sources = {}
for (const [target, source] of Object.entries(sourceFiles)) sources[target] = await fs.readFile(path.join(frontend, source), 'utf8')
const geometry = new Float32Array([-1,0,0, 1,0,0, 0,2,0])
const gltf = {
  asset: { version: '2.0' }, scene: 0, scenes: [{ nodes: [0] }], nodes: [{ mesh: 0 }],
  meshes: [{ primitives: [{ attributes: { POSITION: 0 }, material: 0 }] }],
  buffers: [{ uri: 'data:application/octet-stream;base64,' + Buffer.from(geometry.buffer).toString('base64'), byteLength: geometry.byteLength }],
  bufferViews: [{ buffer: 0, byteOffset: 0, byteLength: geometry.byteLength, target: 34962 }],
  accessors: [{ bufferView: 0, componentType: 5126, count: 3, type: 'VEC3', min: [-1,0,0], max: [1,2,0] }],
  materials: [{ pbrMetallicRoughness: { baseColorFactor: [0.2,1,0.3,1], metallicFactor: 0 }, doubleSided: true }],
}
const fixture = path.join(frontend, 'tests/fixtures/triangle.gltf')
await fs.mkdir(path.dirname(fixture), { recursive: true })
await fs.writeFile(fixture, JSON.stringify(gltf))
const group = createCompositeObject(componentLibrary.find(c => c.name === '方形展台'))
group.position = [-2,0,0]
group.interactions.onClick.enabled = true
group.interactions.onClick.action = 'changeColor'
const text = createSceneObject('TextSprite', 'test-label', { text: "模型恢复\n引号 \" ' <script>", position: [0,3,0] })
const model = createSceneObject('Model', 'triangle', { url: 'fixture.gltf', position: [1,0,0] })
const files = await prepareProject([group, text, model], sources, {
  readAsset: async () => ({ name: 'triangle.gltf', blob: new Blob([JSON.stringify(gltf)]) }),
  readDecoder: name => fs.readFile(path.join(frontend, 'public/draco', name)),
})
const destination = await fs.mkdtemp(path.join(os.tmpdir(), 'lowcode-export-check-'))
for (const [name, data] of Object.entries(files)) {
  const target = path.join(destination, name)
  await fs.mkdir(path.dirname(target), { recursive: true })
  await fs.writeFile(target, data)
}
// Reuse installed dependencies; the output contains no dependency on the editor source.
await fs.symlink(path.join(frontend, 'node_modules'), path.join(destination, 'node_modules'), 'junction')
await build({ root: destination, logLevel: 'error', configFile: path.join(destination, 'vite.config.js') })
console.log('Exported project build PASS')
console.log('Exported project: ' + destination)
console.log('Browser upload fixture: ' + fixture)
await fs.writeFile(path.join(os.tmpdir(), 'lowcode-last-export-check.txt'), destination)
