import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// THE FACES. Zen is authored in `@hanzo/font`, which ships the woff2 the
// `@font-face` needs; `@hanzo/ui`'s theme.css only names the family. Imported
// once, here, so the `--font-sans` token resolves to a real face rather than the
// system fallback.
import '@hanzo/font/css'
// THE ROLES. `src/theme/theme.ts` names them and every component reads them from
// there; this is where their values arrive. Without it every `var(--team-…)`
// resolves to nothing and the product paints as unstyled text.
import '~/theme/tokens.css'
import { App } from '~/app'

const root = document.getElementById('root')
if (!root) throw new Error('no #root')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
