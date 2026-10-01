/** Serialized contract; runtime Object3D, functions and object URLs are excluded. */
export type Vec3 = [number, number, number]
export type PrimitiveType = 'Box' | 'Sphere' | 'Cylinder' | 'Cone' | 'Plane' | 'Torus' | 'Ring' | 'Icosahedron' | 'Octahedron' | 'Tetrahedron' | 'Dodecahedron' | 'Lathe'
export type SceneType = PrimitiveType | 'TextSprite' | 'Model' | 'CompositeGroup' | 'DirectionalLight' | 'PointLight' | 'SpotLight' | 'HemisphereLight' | 'Light'
export interface Binding { enabled: boolean; targetProp: 'none' | 'color' | 'scaleX' | 'scaleY' | 'scaleZ' | 'positionY' | 'text'; dataSource: 'none' | 'sine' | 'random' | 'clock' | 'counter'; min: number; max: number; speed: number; format: string }
export interface Interactions {
  autoRotate: { enabled: boolean; axis: 'x' | 'y' | 'z'; speed: number }
  onClick: { enabled: boolean; action: string; targetColor?: string; animationName?: string; moveToPosition?: Vec3; tweenDuration?: number; highlightColor?: string }
  onHover: { enabled: boolean; action: string; highlightColor?: string; scaleMultiplier?: number }
}
export interface SceneObject {
  id: string; type: SceneType; name: string; position: Vec3; rotation: Vec3; scale: Vec3; visible: boolean
  color?: string; text?: string; fontSize?: number; textColor?: string; bgColor?: string; bold?: boolean
  assetId?: string; assetName?: string; url?: string; activeAnimation?: string; animations?: string[]
  interactions?: Interactions; binding?: Binding
  meta?: { componentId: string; params: Record<string, string | number | boolean>; childrenResolved: SceneObject[] }
}
export interface SceneDocument { version: 3; name: string; createdAt: string; objects: SceneObject[]; assets?: Record<string, {name: string; data: string}> }
export type ConversionStatus = 'uploading' | 'queued' | 'running' | 'completed' | 'failed' | 'cancelled'
export interface ConversionJob { id: string; status: ConversionStatus; stage: string; error?: string; result?: { url: string; fileName: string; size: number } }
