/**
 * 交互逻辑配置
 * 定义所有可用的交互行为类型、动作及默认值
 */

// === 点击交互动作 ===
export const CLICK_ACTIONS = [
  { value: 'none',          label: '无动作' },
  { value: 'highlight',     label: '高亮闪烁' },
  { value: 'animate',       label: '播放动画' },
  { value: 'moveTo',        label: '移动到指定位置' },
  { value: 'changeColor',   label: '改变颜色' },
  { value: 'toggleVisible', label: '切换可见性' },
  { value: 'bounce',        label: '弹跳效果' },
  { value: 'focusCamera',   label: '聚焦相机' },
  { value: 'wireframe',     label: '线框切换' },
]

// === 悬停交互动作 ===
export const HOVER_ACTIONS = [
  { value: 'none',        label: '无动作' },
  { value: 'highlight',   label: '高亮变色' },
  { value: 'scaleUp',     label: '放大' },
  { value: 'rotate',      label: '旋转偏移' },
  { value: 'wireframe',   label: '显示线框' },
  { value: 'emissive',    label: '自发光' },
]

// === 默认交互配置 ===
export const DEFAULT_INTERACTIONS = {
  onClick: {
    enabled: false,
    action: 'none',
    highlightColor: '#ffff00',
    animationName: '',
    moveToPosition: [0, 1, 0],
    targetColor: '#ff0000',
    tweenDuration: 1000,
  },
  onHover: {
    enabled: false,
    action: 'none',
    highlightColor: '#00ff88',
    scaleMultiplier: 1.15,
  },
  autoRotate: {
    enabled: false,
    speed: 1,
    axis: 'y',
  },
}

// === 自动旋转轴选项 ===
export const ROTATE_AXES = [
  { value: 'x', label: 'X 轴' },
  { value: 'y', label: 'Y 轴' },
  { value: 'z', label: 'Z 轴' },
]
