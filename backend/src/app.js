const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')
const { modelDir, root } = require('./config')
const convertRoutes = require('./routes/convert')
const app = express()
app.use(cors())
fs.mkdirSync(modelDir, { recursive: true })
app.use('/models', express.static(modelDir))
// Preserve URLs produced by the previous modular backend.
app.use('/models', express.static(path.join(root, 'public', 'models')))
app.use('/api', convertRoutes)
app.get('/api/health', (req, res) => res.json({ ok: true, status: 'ok' }))
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error)
  res.status(error.code === 'LIMIT_FILE_SIZE' ? 413 : (error.status || 400))
    .json({ success: false, error: error.message })
})
function start() {
  const port = process.env.PORT || 3000
  return app.listen(port, () => console.log('后端服务已启动: http://localhost:' + port))
}
if (require.main === module) start()
module.exports = { app, start }
