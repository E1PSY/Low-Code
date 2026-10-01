<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-box scene-list-modal" ref="dialog" role="dialog" aria-modal="true" aria-label="场景管理" tabindex="-1">
      <div class="modal-header">
        <h3>场景管理</h3>
        <button class="icon-btn" @click="$emit('close')">✕</button>
      </div>

      <!-- 导入区 -->
      <div class="import-section">
        <label class="import-label">
          <AppIcon name="upload" /> 导入 JSON 场景文件
          <input
            type="file"
            accept=".json"
            class="file-input-hidden"
            @change="handleImport"
          />
        </label>
      </div>

      <!-- 已保存场景列表 -->
      <div class="scene-list-area" v-if="sceneList.length > 0">
        <div
          v-for="scene in sceneList"
          :key="scene.id"
          class="scene-card" role="button" tabindex="0" @keydown.enter.self="$emit('load', scene.id)" @keydown.space.self.prevent="$emit('load', scene.id)"
          @click="$emit('load', scene.id)"
        >
          <div class="scene-info">
            <div class="scene-name">{{ scene.name }}</div>
            <div class="scene-meta">
              {{ scene.objectCount }} 个对象 ·
              {{ formatDate(scene.updatedAt) }}
            </div>
          </div>
          <button
            class="delete-btn"
            @click.stop="$emit('delete', scene.id)"
            title="删除场景"
          ><AppIcon name="trash" /></button>
        </div>
      </div>

      <div class="empty-hint" v-else>
        <span class="empty-icon"><AppIcon name="folder" /></span>
        <p>暂无保存的场景</p>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" @click="$emit('export-file')">
          <AppIcon name="download" />导出文件
        </button>
        <button class="btn-secondary" @click="$emit('autosave-load')">
          <AppIcon name="undo" />恢复自动保存
        </button>
        <button class="btn-primary" @click="$emit('close')">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import AppIcon from '../common/AppIcon.vue'
import { useDialog } from '../../composables/useDialog.js'
const dialog = useDialog(() => emit('close'))
defineProps({
  sceneList: { type: Array, default: () => [] },
})

const emit = defineEmits(['close', 'load', 'delete', 'export-file', 'autosave-load', 'import-file'])

function formatDate(iso) {
  if (!iso) return '未知'
  try {
    const d = new Date(iso)
    const now = new Date()
    const diffMs = now - d
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 60) return `${diffMin} 分钟前`
    const diffHour = Math.floor(diffMin / 60)
    if (diffHour < 24) return `${diffHour} 小时前`
    return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch {
    return iso
  }
}

function handleImport(event) {
  const file = event.target.files[0]
  if (file) {
    emit('import-file', file)
    event.target.value = ''
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(28, 39, 58, 0.16); z-index: 200;
  display: flex; align-items: center; justify-content: center;
}
.modal-box {
  width: 420px; max-height: 70vh;
  background-color: var(--bg-panel); border: 1px solid var(--border-color);
  border-radius: 12px; display: flex; flex-direction: column;
  box-shadow: 0 20px 60px rgba(28, 39, 58, 0.16);
}
.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px 20px; border-bottom: 1px solid var(--border-color);
}
.modal-header h3 { margin: 0; font-size: 1rem; }
.icon-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.1rem; padding: 4px 8px; border-radius: 4px; }
.icon-btn:hover { background-color: var(--bg-hover); color: var(--text-main); }

.import-section { padding: 12px 20px; border-bottom: 1px solid var(--border-color); }
.import-label {
  display: block; text-align: center; padding: 12px;
  border: 2px dashed var(--border-color); border-radius: 8px;
  color: var(--text-muted); cursor: pointer; font-size: 0.85rem;
  transition: 0.2s;
}
.import-label:hover { border-color: var(--accent-color); color: var(--accent-color); }
.file-input-hidden { display: none; }

.scene-list-area { flex: 1; overflow-y: auto; padding: 8px 20px; }
.scene-card {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px; margin-bottom: 6px; border-radius: 8px;
  background-color: var(--bg-section); cursor: pointer; transition: 0.2s;
}
.scene-card:hover { background-color: var(--bg-hover); }
.scene-info { flex: 1; min-width: 0; }
.scene-name { font-size: 0.9rem; font-weight: 500; margin-bottom: 4px; }
.scene-meta { font-size: 0.75rem; color: var(--text-muted); }
.delete-btn {
  background: none; border: none; font-size: 1rem; cursor: pointer;
  padding: 4px 8px; border-radius: 4px; opacity: 0.4; transition: 0.2s;
}
.delete-btn:hover { opacity: 1; background-color: rgba(239, 68, 68, 0.2); }

.empty-hint { display: flex; flex-direction: column; align-items: center; padding: 40px 0; color: var(--text-muted); }
.empty-icon { font-size: 2rem; margin-bottom: 8px; opacity: 0.5; }

.modal-footer { display: flex; gap: 8px; padding: 14px 20px; border-top: 1px solid var(--border-color); }
</style>
