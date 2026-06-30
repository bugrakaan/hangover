// Exports the Dropdown component as a portable, copy-paste-ready folder of plain
// .js files (JSX preserved, but with a .js extension) plus compiled CSS.
//
// Usage:  npm run export
// Output: export/hangover/  →  copy this folder into another React project.
//
// The target project needs React 18+ and `fuse.js` installed:
//   npm install fuse.js

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as sass from 'sass'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const srcDir = path.join(root, 'src')
const outDir = path.join(root, 'export', 'hangover')

// Folders under src/ that should not be exported.
const EXCLUDE_DIRS = new Set(['stories', 'demo', 'assets'])

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry.name)) continue
      files.push(...(await walk(full)))
    } else {
      files.push(full)
    }
  }
  return files
}

function rewriteStyleImports(code) {
  // Point stylesheet imports at the compiled .css files.
  return code.replace(/(['"][^'"]+)\.scss(['"])/g, '$1.css$2')
}

async function run() {
  await fs.rm(outDir, { recursive: true, force: true })
  await fs.mkdir(outDir, { recursive: true })

  const files = await walk(srcDir)

  for (const file of files) {
    const rel = path.relative(srcDir, file)
    const ext = path.extname(file)
    const base = path.basename(file)

    // Skip SCSS partials (e.g. _fonts.scss) — they are compiled via their parent.
    if (ext === '.scss' && base.startsWith('_')) continue

    let outRel = rel
    let content

    if (ext === '.scss') {
      // Compile SCSS → CSS and change the extension.
      const result = sass.compile(file, { style: 'expanded' })
      content = result.css
      outRel = rel.slice(0, -ext.length) + '.css'
    } else if (ext === '.jsx') {
      // Keep JSX syntax, just rename to .js and fix style imports.
      content = rewriteStyleImports(await fs.readFile(file, 'utf8'))
      outRel = rel.slice(0, -ext.length) + '.js'
    } else if (ext === '.js') {
      content = rewriteStyleImports(await fs.readFile(file, 'utf8'))
    } else {
      content = await fs.readFile(file)
    }

    const dest = path.join(outDir, outRel)
    await fs.mkdir(path.dirname(dest), { recursive: true })
    await fs.writeFile(dest, content)
  }

  console.log(`Exported portable component to: ${path.relative(root, outDir)}`)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
