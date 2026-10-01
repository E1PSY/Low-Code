<template>
  <div class="modal-overlay" @click.self="editorStore.hideExportModal">
    <div class="modal-content" ref="dialog" role="dialog" aria-modal="true" aria-label="导出场景项目" tabindex="-1">
      <div class="modal-header">
        <h3>导出场景项目</h3>
        <button class="close-btn" @click="editorStore.hideExportModal">✕</button>
      </div>
      <div class="modal-body">
        <p class="export-hint">将导出完整项目压缩包，包含所有组件、交互和数据绑定配置。</p>
        <textarea class="code-preview" readonly :value="previewText"></textarea>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" @click="editorStore.hideExportModal">关闭</button>
        <button class="btn-primary" @click="emit('download')">⬇ 下载 .zip</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useDialog } from '../../composables/useDialog.js'
const dialog = useDialog(() => editorStore.hideExportModal())
import { computed } from 'vue'
import { useEditorStore } from '../../stores/editorStore.js'

const props = defineProps({
  code: { type: Object, default: function() { return {} } },
})

const emit = defineEmits(['download'])

var editorStore = useEditorStore()

var previewText = computed(function() {
  var c = props.code
  if (!c || typeof c === 'string') return '生成中...'
  var keys = Object.keys(c).sort()
  var lines = ['项目文件结构：', '']
  keys.forEach(function(k) {
    var size = c[k].length
    lines.push('  ' + k + '  (' + (size > 1024 ? (size / 1024).toFixed(1) + ' KB' : size + ' B') + ')')
  })
  lines.push('')
  lines.push('共 ' + keys.length + ' 个文件')
  return lines.join('\n')
})
</script>

<style scoped>
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.7); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 9999; }
.modal-content { background-color: var(--bg-panel); width: 680px; max-width: 92vw; max-height: 90vh; border-radius: 12px; border: 1px solid var(--border-color); display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 24px; border-bottom: 1px solid var(--border-color); }
.modal-header h3 { margin: 0; font-size: 1.1rem; color: var(--text-main); }
.close-btn { background: none; border: none; color: var(--text-muted); font-size: 1.2rem; cursor: pointer; }
.close-btn:hover { color: var(--text-main); }
.modal-body { padding: 20px 24px; overflow-y: auto; flex: 1; }
.export-hint { font-size: 0.82rem; color: var(--text-muted); margin: 0 0 12px 0; line-height: 1.5; }
.code-preview { width: 100%; height: 300px; background-color: #0d0d0f; border: 1px solid var(--border-color); border-radius: 8px; padding: 16px; color: #a6accd; font-family: Consolas, monospace; font-size: 0.82rem; line-height: 1.5; resize: none; outline: none; box-sizing: border-box; white-space: pre; overflow: auto; }
.modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 14px 24px; border-top: 1px solid var(--border-color); background-color: rgba(0,0,0,0.2); }
.btn-primary { background-color: var(--accent-color); color: var(--text-main); border: none; padding: 8px 16px; border-radius: 6px; font-size: 0.9rem; cursor: pointer; transition: 0.2s; }
.btn-primary:hover { background-color: var(--accent-hover); }
.btn-secondary { background-color: transparent; color: var(--text-main); border: 1px solid var(--border-color); padding: 8px 16px; border-radius: 6px; font-size: 0.9rem; cursor: pointer; transition: 0.2s; }
.btn-secondary:hover { background-color: var(--bg-hover); }
</style>
