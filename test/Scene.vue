<template>
  <div class="scene-container">
    <TresCanvas clear-color="#18181a" window-size>
      <TresPerspectiveCamera :position="[5,5,5]" :look-at="[0,0,0]" />
      <OrbitControls />
      <TresAmbientLight :intensity="0.8" />
        <InteractableMesh :position="[0, 0.5, 0]" :rotation="[0, 0, 0]" :scale="[1, 1, 1]" :interactions="{ onClick: { enabled: true, action: 'bounce', highlightColor: '#ffff00', animationName: '', moveToPosition: [0, 1, 0], targetColor: '#ff0000', tweenDuration: 1000 }, onHover: { enabled: true, action: 'scaleUp', highlightColor: '#00ff88', scaleMultiplier: 1.2 }, autoRotate: { enabled: false, speed: 1, axis: 'y' } }">
          <TresBoxGeometry :args="[1,1,1]" />
          <TresMeshStandardMaterial :color="'#3b82f6'" />
        </InteractableMesh>
        <TresGroup :position="[2, 0, 0]" :rotation="[0, 0, 0]" :scale="[1, 1, 1]">
          <Suspense>
            <AnimatedModel :obj="{ url: 'http://localhost:3000/models/chair.glb' }" />
          </Suspense>
        </TresGroup>
        <TresMesh :position="[0, 0, 0]" :rotation="[0, 0, 0]" :scale="[3, 1, 3]">
          <TresPlaneGeometry :args="[5,5]" />
          <TresMeshStandardMaterial :color="'#6b7280'" :side="2" />
        </TresMesh>
        <TextSpriteRenderer :obj="{ text: 'Hello', fontSize: 48, textColor: '#fff', bgColor: 'transparent', bold: true, position: [0, 2, 0], scale: [1, 1, 1] }" />
    </TresCanvas>
  </div>
</template>

<script setup>
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import { defineComponent, h, ref, onMounted, watch, shallowRef } from 'vue'
import * as THREE from 'three'
import { useGLTF } from '@tresjs/cientos'

const InteractableMesh = defineComponent({
  name: 'InteractableMesh',
  props: {
    position: { type: Array, default: function() { return [0,0,0] } },
    rotation: { type: Array, default: function() { return [0,0,0] } },
    scale: { type: Array, default: function() { return [1,1,1] } },
    interactions: { type: Object, default: function() { return {} } }
  },
  setup: function(props, ctx) {
    return function() { return ctx.slots.default ? ctx.slots.default() : null }
  }
})


const TextSpriteRenderer = defineComponent({
  name: 'TextSpriteRenderer',
  props: { obj: { type: Object, required: true } },
  setup: function(props) {
    var texture = ref(null)
    function buildTexture() {
      var c = document.createElement('canvas')
      var fs = props.obj.fontSize || 48
      c.width = fs * 8
      c.height = fs * 2
      var ctx = c.getContext('2d')
      if (props.obj.bgColor && props.obj.bgColor !== 'transparent') {
        ctx.fillStyle = props.obj.bgColor
        ctx.fillRect(0, 0, c.width, c.height)
      }
      ctx.font = (props.obj.bold ? 'bold ' : '') + fs + 'px sans-serif'
      ctx.fillStyle = props.obj.textColor || '#fff'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(props.obj.text || '?', c.width / 2, c.height / 2)
      texture.value = new THREE.CanvasTexture(c)
    }
    onMounted(function() { buildTexture() })
    watch(function() { return [props.obj.text, props.obj.fontSize] }, function() { buildTexture() })
    return function() {
      var t = texture.value
      if (!t) return null
      return h('TresSprite', {
        position: [props.obj.position[0], props.obj.position[1], props.obj.position[2]],
        scale: [props.obj.scale[0], props.obj.scale[1], 1]
      }, function() {
        return h('TresSpriteMaterial', { map: t, transparent: true, depthTest: false })
      })
    }
  }
})


const AnimatedModel = defineComponent({
  name: 'AnimatedModel',
  props: { obj: { type: Object, required: true } },
  setup: function(props) {
    var groupRef = shallowRef(null)
    var modelScene = shallowRef(null)
    async function load() {
      try {
        var result = await useGLTF(props.obj.url, { draco: true })
        var scene = result.scene || (result.scenes && result.scenes[0])
        if (scene) modelScene.value = scene
      } catch(e) { console.error('Model load error:', e) }
    }
    onMounted(function() { load() })
    watch(function() { return props.obj.url }, function() { load() })
    return function() {
      return h('TresGroup', {
        ref: function(el) { groupRef.value = el; if (el && modelScene.value) el.add(modelScene.value) }
      })
    }
  }
})

</script>

<style scoped>
.scene-container { width: 100vw; height: 100vh; overflow: hidden; background-color: #18181a; }
</style>