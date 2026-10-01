<template>
  <div class="scene-container">
    <TresCanvas clear-color="#18181a" window-size>
      <TresPerspectiveCamera :position="[5,5,5]" :look-at="[0,0,0]" />
      <OrbitControls />
      <TresAmbientLight :intensity="0.8" />
        <TresMesh :position="[-0.2, 0.5, -0.4]" :rotation="[0, 0, 0]" :scale="[1, 1, 1]">
          <TresBoxGeometry :args="[1,1,1]" />
          <TresMeshStandardMaterial :color="'#3b82f6'" />
        </TresMesh>
        <TresMesh :position="[2.797, 0.5, -0.791]" :rotation="[0, 0, 0]" :scale="[1, 1, 1]">
          <TresBoxGeometry :args="[1,1,1]" />
          <TresMeshStandardMaterial :color="'#3b82f6'" />
        </TresMesh>
        <TresGroup :position="[1.41, 0.09, -0.469]" :rotation="[0, 0, 0]" :scale="[1, 1, 1]">
          <Suspense>
            <AnimatedModel :obj="{ url: 'http://localhost:3000/models/mid_century_lounge_chair_4k.glb' }" />
          </Suspense>
        </TresGroup>
    </TresCanvas>
  </div>
</template>

<script setup>
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import AnimatedModel from './AnimatedModel.vue'
</script>

<style scoped>
.scene-container { width: 100vw; height: 100vh; overflow: hidden; background-color: #18181a; }
</style>