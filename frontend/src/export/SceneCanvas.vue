<template>
  <TresCanvas clear-color="#121824" window-size>
    <TresPerspectiveCamera :position="[5,5,5]" :look-at="[0,0,0]" />
    <OrbitControls make-default />
    <TresAmbientLight :intensity="0.8" />
    <CameraBridge />
    <SceneNode v-for="obj in store.objects" :key="obj.id" :obj="obj" :handlers="handlers" />
  </TresCanvas>
</template>
<script setup>
import { defineComponent, shallowRef, onMounted, onUnmounted } from 'vue'
import { TresCanvas, useTres } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import SceneNode from './SceneNode.vue'
import { useSceneStore } from '../../stores/sceneStore.js'
import { useSceneRuntime } from '../../composables/useSceneRuntime.js'
const store = useSceneStore()
const api = shallowRef(null)
const CameraBridge = defineComponent({ setup() { const { camera, controls } = useTres(); api.value = { camera, controls }; return () => null } })
const { handlers } = useSceneRuntime(api)
</script>
