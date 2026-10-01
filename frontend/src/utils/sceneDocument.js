import { createSceneObject } from './objectFactory.js'
import { componentLibrary } from '../config/componentLibrary.js'
import { componentRegistry } from '../config/componentRegistry.js'

const clone = value => JSON.parse(JSON.stringify(value))
const types = new Set(Object.keys(componentRegistry))
const fields = ['id', 'type', 'name', 'position', 'rotation', 'scale', 'visible', 'color', 'text',
  'fontSize', 'textColor', 'bgColor', 'bold', 'url', 'assetId', 'assetName', 'activeAnimation',
  'animations', 'interactions', 'binding', 'componentDef']

/** @param {import('../types/scene').SceneObject} obj */
export function serializeObject(obj) {
  for (const key of ['position', 'rotation', 'scale']) {
    if (obj[key] !== undefined && (!Array.isArray(obj[key]) || obj[key].length !== 3 || !obj[key].every(Number.isFinite))) {
      throw new Error('无效的变换属性: ' + key)
    }
  }
  const result = {}
  for (const key of fields) if (obj[key] !== undefined) result[key] = clone(obj[key])
  if (obj.assetId) delete result.url // Object URLs are session-local.
  if (obj.type === 'CompositeGroup') {
    if (!obj.meta?.childrenResolved) throw new Error('组合组件缺少子对象: ' + obj.name)
    result.meta = {
      componentId: obj.meta.componentId,
      params: clone(obj.meta.params || {}),
      childrenResolved: obj.meta.childrenResolved.map(serializeObject),
    }
  }
  return result
}

/** @param {import('../types/scene').SceneObject[]} objects */
export function createDocument(objects, name = '未命名场景') {
  return { version: 3, name, createdAt: new Date().toISOString(), objects: objects.map(serializeObject) }
}

export function parseDocument(input) {
  const data = typeof input === 'string' ? JSON.parse(input) : input
  if (!data || ![2, 3].includes(data.version) || !Array.isArray(data.objects)) {
    throw new Error('不支持的场景文件或版本')
  }
  if (data.objects.length > 10000) throw new Error('场景对象数量过多')
  const ids = new Set()
  let count = 0
  function restore(item, depth = 0) {
    if (++count > 20000 || depth > 32) throw new Error('场景对象过多或嵌套过深')
    if (!item || !types.has(item.type)) throw new Error('不支持的组件类型: ' + item?.type)
    for (const key of ['position', 'rotation', 'scale']) {
      if (item[key] !== undefined && (!Array.isArray(item[key]) || item[key].length !== 3 ||
          !item[key].every(v => typeof v === 'number' && Number.isFinite(v)))) {
        throw new Error('无效的变换属性: ' + key)
      }
    }
    const clean = {}
    for (const key of fields) if (item[key] !== undefined) clean[key] = clone(item[key])
    if (clean.id !== undefined && (typeof clean.id !== 'string' || ids.has(clean.id))) throw new Error('场景对象 ID 重复或无效')
    for (const key of ['name', 'color', 'text', 'textColor', 'bgColor', 'url', 'assetId', 'assetName', 'activeAnimation']) {
      if (clean[key] !== undefined && typeof clean[key] !== 'string') throw new Error('无效的属性: ' + key)
    }
    if (clean.fontSize !== undefined && (!Number.isFinite(clean.fontSize) || clean.fontSize < 1 || clean.fontSize > 512)) throw new Error('字号必须在 1–512 之间')
    for (const key of ['interactions', 'binding']) {
      if (clean[key] !== undefined && (!clean[key] || typeof clean[key] !== 'object' || Array.isArray(clean[key]))) throw new Error('无效的属性: ' + key)
    }
    const obj = createSceneObject(item.type, item.name, { position: [0, 0, 0], ...clean })
    ids.add(obj.id)
    if (item.type === 'CompositeGroup') {
      if (!Array.isArray(item.meta?.childrenResolved)) {
        throw new Error('旧场景未保存组合组件内容，无法完整恢复，请重新添加该组件')
      }
      const definition = componentLibrary.find(c => c.componentId === item.meta.componentId)
      obj.meta = {
        componentId: item.meta.componentId,
        params: clone(item.meta.params || {}),
        childrenResolved: item.meta.childrenResolved.map(child => restore(child, depth + 1)),
        _origChildren: definition?.meta?.children,
      }
      obj.meta.childrenResolved.forEach((child, i) => {
        child._childId = child.id || obj.id + '_child_' + i
        child._groupId = obj.id
      })
    }
    return obj
  }
  return { ...data, objects: data.objects.map(item => restore(item)) }
}

export function walkObjects(objects, visit) {
  for (const obj of objects) {
    visit(obj)
    if (obj.type === 'CompositeGroup') walkObjects(obj.meta?.childrenResolved || [], visit)
  }
}
