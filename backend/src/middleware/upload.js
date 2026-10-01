const multer = require('multer')
const path = require('path')
const fs = require('fs')

// 上传目录
const { uploadDir } = require('../config')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

// Multer 磁盘存储配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  },
})

// 文件过滤器：仅允许 .blend 和 .zip
function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase()
  if (['.blend', '.zip', '.glb', '.gltf'].includes(ext)) {
    cb(null, true)
  } else {
    cb(new Error('仅支持 .blend、.zip、.glb 和 .gltf 文件格式'), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB 上限
})

module.exports = upload
