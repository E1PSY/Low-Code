import { ref, onMounted, onBeforeUnmount } from 'vue'
/** Keep keyboard navigation inside an open dialog and return focus on close. */
export function useDialog(close) {
  const dialog = ref(null)
  let previous
  const focusable = () => [...(dialog.value?.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]') || [])].filter(el => el.getClientRects().length)
  function keydown(event) {
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close() }
    if (event.key !== 'Tab') return
    const items = focusable(), first = items[0], last = items.at(-1)
    if (!first) { event.preventDefault(); return }
    if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.value)) { event.preventDefault(); last.focus() }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
  }
  onMounted(() => { previous = document.activeElement; dialog.value?.addEventListener('keydown', keydown); (focusable()[0] || dialog.value)?.focus() })
  onBeforeUnmount(() => { dialog.value?.removeEventListener('keydown', keydown); if (previous?.isConnected) previous.focus() })
  return dialog
}
