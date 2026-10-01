const path = require('path')
const root = path.resolve(__dirname, '..')
module.exports = {
  root,
  modelDir: path.resolve(process.env.MODEL_DIR || path.join(root, 'models')),
  uploadDir: path.resolve(process.env.UPLOAD_DIR || path.join(root, 'uploads')),
}
