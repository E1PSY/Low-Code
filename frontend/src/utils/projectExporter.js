import { createDocument, parseDocument, walkObjects } from './sceneDocument.js'
import { readModelAsset } from './assetStorage.js'

export function generatePortableProject(objects, sources, name = 'tresjs-scene') {
  if (!sources?.['src/components/scene/SceneCanvas.vue']) throw new Error('缺少导出运行时')
  const document = createDocument(parseDocument(createDocument(objects)).objects, name)
  return {
    ...sources,
    'package.json': JSON.stringify({
      name: name.replace(/[^a-z0-9-]/gi, '-').toLowerCase(), private: true, version: '1.0.0', type: 'module',
      scripts: { dev: 'vite', build: 'vite build', preview: 'vite preview' },
      dependencies: { '@tresjs/cientos': '5.7.2', '@tresjs/core': '5.8.1', three: '0.184.0', vue: '3.5.38', pinia: '3.0.4' },
      devDependencies: { vite: '7.3.5', '@vitejs/plugin-vue': '6.0.7' },
    }, null, 2),
    'vite.config.js': "import { defineConfig } from 'vite'\nimport vue from '@vitejs/plugin-vue'\nimport { templateCompilerOptions } from '@tresjs/core'\nexport default defineConfig({ base: './', plugins: [vue({...templateCompilerOptions})] })\n",
    'index.html': '<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>3D Scene</title></head><body><div id="app"></div><script type="module" src="/src/main.js"></script></body></html>',
    'src/main.js': "import { createApp } from 'vue'\nimport { createPinia } from 'pinia'\nimport Tres from '@tresjs/core'\nimport App from './App.vue'\ncreateApp(App).use(createPinia()).use(Tres).mount('#app')\n",
    'src/App.vue': '<template><SceneCanvas /><div v-if="error" class="error" role="alert">{{ error }}</div></template>\n<script setup>\nimport { ref, onMounted, onUnmounted } from "vue"\nimport SceneCanvas from "./components/scene/SceneCanvas.vue"\nconst error = ref("")\nconst onError = event => { error.value = event.detail }\nonMounted(() => window.addEventListener("model-load-error", onError))\nonUnmounted(() => window.removeEventListener("model-load-error", onError))\n</script>\n<style>html,body,#app{margin:0;width:100%;height:100%;overflow:hidden}.error{position:fixed;bottom:12px;left:12px;padding:12px;background:#7f1d1d;color:white}</style>',
    'src/scene.json': JSON.stringify(document, null, 2),
    'README.md': '# 导出的 3D 场景\n\n运行环境：Node.js 22.12 或以上。\n\n运行 npm install，然后 npm run dev。生产构建使用 npm run build。\n\n模型位于 public/assets，Draco 解码器位于 public/draco；运行时不依赖原编辑器的后端。请通过 HTTP 服务访问，不要直接双击 index.html。\n',
  }
}

export async function prepareProject(objects, sources, { readAsset = readModelAsset, readDecoder } = {}) {
  // Snapshot first: edits during asset preparation cannot create a mixed export.
  const snapshot = createDocument(objects)
  const models = []
  walkObjects(snapshot.objects, obj => { if (obj.type === 'Model') models.push(obj) })
  const assets = {}
  const seen = new Map()
  for (const obj of models) {
    const key = obj.assetId || obj.url
    let path = seen.get(key)
    if (!path) {
      const asset = await readAsset(obj)
      const ext = asset.name.toLowerCase().endsWith('.gltf') ? '.gltf' : '.glb'
      path = 'assets/model-' + seen.size + ext
      assets['public/' + path] = new Uint8Array(await asset.blob.arrayBuffer())
      seen.set(key, path)
    }
    obj.url = path
    delete obj.assetId
  }
  if (models.length) {
    if (!readDecoder) throw new Error('缺少模型解码资源')
    for (const name of ['draco_decoder.js', 'draco_decoder.wasm', 'draco_wasm_wrapper.js']) {
      assets['public/draco/' + name] = await readDecoder(name)
    }
  }
  return { ...generatePortableProject(snapshot.objects, sources), ...assets }
}
