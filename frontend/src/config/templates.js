/**
 * 预置场景模板
 * =============
 * 每个模板使用 6 大预设类型快速组合场景：
 *   - 场景结构（三面墙 + 地板 + 天花板 + 灯具）
 *   - 展台/展柜（方形展台 + 圆柱展台 + 玻璃展柜）
 *   - 设备组合（储罐 + 电机 + 传送带 + 管道）
 *   - 仪表/控制台
 *   - 装饰（齿轮组 + 栏杆）
 *   - 数据标签（文字精灵 + 数据绑定）
 *
 * 每个模板的 generate() 返回预配置的场景对象数组，
 * 由 sceneStore.loadTemplate() 加载。
 */

function freshId() { return 'tpl_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8) }
function mod(arr, idx, val) { const c = [...arr]; c[idx] = val; return c }

// ============================================================
//  模板1：虚拟展厅
// ============================================================
export const EXHIBITION_HALL = {
  name: '虚拟展厅',
  icon: '🏛️',
  description: '完整展厅布局：三面墙 + 地板 + 天花板 + 4 展台 + 专业灯光',
  preview: 'hall',
  objectCount: 28,
  generate() {
    return [
      // === 建筑结构 ===
      // 地板
      { id: freshId(), type: 'Plane', name: '展厅地板', position: [0, 0, 0], rotation: [-Math.PI / 2, 0, 0], scale: [2.4, 2, 1], color: '#44403c' },
      // 天花板
      { id: freshId(), type: 'Plane', name: '展厅天花板', position: [0, 5, 0], rotation: [Math.PI / 2, 0, 0], scale: [2.4, 2, 1], color: '#a8a29e' },
      // 后墙
      { id: freshId(), type: 'Box', name: '展厅后墙', position: [0, 2.5, -5], rotation: [0, 0, 0], scale: [12, 5, 0.3], color: '#78716c' },
      // 左墙
      { id: freshId(), type: 'Box', name: '展厅左墙', position: [-6, 2.5, 0], rotation: [0, 0, 0], scale: [0.3, 5, 10], color: '#78716c' },
      // 右墙
      { id: freshId(), type: 'Box', name: '展厅右墙', position: [6, 2.5, 0], rotation: [0, 0, 0], scale: [0.3, 5, 10], color: '#78716c' },

      // === 展台系统 ===
      // 左前展台（方形）
      { id: freshId(), type: 'Box', name: '展台底座A', position: [-3.5, 0.35, 3], rotation: [0, 0, 0], scale: [2, 0.7, 2], color: '#292524' },
      { id: freshId(), type: 'Box', name: '展台台面A', position: [-3.5, 0.8, 3], rotation: [0, 0, 0], scale: [2.2, 0.1, 2.2], color: '#57534e' },
      { id: freshId(), type: 'Box', name: '展台饰条A', position: [-3.5, 0.9, 3], rotation: [0, 0, 0], scale: [2.3, 0.04, 2.3], color: '#d6d3d1' },
      // 右前展台（圆柱）
      { id: freshId(), type: 'Cylinder', name: '展台底座B', position: [3.5, 0.2, 2.5], rotation: [0, 0, 0], scale: [1, 0.4, 1], color: '#292524' },
      { id: freshId(), type: 'Cylinder', name: '展台柱B', position: [3.5, 0.7, 2.5], rotation: [0, 0, 0], scale: [0.3, 0.6, 0.3], color: '#d6d3d1' },
      { id: freshId(), type: 'Cylinder', name: '展台台面B', position: [3.5, 1.05, 2.5], rotation: [0, 0, 0], scale: [1, 0.1, 1], color: '#57534e' },
      // 中央主展台（大型方形）
      { id: freshId(), type: 'Box', name: '中央展台底座', position: [0, 0.6, 0], rotation: [0, 0, 0], scale: [3, 1.2, 3], color: '#292524' },
      { id: freshId(), type: 'Box', name: '中央展台顶', position: [0, 1.3, 0], rotation: [0, 0, 0], scale: [3.3, 0.12, 3.3], color: '#44403c' },
      // 后墙展台（玻璃展柜风格）
      { id: freshId(), type: 'Box', name: '后展台底座', position: [0, 0.2, -3], rotation: [0, 0, 0], scale: [3, 0.4, 1.5], color: '#292524' },
      { id: freshId(), type: 'Box', name: '后展台玻璃左', position: [-1, 1.2, -3], rotation: [0, 0, 0], scale: [0.06, 1.5, 1.3], color: '#94a3b8' },
      { id: freshId(), type: 'Box', name: '后展台玻璃右', position: [1, 1.2, -3], rotation: [0, 0, 0], scale: [0.06, 1.5, 1.3], color: '#94a3b8' },
      { id: freshId(), type: 'Box', name: '后展台顶', position: [0, 1.95, -3], rotation: [0, 0, 0], scale: [3, 0.08, 1.5], color: '#292524' },

      // === 展品 ===
      { id: freshId(), type: 'Dodecahedron', name: '中央展品', position: [0, 1.85, 0], rotation: [0, 0, 0], scale: [0.6, 0.6, 0.6], color: '#f59e0b',
        interactions: { onClick: { enabled: true, action: 'bounce', highlightColor: '#ffff00', animationName: '', moveToPosition: [0,1,0], targetColor: '#ff0000', tweenDuration: 1000 }, onHover: { enabled: true, action: 'scaleUp', highlightColor: '#00ff88', scaleMultiplier: 1.2 }, autoRotate: { enabled: true, speed: 0.8, axis: 'y' } } },
      { id: freshId(), type: 'Icosahedron', name: '展品装饰A', position: [-3.5, 1.3, 3], rotation: [0, 0, 0], scale: [0.35, 0.35, 0.35], color: '#8b5cf6',
        interactions: { onClick: { enabled: true, action: 'highlight', highlightColor: '#ffff00', animationName: '', moveToPosition: [0,1,0], targetColor: '#ff0000', tweenDuration: 1000 }, onHover: { enabled: false, action: 'none', highlightColor: '#00ff88', scaleMultiplier: 1.15 }, autoRotate: { enabled: false, speed: 1, axis: 'y' } } },
      { id: freshId(), type: 'Torus', name: '展品装饰B', position: [3.5, 1.5, 2.5], rotation: [Math.PI * 0.5, 0, 0], scale: [0.45, 0.45, 0.45], color: '#fbbf24',
        interactions: { onClick: { enabled: true, action: 'highlight', highlightColor: '#ffff00', animationName: '', moveToPosition: [0,1,0], targetColor: '#ff0000', tweenDuration: 1000 }, onHover: { enabled: true, action: 'scaleUp', highlightColor: '#00ff88', scaleMultiplier: 1.15 }, autoRotate: { enabled: false, speed: 1, axis: 'y' } } },

      // === 标签系统 ===
      { id: freshId(), type: 'TextSprite', name: '展厅标题', text: 'Virtual Exhibition Hall', fontSize: 48, textColor: '#ffffff', bgColor: 'transparent', bold: true, position: [0, 4.3, -4.8], scale: [10, 0.8, 1] },
      { id: freshId(), type: 'TextSprite', name: '展区标识A', text: 'ZONE A', fontSize: 36, textColor: '#a78bfa', bgColor: 'transparent', bold: true, position: [-3.5, 1.6, 3.8], scale: [2.5, 0.5, 1] },
      { id: freshId(), type: 'TextSprite', name: '展区标识B', text: 'ZONE B', fontSize: 36, textColor: '#fbbf24', bgColor: 'transparent', bold: true, position: [3.5, 1.6, 3.3], scale: [2.5, 0.5, 1] },

      // === 专业灯光 ===
      { id: freshId(), type: 'DirectionalLight', name: '环境主光', position: [0, 6, 0], color: '#fef3c7' },
      { id: freshId(), type: 'PointLight', name: '展台灯A', position: [-3.5, 2.5, 3], color: '#fef3c7' },
      { id: freshId(), type: 'PointLight', name: '展台灯B', position: [3.5, 2.5, 2.5], color: '#fef3c7' },
      { id: freshId(), type: 'PointLight', name: '中央展台灯', position: [0, 3, 0], color: '#fef9c3' },
      { id: freshId(), type: 'PointLight', name: '后展台灯', position: [0, 2.8, -3], color: '#dbeafe' },
      { id: freshId(), type: 'SpotLight', name: '中央射灯', position: [0, 4.8, -2], rotation: mod([0, 0, 0], 0, -0.7), color: '#ffffff' },
    ]
  },
}

// ============================================================
//  模板2：工业仿真数据看板
// ============================================================
export const INDUSTRIAL_DASHBOARD = {
  name: '工业仿真看板',
  icon: '🏭',
  description: '数据看板 + 储罐 + 管道 + 传送带 + 控制台',
  preview: 'factory',
  objectCount: 45,
  generate() {
    return [
      // === 基台 ===
      { id: freshId(), type: 'Box', name: '工厂地面', position: [0, -0.1, 0], rotation: [0, 0, 0], scale: [10, 0.2, 10], color: '#292524' },

      // === 储罐区（右侧） ===
      { id: freshId(), type: 'Cylinder', name: '储罐A罐体', position: [3, 1.5, -2], rotation: [0, 0, 0], scale: [1.2, 3, 1.2], color: '#475569' },
      { id: freshId(), type: 'Cylinder', name: '储罐A顶', position: [3, 3.05, -2], rotation: [0, 0, 0], scale: [1.2, 0.15, 1.2], color: '#64748b' },
      { id: freshId(), type: 'Cylinder', name: '储罐A底', position: [3, 0.1, -2], rotation: [0, 0, 0], scale: [1.2, 0.1, 1.2], color: '#64748b' },
      // 储罐B（较小）
      { id: freshId(), type: 'Cylinder', name: '储罐B罐体', position: [4.5, 1, -2.5], rotation: [0, 0, 0], scale: [0.7, 2, 0.7], color: '#334155' },
      { id: freshId(), type: 'Cylinder', name: '储罐B顶', position: [4.5, 2.05, -2.5], rotation: [0, 0, 0], scale: [0.7, 0.1, 0.7], color: '#64748b' },

      // === 管道系统 ===
      { id: freshId(), type: 'Cylinder', name: '水平管道A', position: [2, 1.8, -2], rotation: [0, 0, Math.PI / 2], scale: [0.12, 2.5, 0.12], color: '#94a3b8' },
      { id: freshId(), type: 'Cylinder', name: '水平管道B', position: [0.75, 1.5, -2], rotation: [0, 0, Math.PI / 2], scale: [0.1, 4, 0.1], color: '#94a3b8' },
      { id: freshId(), type: 'Cylinder', name: '垂直管道', position: [-1.5, 1, -2], rotation: [0, 0, 0], scale: [0.12, 2, 0.12], color: '#94a3b8' },
      { id: freshId(), type: 'Sphere', name: '管道弯头', position: [-1.5, 1.5, -2], rotation: [0, 0, 0], scale: [0.2, 0.2, 0.2], color: '#64748b' },

      // === 传送带（左侧） ===
      { id: freshId(), type: 'Box', name: '传送带框架A', position: [-3, 1, 1], rotation: [0, 0, 0], scale: [5, 0.1, 0.1], color: '#334155' },
      { id: freshId(), type: 'Box', name: '传送带框架B', position: [-3, 1, -0.5], rotation: [0, 0, 0], scale: [5, 0.1, 0.1], color: '#334155' },
      { id: freshId(), type: 'Cylinder', name: '支腿1', position: [-5, 0.5, 1], rotation: [0, 0, 0], scale: [0.06, 1, 0.06], color: '#475569' },
      { id: freshId(), type: 'Cylinder', name: '支腿2', position: [-1, 0.5, 1], rotation: [0, 0, 0], scale: [0.06, 1, 0.06], color: '#475569' },
      { id: freshId(), type: 'Cylinder', name: '支腿3', position: [-5, 0.5, -0.5], rotation: [0, 0, 0], scale: [0.06, 1, 0.06], color: '#475569' },
      { id: freshId(), type: 'Cylinder', name: '支腿4', position: [-1, 0.5, -0.5], rotation: [0, 0, 0], scale: [0.06, 1, 0.06], color: '#475569' },
      { id: freshId(), type: 'Box', name: '传送皮带', position: [-3, 1.03, 0.25], rotation: [0, 0, 0], scale: [4.8, 0.04, 0.6], color: '#1e293b' },
      { id: freshId(), type: 'Cylinder', name: '头滚', position: [-0.8, 1, 0.25], rotation: [0, 0, Math.PI / 2], scale: [0.12, 0.65, 0.12], color: '#64748b' },
      { id: freshId(), type: 'Cylinder', name: '尾滚', position: [-5.2, 1, 0.25], rotation: [0, 0, Math.PI / 2], scale: [0.12, 0.65, 0.12], color: '#64748b' },

      // === 电机 ===
      { id: freshId(), type: 'Cylinder', name: '电机机身', position: [-5.8, 1, 0.25], rotation: [0, 0, Math.PI / 2], scale: [0.3, 0.8, 0.3], color: '#64748b' },

      // === 控制台（前景中央） ===
      { id: freshId(), type: 'Box', name: '控制台体', position: [0.5, 0.6, 3.5], rotation: [0, 0, 0], scale: [2.5, 1.2, 1.2], color: '#334155' },
      { id: freshId(), type: 'Box', name: '控制台面', position: [0.5, 1.25, 3.2], rotation: [0.25, 0, 0], scale: [2.2, 0.06, 0.8], color: '#64748b' },
      { id: freshId(), type: 'Box', name: '显示屏', position: [0.5, 0.85, 2.9], rotation: [0.1, 0, 0], scale: [1.5, 0.7, 0.06], color: '#0f172a' },
      // 按钮
      { id: freshId(), type: 'Cylinder', name: '按钮1', position: [0, 1.2, 3.3], rotation: [0, 0, 0], scale: [0.05, 0.04, 0.05], color: '#22c55e' },
      { id: freshId(), type: 'Cylinder', name: '按钮2', position: [0.5, 1.2, 3.3], rotation: [0, 0, 0], scale: [0.05, 0.04, 0.05], color: '#f59e0b' },
      { id: freshId(), type: 'Cylinder', name: '按钮3', position: [1, 1.2, 3.3], rotation: [0, 0, 0], scale: [0.05, 0.04, 0.05], color: '#ef4444' },

      // === 仪表系统 ===
      { id: freshId(), type: 'Cylinder', name: '仪表A盘面', position: [-0.5, 1.2, -3.5], rotation: [0, 0, 0], scale: [0.6, 0.03, 0.6], color: '#f8fafc' },
      { id: freshId(), type: 'Torus', name: '仪表A外框', position: [-0.5, 1.2, -3.5], rotation: [Math.PI / 2, 0, 0], scale: [0.58, 0.58, 0.06], color: '#334155' },
      { id: freshId(), type: 'Box', name: '仪表A指针', position: [-0.5, 1.22, -3.5], rotation: [0, 0, 0], scale: [0.03, 0.01, 0.5], color: '#ef4444',
        binding: { enabled: true, targetProp: 'scaleZ', dataSource: 'sine', min: 0.1, max: 0.5, speed: 0.8, format: '{value}' } },
      { id: freshId(), type: 'Cylinder', name: '仪表B盘面', position: [0.8, 0.8, -3.5], rotation: [0, 0, 0], scale: [0.45, 0.03, 0.45], color: '#f8fafc' },
      { id: freshId(), type: 'Torus', name: '仪表B外框', position: [0.8, 0.8, -3.5], rotation: [Math.PI / 2, 0, 0], scale: [0.43, 0.43, 0.06], color: '#334155' },
      { id: freshId(), type: 'Box', name: '仪表B指针', position: [0.8, 0.82, -3.5], rotation: [0, 0, 0], scale: [0.03, 0.01, 0.35], color: '#22c55e',
        binding: { enabled: true, targetProp: 'scaleZ', dataSource: 'random', min: 0.05, max: 0.4, speed: 1.5, format: '{value}' } },

      // === 数据标签（实时绑定） ===
      { id: freshId(), type: 'TextSprite', name: '温度', text: '22.5°C', fontSize: 44, textColor: '#f87171', bgColor: 'transparent', bold: true, position: [-0.5, 2, -3.5], scale: [3.5, 0.7, 1],
        binding: { enabled: true, targetProp: 'text', dataSource: 'sine', min: 20, max: 35, speed: 0.5, format: '温度: {value}°C' } },
      { id: freshId(), type: 'TextSprite', name: '压力', text: '101 kPa', fontSize: 44, textColor: '#60a5fa', bgColor: 'transparent', bold: true, position: [0.8, 1.5, -3.5], scale: [3.5, 0.7, 1],
        binding: { enabled: true, targetProp: 'text', dataSource: 'random', min: 95, max: 105, speed: 1, format: '压力: {value} kPa' } },
      { id: freshId(), type: 'TextSprite', name: '转速', text: '1500 rpm', fontSize: 40, textColor: '#34d399', bgColor: 'transparent', bold: true, position: [-2.5, 1.8, -2.5], scale: [3, 0.65, 1],
        binding: { enabled: true, targetProp: 'text', dataSource: 'sine', min: 1200, max: 1800, speed: 1.5, format: '转速: {value} rpm' } },
      { id: freshId(), type: 'TextSprite', name: '时钟', text: '00:00:00', fontSize: 36, textColor: '#facc15', bgColor: 'transparent', bold: true, position: [0.5, 0.4, 3.8], scale: [3.5, 0.65, 1],
        binding: { enabled: true, targetProp: 'text', dataSource: 'clock', min: 0, max: 1, speed: 1, format: '{value}' } },
      // 看板标题
      { id: freshId(), type: 'TextSprite', name: '看板主标题', text: '工业仿真监控系统', fontSize: 64, textColor: '#ffffff', bgColor: 'transparent', bold: true, position: [-3, 3.8, -3.5], scale: [8, 1.1, 1] },
      { id: freshId(), type: 'TextSprite', name: '状态标签', text: '● 系统运行中', fontSize: 32, textColor: '#22c55e', bgColor: 'transparent', bold: false, position: [-3, 3.2, -3.5], scale: [3.5, 0.55, 1] },

      // === 状态指示灯 ===
      { id: freshId(), type: 'Sphere', name: '状态指示灯', position: [0.5, 1.85, 3], rotation: [0, 0, 0], scale: [0.2, 0.2, 0.2], color: '#ef4444',
        binding: { enabled: true, targetProp: 'color', dataSource: 'sine', min: 0, max: 1, speed: 0.6, format: '{value}' },
        interactions: { onClick: { enabled: true, action: 'bounce', highlightColor: '#ffff00', animationName: '', moveToPosition: [0,1,0], targetColor: '#ff0000', tweenDuration: 1000 }, onHover: { enabled: false, action: 'none', highlightColor: '#00ff88', scaleMultiplier: 1.15 }, autoRotate: { enabled: false, speed: 1, axis: 'y' } } },

      // === 灯光 ===
      { id: freshId(), type: 'DirectionalLight', name: '主光', position: [0, 6, 2], color: '#ffffff' },
      { id: freshId(), type: 'PointLight', name: '储罐区补光', position: [3.5, 3, -2], color: '#dbeafe' },
      { id: freshId(), type: 'PointLight', name: '传送带补光', position: [-3, 2, 1], color: '#fef3c7' },
      { id: freshId(), type: 'SpotLight', name: '控制台聚焦', position: [0.5, 3, 4.5], rotation: mod([0, 0, 0], 0, -2.4), color: '#ffffff' },
      { id: freshId(), type: 'SpotLight', name: '仪表聚焦', position: [0, 3, -4.5], rotation: mod([0, 0, 0], 0, -0.7), color: '#ffffff' },
    ]
  },
}

// ============================================================
//  模板3：产品展示台
// ============================================================
export const PRODUCT_SHOWCASE = {
  name: '产品展示台',
  icon: '💍',
  description: '360°旋转展台 + 四点环绕照明 + 铭牌',
  preview: 'showcase',
  objectCount: 18,
  generate() {
    return [
      // === 圆形底座系统 ===
      { id: freshId(), type: 'Cylinder', name: '底座', position: [0, 0.15, 0], rotation: [0, 0, 0], scale: [2.5, 0.3, 2.5], color: '#292524' },
      { id: freshId(), type: 'Cylinder', name: '底座饰环', position: [0, 0.3, 0], rotation: [0, 0, 0], scale: [2.6, 0.04, 2.6], color: '#d6d3d1' },
      { id: freshId(), type: 'Cylinder', name: '展柱', position: [0, 0.9, 0], rotation: [0, 0, 0], scale: [0.5, 1.1, 0.5], color: '#57534e' },
      { id: freshId(), type: 'Cylinder', name: '台面', position: [0, 1.5, 0], rotation: [0, 0, 0], scale: [1.5, 0.12, 1.5], color: '#44403c' },

      // === 展品 ===
      { id: freshId(), type: 'Dodecahedron', name: '主展品', position: [0, 2.1, 0], rotation: [0, 0, 0], scale: [0.55, 0.55, 0.55], color: '#ec4899',
        interactions: { onClick: { enabled: true, action: 'bounce', highlightColor: '#ffff00', animationName: '', moveToPosition: [0,1,0], targetColor: '#ff0000', tweenDuration: 1000 }, onHover: { enabled: true, action: 'scaleUp', highlightColor: '#00ff88', scaleMultiplier: 1.2 }, autoRotate: { enabled: true, speed: 1.2, axis: 'y' } } },

      // === 环绕装饰 ===
      { id: freshId(), type: 'Torus', name: '大光环', position: [0, 2.1, 0], rotation: mod([0, 0, 0], 1, Math.PI * 0.5), scale: [1.1, 1.1, 1.1], color: '#fbbf24',
        interactions: { onClick: { enabled: false, action: 'none', highlightColor: '#ffff00', animationName: '', moveToPosition: [0,1,0], targetColor: '#ff0000', tweenDuration: 1000 }, onHover: { enabled: false, action: 'none', highlightColor: '#00ff88', scaleMultiplier: 1.15 }, autoRotate: { enabled: true, speed: 1.8, axis: 'z' } } },
      { id: freshId(), type: 'Torus', name: '小光环', position: [0, 2.1, 0], rotation: mod([0, 0, 0], 0, Math.PI * 0.3), scale: [1.3, 1.3, 1.3], color: '#a78bfa',
        interactions: { onClick: { enabled: false, action: 'none', highlightColor: '#ffff00', animationName: '', moveToPosition: [0,1,0], targetColor: '#ff0000', tweenDuration: 1000 }, onHover: { enabled: false, action: 'none', highlightColor: '#00ff88', scaleMultiplier: 1.15 }, autoRotate: { enabled: true, speed: 1, axis: 'x' } } },

      // === 地面光晕 ===
      { id: freshId(), type: 'Ring', name: '地面光晕', position: [0, 0.02, 0], rotation: mod([0, 0, 0], 0, -Math.PI * 0.5), scale: [2.5, 2.5, 1], color: '#fbbf24' },

      // === 铭牌 ===
      { id: freshId(), type: 'TextSprite', name: '产品名称', text: 'PREMIUM X', fontSize: 56, textColor: '#ffffff', bgColor: 'transparent', bold: true, position: [0, 2.7, 1.2], scale: [5, 0.8, 1] },
      { id: freshId(), type: 'TextSprite', name: '产品副标题', text: 'Limited Edition', fontSize: 32, textColor: '#d6d3d1', bgColor: 'transparent', bold: false, position: [0, 2.35, 1.3], scale: [3.5, 0.5, 1] },

      // === 装饰柱（四个角） ===
      ...[0, 1, 2, 3].map((i) => {
        const angle = (i / 4) * Math.PI * 2 - Math.PI / 4
        const r = 2
        return { id: freshId(), type: 'Cylinder', name: `装饰柱${i + 1}`, position: [Math.cos(angle) * r, 0.6, Math.sin(angle) * r], rotation: [0, 0, 0], scale: [0.08, 1.2, 0.08], color: '#d6d3d1' }
      }),

      // === 四点环绕灯光 ===
      { id: freshId(), type: 'SpotLight', name: '射灯A', position: [-2.5, 4, 2.5], rotation: mod([0, 0, 0], 0, -0.7), color: '#fef3c7' },
      { id: freshId(), type: 'SpotLight', name: '射灯B', position: [2.5, 4, -2.5], rotation: mod([0, 0, 0], 0, -2.4), color: '#dbeafe' },
      { id: freshId(), type: 'SpotLight', name: '射灯C', position: [2.5, 4, 2.5], rotation: mod([0, 0, 0], 0, -0.9), color: '#ffffff' },
      { id: freshId(), type: 'SpotLight', name: '射灯D', position: [-2.5, 4, -2.5], rotation: mod([0, 0, 0], 0, -3.5), color: '#fce7f3' },
      { id: freshId(), type: 'DirectionalLight', name: '环境光', position: [0, 5, 0], color: '#ffffff' },
    ]
  },
}

// ============================================================
//  模板4：空场景
// ============================================================
export const EMPTY_SCENE = {
  name: '空白场景',
  icon: '📄',
  description: '从头开始搭建',
  preview: 'blank',
  objectCount: 0,
  generate() { return [] },
}

// ============================================================
//  模板5：管道车间（新增）
// ============================================================
export const PIPE_WORKSHOP = {
  name: '管道车间',
  icon: '🔩',
  description: 'L 形管道 + 法兰 + 阀门 + 储罐的管道车间场景',
  preview: 'pipes',
  objectCount: 22,
  generate() {
    return [
      // 地板
      { id: freshId(), type: 'Plane', name: '车间地面', position: [0, 0, 0], rotation: [-Math.PI / 2, 0, 0], scale: [2, 1.4, 1], color: '#44403c' },
      // 储罐
      { id: freshId(), type: 'Cylinder', name: '主储罐罐体', position: [0, 2, -2.5], rotation: [0, 0, 0], scale: [1.5, 4, 1.5], color: '#475569' },
      { id: freshId(), type: 'Cylinder', name: '主储罐顶', position: [0, 4.05, -2.5], rotation: [0, 0, 0], scale: [1.5, 0.2, 1.5], color: '#64748b' },
      // 水平主管道
      { id: freshId(), type: 'Cylinder', name: '主管道A', position: [0, 2, -0.8], rotation: [0, 0, Math.PI / 2], scale: [0.2, 5, 0.2], color: '#94a3b8' },
      { id: freshId(), type: 'Cylinder', name: '主管道B', position: [1.5, 2, -0.8], rotation: [Math.PI / 2, 0, 0], scale: [0.15, 2.5, 0.15], color: '#94a3b8' },
      // 法兰
      { id: freshId(), type: 'Cylinder', name: '法兰A', position: [-2.5, 2, -0.8], rotation: [0, 0, 0], scale: [0.35, 0.06, 0.35], color: '#64748b' },
      { id: freshId(), type: 'Torus', name: '法兰A边', position: [-2.5, 2, -0.8], rotation: [Math.PI / 2, 0, 0], scale: [0.3, 0.3, 0.08], color: '#334155' },
      { id: freshId(), type: 'Cylinder', name: '法兰B', position: [1.5, 2, -3.3], rotation: [0, 0, 0], scale: [0.3, 0.06, 0.3], color: '#64748b' },
      // 弯头
      { id: freshId(), type: 'Sphere', name: '弯头A', position: [-1.5, 2, -0.8], rotation: [0, 0, 0], scale: [0.25, 0.25, 0.25], color: '#64748b' },
      { id: freshId(), type: 'Sphere', name: '弯头B', position: [0, 2, -2.5], rotation: [0, 0, 0], scale: [0.25, 0.25, 0.25], color: '#64748b' },
      // 支架
      ...[0, 1, 2, 3].map((i) => {
        const x = -2 + i * 1.5
        return { id: freshId(), type: 'Cylinder', name: `支架${i + 1}`, position: [x, 1.5, -0.8], rotation: [0, 0, 0], scale: [0.06, 0.8, 0.06], color: '#334155' }
      }),

      // 标签
      { id: freshId(), type: 'TextSprite', name: '管道标签', text: '主蒸汽管线', fontSize: 40, textColor: '#94a3b8', bgColor: 'transparent', bold: true, position: [0, 2.6, -0.8], scale: [4, 0.6, 1] },

      // 灯光
      { id: freshId(), type: 'DirectionalLight', name: '主光', position: [3, 6, 3], color: '#ffffff' },
      { id: freshId(), type: 'PointLight', name: '罐区补光', position: [0, 3, -2.5], color: '#dbeafe' },
      { id: freshId(), type: 'SpotLight', name: '管道聚焦', position: [-2, 5, 2], rotation: mod([0, 0, 0], 0, -1), color: '#ffffff' },
    ]
  },
}

// ============================================================
//  模板6：控制室（新增）
// ============================================================
export const CONTROL_ROOM = {
  name: '控制室',
  icon: '🖥️',
  description: '三面墙控制室 + 操作台阵列 + 大屏 + 仪表墙',
  preview: 'control',
  objectCount: 34,
  generate() {
    return [
      // 地板
      { id: freshId(), type: 'Plane', name: '控制室地面', position: [0, 0, 0], rotation: [-Math.PI / 2, 0, 0], scale: [1.6, 1.6, 1], color: '#292524' },
      // 三面墙
      { id: freshId(), type: 'Box', name: '后墙', position: [0, 2, -4], rotation: [0, 0, 0], scale: [8, 4, 0.3], color: '#57534e' },
      { id: freshId(), type: 'Box', name: '左墙', position: [-4, 2, 0], rotation: [0, 0, 0], scale: [0.3, 4, 8], color: '#57534e' },
      { id: freshId(), type: 'Box', name: '右墙', position: [4, 2, 0], rotation: [0, 0, 0], scale: [0.3, 4, 8], color: '#57534e' },

      // 大屏（后墙）
      { id: freshId(), type: 'Box', name: '主显示屏', position: [0, 2.5, -3.8], rotation: [0, 0, 0], scale: [6, 2, 0.06], color: '#0f172a' },
      { id: freshId(), type: 'Box', name: '屏边框', position: [0, 2.5, -3.78], rotation: [0, 0, 0], scale: [6.2, 2.2, 0.04], color: '#334155' },

      // 操作台阵列（3 台）
      ...[0, 1, 2].map((i) => {
        const x = -2.2 + i * 2.2
        return [
          { id: freshId(), type: 'Box', name: `操作台${i + 1}体`, position: [x, 0.5, 2], rotation: [0, 0, 0], scale: [1.8, 1, 1], color: '#334155' },
          { id: freshId(), type: 'Box', name: `操作台${i + 1}面`, position: [x, 1.05, 1.7], rotation: [0.25, 0, 0], scale: [1.6, 0.06, 0.7], color: '#64748b' },
          { id: freshId(), type: 'Box', name: `屏幕${i + 1}`, position: [x, 0.7, 1.45], rotation: [0.1, 0, 0], scale: [1.2, 0.5, 0.06], color: '#0f172a' },
        ]
      }).flat(),

      // 仪表墙（右墙）
      { id: freshId(), type: 'Cylinder', name: '墙仪表1', position: [3.8, 1.2, -2], rotation: [0, 0, 0], scale: [0.45, 0.03, 0.45], color: '#f8fafc' },
      { id: freshId(), type: 'Torus', name: '墙仪表1框', position: [3.8, 1.2, -2], rotation: [Math.PI / 2, 0, 0], scale: [0.43, 0.43, 0.06], color: '#334155' },
      { id: freshId(), type: 'Cylinder', name: '墙仪表2', position: [3.8, 1.2, 0], rotation: [0, 0, 0], scale: [0.45, 0.03, 0.45], color: '#f8fafc' },
      { id: freshId(), type: 'Torus', name: '墙仪表2框', position: [3.8, 1.2, 0], rotation: [Math.PI / 2, 0, 0], scale: [0.43, 0.43, 0.06], color: '#334155' },
      { id: freshId(), type: 'Cylinder', name: '墙仪表3', position: [3.8, 1.2, 2], rotation: [0, 0, 0], scale: [0.45, 0.03, 0.45], color: '#f8fafc' },
      { id: freshId(), type: 'Torus', name: '墙仪表3框', position: [3.8, 1.2, 2], rotation: [Math.PI / 2, 0, 0], scale: [0.43, 0.43, 0.06], color: '#334155' },

      // 标签
      { id: freshId(), type: 'TextSprite', name: '控制室标题', text: '中央控制室', fontSize: 56, textColor: '#ffffff', bgColor: 'transparent', bold: true, position: [0, 3.6, -3.7], scale: [6, 0.9, 1] },

      // 灯光
      { id: freshId(), type: 'DirectionalLight', name: '环境光', position: [0, 5, 0], color: '#f8fafc' },
      { id: freshId(), type: 'PointLight', name: '屏背光', position: [0, 3, -4], color: '#dbeafe' },
      { id: freshId(), type: 'SpotLight', name: '操作台光', position: [0, 3, 4], rotation: mod([0, 0, 0], 0, -2.4), color: '#ffffff' },
    ]
  },
}

// ============================================================
// 所有模板列表
// ============================================================
export const TEMPLATES = [
  EXHIBITION_HALL,
  INDUSTRIAL_DASHBOARD,
  PRODUCT_SHOWCASE,
  PIPE_WORKSHOP,
  CONTROL_ROOM,
  EMPTY_SCENE,
]
