import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Tres from '@tresjs/core'
import App from './App.vue'

const app = createApp(App)

// 全局注册 Pinia 状态管理
app.use(createPinia())

// 全局注册 TresJS 核心（Vue 才能解析 3D 标签）
app.use(Tres)

app.mount('#app')
