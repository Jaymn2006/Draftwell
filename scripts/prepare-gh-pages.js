import fs from 'node:fs'
import path from 'node:path'

/**
 * Prepares the production build directory (dist/) for GitHub Pages:
 * 1. Creates a copy of index.html as 404.html to support SPA client-side routing on direct reloads.
 * 2. Creates a .nojekyll file to prevent GitHub Pages from ignoring files prefixed with underscores.
 */
const distDir = path.resolve(process.cwd(), 'dist')

if (fs.existsSync(distDir)) {
  const indexHtml = path.join(distDir, 'index.html')
  const notFoundHtml = path.join(distDir, '404.html')
  const noJekyll = path.join(distDir, '.nojekyll')

  if (fs.existsSync(indexHtml)) {
    fs.copyFileSync(indexHtml, notFoundHtml)
    console.log('✓ Created dist/404.html for GitHub Pages SPA client-side routing fallback.')
  }

  fs.writeFileSync(noJekyll, '')
  console.log('✓ Created dist/.nojekyll to bypass Jekyll processing on GitHub Pages.')
} else {
  console.warn('⚠ dist directory not found. Run npm run build first.')
}
