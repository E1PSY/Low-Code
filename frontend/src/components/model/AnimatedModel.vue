<template>
  <TresGroup ref="group" />
</template>

<script setup>
import { shallowRef, watch, onBeforeUnmount, inject } from 'vue'
import { AnimationMixer } from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { acquireModelURL } from '../../utils/assetStorage.js'

const props = defineProps({ obj: { type: Object, required: true } })
const group = shallowRef(null)
const runtime = inject('sceneRuntime')
let stopAnimation
let model, mixer, resource, stopped = false, revision = 0
const draco = new DRACOLoader()
draco.setDecoderPath(import.meta.env.BASE_URL + 'draco/')
const loader = new GLTFLoader().setDRACOLoader(draco)
function disposeModel(scene) {
  const disposed = new Set()
  function dispose(resource) { if (resource && !disposed.has(resource)) { disposed.add(resource); resource.dispose(); if (resource.isTexture) resource.source?.data?.close?.() } }
  scene?.traverse(node => {
    dispose(node.geometry)
    for (const material of (Array.isArray(node.material) ? node.material : [node.material])) {
      if (!material) continue
      for (const value of Object.values(material)) if (value?.isTexture) dispose(value)
      dispose(material)
    }
  })
}
function cleanup() {
  stopAnimation?.(); stopAnimation = null
  mixer?.stopAllAction()
  if (model) { mixer?.uncacheRoot(model); model.removeFromParent(); disposeModel(model) }
  resource?.release()
  resource = model = mixer = undefined
}
function playAnimation() {
  stopAnimation?.(); stopAnimation = null
  mixer?.stopAllAction()
  if (!runtime?.enabled.value) return
  if (mixer && props.obj.activeAnimation) {
    const clip = model.animations?.find(item => item.name === props.obj.activeAnimation)
    if (clip) { mixer.clipAction(clip).reset().play(); stopAnimation = runtime.scheduler.subscribe(delta => mixer?.update(delta)) }
  }
}
watch(() => [props.obj.assetId, props.obj.url], async () => {
  const request = ++revision
  cleanup()
  let pending
  try {
    pending = await acquireModelURL(props.obj)
    const gltf = await loader.loadAsync(pending.url)
    if (stopped || request !== revision) { disposeModel(gltf.scene); pending.release(); return }
    resource = pending
    model = gltf.scene
    model.animations = gltf.animations
    const names = gltf.animations.map(clip => clip.name)
    if (JSON.stringify(props.obj.animations) !== JSON.stringify(names)) props.obj.animations = names
    if (group.value) group.value.add(model)
    mixer = new AnimationMixer(model)
    playAnimation()
  } catch (error) {
    pending?.release()
    if (!stopped && request === revision) {
      console.error('模型加载失败:', error)
      globalThis.window?.dispatchEvent(new CustomEvent('model-load-error', { detail: props.obj.name + ': ' + error.message }))
    }
  }
}, { immediate: true })
watch(group, value => { if (value && model) value.add(model) })
watch(() => [props.obj.activeAnimation, runtime?.enabled.value], playAnimation)
onBeforeUnmount(() => { stopped = true; revision++; cleanup(); draco.dispose() })
</script>
