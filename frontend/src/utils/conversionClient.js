import { API_BASE_URL } from '../config/constants.js'
const stages = { uploading: '上传中', queued: '等待转换', preparing: '准备文件', extracting: '解压资源', converting: 'Blender 转换中', validating: '校验结果', completed: '转换完成' }
function delay(ms, signal) {
  return new Promise((resolve, reject) => {
    const abort = () => { clearTimeout(timer); reject(signal.reason) }
    const timer = setTimeout(() => { signal.removeEventListener('abort', abort); resolve() }, ms)
    signal.addEventListener('abort', abort, { once: true })
    if (signal.aborted) abort()
  })
}
export async function convertModel(file, { signal, progress }) {
  const id = crypto.randomUUID()
  const endpoint = API_BASE_URL + '/api/convert/jobs/' + id
  const cancel = () => { fetch(endpoint, { method: 'DELETE', keepalive: true }).catch(() => {}) }
  signal.addEventListener('abort', cancel, { once: true })
  try {
    signal.throwIfAborted()
    await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      const abort = () => xhr.abort()
      signal.addEventListener('abort', abort, { once: true })
      xhr.open('POST', endpoint); xhr.timeout = 120000
      xhr.upload.onprogress = event => progress('上传模型', event.lengthComputable ? Math.round(event.loaded / event.total * 100) : null)
      xhr.onload = () => {
        try { const data = JSON.parse(xhr.responseText); if (xhr.status >= 400) throw new Error(data.error || '上传失败'); resolve(data) } catch (error) { reject(error) }
      }
      xhr.onerror = () => reject(new Error('无法连接转换服务'))
      xhr.ontimeout = () => reject(new Error('上传超时'))
      xhr.onabort = () => reject(new DOMException('已取消', 'AbortError'))
      xhr.onloadend = () => signal.removeEventListener('abort', abort)
      const form = new FormData(); form.append('modelFile', file); xhr.send(form)
    })
    for (;;) {
      signal.throwIfAborted()
      const response = await fetch(endpoint, { signal })
      const job = await response.json()
      if (!response.ok) throw new Error(job.error || '获取转换状态失败')
      progress(stages[job.stage] || '处理中', null)
      if (job.status === 'completed') return job.result
      if (job.status === 'failed') throw new Error(job.error || '转换失败')
      if (job.status === 'cancelled') throw new DOMException('已取消', 'AbortError')
      await delay(500, signal)
    }
  } catch (error) { cancel(); throw error }
  finally { signal.removeEventListener('abort', cancel) }
}
