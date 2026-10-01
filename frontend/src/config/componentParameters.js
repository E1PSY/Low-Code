export function formatLabel(key) {
  const labels = {
    w: '宽度', d: '深度', h: '高度', width: '宽度', depth: '深度', height: '高度',
    wallW: '墙宽', wallH: '墙高', wallD: '墙厚', wallThick: '墙厚',
    doorW: '门宽', doorH: '门高', doorY: '门底高',
    radius: '半径', r1: '大轮半径', r2: '小轮半径',
    length: '长度', rise: '升程', stepW: '台阶宽', stepD: '台阶深', stepH: '台阶高',
    leg1: '水平段', leg2: '垂直段',
    potR: '盆半径', potH: '盆高', crownR: '冠半径',
    signW: '牌宽', signH: '牌高', poleH: '柱高',
    fins: '散热片数',
    baseR: '底座半径', baseH: '底座高',
    bgColor: '背景色', borderColor: '边框色', labelText: '标签文本',
    baseColor: '底座色', topColor: '台面色', accentColor: '饰条色',
    hasLight: '内置灯光', beltColor: '皮带色', rollerColor: '滚轮色',
    glassColor: '玻璃色', signColor: '牌面色', crownColor: '冠色',
    potColor: '盆色', armColor: '臂色', pipeColor: '管色',
    faceColor: '盘面色', frameColor: '框色', needleColor: '指针色',
    screenColor: '屏幕色', endColor: '端面色',
    color: '颜色',
  }
  return labels[key] || key
}

export function rangeMin(key) {
  if (key.includes('height') || key.includes('h') || key === 'rise' || key === 'poleH' || key === 'potH' || key === 'baseH') return 0.2
  if (key === 'length' || key.includes('wallW') || key === 'signW') return 1
  if (key === 'stepW') return 1
  if (key.includes('radius') || key === 'r1' || key === 'r2' || key.includes('crownR')) return 0.1
  if (key.includes('depth') || key.includes('d') || key === 'signW') return 0.1
  if (key === 'doorW') return 0.5
  if (key === 'doorY') return 0
  if (key === 'fins') return 2
  return 0.1
}

export function rangeMax(key) {
  if (key.includes('height') || key.includes('wallH')) return 8
  if (key.includes('length') || key.includes('wallW') || key === 'stepW') return 12
  if (key.includes('radius') || key === 'r2') return 3
  if (key === 'r1') return 2
  if (key.includes('depth') || key.includes('doorW')) return 10
  if (key === 'fins') return 30
  if (key === 'rise') return 5
  if (key === 'stepD') return 2
  if (key === 'doorY') return 2
  return 5
}

export function rangeStep(key) {
  if (key.includes('radius') || key === 'r1' || key === 'r2') return 0.05
  if (key === 'fins') return 1
  return 0.1
}

export function rebuildComposite(obj) {
  const fn = obj.meta?._origChildren
  if (typeof fn !== 'function') throw new Error('该组件仅保留快照，无法调整参数')
  obj.meta.childrenResolved = fn({ ...obj.meta.params }).map((child, i) => ({ ...child,
    id: `${obj.id}_child_${i}`, _childId: `${obj.id}_child_${i}`, _groupId: obj.id }))
}
