const router = require('express').Router()
const upload = require('../middleware/upload')
const { randomUUID } = require('crypto')
// Compatibility endpoint uses the same bounded worker queue.
router.post('/convert', upload.single('modelFile'), async (req, res, next) => {
  if (!req.file) return res.status(400).json({ success: false, error: '没有检测到上传的文件' })
  const id = randomUUID()
  try {
    jobs.reserve(id)
    res.once('close', () => { if (!res.writableFinished) jobs.cancel(id).catch(console.error) })
    await jobs.enqueue(id, req.file)
    const job = await jobs.wait(id)
    if (job.status !== 'completed') throw new Error(job.error || '转换已取消')
    res.json({ success: true, ...job.result })
  } catch (error) { await fs.rm(req.file.path, { force: true }); next(error) }
})
const { createJobManager } = require('../services/conversionJobs')
const fs = require('fs/promises')
const jobs = createJobManager()
router.post('/convert/jobs/:id', (req, res, next) => {
  try { jobs.reserve(req.params.id) } catch (error) { return next(error) }
  req.once('aborted', () => { jobs.cancel(req.params.id).catch(console.error) })
  upload.single('modelFile')(req, res, async error => {
    try {
      if (error || !req.file) {
        jobs.fail(req.params.id, error || new Error('没有检测到上传的文件'))
        if (req.file) await fs.rm(req.file.path, { force: true })
        return next(error || new Error('没有检测到上传的文件'))
      }
      await jobs.enqueue(req.params.id, req.file)
      res.status(202).json({ success: true, ...jobs.get(req.params.id) })
    } catch (err) { next(err) }
  })
})
router.get('/convert/jobs/:id', (req, res) => {
  const job = jobs.get(req.params.id)
  if (!job) return res.status(404).json({ error: '找不到任务或状态已过期' })
  res.json(job)
})
router.delete('/convert/jobs/:id', async (req, res, next) => {
  try {
    if (!await jobs.cancel(req.params.id)) return res.status(404).json({ error: '找不到任务' })
    res.json(jobs.get(req.params.id))
  } catch (error) { next(error) }
})
module.exports = router
