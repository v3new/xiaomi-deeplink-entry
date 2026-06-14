import {mkdir, readFile, writeFile} from 'node:fs/promises'
import {basename, dirname, join} from 'node:path'
import process from 'node:process'

const ROOT = process.cwd()
const APPS_DIR = join(ROOT, 'src', 'apps')
const ICONS_DIR = join(ROOT, 'public', 'app-icons')
const APP_FILES = [
  'ai.ts',
  'communication.ts',
  'entertainment.ts',
  'messengers.ts',
  'music.ts',
  'navigation.ts',
  'tools.ts',
]

const EXPECTED_TYPES = new Map([
  ['.png', 'image/png'],
  ['.webp', 'image/webp'],
])

const force = process.argv.includes('--force')

function extractStringProperty(body, property) {
  const match = body.match(new RegExp(`${property}:\\s*(['"])([\\s\\S]*?)\\1`))
  return match?.[2].replace(/\s+/g, '') ?? null
}

function extractApps(source, fileName) {
  return [...source.matchAll(/\{([\s\S]*?)\n\s*\}/g)]
    .map(match => {
      const body = match[1]
      const id = extractStringProperty(body, 'id')
      const icon = extractStringProperty(body, 'icon')
      const iconSource = extractStringProperty(body, 'iconSource')
      return id && icon && iconSource ? {fileName, icon, iconSource, id} : null
    })
    .filter(Boolean)
}

async function listApps() {
  const apps = []

  for (const fileName of APP_FILES) {
    const source = await readFile(join(APPS_DIR, fileName), 'utf8')
    apps.push(...extractApps(source, fileName))
  }

  return apps
}

async function downloadIcon(app) {
  const localPath = join(ROOT, 'public', app.icon.replace(/^\//, ''))
  const extension = basename(localPath).match(/\.[^.]+$/)?.[0]
  const expectedType = extension ? EXPECTED_TYPES.get(extension) : undefined

  if (!force && !process.argv.includes('--refresh')) {
    try {
      await readFile(localPath)
      return {app, status: 'skipped'}
    } catch {
      // Missing file; download it.
    }
  }

  const response = await fetch(app.iconSource, {
    headers: {
      accept: expectedType ?? 'image/avif,image/webp,image/png,image/*,*/*;q=0.8',
      'user-agent': 'Mozilla/5.0 app-icon-downloader',
    },
  })

  if (!response.ok) {
    throw new Error(`${app.id}: ${response.status} ${response.statusText}`)
  }

  const contentType = response.headers.get('content-type')?.split(';')[0].trim().toLowerCase()
  if (expectedType && contentType && contentType !== expectedType) {
    throw new Error(`${app.id}: expected ${expectedType}, got ${contentType}`)
  }

  const bytes = new Uint8Array(await response.arrayBuffer())
  await mkdir(dirname(localPath), {recursive: true})
  await writeFile(localPath, bytes)

  return {app, status: 'downloaded'}
}

async function main() {
  await mkdir(ICONS_DIR, {recursive: true})

  const apps = await listApps()
  const seen = new Set()
  for (const app of apps) {
    if (seen.has(app.id)) throw new Error(`Duplicate icon id: ${app.id}`)
    seen.add(app.id)
  }

  let downloaded = 0
  let skipped = 0

  for (const app of apps) {
    const result = await downloadIcon(app)
    if (result.status === 'downloaded') downloaded += 1
    else skipped += 1
    console.log(`${result.status.padEnd(10)} ${app.icon}`)
  }

  console.log(`Done: ${downloaded} downloaded, ${skipped} skipped`)
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
