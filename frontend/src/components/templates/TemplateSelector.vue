<template>
  <div class="modal-overlay" @click.self="editorStore.hideTemplateModal">
    <div class="modal-content" ref="dialog" role="dialog" aria-modal="true" aria-label="场景模板" tabindex="-1">
      <div class="modal-header">
        <div>
          <h3>场景模板</h3>
          <p class="modal-subtitle">选择一个预置模板快速开始，或从空白场景搭建</p>
        </div>
        <button class="close-btn" @click="editorStore.hideTemplateModal">✕</button>
      </div>

      <div class="modal-body">
        <!-- 搜索过滤 -->
        <div class="search-bar">
          <input
            v-model="searchText"
            type="text"
            class="ui-input"
            placeholder="搜索模板..."
          />
        </div>

        <div class="template-grid">
          <div
            v-for="tpl in filteredTemplates"
            :key="tpl.name"
            class="template-card"
            @click="applyTemplate(tpl)"
          >
            <!-- 预览图区域 -->
            <div :class="['preview-area', tpl.preview || 'default']">
              <span class="preview-icon">{{ tpl.icon }}</span>
              <div class="preview-badge">{{ tpl.objectCount }} 对象</div>
            </div>

            <div class="card-body">
              <div class="tpl-name">{{ tpl.name }}</div>
              <div class="tpl-desc">{{ tpl.description }}</div>
            </div>

            <div class="card-footer">
              <span class="tpl-action">点击应用 →</span>
            </div>
          </div>
        </div>

        <div v-if="filteredTemplates.length === 0" class="empty-result">
          <span class="empty-icon">🔍</span>
          <p>没有匹配的模板</p>
        </div>
      </div>

      <div class="modal-footer">
        <span class="footer-hint">模板会替换当前场景内容</span>
        <button class="btn-secondary" @click="editorStore.hideTemplateModal">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useDialog } from '../../composables/useDialog.js'
const dialog = useDialog(() => editorStore.hideTemplateModal())
import { ref, computed } from 'vue'
import { useEditorStore } from '../../stores/editorStore.js'
import { useSceneStore } from '../../stores/sceneStore.js'
import { TEMPLATES } from '../../config/templates.js'

const editorStore = useEditorStore()
const sceneStore = useSceneStore()
const templates = TEMPLATES

const searchText = ref('')

const filteredTemplates = computed(() => {
  const q = searchText.value.trim().toLowerCase()
  if (!q) return templates
  return templates.filter((t) =>
    t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
  )
})

function applyTemplate(tpl) {
  sceneStore.loadTemplate(tpl)
  editorStore.hideTemplateModal()
}
</script>

<style scoped>
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.65); backdrop-filter: blur(6px);
  display: flex; justify-content: center; align-items: center; z-index: 9999;
}
.modal-content {
  background-color: var(--bg-panel); width: 800px; max-width: 94vw; max-height: 85vh;
  border-radius: 14px; border: 1px solid var(--border-color);
  display: flex; flex-direction: column; overflow: hidden;
  box-shadow: 0 20px 60px rgba(28, 39, 58, 0.16);
}
.modal-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 20px 24px 12px; border-bottom: 1px solid var(--border-color);
}
.modal-header h3 { margin: 0 0 4px 0; font-size: 1.15rem; color: var(--text-main); }
.modal-subtitle { margin: 0; font-size: 0.82rem; color: var(--text-muted); }
.close-btn {
  background: none; border: none; color: var(--text-muted);
  font-size: 1.3rem; cursor: pointer; padding: 4px 8px; border-radius: 6px; transition: 0.2s;
}
.close-btn:hover { color: var(--text-main); background-color: var(--bg-hover); }

.modal-body { padding: 16px 24px; overflow-y: auto; flex: 1; }

.search-bar { margin-bottom: 16px; }
.ui-input {
  width: 100%; padding: 10px 14px;
  background-color: var(--bg-section); border: 1px solid transparent;
  color: var(--text-main); border-radius: 8px; font-size: 0.9rem;
  outline: none; box-sizing: border-box; transition: 0.2s;
}
.ui-input:focus { border-color: var(--accent-color); background-color: var(--bg-panel); }

.template-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;
}
@media (max-width: 700px) { .template-grid { grid-template-columns: 1fr 1fr; } }

.template-card {
  background-color: var(--bg-section); border: 1px solid transparent;
  border-radius: 12px; overflow: hidden; cursor: pointer;
  transition: all 0.2s; display: flex; flex-direction: column;
}
.template-card:hover {
  border-color: var(--accent-color); transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(28, 39, 58, 0.16);
}

/* 预览区域 */
.preview-area {
  height: 100px; display: flex; align-items: center; justify-content: center;
  position: relative; flex-shrink: 0;
}
.preview-icon { font-size: 2.8rem; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); }
.preview-badge {
  position: absolute; top: 8px; right: 8px;
  font-size: 0.68rem; padding: 2px 8px; border-radius: 10px;
  background-color: rgba(28, 39, 58, 0.16); color: var(--text-muted);
  backdrop-filter: blur(4px);
}
/* 不同模板类型配色 */
.preview-area.hall     { background: linear-gradient(135deg, #292524 0%, #57534e 50%, #78716c 100%); }
.preview-area.factory  { background: linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%); }
.preview-area.showcase { background: linear-gradient(135deg, #1e1e24 0%, #292524 40%, #44403c 100%); }
.preview-area.pipes    { background: linear-gradient(135deg, #1e293b 0%, #475569 40%, #64748b 100%); }
.preview-area.control  { background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%); }
.preview-area.blank    { background: linear-gradient(135deg, #18181b 0%, #27272a 100%); }
.preview-area.default  { background: linear-gradient(135deg, #1e1e24 0%, #27272a 100%); }

.card-body { padding: 12px 14px 8px; flex: 1; }
.tpl-name { font-size: 0.92rem; font-weight: 600; color: var(--text-main); margin-bottom: 4px; }
.tpl-desc { font-size: 0.75rem; color: var(--text-muted); line-height: 1.4; }

.card-footer {
  padding: 8px 14px 12px; border-top: 1px solid rgba(255,255,255,0.05);
}
.tpl-action {
  font-size: 0.78rem; color: var(--accent-color); font-weight: 500;
  opacity: 0; transition: opacity 0.2s;
}
.template-card:hover .tpl-action { opacity: 1; }

.empty-result { text-align: center; padding: 40px 0; color: var(--text-muted); }
.empty-icon { font-size: 2rem; margin-bottom: 8px; opacity: 0.4; display: block; }

.modal-footer {
  display: flex; justify-content: flex-end; align-items: center; gap: 12px;
  padding: 14px 24px; border-top: 1px solid var(--border-color);
  background-color: var(--bg-section);
}
.footer-hint { font-size: 0.78rem; color: var(--text-muted); margin-right: auto; }
</style>
