import { provide, watch, onScopeDispose, computed } from 'vue'
import { useSceneStore } from '../stores/sceneStore.js'
import { createFrameScheduler } from '../runtime/frameScheduler.js'
import { useInteractions } from './useInteractions.js'
import { useDataBinding } from './useDataBinding.js'
export function useSceneRuntime(api, enabled = computed(() => true)) {
  const store = useSceneStore()
  const scheduler = createFrameScheduler()
  provide('sceneRuntime', { scheduler, enabled })
  const interaction = useInteractions(api, scheduler)
  const binding = useDataBinding(scheduler)
  watch(enabled, value => {
    if (value) { interaction.startAutoRotateLoop(); binding.start() }
    else { interaction.stopAutoRotateLoop(); binding.stop() }
  }, { immediate: true, flush: 'sync' })
  onScopeDispose(() => { interaction.stopAutoRotateLoop(); binding.stop(); scheduler.dispose() })
  return { scheduler, handlers: {
    click: obj => { if (enabled.value) interaction.handleObjectClick(obj); else store.selectObject(obj.id) },
    enter: obj => { if (enabled.value) interaction.handleObjectHoverEnter(obj) },
    leave: obj => { if (enabled.value) interaction.handleObjectHoverLeave(obj) },
  } }
}
