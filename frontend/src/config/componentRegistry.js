import { Vector2 } from 'three'
const lathe = [[0,1.2],[0.15,1.15],[0.15,0.9],[0.5,0.75],[0.7,0.5],[0.6,0.25],[0.4,0.05],[0.35,0]].map(p => new Vector2(...p))

// Add a primitive here; library, factory, validation, editor and export derive from this registry.
export const componentRegistry = {
  Box: { type: 'Box', kind: 'mesh', defaults: { defaultScale: [1, 1, 1], defaultColor: '#3b82f6' }, name: '立方体',     icon: '📦', category: 'primitive',   description: '基础立方体网格', geometry: ['TresBoxGeometry', [1,1,1]] },
  Sphere: { type: 'Sphere', kind: 'mesh', defaults: { defaultScale: [1, 1, 1], defaultColor: '#3b82f6' }, name: '球体',       icon: '⚽', category: 'primitive',   description: '基础球体网格', geometry: ['TresSphereGeometry', [0.5,32,32]], segmentIndices: [1,2] },
  Cylinder: { type: 'Cylinder', kind: 'mesh', defaults: { defaultScale: [1, 1, 1], defaultColor: '#3b82f6' }, name: '圆柱体',     icon: '🥫', category: 'primitive',   description: '基础圆柱体网格', geometry: ['TresCylinderGeometry', [0.5,0.5,1,32]], segmentIndices: [3] },
  Cone: { type: 'Cone', kind: 'mesh', defaults: { defaultScale: [1, 1, 1], defaultColor: '#3b82f6' }, name: '圆锥体',     icon: '🔺', category: 'primitive',   description: '基础圆锥体网格', geometry: ['TresConeGeometry', [0.5,1,32]], segmentIndices: [2] },
  Plane: { type: 'Plane', kind: 'mesh', defaults: { defaultScale: [1, 1, 1], defaultColor: '#6b7280' }, name: '平面',       icon: '🟩', category: 'primitive',   description: '扁平矩形平面', geometry: ['TresPlaneGeometry', [5,5]] },
  Torus: { type: 'Torus', kind: 'mesh', defaults: { defaultScale: [1, 1, 1], defaultColor: '#3b82f6' }, name: '圆环体',     icon: '🍩', category: 'primitive',   description: '3D 甜甜圈圆环', geometry: ['TresTorusGeometry', [0.5,0.2,16,32]], segmentIndices: [2,3] },
  Ring: { type: 'Ring', kind: 'mesh', defaults: { defaultScale: [1, 1, 1], defaultColor: '#3b82f6' }, name: '圆环',       icon: '⭕', category: 'primitive',   description: '扁平 2D 圆环', geometry: ['TresRingGeometry', [0.3,0.6,32]], segmentIndices: [2] },
  Icosahedron: { type: 'Icosahedron', kind: 'mesh', defaults: { defaultScale: [1, 1, 1], defaultColor: '#8b5cf6' }, name: '二十面体',   icon: '💎', category: 'primitive',   description: '正二十面体（20面）', geometry: ['TresIcosahedronGeometry', [0.7,0]] },
  Octahedron: { type: 'Octahedron', kind: 'mesh', defaults: { defaultScale: [1, 1, 1], defaultColor: '#f59e0b' }, name: '八面体',     icon: '🔶', category: 'primitive',   description: '正八面体（8面）', geometry: ['TresOctahedronGeometry', [0.7,0]] },
  Tetrahedron: { type: 'Tetrahedron', kind: 'mesh', defaults: { defaultScale: [1, 1, 1], defaultColor: '#10b981' }, name: '四面体',     icon: '🔻', category: 'primitive',   description: '正四面体（4面）', geometry: ['TresTetrahedronGeometry', [0.7,0]] },
  Dodecahedron: { type: 'Dodecahedron', kind: 'mesh', defaults: { defaultScale: [1, 1, 1], defaultColor: '#ec4899' }, name:'十二面体',   icon: '⚛️', category: 'primitive',   description: '正十二面体（12面）', geometry: ['TresDodecahedronGeometry', [0.7,0]] },
  Lathe: { type: 'Lathe', kind: 'mesh', defaults: { defaultScale: [1, 1, 1], defaultColor: '#3b82f6' }, name: '车削体',     icon: '🏺', category: 'primitive',   description: '旋转成型体（花瓶）', geometry: ['TresLatheGeometry', [lathe,32]], segmentIndices: [1] },
  TextSprite: { type: 'TextSprite', kind: 'text', defaults: { defaultScale: [4, 1, 1], defaultColor: '#ffffff', yPosition: 1.5 }, name: '文字标签',  icon: '🏷️', category: 'data',       description: '3D 文字精灵标签' },
  DirectionalLight: { type: 'DirectionalLight', kind: 'light', defaults: { intensity: 2, color: '#ffffff', yPosition: 4 }, name: '平行光',  icon: '☀️', category: 'light',  description: '平行方向光源', lightComponent: 'TresDirectionalLight', lightProps: { intensity: 2 } },
  PointLight: { type: 'PointLight', kind: 'light', defaults: { intensity: 10, color: '#ffffff', yPosition: 2 }, name: '点光源',  icon: '💡', category: 'light',  description: '向四周发散的点光源', lightComponent: 'TresPointLight', lightProps: { intensity: 10 } },
  SpotLight: { type: 'SpotLight', kind: 'light', defaults: { intensity: 10, color: '#ffffff', yPosition: 3 }, name: '聚光灯',  icon: '🔦', category: 'light',  description: '锥形聚光灯光源', lightComponent: 'TresSpotLight', lightProps: { intensity: 10, angle: 0.5, penumbra: 0.3 } },
  HemisphereLight: { type: 'HemisphereLight', kind: 'light', defaults: { intensity: 2, color: '#87ceeb', yPosition: 5 }, name: '半球光',  icon: '🌓', category: 'light',  description: '天空/地面渐变光源', lightComponent: 'TresHemisphereLight', lightProps: { intensity: 2, groundColor: '#444444' } },
  Model: { type: 'Model', kind: 'model', defaults: { defaultScale: [1, 1, 1], defaultPosition: [0, 0, 0], defaultRotation: [0, 0, 0] } },
  CompositeGroup: { type: 'CompositeGroup', kind: 'group', defaults: { defaultScale: [1, 1, 1], defaultColor: '#ffffff', yPosition: 0 } },
}
componentRegistry.Light = { ...componentRegistry.DirectionalLight, type: 'Light', category: undefined }
const definitions = Object.values(componentRegistry)
export const OBJECT_DEFAULTS = Object.fromEntries(definitions.map(d => [d.type, d.defaults]))
export const TYPES_WITH_COLOR = definitions.filter(d => ['mesh', 'light'].includes(d.kind)).map(d => d.type)
export const GEOMETRY_TYPES = definitions.filter(d => d.kind === 'mesh').map(d => d.type)
export const LIGHT_TYPES = definitions.filter(d => d.kind === 'light').map(d => d.type)
export const COMPOSITE_TYPES = definitions.filter(d => d.kind === 'group').map(d => d.type)
export const TYPE_ICONS = Object.fromEntries(definitions.map(d => [d.type, d.icon || '🏗️']))
export function getComponent(type) { const definition = componentRegistry[type]; if (!definition) throw new Error('不支持的组件类型: ' + type); return definition }
export const QUALITY_PRESETS = {
  low: { label: '流畅', dpr: 1, segments: 12 },
  standard: { label: '标准', dpr: 1.5, segments: 24 },
  high: { label: '精细', dpr: 2, segments: 32 },
}
export function geometryFor(type, quality = 'standard') {
  const geometry = getComponent(type).geometry
  if (!geometry) return undefined
  const [name, source] = geometry, args = [...source]
  const segments = QUALITY_PRESETS[quality]?.segments || 24
  const indices = getComponent(type).segmentIndices || []
  indices.forEach(index => { args[index] = Math.min(source[index], segments) })
  return [name, args]
}
