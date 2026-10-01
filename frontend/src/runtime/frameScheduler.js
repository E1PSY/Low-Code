/** One frame source per scene; no work when idle, hidden or disposed. */
export function createFrameScheduler({ request = cb => requestAnimationFrame(cb), cancel = id => cancelAnimationFrame(id), document: doc = globalThis.document } = {}) {
  const callbacks = new Set()
  let frame = null, previous, disposed = false, elapsed = 0
  function schedule() { if (!disposed && frame === null && callbacks.size && !doc?.hidden) frame = request(tick) }
  function tick(now) {
    frame = null
    const delta = previous === undefined ? 0 : Math.min((now - previous) / 1000, 0.1)
    previous = now; elapsed += delta
    for (const callback of [...callbacks]) callback(delta, elapsed)
    schedule()
  }
  function pause() { if (frame !== null) cancel(frame); frame = null; previous = undefined }
  function visibility() { pause(); schedule() }
  doc?.addEventListener('visibilitychange', visibility)
  return {
    subscribe(callback) { if (disposed) return () => {}; callbacks.add(callback); schedule(); return () => { callbacks.delete(callback); if (!callbacks.size) pause() } },
    dispose() { disposed = true; callbacks.clear(); pause(); doc?.removeEventListener('visibilitychange', visibility) },
    get subscriberCount() { return callbacks.size },
  }
}
