/**
 * 场景对象工厂
 */
import { getComponent, TYPES_WITH_COLOR } from '../config/componentRegistry.js'
import { DEFAULT_INTERACTIONS } from '../config/interactions.js'
import { DEFAULT_BINDING } from '../config/bindings.js'
import { componentLibrary } from '../config/componentLibrary.js'

let objectIdCounter = 0

function generateId(prefix = 'obj') {
  objectIdCounter++
  return `${prefix}_${Date.now()}_${objectIdCounter}`
}

function randomOffset() {
  return Number((Math.random() - 0.5).toFixed(1))
}

function cloneInteractions() {
  return JSON.parse(JSON.stringify(DEFAULT_INTERACTIONS))
}

function cloneBinding() {
  return JSON.parse(JSON.stringify(DEFAULT_BINDING))
}

export function createSceneObject(type, name, overrides = {}) {
  const defaults = getComponent(type).defaults

  const base = {
    id: generateId(),
    type,
    name: name || `${type}_${objectIdCounter}`,
    position: [randomOffset(), defaults.yPosition ?? 0.5, randomOffset()],
    rotation: [0, 0, 0],
    scale: [...(defaults.defaultScale || [1, 1, 1])],
    visible: true,
    interactions: cloneInteractions(),
    binding: cloneBinding(),
    ...overrides,
  }

  if (type === 'TextSprite') {
    base.text = base.text ?? 'Hello'
    base.fontSize = base.fontSize || 48
    base.textColor = base.textColor || '#ffffff'
    base.bgColor = base.bgColor || 'transparent'
    base.bold = base.bold || false
  }

  if (TYPES_WITH_COLOR.includes(type) && !base.color) {
    base.color = defaults.defaultColor || '#ffffff'
  }

  // CompositeGroup：展开子对象。meta 必须完全克隆，不能与组件库条目共享引用
  // overrides.meta 已被调用方（useDragDrop / App.vue）提前 JSON 深拷贝
  if (type === 'CompositeGroup' && base.meta && typeof base.meta.children === 'function') {
    const childrenFn = base.meta.children
    const params = base.meta.params ? JSON.parse(JSON.stringify(base.meta.params)) : {}
    if (overrides.metaParams) {
      Object.assign(params, overrides.metaParams)
    }
    const resolved = childrenFn(params)
    // 用全新对象替换 base.meta，彻底断掉与组件库条目的引用
    base.meta = {
      componentId: base.meta.componentId || componentLibrary.find(c => c.meta?.children === childrenFn)?.componentId,
      params,
      _origChildren: childrenFn,
      childrenResolved: (resolved || []).map((child) => ({
        ...child,
        id: `child_${base.id}_${Math.random().toString(36).slice(2, 10)}`,
        _childId: `child_${base.id}_${Math.random().toString(36).slice(2, 6)}`,
        _groupId: base.id,
      })),
    }
  }

  return base
}

export function createModelObject(fileName, url, overrides = {}) {
  return createSceneObject('Model', fileName.replace('.blend', ''), {
    id: generateId('model'),
    url,
    activeAnimation: '',
    animations: [],
    ...overrides,
  })
}

/**
 * 创建 CompositeGroup 对象（场景级组件）
 * @param {Object} comp 组件库条目（含 meta）
 * @param {Object} [paramOverrides] 覆盖默认参数
 */
export function createCompositeObject(comp, paramOverrides = {}) {
  const obj = createSceneObject('CompositeGroup', comp.name, {
    position: [randomOffset(), 0, randomOffset()],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    meta: comp.meta ? { params: { ...comp.meta.params }, children: comp.meta.children } : undefined,
    metaParams: paramOverrides,
    componentDef: { type: comp.type, name: comp.name, icon: comp.icon, description: comp.description },
  })
  return obj
}

export function resetObjectCounter() {
  objectIdCounter = 0
}
