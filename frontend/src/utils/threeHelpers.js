/**
 * Three.js / TresJS 辅助工具函数
 */
import { toRaw } from 'vue'

/**
 * 解析 TresJS 组件引用中的原生 Three.js Object3D 实例
 * 兼容 TresJS 4.x / 5.x 多种引用包装格式
 */
export function resolveObject3D(refValue) {
  if (!refValue) return null

  let raw = toRaw(refValue)

  // 直接就是 Object3D 实例
  if (raw && raw.isObject3D) return raw

  // TresJS 4/5 常用包装：.instance
  if (raw && raw.instance && raw.instance.isObject3D) return raw.instance

  // TresJS v2 组件包装：$el.instance
  if (raw?.$el?.instance?.isObject3D) return raw.$el.instance

  // TresJS 5 内部结构：.value
  if (raw?.value?.isObject3D) return raw.value

  // TresJS 5 深层结构：组件实例的 .__vnode?.component?.exposed
  if (raw?.__vnode?.component?.exposed) {
    const exposed = raw.__vnode.component.exposed
    for (const key of ['mesh', 'instance', 'object3D', 'node']) {
      const val = toRaw(exposed[key])
      if (val?.isObject3D) return val
    }
  }

  // TresGroup ref → 取第一个有效子对象（Group 自身无 material）
  if (raw?.isGroup && raw.children?.length) {
    for (const child of raw.children) {
      if (child.isObject3D) return child
    }
  }

  return null
}

/**
 * 将对象位移/旋转/缩放的数值截断到指定精度
 */
export function truncateVector(values, precision = 3) {
  return values.map((v) => Number(v.toFixed(precision)))
}

/**
 * 确保缩放值不为零
 */
export function clampScale(value, min = 0.01) {
  return Math.max(min, value)
}
