<template>
  <TresGroup ref="groupRef" @click.stop="onClick" />
</template>

<script setup>
import { shallowRef, watch, unref, onUnmounted } from 'vue'
import { useGLTF, useAnimations } from '@tresjs/cientos'

const props = defineProps({
  obj: { type: Object, required: true }
})

const emit = defineEmits(['select'])

// 使用浅层响应式，保护 Three.js 原生对象不被 Vue 的深层代理卡死
const groupRef = shallowRef(null)
const sceneRef = shallowRef(null)
const animationsRef = shallowRef([])

// 顶层初始化动画控制器。即便此时数组是空的，等下面加载完数据它会自动就绪
const { actions } = useAnimations(animationsRef, sceneRef)

const loadModel = async () => {
  try {
    // 发起加载请求
    const gltfResult = await useGLTF(props.obj.url, { draco: true })
    
    // 核心提取逻辑：抽离成函数，方便在异步就绪后调用
    const processData = () => {
      // 暴力兼容不同版本的库返回的数据结构：
      // 无论是浅层 Ref、带 isReady 的包装器，还是原生的 GLTF 对象，统统扒出 scene 和 animations
      const rawScene = unref(gltfResult.scene) || unref(gltfResult.scenes)?.[0] || unref(gltfResult.state)?.scene || gltfResult
      const rawAnims = unref(gltfResult.animations) || unref(gltfResult.state)?.animations || []
      
      if (rawScene) {
        sceneRef.value = rawScene
        // 如果容器已经挂载，直接把模型塞进去
        if (groupRef.value) {
          groupRef.value.add(rawScene)
        } else {
          // 如果渲染比较慢，我们等容器挂载了再塞
          const unwatchGroup = watch(groupRef, (g) => {
            if (g) { g.add(rawScene); unwatchGroup() }
          })
        }
      }

      // 如果扒到了动画数据
      if (rawAnims && rawAnims.length > 0) {
        animationsRef.value = rawAnims
        // 关键一步：把动画名称同步到右侧面板的下拉框！
        props.obj.animations = rawAnims.map(a => a.name)
        console.log('🎉 成功提取到动画:', props.obj.animations)
      } else {
        props.obj.animations = []
        console.log('⚠️ 此模型不包含动画数据')
      }
    }

    // 判断返回的是否是异步状态包装器 (带有 isReady 属性)
    if (gltfResult.isReady !== undefined && !unref(gltfResult.isReady)) {
      // 正在后台加载中，我们监听 isReady，等它变成 true 了再处理
      const unwatchReady = watch(() => unref(gltfResult.isReady), (ready) => {
        if (ready) {
          processData()
          unwatchReady()
        }
      })
    } else {
      // 如果数据已经就绪，直接处理
      processData()
    }

  } catch (error) {
    console.error('加载模型时发生致命错误:', error)
  }
}

// 立即执行加载
loadModel()

// 监听右侧下拉框绑定的 activeAnimation 的变化
watch(() => props.obj.activeAnimation, (newAnim) => {
  if (!actions) return
  
  // 切换前，一律先停止正在播放的所有动作
  Object.values(actions).forEach(action => action?.stop?.())
  
  // 播放用户选中的新动作
  if (newAnim && actions[newAnim]) {
    actions[newAnim].play()
  }
})

// 销毁组件时，打扫战场，释放内存
onUnmounted(() => {
  if (groupRef.value && sceneRef.value) {
    groupRef.value.remove(sceneRef.value)
  }
})

const onClick = () => emit('select', props.obj.id)
</script>