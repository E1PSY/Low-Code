/**
 * 数据绑定配置
 * 定义可绑定的属性类型、数据源模拟器及默认配置
 */

// === 可绑定的目标属性 ===
export const BINDABLE_PROPS = [
  { value: 'none',        label: '无绑定' },
  { value: 'color',       label: '颜色' },
  { value: 'scaleX',      label: '缩放 X' },
  { value: 'scaleY',      label: '缩放 Y' },
  { value: 'scaleZ',      label: '缩放 Z' },
  { value: 'positionY',   label: '位置 Y' },
  { value: 'text',       label: '文本内容' },
]

// === 数据源类型 ===
export const DATA_SOURCES = [
  { value: 'none',          label: '无数据源' },
  { value: 'sine',          label: '正弦波 (0-1)' },
  { value: 'random',        label: '随机值' },
  { value: 'clock',         label: '实时时间' },
  { value: 'counter',       label: '计数器' },
]

// === 默认绑定配置 ===
export const DEFAULT_BINDING = {
  enabled: false,
  targetProp: 'none',
  dataSource: 'none',
  min: 0,
  max: 1,
  speed: 1,
  format: '{value}',
}

// 计数器外部存储（不污染 Pinia 状态）
const counters = new Map()

/**
 * 根据数据源生成值
 * @param {string} source - 数据源类型
 * @param {object} opts - 绑定配置 (min, max, speed)
 * @param {number} frame - 帧计数
 * @param {string} objId - 对象 ID（用于 counter 状态隔离）
 */
export function getDataValue(source, opts = {}, frame, objId) {
  const t = (frame || 0) * (opts.speed || 1) * 0.016

  switch (source) {
    case 'sine':
      return opts.min + ((Math.sin(t * 2) + 1) / 2) * (opts.max - opts.min)

    case 'random':
      return opts.min + Math.random() * (opts.max - opts.min)

    case 'clock': {
      const now = new Date()
      return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
    }

    case 'counter': {
      const count = Math.floor(t)
      const raw = opts.min + (count % Math.max(opts.max - opts.min + 1, 1))
      return Math.round(raw * 100) / 100
    }

    default:
      return 0
  }
}

/** 清除计数器（模板切换时调用） */
export function resetCounters() {
  counters.clear()
}

/** hex 颜色插值 */
export function lerpColor(hexA, hexB, t) {
  const a = hexToRgb(hexA)
  const b = hexToRgb(hexB)
  if (!a || !b) return hexA
  const r = Math.round(a.r + (b.r - a.r) * t)
  const g = Math.round(a.g + (b.g - a.g) * t)
  const bv = Math.round(a.b + (b.b - a.b) * t)
  return '#' + [r, g, bv].map((v) => v.toString(16).padStart(2, '0')).join('')
}

function hexToRgb(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : null
}
