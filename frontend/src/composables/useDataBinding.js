/**
 * 数据绑定运行时引擎
 * 仅处理活跃绑定，最多每秒更新 10 次，与渲染帧率解耦
 */
import { useSceneStore } from '../stores/sceneStore.js'
import { resolveObject3D } from '../utils/threeHelpers.js'
import { getDataValue, lerpColor } from '../config/bindings.js'

import { watch } from 'vue'
import { getComponent } from '../config/componentRegistry.js'

export function useDataBinding(scheduler) {
  const sceneStore = useSceneStore()
  let stopWatching, unsubscribe
  let frameCount = 0
  function start() {
    if (stopWatching) return
    stopWatching = watch(() => sceneStore.runtimeObjects.filter(obj => obj.binding?.enabled && obj.binding.targetProp !== 'none' && obj.binding.dataSource !== 'none'), items => {
      unsubscribe?.(); unsubscribe = null
      if (!items.length) return
      let since = 1, elapsed = 0
      unsubscribe = scheduler.subscribe(delta => {
        elapsed += delta; since += delta
        if (since < 0.1) return
        since = 0; frameCount = elapsed / 0.016
        tick(items)
      })
    }, { immediate: true })
  }
  function stop() { stopWatching?.(); stopWatching = null; unsubscribe?.(); unsubscribe = null }
  function tick(items) {
    items.forEach((obj) => {
      const binding = obj.binding
      if (!binding?.enabled || binding.targetProp === 'none' || binding.dataSource === 'none') return



      if (obj.type === 'TextSprite') {
        const value = getDataValue(binding.dataSource, binding, frameCount, obj.id)
        obj.text = typeof value === 'string'
          ? value
          : binding.format.replace('{value}', String(Math.round(value * 100) / 100))
        return
      }

      const value = getDataValue(binding.dataSource, binding, frameCount, obj.id)
      if (typeof value === 'string') return

      const mesh = resolveObject3D(sceneStore.objectRefs.get(obj.id))
      if (!mesh) return

      const range = binding.max - binding.min || 1
      const t = (value - binding.min) / range

      switch (binding.targetProp) {
        case 'color': {
          if (mesh.material?.color) {
            const baseColor = getComponent(obj.type).defaults.defaultColor || '#3b82f6'
            const target = lerpColor(baseColor, '#ef4444', t)
            mesh.material.color.set(target)
          }
          break
        }
        case 'scaleX':
          mesh.scale.x = binding.min + t * (binding.max - binding.min) * 2
          obj.scale[0] = Number(mesh.scale.x.toFixed(3))
          break
        case 'scaleY':
          mesh.scale.y = binding.min + t * (binding.max - binding.min) * 2
          obj.scale[1] = Number(mesh.scale.y.toFixed(3))
          break
        case 'scaleZ':
          mesh.scale.z = binding.min + t * (binding.max - binding.min) * 2
          obj.scale[2] = Number(mesh.scale.z.toFixed(3))
          break
        case 'positionY':
          mesh.position.y = binding.min + t * (binding.max - binding.min) * 3
          obj.position[1] = Number(mesh.position.y.toFixed(3))
          break
      }
    })


  }

  return { start, stop }
}

// ==============
// 静态辅助函数
// ==============

/** 创建 Canvas 纹理 */
export function createSpriteTexture(text, fontSize, textColor, bgColor, bold) {
  const canvas = document.createElement('canvas')
  refreshSpriteCanvas(canvas, text, fontSize, textColor, bgColor, bold)
  return canvas
}

export function refreshSpriteCanvas(canvas, text, fontSize, textColor, bgColor, bold) {
  const lines = String(text).split('\n')
  const font = (bold ? 'bold ' : '') + fontSize + 'px sans-serif'
  const context = canvas.getContext('2d')
  context.font = font
  canvas.width = Math.min(4096, Math.max(fontSize, ...lines.map(line => context.measureText(line).width)) + fontSize)
  canvas.height = Math.min(4096, Math.ceil(fontSize * 1.4 * lines.length + fontSize * 0.5))
  const ctx = canvas.getContext('2d')
  if (bgColor && bgColor !== 'transparent') {
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  } else ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.font = font
  ctx.fillStyle = textColor
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  lines.forEach((line, index) => ctx.fillText(line, canvas.width / 2, fontSize * (0.95 + index * 1.4), canvas.width - fontSize))
}
