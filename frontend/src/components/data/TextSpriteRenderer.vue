<template>
  <TresSprite
    :ref="(el) => setObjectRef(el, obj.id)"
    :position="pos(obj)"
    :scale="[obj.scale[0], obj.scale[1], 1]"
    @click.stop="selectObject(obj.id)"
  >
    <TresSpriteMaterial :map="textureRef" :transparent="true" :depth-test="false" />
  </TresSprite>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import * as THREE from 'three'
import { useSceneStore } from '../../stores/sceneStore.js'
import { createSpriteTexture } from '../../composables/useDataBinding.js'

const props = defineProps({
  obj: { type: Object, required: true },
})

const sceneStore = useSceneStore()
const textureRef = ref(null)

function pos(o) { return [o.position[0], o.position[1], o.position[2]] }
function setObjectRef(el, id) { sceneStore.setObjectRef(id, el) }
function selectObject(id) { sceneStore.selectObject(id) }

function makeTexture(text, fontSize, textColor, bgColor, bold) {
  const canvas = createSpriteTexture(text, fontSize, textColor, bgColor, bold)
  const tex = new THREE.CanvasTexture(canvas)
  tex.minFilter = THREE.LinearFilter
  tex.magFilter = THREE.LinearFilter
  return tex
}

function refreshTexture() {
  textureRef.value = makeTexture(
    props.obj.text || 'Hello',
    props.obj.fontSize || 48,
    props.obj.textColor || '#ffffff',
    props.obj.bgColor || 'transparent',
    props.obj.bold || false
  )
}

onMounted(() => refreshTexture())

watch(() => [props.obj.text, props.obj.textColor, props.obj.bgColor, props.obj.fontSize, props.obj.bold],
  () => refreshTexture(),
  { deep: false }
)
</script>
