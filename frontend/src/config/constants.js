/**
 * 应用级常量定义
 */

export const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || ''
export const API_CONVERT_ENDPOINT = '/api/convert'
export const PANEL_WIDTH = 300

export const SCENE_DEFAULTS = {
  clearColor: '#18181a',
  cameraPosition: [5, 5, 5],
  cameraLookAt: [0, 0, 0],
  ambientLightIntensity: 0.8,
  gridSize: 20,
  gridDivisions: 20,
  gridColorCenter: '#3f3f46',
  gridColorGrid: '#27272a',
}

export { OBJECT_DEFAULTS, TYPES_WITH_COLOR, GEOMETRY_TYPES, COMPOSITE_TYPES, LIGHT_TYPES } from './componentRegistry.js'

export const TRANSFORM_MODES = { TRANSLATE: 'translate', ROTATE: 'rotate', SCALE: 'scale' }
export const KEY_BINDINGS = { TRANSLATE: 'w', ROTATE: 'e', SCALE: 'r' }
export const ALLOWED_UPLOAD_EXTENSIONS = ['.blend', '.zip']

export { TYPE_ICONS } from './componentRegistry.js'
