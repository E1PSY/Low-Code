<template>
  <component :is="nodeType" :ref="register" :position="obj.position || [0,0,0]"
    :rotation="obj.rotation || [0,0,0]" :scale="obj.scale || [1,1,1]" :visible="obj.visible !== false"
    @click.stop="handlers.click?.(eventObject)" @pointer-enter="handlers.enter?.(eventObject)"
    @pointer-leave="handlers.leave?.(eventObject)">
    <template v-if="geometry">
      <component :is="geometry[0]" :args="geometry[1]" />
      <TresMeshStandardMaterial :color="obj.color || '#3b82f6'" :side="doubleSided ? 2 : 0" />
    </template>
    <TresSpriteMaterial v-else-if="obj.type === 'TextSprite'" :map="texture" :transparent="true" :depth-test="false" />
    <AnimatedModel v-else-if="obj.type === 'Model'" :obj="obj" />
    <template v-else-if="obj.type === 'CompositeGroup'">
      <SceneNode v-for="(child, index) in obj.meta.childrenResolved" :key="child.id || child._childId || index"
        :obj="child" :handlers="handlers" :interaction-object="eventObject" />
    </template>
    <component v-else-if="isLight" :is="definition.lightComponent" v-bind="definition.lightProps" :color="obj.color || definition.defaults.color" />
    <TresMesh v-if="isLight">
      <TresSphereGeometry :args="[0.15, 12, 12]" /><TresMeshBasicMaterial :color="obj.color || '#fff'" />
    </TresMesh>
  </component>
</template>

<script setup>
import { computed, shallowRef, watch, onBeforeUnmount, inject } from 'vue'
import { CanvasTexture, LinearFilter } from 'three'
import { useSceneStore } from '../../stores/sceneStore.js'
import { refreshSpriteCanvas } from '../../composables/useDataBinding.js'
import { defineAsyncComponent } from 'vue'
import { geometryFor, getComponent } from '../../config/componentRegistry.js'
const AnimatedModel = defineAsyncComponent(() => import('../model/AnimatedModel.vue'))

const props = defineProps({
  obj: { type: Object, required: true },
  handlers: { type: Object, default: () => ({}) },
  interactionObject: Object,
})
const store = useSceneStore()
const eventObject = computed(() => props.interactionObject || props.obj)
const quality = inject('sceneQuality', { value: 'standard' })
const geometry = computed(() => geometryFor(props.obj.type, quality.value))
const nodeType = computed(() => geometry.value ? 'TresMesh' : props.obj.type === 'TextSprite' ? 'TresSprite' : 'TresGroup')
const doubleSided = computed(() => ['Plane', 'Ring'].includes(props.obj.type))
const definition = computed(() => getComponent(props.obj.type))
const isLight = computed(() => definition.value.kind === 'light')
function register(el) { if (props.obj.id) store.setObjectRef(props.obj.id, el) }
const texture = shallowRef(null)
watch(() => [props.obj.text, props.obj.fontSize, props.obj.textColor, props.obj.bgColor, props.obj.bold], () => {
  if (props.obj.type !== 'TextSprite') return
  const previous = texture.value
  const canvas = previous?.image || document.createElement('canvas')
  const width = canvas.width, height = canvas.height
  refreshSpriteCanvas(canvas, props.obj.text ?? '', props.obj.fontSize || 48, props.obj.textColor || '#fff', props.obj.bgColor, props.obj.bold)
  if (previous && width === canvas.width && height === canvas.height) { previous.needsUpdate = true; return }
  const next = new CanvasTexture(canvas)
  next.minFilter = next.magFilter = LinearFilter
  texture.value = next
  previous?.dispose()
}, { immediate: true })
onBeforeUnmount(() => texture.value?.dispose())
</script>
