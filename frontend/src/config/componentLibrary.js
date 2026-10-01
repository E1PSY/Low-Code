import { componentRegistry } from './componentRegistry.js'
/**
 * 分层组件库配置
 * =================
 * 三层体系：基础几何体 → 场景结构组件 → 装饰/设备组件
 *
 * 场景级组件（structure / decor / equipment / indicator）
 * 是多个基础几何体的 CompositeGroup，拖入后自动生成一组子对象。
 *
 * 每个场景级组件的 meta 字段描述其参数化预设：
 *   meta.children: 子组件定义数组，每个包含 type/name/position/rotation/scale/color/…
 *   meta.params:   可调整的参数（宽度/高度/颜色等）
 */

// ================================================================
// 第一层：基础几何体 (primitive) — 保持不变，搭积木的砖块
// ================================================================
const PRIMITIVES = Object.values(componentRegistry).filter(definition => definition.category === 'primitive')

// ================================================================
// 第二层：场景结构组件 (structure)
// 拖入后自动生成一组基础几何体，构成一面墙、一个展台等
// ================================================================

/**
 * CompositeGroup 是一种特殊的"元组件"，拖入时：
 * 1. 前端创建 CompositeGroup 类型的顶层对象（group 本身不渲染 3D）
 * 2. 对象含 meta.children 数组，SceneCanvas 遍历并渲染每一个子对象
 * 3. 选中 group 时右侧面板可调 meta.params
 */
const STRUCTURE_COMPONENTS = [
  // ---- 墙体系统 ----
  {
    type: 'CompositeGroup', name: '直墙', icon: '🧱', category: 'structure',
    description: '可调长度/高度/厚度的直墙',
    meta: {
      params: { width: 6, height: 4, depth: 0.3, color: '#78716c' },
      children: ({ width, height, depth, color }) => [
        { type: 'Box', name: '墙体', position: [0, height / 2, 0], rotation: [0, 0, 0], scale: [width, height, depth], color },
      ],
    },
  },
  {
    type: 'CompositeGroup', name: 'L 形墙角', icon: '🔲', category: 'structure',
    description: '两面垂直相交的墙体',
    meta: {
      params: { width: 4, height: 4, depth: 0.3, color: '#78716c' },
      children: ({ width, height, depth, color }) => [
        { type: 'Box', name: '墙 X', position: [width / 2, height / 2, 0], rotation: [0, 0, 0], scale: [width, height, depth], color },
        { type: 'Box', name: '墙 Z', position: [0, height / 2, width / 2], rotation: [0, 0, 0], scale: [depth, height, width], color },
      ],
    },
  },
  {
    type: 'CompositeGroup', name: '三面墙', icon: '🏠', category: 'structure',
    description: 'U 形三面墙体（带后墙+两侧墙）',
    meta: {
      params: { width: 8, depth: 6, height: 4, wallThick: 0.3, color: '#78716c' },
      children: ({ width, depth, height, wallThick: t, color }) => [
        { type: 'Box', name: '后墙', position: [0, height / 2, -depth / 2], rotation: [0, 0, 0], scale: [width, height, t], color },
        { type: 'Box', name: '左墙', position: [-width / 2, height / 2, 0], rotation: [0, 0, 0], scale: [t, height, depth], color },
        { type: 'Box', name: '右墙', position: [width / 2, height / 2, 0], rotation: [0, 0, 0], scale: [t, height, depth], color },
      ],
    },
  },
  {
    type: 'CompositeGroup', name: '带门洞墙', icon: '🚪', category: 'structure',
    description: '中间带矩形门洞的墙体（由上下左右四块组成）',
    meta: {
      params: { wallW: 6, wallH: 4, wallD: 0.3, doorW: 1.5, doorH: 2.5, doorY: 0.75, color: '#78716c' },
      children: ({ wallW, wallH, wallD, doorW, doorH, doorY, color }) => {
        const hw = wallW / 2; const hh = wallH / 2
        const dw = doorW / 2; const dh = doorH / 2
        const topH = wallH - doorY - doorH
        const topY = doorY + doorH + topH / 2
        const sideW = (wallW - doorW) / 2
        return [
          // 上门楣
          { type: 'Box', name: '门楣', position: [0, topY, 0], rotation: [0, 0, 0], scale: [wallW, topH, wallD], color },
          // 左门垛
          { type: 'Box', name: '左垛', position: [-dw - sideW / 2, doorY + dh, 0], rotation: [0, 0, 0], scale: [sideW, doorH, wallD], color },
          // 右门垛
          { type: 'Box', name: '右垛', position: [dw + sideW / 2, doorY + dh, 0], rotation: [0, 0, 0], scale: [sideW, doorH, wallD], color },
          // 门下墙（从地面到门底）
          { type: 'Box', name: '门下墙', position: [0, doorY / 2, 0], rotation: [0, 0, 0], scale: [wallW, doorY, wallD], color },
        ]
      },
    },
  },

  // ---- 地板/天花板 ----
  {
    type: 'CompositeGroup', name: '地板', icon: '🟫', category: 'structure',
    description: '可调大小的地板平面',
    meta: {
      params: { width: 10, depth: 10, color: '#44403c' },
      children: ({ width, depth, color }) => [
        { type: 'Plane', name: '地板', position: [0, 0, 0], rotation: [-Math.PI / 2, 0, 0], scale: [width / 5, depth / 5, 1], color },
      ],
    },
  },
  {
    type: 'CompositeGroup', name: '天花板', icon: '⬜', category: 'structure',
    description: '可调大小的天花板平面',
    meta: {
      params: { width: 10, depth: 10, height: 5, color: '#a8a29e' },
      children: ({ width, depth, height, color }) => [
        { type: 'Plane', name: '天花板', position: [0, height, 0], rotation: [Math.PI / 2, 0, 0], scale: [width / 5, depth / 5, 1], color },
      ],
    },
  },

  // ---- 展台/展柜 ----
  {
    type: 'CompositeGroup', name: '方形展台', icon: '🪧', category: 'structure',
    description: '底座+台面+可选内嵌灯光',
    meta: {
      params: { w: 1.6, h: 1.2, d: 1.6, baseColor: '#292524', topColor: '#44403c', accentColor: '#d6d3d1', hasLight: false },
      children: ({ w, h, d, baseColor, topColor, accentColor, hasLight }) => {
        const children = [
          { type: 'Box', name: '展台底座', position: [0, h * 0.35, 0], rotation: [0, 0, 0], scale: [w * 0.9, h * 0.75, d * 0.9], color: baseColor },
          { type: 'Box', name: '展台台面', position: [0, h * 0.8, 0], rotation: [0, 0, 0], scale: [w, h * 0.15, d], color: topColor },
          { type: 'Box', name: '展台饰条', position: [0, h * 0.9, 0], rotation: [0, 0, 0], scale: [w * 1.05, h * 0.05, d * 1.05], color: accentColor },
        ]
        if (hasLight) {
          children.push({ type: 'PointLight', name: '展台灯', position: [0, h + 0.1, 0], color: '#fef3c7' })
        }
        return children
      },
    },
  },
  {
    type: 'CompositeGroup', name: '圆柱展台', icon: '🏛️', category: 'structure',
    description: '圆形展台：圆柱底座+台面+中心柱',
    meta: {
      params: { radius: 0.8, h: 1.5, baseColor: '#292524', topColor: '#57534e', accentColor: '#d6d3d1' },
      children: ({ radius, h, baseColor, topColor, accentColor }) => [
        { type: 'Cylinder', name: '展台底座', position: [0, h * 0.15, 0], rotation: [0, 0, 0], scale: [radius, h * 0.3, radius], color: baseColor },
        { type: 'Cylinder', name: '展台柱', position: [0, h * 0.5, 0], rotation: [0, 0, 0], scale: [radius * 0.3, h * 0.4, radius * 0.3], color: accentColor },
        { type: 'Cylinder', name: '展台台面', position: [0, h * 0.8, 0], rotation: [0, 0, 0], scale: [radius, h * 0.1, radius], color: topColor },
      ],
    },
  },
  {
    type: 'CompositeGroup', name: '玻璃展柜', icon: '🪟', category: 'structure',
    description: '透明展柜：底座+玻璃罩+顶盖',
    meta: {
      params: { w: 1.4, h: 2, d: 1.4, baseColor: '#292524', glassColor: '#94a3b8' },
      children: ({ w, h, d, baseColor, glassColor }) => [
        { type: 'Box', name: '展柜底座', position: [0, 0.15, 0], rotation: [0, 0, 0], scale: [w, 0.3, d], color: baseColor },
        { type: 'Box', name: '展柜玻璃', position: [0, h * 0.55, 0], rotation: [0, 0, 0], scale: [w * 0.95, h * 0.55, d * 0.95], color: glassColor, wireframe: true },
        { type: 'Box', name: '展柜顶盖', position: [0, h * 0.95, 0], rotation: [0, 0, 0], scale: [w, 0.1, d], color: baseColor },
      ],
    },
  },

  // ---- 楼梯/坡道 ----
  {
    type: 'CompositeGroup', name: '楼梯（5级）', icon: '🪜', category: 'structure',
    description: '5 级台阶楼梯',
    meta: {
      params: { stepW: 3, stepD: 0.5, stepH: 0.2, color: '#78716c' },
      children: ({ stepW, stepD, stepH, color }) =>
        Array.from({ length: 5 }, (_, i) => ({
          type: 'Box', name: `台阶${i + 1}`,
          position: [0, stepH * (i + 0.5), stepD * i],
          rotation: [0, 0, 0],
          scale: [stepW, stepH, stepD],
          color,
        })),
    },
  },
  {
    type: 'CompositeGroup', name: '坡道', icon: '📐', category: 'structure',
    description: '倾斜坡道平面',
    meta: {
      params: { w: 2, length: 4, rise: 2, color: '#78716c' },
      children: ({ w, length, rise, color }) => [
        { type: 'Box', name: '坡道面', position: [0, rise / 2, length / 2], rotation: [-Math.atan2(rise, length), 0, 0], scale: [w, 0.1, Math.sqrt(length * length + rise * rise)], color },
      ],
    },
  },

  // ---- 栏杆/围栏 ----
  {
    type: 'CompositeGroup', name: '栏杆（4柱）', icon: '🚧', category: 'structure',
    description: '四根立柱+顶部横杆',
    meta: {
      params: { length: 4, h: 1.2, color: '#78716c' },
      children: ({ length, h, color }) => {
        const posts = []
        const half = length / 2
        const step = length / 3
        for (let i = 0; i < 4; i++) {
          const x = -half + step * i
          posts.push({ type: 'Cylinder', name: `栏杆柱${i + 1}`, position: [x, h / 2, 0], rotation: [0, 0, 0], scale: [0.06, h, 0.06], color })
        }
        posts.push({ type: 'Box', name: '栏杆横杆', position: [0, h, 0], rotation: [0, 0, 0], scale: [length, 0.08, 0.08], color })
        return posts
      },
    },
  },
]

// ================================================================
// 第三层：装饰与设备组件 (decor / equipment)
// ================================================================

const DECOR_EQUIPMENT_COMPONENTS = [
  // ---- 管道 ----
  {
    type: 'CompositeGroup', name: '直管道', icon: '🔩', category: 'equipment',
    description: '工业直管道（圆柱体）',
    meta: {
      params: { length: 4, radius: 0.15, color: '#94a3b8' },
      children: ({ length, radius, color }) => [
        { type: 'Cylinder', name: '管道', position: [0, 0, 0], rotation: [0, 0, Math.PI / 2], scale: [radius, length, radius], color },
      ],
    },
  },
  {
    type: 'CompositeGroup', name: 'L 形管道', icon: '🔧', category: 'equipment',
    description: '90° L 形管道弯头',
    meta: {
      params: { leg1: 2, leg2: 2, radius: 0.15, color: '#94a3b8' },
      children: ({ leg1, leg2, radius, color }) => [
        { type: 'Cylinder', name: '水平段', position: [leg1 / 2, 0, 0], rotation: [0, 0, Math.PI / 2], scale: [radius, leg1, radius], color },
        { type: 'Cylinder', name: '垂直段', position: [leg1, leg2 / 2, 0], rotation: [0, 0, 0], scale: [radius, leg2, radius], color },
        // 弯头球
        { type: 'Sphere', name: '弯头', position: [leg1, 0, 0], rotation: [0, 0, 0], scale: [radius * 1.8, radius * 1.8, radius * 1.8], color },
      ],
    },
  },
  {
    type: 'CompositeGroup', name: '法兰盘', icon: '⭕', category: 'equipment',
    description: '管道法兰连接盘',
    meta: {
      params: { radius: 0.5, thickness: 0.08, color: '#64748b' },
      children: ({ radius, thickness, color }) => [
        { type: 'Cylinder', name: '法兰盘体', position: [0, 0, 0], rotation: [0, 0, 0], scale: [radius, thickness, radius], color },
        { type: 'Torus', name: '法兰边', position: [0, 0, 0], rotation: [Math.PI / 2, 0, 0], scale: [radius * 0.95, radius * 0.95, thickness * 2], color },
      ],
    },
  },

  // ---- 储罐/容器 ----
  {
    type: 'CompositeGroup', name: '立式储罐', icon: '🛢️', category: 'equipment',
    description: '圆柱储罐：罐体+顶盖+底脚',
    meta: {
      params: { radius: 1, h: 3, color: '#475569', accentColor: '#64748b' },
      children: ({ radius, h, color, accentColor }) => [
        { type: 'Cylinder', name: '罐体', position: [0, h / 2, 0], rotation: [0, 0, 0], scale: [radius, h, radius], color },
        { type: 'Cylinder', name: '罐顶', position: [0, h, 0], rotation: [0, 0, 0], scale: [radius, 0.15, radius], color: accentColor },
        { type: 'Cylinder', name: '罐底', position: [0, 0.05, 0], rotation: [0, 0, 0], scale: [radius, 0.1, radius], color: accentColor },
        ...Array.from({ length: 4 }, (_, i) => {
          const angle = (i / 4) * Math.PI * 2
          return { type: 'Cylinder', name: `罐脚${i + 1}`, position: [Math.cos(angle) * radius * 0.85, 0.1, Math.sin(angle) * radius * 0.85], rotation: [0, 0, 0], scale: [0.1, 0.2, 0.1], color: '#334155' }
        }),
      ],
    },
  },
  {
    type: 'CompositeGroup', name: '压力容器', icon: '⚗️', category: 'equipment',
    description: '球形压力容器',
    meta: {
      params: { radius: 1.2, color: '#94a3b8', accentColor: '#64748b' },
      children: ({ radius, color, accentColor }) => [
        { type: 'Sphere', name: '球罐', position: [0, radius, 0], rotation: [0, 0, 0], scale: [radius, radius, radius], color },
        { type: 'Cylinder', name: '底座', position: [0, 0.15, 0], rotation: [0, 0, 0], scale: [radius * 0.4, 0.3, radius * 0.4], color: accentColor },
        // 顶部接管
        { type: 'Cylinder', name: '上接管', position: [0, radius * 2, 0], rotation: [0, 0, 0], scale: [0.15, 0.5, 0.15], color: accentColor },
      ],
    },
  },

  // ---- 传送带 ----
  {
    type: 'CompositeGroup', name: '传送带', icon: '〰️', category: 'equipment',
    description: '工业传送带：框架+滚轮+皮带面',
    meta: {
      params: { length: 5, width: 1, height: 1.2, color: '#475569', beltColor: '#1e293b', rollerColor: '#64748b' },
      children: ({ length, width, height, color, beltColor, rollerColor }) => {
        const halfL = length / 2
        return [
          // 框架
          { type: 'Box', name: '框架梁A', position: [0, height, width / 2], rotation: [0, 0, 0], scale: [length, 0.1, 0.08], color },
          { type: 'Box', name: '框架梁B', position: [0, height, -width / 2], rotation: [0, 0, 0], scale: [length, 0.1, 0.08], color },
          // 四根支腿
          { type: 'Cylinder', name: '支腿1', position: [-halfL, height / 2, width / 2], rotation: [0, 0, 0], scale: [0.06, height, 0.06], color },
          { type: 'Cylinder', name: '支腿2', position: [halfL, height / 2, width / 2], rotation: [0, 0, 0], scale: [0.06, height, 0.06], color },
          { type: 'Cylinder', name: '支腿3', position: [-halfL, height / 2, -width / 2], rotation: [0, 0, 0], scale: [0.06, height, 0.06], color },
          { type: 'Cylinder', name: '支腿4', position: [halfL, height / 2, -width / 2], rotation: [0, 0, 0], scale: [0.06, height, 0.06], color },
          // 皮带面
          { type: 'Box', name: '皮带', position: [0, height, 0], rotation: [0, 0, 0], scale: [length * 0.95, 0.04, width * 0.9], color: beltColor },
          // 头尾滚筒
          { type: 'Cylinder', name: '头滚', position: [halfL, height, 0], rotation: [0, 0, Math.PI / 2], scale: [0.15, width, 0.15], color: rollerColor },
          { type: 'Cylinder', name: '尾滚', position: [-halfL, height, 0], rotation: [0, 0, Math.PI / 2], scale: [0.15, width, 0.15], color: rollerColor },
        ]
      },
    },
  },

  // ---- 仪表盘/控制台 ----
  {
    type: 'CompositeGroup', name: '仪表盘', icon: '📊', category: 'indicator',
    description: '圆形仪表盘（平面+外框+指针）',
    meta: {
      params: { radius: 0.8, faceColor: '#f8fafc', frameColor: '#334155', needleColor: '#ef4444' },
      children: ({ radius, faceColor, frameColor, needleColor }) => [
        { type: 'Cylinder', name: '仪表盘面', position: [0, 0, 0], rotation: [0, 0, 0], scale: [radius, 0.03, radius], color: faceColor },
        { type: 'Torus', name: '仪表外框', position: [0, 0.01, 0], rotation: [Math.PI / 2, 0, 0], scale: [radius, radius, 0.05], color: frameColor },
        { type: 'Box', name: '仪表指针', position: [0, 0.03, 0], rotation: [0, 0, 0], scale: [0.04, 0.01, radius * 0.85], color: needleColor },
      ],
    },
  },
  {
    type: 'CompositeGroup', name: '控制台', icon: '🖥️', category: 'equipment',
    description: '工业控制台：台面+屏幕+按钮面板',
    meta: {
      params: { w: 1.8, h: 1.5, d: 1, color: '#334155', screenColor: '#0f172a' },
      children: ({ w, h, d, color, screenColor }) => [
        { type: 'Box', name: '台体', position: [0, h * 0.4, 0], rotation: [0, 0, 0], scale: [w, h * 0.8, d], color },
        { type: 'Box', name: '台面', position: [0, h * 0.85, -d * 0.1], rotation: [0.3, 0, 0], scale: [w * 0.9, 0.06, d * 0.6], color: '#64748b' },
        { type: 'Box', name: '屏幕', position: [0, h * 0.55, -d * 0.38], rotation: [0.1, 0, 0], scale: [w * 0.6, h * 0.4, 0.06], color: screenColor },
        // 按钮
        { type: 'Cylinder', name: '按钮1', position: [-w * 0.2, h * 0.82, -d * 0.05], rotation: [0, 0, 0], scale: [0.05, 0.04, 0.05], color: '#22c55e' },
        { type: 'Cylinder', name: '按钮2', position: [0, h * 0.82, -d * 0.05], rotation: [0, 0, 0], scale: [0.05, 0.04, 0.05], color: '#f59e0b' },
        { type: 'Cylinder', name: '按钮3', position: [w * 0.2, h * 0.82, -d * 0.05], rotation: [0, 0, 0], scale: [0.05, 0.04, 0.05], color: '#ef4444' },
      ],
    },
  },

  // ---- 机械设备 ----
  {
    type: 'CompositeGroup', name: '电机', icon: '⚙️', category: 'equipment',
    description: '工业电机：圆柱机身+端盖+底座',
    meta: {
      params: { radius: 0.5, length: 1.5, color: '#64748b', endColor: '#475569' },
      children: ({ radius, length, color, endColor }) => [
        { type: 'Cylinder', name: '机身', position: [0, 0, 0], rotation: [0, 0, Math.PI / 2], scale: [radius, length, radius], color },
        { type: 'Cylinder', name: '前盖', position: [length / 2, 0, 0], rotation: [0, 0, Math.PI / 2], scale: [radius * 1.05, 0.1, radius * 1.05], color: endColor },
        { type: 'Cylinder', name: '后盖', position: [-length / 2, 0, 0], rotation: [0, 0, Math.PI / 2], scale: [radius * 1.05, 0.1, radius * 1.05], color: endColor },
        { type: 'Box', name: '底座', position: [0, -radius - 0.15, 0], rotation: [0, 0, 0], scale: [length * 0.5, 0.15, radius * 1.6], color: '#334155' },
        // 输出轴
        { type: 'Cylinder', name: '输出轴', position: [length / 2 + 0.15, 0, 0], rotation: [0, 0, Math.PI / 2], scale: [0.06, 0.3, 0.06], color: '#94a3b8' },
      ],
    },
  },
  {
    type: 'CompositeGroup', name: '齿轮组', icon: '⚙️', category: 'equipment',
    description: '两个啮合齿轮',
    meta: {
      params: { r1: 0.5, r2: 0.35, color: '#64748b' },
      children: ({ r1, r2, color }) => [
        { type: 'Cylinder', name: '大齿轮', position: [0, 0, 0], rotation: [Math.PI / 2, 0, 0], scale: [r1, 0.12, r1], color },
        { type: 'Torus', name: '大齿圈', position: [0, 0, 0], rotation: [0, 0, 0], scale: [r1, r1, 0.12], color },
        { type: 'Cylinder', name: '小齿轮', position: [r1 + r2 - 0.05, 0, 0], rotation: [Math.PI / 2, 0, 0], scale: [r2, 0.1, r2], color },
        { type: 'Torus', name: '小齿圈', position: [r1 + r2 - 0.05, 0, 0], rotation: [0, 0, 0], scale: [r2, r2, 0.1], color },
      ],
    },
  },
]

// ================================================================
// 第三层续：装饰组件 (decor)
// ================================================================

const DECOR_COMPONENTS = [
  {
    type: 'CompositeGroup', name: '盆栽绿植', icon: '🌿', category: 'decor',
    description: '装饰盆栽：花盆+球形树冠',
    meta: {
      params: { potH: 0.8, potR: 0.35, crownR: 0.55, potColor: '#78350f', crownColor: '#22c55e' },
      children: ({ potH, potR, crownR, potColor, crownColor }) => [
        { type: 'Cylinder', name: '花盆', position: [0, potH / 2, 0], rotation: [0, 0, 0], scale: [potR, potH, potR], color: potColor },
        { type: 'Cone', name: '盆口', position: [0, potH * 0.95, 0], rotation: [0, 0, 0], scale: [potR * 0.9, 0.2, potR * 0.9], color: '#92400e' },
        { type: 'Cylinder', name: '树干', position: [0, potH + crownR * 0.3, 0], rotation: [0, 0, 0], scale: [0.06, crownR * 0.6, 0.06], color: '#78350f' },
        { type: 'Sphere', name: '树冠', position: [0, potH + crownR * 0.8, 0], rotation: [0, 0, 0], scale: [crownR, crownR * 0.8, crownR], color: crownColor },
      ],
    },
  },
  {
    type: 'CompositeGroup', name: '指示牌', icon: '🪧', category: 'decor',
    description: '立式指示牌：立柱+牌面',
    meta: {
      params: { signW: 1.4, signH: 0.7, poleH: 2.5, color: '#64748b', signColor: '#f8fafc' },
      children: ({ signW, signH, poleH, color, signColor }) => [
        { type: 'Cylinder', name: '立柱', position: [0, poleH / 2, 0], rotation: [0, 0, 0], scale: [0.06, poleH, 0.06], color },
        { type: 'Box', name: '牌面', position: [0, poleH + signH / 2, 0], rotation: [0, 0, 0], scale: [signW, signH, 0.04], color: signColor },
        { type: 'Box', name: '牌面边框', position: [0, poleH + signH / 2, 0.02], rotation: [0, 0, 0], scale: [signW * 1.06, signH * 1.08, 0.03], color },
      ],
    },
  },
  {
    type: 'CompositeGroup', name: '天花板灯带', icon: '💡', category: 'decor',
    description: '长条形天花板灯带',
    meta: {
      params: { length: 6, width: 0.3, height: 3.5, color: '#fef3c7' },
      children: ({ length, width, height, color }) => [
        { type: 'Box', name: '灯带槽', position: [0, height, 0], rotation: [0, 0, 0], scale: [length, 0.06, width], color: '#292524' },
        { type: 'Box', name: '灯带发光面', position: [0, height - 0.02, 0], rotation: [0, 0, 0], scale: [length * 0.9, 0.02, width * 0.6], color },
        { type: 'PointLight', name: '灯带光', position: [0, height - 0.1, 0], color },
      ],
    },
  },
  {
    type: 'CompositeGroup', name: '吊顶装饰', icon: '✨', category: 'decor',
    description: '圆形吊顶装饰盘',
    meta: {
      params: { radius: 1.5, height: 3.8, color: '#d6d3d1' },
      children: ({ radius, height, color }) => [
        { type: 'Cylinder', name: '吊顶盘', position: [0, height, 0], rotation: [0, 0, 0], scale: [radius, 0.08, radius], color },
        { type: 'Torus', name: '吊顶饰环', position: [0, height - 0.05, 0], rotation: [0, 0, 0], scale: [radius * 0.9, radius * 0.9, 0.04], color: '#fbbf24' },
        { type: 'PointLight', name: '吊顶灯', position: [0, height - 0.2, 0], color: '#fef3c7' },
      ],
    },
  },
]

// ================================================================
// 第三层续：设备组件补充 (equipment)
// ================================================================

const MORE_EQUIPMENT_COMPONENTS = [
  {
    type: 'CompositeGroup', name: '机械臂', icon: '🦾', category: 'equipment',
    description: '工业机械臂：基座+转台+大臂+小臂+末端',
    meta: {
      params: { baseH: 0.6, baseR: 0.4, armColor: '#f59e0b', baseColor: '#334155' },
      children: ({ baseH, baseR, armColor, baseColor }) => [
        { type: 'Cylinder', name: '基座', position: [0, baseH / 2, 0], rotation: [0, 0, 0], scale: [baseR * 1.3, baseH, baseR * 1.3], color: baseColor },
        { type: 'Cylinder', name: '转台', position: [0, baseH, 0], rotation: [0, 0, 0], scale: [baseR, 0.2, baseR], color: '#475569' },
        { type: 'Box', name: '大臂', position: [0, baseH + 0.8, 0], rotation: [0, 0, 0.15], scale: [0.15, 1.4, 0.15], color: armColor },
        { type: 'Box', name: '肘关节', position: [0.25, baseH + 1.45, 0], rotation: [0, 0, 0], scale: [0.25, 0.25, 0.25], color: '#475569' },
        { type: 'Box', name: '小臂', position: [0.35, baseH + 2, 0], rotation: [0, 0, -0.5], scale: [0.12, 1.1, 0.12], color: armColor },
        { type: 'Sphere', name: '末端', position: [0.85, baseH + 2.4, 0], rotation: [0, 0, 0], scale: [0.2, 0.2, 0.2], color: '#ef4444' },
        { type: 'Cylinder', name: '末端工具', position: [0.85, baseH + 2.15, 0], rotation: [0, 0, 0], scale: [0.04, 0.4, 0.04], color: '#94a3b8' },
      ],
    },
  },
  {
    type: 'CompositeGroup', name: '阀门手轮', icon: '🎛️', category: 'equipment',
    description: '管道阀门手轮：法兰+阀体+手轮',
    meta: {
      params: { radius: 0.35, color: '#ef4444', pipeColor: '#94a3b8' },
      children: ({ radius, color, pipeColor }) => [
        { type: 'Cylinder', name: '阀体', position: [0, 0, 0], rotation: [0, 0, 0], scale: [radius * 0.7, 0.3, radius * 0.7], color },
        { type: 'Cylinder', name: '上接管', position: [0, 0.3, 0], rotation: [0, 0, 0], scale: [radius * 0.15, 0.5, radius * 0.15], color: pipeColor },
        { type: 'Cylinder', name: '手轮柱', position: [0, 0.6, 0], rotation: [0, 0, 0], scale: [0.04, 0.5, 0.04], color: '#64748b' },
        { type: 'Torus', name: '手轮', position: [0, 0.9, 0], rotation: [0, 0, 0], scale: [radius * 0.6, radius * 0.6, 0.04], color },
        // 手轮辐条
        ...[0, 1, 2, 3].map((i) => {
          const a = (i / 4) * Math.PI * 2
          return { type: 'Cylinder', name: `手轮辐条${i + 1}`, position: [Math.cos(a) * radius * 0.3, 0.9, Math.sin(a) * radius * 0.3], rotation: [0, 0, Math.PI / 2 + a], scale: [radius * 0.03, radius * 0.5, radius * 0.03], color: '#64748b' }
        }),
      ],
    },
  },
  {
    type: 'CompositeGroup', name: '散热器', icon: '🌡️', category: 'equipment',
    description: '工业散热器：散热片阵列',
    meta: {
      params: { w: 0.3, h: 1.5, fins: 8, color: '#94a3b8' },
      children: ({ w, h, fins, color }) => {
        const gap = h / (fins + 1)
        const children = [
          { type: 'Box', name: '散热器底座', position: [0, 0, 0], rotation: [0, 0, 0], scale: [w, 0.08, w * 1.5], color: '#64748b' },
        ]
        for (let i = 0; i < fins; i++) {
          children.push({
            type: 'Box', name: `散热片${i + 1}`,
            position: [0, gap * (i + 1), 0], rotation: [0, 0, 0],
            scale: [w, 0.04, w * 1.4], color,
          })
        }
        return children
      },
    },
  },
]

// ================================================================
// UI 组件（3D 空间中的信息面板、热点标注、导航箭头）
// ================================================================

const UI_COMPONENTS = [
  {
    type: 'CompositeGroup', name: '信息面板', icon: 'ℹ️', category: 'ui',
    description: '3D 空间中的信息展示面板：背板+边框+发光',
    meta: {
      params: { w: 2, h: 1, bgColor: '#0f172a', borderColor: '#3b82f6' },
      children: ({ w, h, bgColor, borderColor }) => [
        { type: 'Box', name: '面板背景', position: [0, 0, 0], rotation: [0, 0, 0], scale: [w, h, 0.04], color: bgColor },
        { type: 'Box', name: '面板边框', position: [0, 0, 0.02], rotation: [0, 0, 0], scale: [w * 1.02, h * 1.02, 0.03], color: borderColor },
      ],
    },
  },
  {
    type: 'CompositeGroup', name: '热点标注', icon: '📍', category: 'ui',
    description: '3D 空间中的可交互热点指示器：底座+光环+标签',
    meta: {
      params: { radius: 0.3, color: '#3b82f6', labelText: '热点' },
      children: ({ radius, color, labelText }) => [
        { type: 'Cylinder', name: '热点底座', position: [0, 0.05, 0], rotation: [0, 0, 0], scale: [radius * 0.5, 0.1, radius * 0.5], color },
        { type: 'Ring', name: '热点光环', position: [0, 0.2, 0], rotation: [0, 0, 0], scale: [radius, radius, 1], color },
        { type: 'Sphere', name: '热点球', position: [0, 0.15, 0], rotation: [0, 0, 0], scale: [radius * 0.3, radius * 0.3, radius * 0.3], color },
      ],
    },
  },
  {
    type: 'CompositeGroup', name: '导航箭头', icon: '➡️', category: 'ui',
    description: '3D 空间中的方向导航箭头',
    meta: {
      params: { length: 1.5, color: '#22c55e' },
      children: ({ length, color }) => [
        { type: 'Cylinder', name: '箭身', position: [0, 0, 0], rotation: [0, 0, Math.PI / 2], scale: [0.06, length * 0.65, 0.06], color },
        { type: 'Cone', name: '箭头', position: [length * 0.4, 0, 0], rotation: [0, 0, -Math.PI / 2], scale: [0.12, length * 0.3, 0.12], color },
      ],
    },
  },
]

// ================================================================
// 现有分类保留
// ================================================================

const DATA_COMPONENTS = Object.values(componentRegistry).filter(definition => definition.category === 'data')

const LIGHT_COMPONENTS = Object.values(componentRegistry).filter(definition => definition.category === 'light')

// ================================================================
// 合并导出
// ================================================================

export const componentLibrary = [
  ...PRIMITIVES,
  ...STRUCTURE_COMPONENTS,
  ...DECOR_EQUIPMENT_COMPONENTS,
  ...MORE_EQUIPMENT_COMPONENTS,
  ...DECOR_COMPONENTS,
  ...UI_COMPONENTS,
  ...DATA_COMPONENTS,
  ...LIGHT_COMPONENTS,
]

// Persist this key independently of the user-editable object name.
for (const component of componentLibrary) {
  if (component.type === 'CompositeGroup') component.componentId = `composite:${component.name}`
}

// 类别展示顺序（左面板从上到下）
export const CATEGORY_ORDER = [
  { key: 'primitive',   label: '基础几何体' },
  { key: 'structure',   label: '🏗️ 场景结构' },
  { key: 'equipment',   label: '🔧 工业设备' },
  { key: 'decor',       label: '🎨 装饰组件' },
  { key: 'indicator',   label: '📊 仪表显示' },
  { key: 'ui',          label: '🖥️ UI 组件' },
  { key: 'data',        label: '数据标签' },
  { key: 'light',       label: '光源' },
]

// ---- 仍保留原有工具函数 ----
export function getIconByType(type) {
  const map = {}
  for (const c of componentLibrary) { map[c.type] = c.icon }
  map.Model = '🏗️'
  map.CompositeGroup = '📦'
  return map[type] || '💠'
}

export function getCategoryByType(type) {
  const map = {}
  for (const c of componentLibrary) { map[c.type] = c.category }
  map.Model = 'import'
  return map[type] || 'unknown'
}

/**
 * 获取 CompositeGroup 的参数化子对象定义
 * @returns {Array|null} 子对象数组，或 null（若非 CompositeGroup）
 */
export function resolveCompositeChildren(meta, overrides = {}) {
  if (!meta || !meta.children) return null
  const params = { ...meta.params, ...overrides }
  return meta.children(params)
}
