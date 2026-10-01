const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const os = require('node:os')
const path = require('node:path')
const AdmZip = require('adm-zip')

test('shared backend serves uploaded assets, preserves GLTF ZIP dependencies and cleans failed uploads', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'lowcode-api-test-'))
  process.env.MODEL_DIR = path.join(directory, 'models')
  process.env.UPLOAD_DIR = path.join(directory, 'uploads')
  const { app } = require('../src/app')
  const server = app.listen(0, '127.0.0.1')
  await new Promise(resolve => server.once('listening', resolve))
  const base = 'http://127.0.0.1:' + server.address().port
  async function upload(bytes, name) {
    const form = new FormData()
    form.append('modelFile', new Blob([bytes]), name)
    const response = await fetch(base + '/api/convert', { method: 'POST', body: form })
    return { status: response.status, data: await response.json() }
  }
  try {
    assert.equal((await (await fetch(base + '/api/health')).json()).ok, true)
    const first = await upload('GLB fixture', 'same.glb')
    const second = await upload('second fixture', 'same.glb')
    assert.equal(first.status, 200)
    assert.notEqual(first.data.url, second.data.url)
    assert.equal(await (await fetch(base + first.data.url)).text(), 'GLB fixture')
    const zip = new AdmZip()
    zip.addFile('nested/model.gltf', Buffer.from(JSON.stringify({ asset: { version: '2.0' }, buffers: [{ uri: 'mesh.bin' }] })))
    zip.addFile('nested/mesh.bin', Buffer.from('buffer data'))
    const zipped = await upload(zip.toBuffer(), 'scene.zip')
    assert.equal(zipped.status, 200)
    const bufferURL = new URL('mesh.bin', base + zipped.data.url)
    assert.equal(await (await fetch(bufferURL)).text(), 'buffer data')
    const jobId = require('crypto').randomUUID()
    const form = new FormData(); form.append('modelFile', new Blob([zip.toBuffer()]), 'job.zip')
    const accepted = await fetch(base + '/api/convert/jobs/' + jobId, { method: 'POST', body: form })
    assert.equal(accepted.status, 202)
    let job
    for (let i = 0; i < 40; i++) {
      job = await (await fetch(base + '/api/convert/jobs/' + jobId)).json()
      if (job.status === 'completed' || job.status === 'failed') break
      await new Promise(resolve => setTimeout(resolve, 10))
    }
    assert.equal(job.status, 'completed'); assert.ok(job.result.url)
    assert.equal((await fetch(base + '/api/convert/jobs/missing', { method: 'DELETE' })).status, 404)
    // Disconnect midway through multipart upload; no temporary partial file may survive.
    const interruptedId = require('crypto').randomUUID()
    await new Promise(resolve => {
      const request = require('http').request(base + '/api/convert/jobs/' + interruptedId, {
        method: 'POST', headers: { 'Content-Type': 'multipart/form-data; boundary=lowcode-test', 'Content-Length': 10000000 },
      })
      request.on('error', () => resolve())
      request.write('--lowcode-test\r\nContent-Disposition: form-data; name="modelFile"; filename="partial.blend"\r\nContent-Type: application/octet-stream\r\n\r\n')
      request.write(Buffer.alloc(65536))
      setTimeout(() => { request.destroy(); resolve() }, 50)
    })
    await new Promise(resolve => setTimeout(resolve, 100))
    assert.deepEqual(await fs.readdir(process.env.UPLOAD_DIR), [])
    const invalid = new AdmZip()
    invalid.addFile('readme.txt', Buffer.from('no model'))
    assert.equal((await upload(invalid.toBuffer(), 'bad.zip')).status, 400)
    assert.equal((await upload('bad', 'bad.exe')).status, 400)
    assert.deepEqual(await fs.readdir(process.env.UPLOAD_DIR), [])
  } finally {
    await new Promise(resolve => server.close(resolve))
    // directory was created by this test, and is strictly under the temp root.
    const relative = path.relative(os.tmpdir(), directory)
    assert.ok(relative.startsWith('lowcode-api-test-') && !relative.includes(path.sep))
    await fs.rm(directory, { recursive: true, force: true })
  }
})
