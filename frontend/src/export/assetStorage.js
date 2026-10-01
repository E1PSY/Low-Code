// Exported projects resolve bundled files against the configured Vite base.
export async function acquireModelURL(obj) {
  return { url: import.meta.env.BASE_URL + obj.url.replace(/^\.?\//, ''), release() {} }
}
