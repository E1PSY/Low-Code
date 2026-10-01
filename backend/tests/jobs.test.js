const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('fs/promises')
const path = require('path')
const os = require('os')
const { randomUUID } = require('crypto')
const { createJobManager } = require('../src/services/conversionJobs')
const tick = () => new Promise(resolve => setImmediate(resolve))

test('bounded jobs serialize workers, cancel running and queued work, clean files and surface failure', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'lowcode-jobs-'))
  let active = 0, peak = 0
  const release = new Map()
  const manager = createJobManager({ capacity: 2, worker: async (file, name, { signal, onProgress }) => {
    active++; peak = Math.max(peak, active); onProgress('converting')
    try {
      signal.throwIfAborted()
      await new Promise((resolve, reject) => {
        release.set(name, resolve)
        signal.addEventListener('abort', () => reject(signal.reason), { once: true })
      })
      if (name === 'bad') throw new Error('fixture conversion error')
      return { url: '/models/test.glb' }
    } finally { active--; await fs.rm(file, { force: true }) }
  } })
  async function add(name) {
    const id = randomUUID(), file = path.join(directory, id)
    manager.reserve(id); await fs.writeFile(file, name); await manager.enqueue(id, { path: file, originalname: name })
    return { id, file }
  }
  try {
    const first = await add('one'), second = await add('two'); await tick()
    assert.equal(manager.get(first.id).stage, 'converting'); assert.equal(manager.get(second.id).status, 'queued')
    assert.throws(() => manager.reserve(randomUUID()), /队列已满/)
    await manager.cancel(second.id); assert.equal(manager.get(second.id).status, 'cancelled')
    await assert.rejects(fs.stat(second.file))
    await manager.cancel(first.id); await manager.wait(first.id); await tick(); await tick()
    assert.equal(manager.get(first.id).status, 'cancelled')
    const third = await add('three'); await tick(); release.get('three')(); await manager.wait(third.id); await tick()
    assert.equal(manager.get(third.id).status, 'completed'); assert.equal(peak, 1)
    const bad = await add('bad'); await tick(); release.get('bad')(); await manager.wait(bad.id); await tick()
    assert.equal(manager.get(bad.id).status, 'failed'); assert.match(manager.get(bad.id).error, /fixture/)
    const uploading = randomUUID(); manager.reserve(uploading); await manager.cancel(uploading)
    const lateFile = path.join(directory, 'late'); await fs.writeFile(lateFile, 'late')
    await manager.enqueue(uploading, { path: lateFile, originalname: 'late' }); await assert.rejects(fs.stat(lateFile))
    assert.deepEqual(await fs.readdir(directory), [])
  } finally {
    manager.dispose()
    assert.ok(path.relative(os.tmpdir(), directory).startsWith('lowcode-jobs-'))
    await fs.rm(directory, { recursive: true, force: true })
  }
})
