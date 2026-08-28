// Injects JSON-LD structured data into the main site and every standalone SEO calculator
// page, generated straight from the same src/tools/content/*.ts objects that ToolShell.tsx
// renders as the visible FAQ — so the structured data can never drift from what's actually
// on the page (Google requires FAQPage markup to match visible content).
//
// Re-run after editing any tool's FAQ/intro copy, or index.html's description:
//   node scripts/generate-structured-data.mjs
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url)) + '/..'
const contentDir = path.join(root, 'src/tools/content')
const marker = '<!-- structured-data -->'

function readMeta(html, name) {
  const m = html.match(new RegExp(`<meta name="${name}" content="(.*?)" />`))
  return m ? m[1] : null
}
function readCanonical(html) {
  const m = html.match(/<link rel="canonical" href="(.*?)" \/>/)
  return m ? m[1] : 'https://clearpathdebt.co.za/'
}

function inject(filePath, jsonLd) {
  let html = fs.readFileSync(filePath, 'utf8')
  const block = `    ${marker}\n    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>\n`
  if (html.includes(marker)) {
    html = html.replace(new RegExp(`    ${marker}[\\s\\S]*?</script>\\n`), block)
  } else {
    html = html.replace('  </head>', `${block}  </head>`)
  }
  fs.writeFileSync(filePath, html)
  console.log('updated:', path.relative(root, filePath))
}

// --- Main site: WebApplication ---
{
  const file = path.join(root, 'index.html')
  const html = fs.readFileSync(file, 'utf8')
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'ClearPath',
    url: 'https://clearpathdebt.co.za/',
    description: readMeta(html, 'description'),
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Any (web-based)',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'ZAR' },
    inLanguage: ['en', 'zu', 'af'],
    audience: { '@type': 'Audience', geographicArea: { '@type': 'Country', name: 'South Africa' } },
  }
  inject(file, jsonLd)
}

// --- Each tool page: WebApplication + FAQPage ---
for (const contentFile of fs.readdirSync(contentDir)) {
  const mod = await import(path.join(contentDir, contentFile))
  const content = Object.values(mod)[0]
  const htmlFile = path.join(root, 'tools', content.slug, 'index.html')
  if (!fs.existsSync(htmlFile)) {
    console.warn('no matching page for', content.slug, '- skipping')
    continue
  }
  const html = fs.readFileSync(htmlFile, 'utf8')
  const url = readCanonical(html)
  const description = readMeta(html, 'description')

  const webApp = {
    '@type': 'WebApplication',
    name: content.h1,
    url,
    description,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Any (web-based)',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'ZAR' },
    isPartOf: { '@type': 'WebApplication', name: 'ClearPath', url: 'https://clearpathdebt.co.za/' },
  }

  const jsonLd =
    content.faq.length > 0
      ? [
          { '@context': 'https://schema.org', ...webApp },
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: content.faq.map((item) => ({
              '@type': 'Question',
              name: item.q,
              acceptedAnswer: { '@type': 'Answer', text: item.a },
            })),
          },
        ]
      : { '@context': 'https://schema.org', ...webApp }

  inject(htmlFile, jsonLd)
}
