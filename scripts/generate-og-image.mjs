// Renders scripts/og-image-template.html to public/og-image.png (1200x630, the standard
// Open Graph / Twitter card size) via a headless Chromium screenshot.
//
// Re-run this any time the branding in the template changes:
//   node scripts/generate-og-image.mjs
import { chromium } from 'playwright'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = path.dirname(fileURLToPath(import.meta.url))
const templatePath = 'file://' + path.join(dir, 'og-image-template.html')
const outPath = path.join(dir, '..', 'public', 'og-image.png')

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
await page.goto(templatePath)
await page.screenshot({ path: outPath })
await browser.close()
console.log('saved to', outPath)
