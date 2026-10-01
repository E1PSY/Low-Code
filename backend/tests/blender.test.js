const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const syncFs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { execFile } = require('node:child_process')
const { promisify } = require('node:util')
const blender = process.env.TEST_BLENDER_PATH || process.env.BLENDER_PATH || 'C:\\Program Files\\Blender Foundation\\Blender 4.5\\blender.exe'

test('real Blender conversion produces a GLB with mesh and animation', { skip: !syncFs.existsSync(blender), timeout: 120000 }, async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'lowcode-blender-test-'))
  process.env.BLENDER_PATH = blender
  process.env.MODEL_DIR = path.join(directory, 'models')
  process.env.UPLOAD_DIR = path.join(directory, 'uploads')
  const fixture = path.join(directory, 'animated.blend')
  const script = path.join(directory, 'fixture.py')
  const output = JSON.stringify(fixture)
  await fs.writeFile(script, [
    'import bpy',
    'bpy.ops.wm.read_factory_settings(use_empty=True)',
    'bpy.ops.mesh.primitive_cube_add()',
    'obj = bpy.context.active_object',
    'obj.keyframe_insert(data_path="location", frame=1)',
    'obj.location.x = 2',
    'obj.keyframe_insert(data_path="location", frame=20)',
    'bpy.ops.wm.save_as_mainfile(filepath=' + output + ')',
  ].join('\n'))
  try {
    await promisify(execFile)(blender, ['--background', '--disable-autoexec', '--python-exit-code', '1', '--python', script],
      { timeout: 60000, windowsHide: true })
    const { processUpload } = require('../src/services/blenderService')
    const cancelledFixture = path.join(directory, 'cancel.blend')
    await fs.copyFile(fixture, cancelledFixture)
    const result = await processUpload(fixture, 'animated.blend')
    const bytes = await fs.readFile(path.join(process.env.MODEL_DIR, ...result.url.split('/').slice(2)))
    assert.equal(bytes.subarray(0, 4).toString(), 'glTF')
    const jsonLength = bytes.readUInt32LE(12)
    const document = JSON.parse(bytes.subarray(20, 20 + jsonLength).toString().trim())
    assert.ok(document.meshes.length > 0)
    assert.ok(document.animations.length > 0)
    assert.deepEqual(await fs.readdir(process.env.UPLOAD_DIR), [])
    const controller = new AbortController()
    let cancellation
    await assert.rejects(processUpload(cancelledFixture, 'cancel.blend', {
      signal: controller.signal,
      onProgress(stage) { if (stage === 'converting') cancellation = setTimeout(() => controller.abort(), 30) },
    }), error => error.name === 'AbortError')
    clearTimeout(cancellation)
    await assert.rejects(fs.stat(cancelledFixture))
    assert.deepEqual(await fs.readdir(process.env.UPLOAD_DIR), [])
    assert.equal((await fs.readdir(process.env.MODEL_DIR)).length, 1)

  } finally {
    const relative = path.relative(os.tmpdir(), directory)
    assert.ok(relative.startsWith('lowcode-blender-test-') && !relative.includes(path.sep))
    await fs.rm(directory, { recursive: true, force: true })
  }
})
