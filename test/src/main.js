import { createApp } from 'vue'
import App from './App.vue'
import Tres from '@tresjs/core' // 引入 Tres 核心

const app = createApp(App)

app.use(Tres) // 全局注册
app.mount('#app')