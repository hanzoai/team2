import { hanzo } from '@hanzo/vite'
import react from '@vitejs/plugin-react'

/**
 * The bundler. Resolving the Hanzo runtime — `~/…`, react-native-web, one copy
 * of gui — comes from `hanzo()`, stated once for every Hanzo app rather than
 * copied into each. What is left is this app's own.
 *
 * There is no CSS pipeline because there is no CSS to build: @hanzo/ui ships one
 * generated stylesheet that `<Hanzo>` imports, and the styles gui derives from
 * props it inserts at runtime.
 */

/**
 * A single-page app has one document and many addresses, so every address that
 * is not a file has to arrive at that document. The Sites plane answers a miss
 * with the site's own `404.html`, so emitting the document under that name is
 * the whole fix, and it is the convention every static host already implements.
 * The status stays 404 — the browser runs the bundle regardless and the router
 * takes the address from there, while a crawler still reads "not a page I
 * publish", which is true of every address except the ones the router invents.
 */
const fallback = {
  name: 'fallback',
  async writeBundle(options: { dir?: string }) {
    const { copyFile } = await import('node:fs/promises')
    const { join } = await import('node:path')
    const dir = options.dir ?? 'dist'
    await copyFile(join(dir, 'index.html'), join(dir, '404.html'))
  },
}

export default hanzo({ plugins: [react(), fallback] }, { root: import.meta.dirname })
