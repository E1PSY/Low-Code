const fs = require('fs/promises')
const { processUpload } = require('./blenderService')
const terminal = new Set(['completed', 'failed', 'cancelled'])
/** Bounded queue and retained statuses; the worker receives a real AbortSignal. */
function createJobManager({ worker = processUpload, concurrency = 1, capacity = 12, retentionMs = 30 * 60 * 1000 } = {}) {
  const jobs = new Map(), queue = []
  let running = 0
  function publicJob(job) { return { id: job.id, status: job.status, stage: job.stage, result: job.result, error: job.error } }
  function finish(job, status) {
    job.status = status; job.stage = status
    job.resolve?.(publicJob(job))
    clearTimeout(job.expiry)
    job.expiry = setTimeout(() => jobs.delete(job.id), retentionMs); job.expiry.unref?.()
  }
  function pump() {
    while (running < concurrency && queue.length) {
      const job = queue.shift()
      if (job.status !== 'queued') continue
      running++; job.status = 'running'
      Promise.resolve().then(() => worker(job.file.path, job.file.originalname, {
        signal: job.controller.signal,
        onProgress(stage) { if (!terminal.has(job.status)) job.stage = stage },
      })).then(result => {
        if (job.controller.signal.aborted) finish(job, 'cancelled')
        else { job.result = result; finish(job, 'completed') }
      }, error => {
        job.error = error.message
        finish(job, job.controller.signal.aborted ? 'cancelled' : 'failed')
      }).finally(() => { running--; pump() })
    }
  }
  return {
    reserve(id) {
      if (!/^[a-zA-Z0-9-]{16,80}$/.test(id)) throw Object.assign(new Error('任务 ID 无效'), { status: 400 })
      if (jobs.has(id)) throw Object.assign(new Error('任务已存在'), { status: 409 })
      if ([...jobs.values()].filter(j => !terminal.has(j.status)).length >= capacity) throw Object.assign(new Error('转换队列已满，请稍后重试'), { status: 429 })
      const job = { id, status: 'uploading', stage: 'uploading', controller: new AbortController() }
      job.done = new Promise(resolve => { job.resolve = resolve })
      jobs.set(id, job); return publicJob(job)
    },
    async enqueue(id, file) {
      const job = jobs.get(id)
      if (!job || job.controller.signal.aborted) { await fs.rm(file.path, { force: true }); return }
      job.file = file; job.status = 'queued'; job.stage = 'queued'; queue.push(job); pump()
    },
    fail(id, error) { const job = jobs.get(id); if (job && !terminal.has(job.status)) { job.error = error.message; finish(job, 'failed') } },
    wait(id) { return jobs.get(id)?.done },
    get(id) { const job = jobs.get(id); return job && publicJob(job) },
    async cancel(id) {
      const job = jobs.get(id)
      if (!job) return false
      if (terminal.has(job.status)) return true
      const queued = job.status === 'queued'
      job.controller.abort(); finish(job, 'cancelled')
      if (queued) await fs.rm(job.file.path, { force: true })
      return true
    },
    dispose() { for (const job of jobs.values()) { job.controller.abort(); clearTimeout(job.expiry) } },
  }
}
module.exports = { createJobManager }
