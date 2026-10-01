<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-box save-dialog" ref="dialog" role="dialog" aria-modal="true" aria-label="保存场景" tabindex="-1">
      <div class="modal-header">
        <h3>保存场景</h3>
      </div>
      <div class="modal-body">
        <label for="scene-name" class="field-label">场景名称</label>
        <input
          ref="nameInput" id="scene-name"
          type="text"
          class="ui-input"
          :value="modelValue"
          @input="$emit('update:modelValue', $event.target.value)"
          placeholder="输入场景名称"
          @keydown.enter="$emit('confirm')"
        />
        <div class="object-count" v-if="objectCount > 0">
          将保存 {{ objectCount }} 个场景对象
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" @click="$emit('close')">取消</button>
        <button class="btn-primary" @click="$emit('confirm')">保存</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useDialog } from '../../composables/useDialog.js'
const dialog = useDialog(() => emit('close'))
import { ref } from 'vue'

defineProps({
  modelValue: { type: String, default: '' },
  objectCount: { type: Number, default: 0 },
})

const emit = defineEmits(['update:modelValue', 'close', 'confirm'])

const nameInput = ref(null)

</script>

<style scoped>
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(28, 39, 58, 0.16); z-index: 200;
  display: flex; align-items: center; justify-content: center;
}
.modal-box {
  width: 400px;
  background-color: var(--bg-panel); border: 1px solid var(--border-color);
  border-radius: 12px; display: flex; flex-direction: column;
  box-shadow: 0 20px 60px rgba(28, 39, 58, 0.16);
}
.modal-header { padding: 16px 20px; border-bottom: 1px solid var(--border-color); }
.modal-header h3 { margin: 0; font-size: 1rem; }
.modal-body { padding: 20px; }
.field-label { display: block; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 8px; }
.ui-input {
  width: 100%; padding: 10px 12px;
  background-color: var(--bg-section); border: 1px solid transparent;
  color: var(--text-main); border-radius: 6px; font-size: 0.9rem;
  outline: none; box-sizing: border-box;
}
.ui-input:focus { border-color: var(--accent-color); }
.object-count { margin-top: 12px; font-size: 0.8rem; color: var(--text-muted); }
.modal-footer { display: flex; gap: 8px; padding: 14px 20px; border-top: 1px solid var(--border-color); justify-content: flex-end; }
</style>
