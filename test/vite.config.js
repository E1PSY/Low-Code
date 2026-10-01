import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { templateCompilerOptions } from '@tresjs/core' // 引入 TresJS 编译选项

export default defineConfig({
  plugins: [
    vue({
      // 将 TresJS 的自定义标签规则注入到 Vue 编译器中
      ...templateCompilerOptions
    })
  ]
})