const { execFile } = require('child_process')
const { promisify } = require('util')
const { randomUUID } = require('crypto')
const path = require('path')
const fs = require('fs/promises')
const syncFs = require('fs')
const AdmZip = require('adm-zip')
const { root, modelDir, uploadDir } = require('../config')
const run = promisify(execFile)

function blenderPath() {
  if (process.env.BLENDER_PATH) return process.env.BLENDER_PATH
  if (process.platform === 'win32') {
    const base = 'C:\\Program Files\\Blender Foundation'
    if (syncFs.existsSync(base)) {
      for (const name of syncFs.readdirSync(base).sort().reverse()) {
        const candidate = path.join(base, name, 'blender.exe')
        if (syncFs.existsSync(candidate)) return candidate
      }
    }
  }
  return 'blender'
}
async function findModels(dir) {
  const result = []
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name)
    if (entry.isDirectory()) result.push(...await findModels(file))
    else if (/\.(blend|glb|gltf)$/i.test(entry.name)) result.push(file)
  }
  return result
}
function extractArchive(input, destination) {
  const zip = new AdmZip(input)
  const entries = zip.getEntries()
  let total = 0
  if (entries.length > 10000) throw new Error('压缩包文件数量过多')
  for (const entry of entries) {
    total += entry.header.size
    const target = path.resolve(destination, entry.entryName.replace(/\\/g, '/'))
    const relative = path.relative(destination, target)
    if (relative.startsWith('..') || path.isAbsolute(relative) || entry.entryName.includes(':')) {
      throw new Error('压缩包包含非法路径')
    }
    if (total > 1024 * 1024 * 1024) throw new Error('压缩包解压后超过 1GB')
  }
  zip.extractAllTo(destination, true)
}
async function processUpload(inputPath, originalName, { signal, onProgress = () => {} } = {}) {
  const taskId = randomUUID()
  const workDir = path.join(uploadDir, taskId)
  const outputDir = path.join(modelDir, taskId)
  let succeeded = false
  try {
    signal?.throwIfAborted()
    onProgress('preparing')
    await fs.mkdir(workDir, { recursive: true })
    await fs.mkdir(outputDir, { recursive: true })
    let source = inputPath
    let ext = path.extname(originalName).toLowerCase()
    if (ext === '.zip') {
      onProgress('extracting')
      extractArchive(inputPath, workDir)
      signal?.throwIfAborted()
      const files = await findModels(workDir)
      source = files.find(f => /\.glb$/i.test(f)) || files.find(f => /\.gltf$/i.test(f)) || files.find(f => /\.blend$/i.test(f))
      if (!source) throw new Error('压缩包内没有 .blend、.glb 或 .gltf 模型')
      ext = path.extname(source).toLowerCase()
    }
    let relativeName
    if (ext === '.blend') {
      onProgress('converting')
      relativeName = 'model.glb'
      try {
        await run(blenderPath(), ['--background', '--disable-autoexec', '--python-exit-code', '1', '--python',
          path.join(root, 'scripts', 'convert_to_glb.py'), '--', source, path.join(outputDir, relativeName)],
        { signal, timeout: 120000, maxBuffer: 8 * 1024 * 1024, windowsHide: true })
      } catch (error) {
        signal?.throwIfAborted()
        throw new Error(error.code === 'ENOENT' ? 'Blender 未安装或 BLENDER_PATH 配置错误' : 'Blender 转换失败或超时: ' + error.message)
      }
    } else if (ext === '.gltf' && source !== inputPath) {
      // Preserve relative buffers and textures in archived GLTF assets.
      await fs.cp(workDir, outputDir, { recursive: true })
      relativeName = path.relative(workDir, source).split(path.sep).join('/')
    } else {
      relativeName = 'model' + ext
      await fs.copyFile(source, path.join(outputDir, relativeName))
    }
    signal?.throwIfAborted()
    onProgress('validating')
    const stat = await fs.stat(path.join(outputDir, relativeName))
    if (!stat.size) throw new Error('转换结果为空')
    succeeded = true
    return { url: '/models/' + taskId + '/' + relativeName.split('/').map(encodeURIComponent).join('/'), fileName: relativeName, size: stat.size }
  } finally {
    await fs.rm(inputPath, { force: true })
    await fs.rm(workDir, { recursive: true, force: true })
    if (!succeeded) await fs.rm(outputDir, { recursive: true, force: true })
  }
}
module.exports = { processUpload }
