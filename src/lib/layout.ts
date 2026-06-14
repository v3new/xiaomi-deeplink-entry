import {APP_BY_ID} from '../apps'
import {defaultLayout, LAYOUT_VERSION} from '../apps/default-layout'

export type AppTile = {t: 'app'; id: string}
export type FolderTile = {t: 'folder'; id: string; label: string; items: string[]}
export type Tile = AppTile | FolderTile
export type Section = {id: string; label: string | null; items: Tile[]}
export type Layout = {version: 3; sections: Section[]}

const STORAGE_KEY = 'app_layout'

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch (e) {
    console.warn('Storage read failed', e)
    return null
  }
}

function writeStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch (e) {
    console.warn('Storage write failed', e)
  }
}

export function genId(prefix: string): string {
  const rnd =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2)
  return `${prefix}-${rnd}`
}

function isTile(value: unknown): value is Tile {
  if (typeof value !== 'object' || value === null) return false
  const t = value as {t?: unknown; id?: unknown; label?: unknown; items?: unknown}
  if (t.t === 'app') return typeof t.id === 'string'
  if (t.t === 'folder') {
    return (
      typeof t.id === 'string' &&
      typeof t.label === 'string' &&
      Array.isArray(t.items) &&
      t.items.every(id => typeof id === 'string')
    )
  }
  return false
}

function isLayout(value: unknown): value is Layout {
  if (typeof value !== 'object' || value === null) return false
  const l = value as {version?: unknown; sections?: unknown}
  if (l.version !== LAYOUT_VERSION || !Array.isArray(l.sections)) return false
  return l.sections.every(s => {
    if (typeof s !== 'object' || s === null) return false
    const sec = s as {id?: unknown; label?: unknown; items?: unknown}
    const labelOk = sec.label === null || typeof sec.label === 'string'
    return typeof sec.id === 'string' && labelOk && Array.isArray(sec.items) && sec.items.every(isTile)
  })
}

function knownAppTile(id: string): AppTile | null {
  return APP_BY_ID.has(id) ? {t: 'app', id} : null
}

function sanitizeTile(tile: Tile): Tile | null {
  if (tile.t === 'app') return knownAppTile(tile.id)

  const ids = [...new Set(tile.items)].filter(id => APP_BY_ID.has(id))
  if (ids.length === 0) return null
  if (ids.length === 1) return knownAppTile(ids[0])
  return {...tile, items: ids}
}

function sanitizeLayout(layout: Layout): Layout | null {
  const sections = layout.sections
    .map(section => ({
      ...section,
      items: section.items.map(sanitizeTile).filter((tile): tile is Tile => Boolean(tile)),
    }))
    .filter(section => section.items.length > 0)

  if (sections.length === 0) return null
  return {...layout, sections}
}

export function load(): Layout {
  const raw = readStorage(STORAGE_KEY)
  if (raw) {
    try {
      const parsed = JSON.parse(raw)
      if (isLayout(parsed)) {
        const sanitized = sanitizeLayout(parsed)
        if (sanitized) {
          save(sanitized)
          return sanitized
        }
      }
    } catch (_e) {
      // fall through to default
    }
  }
  const fresh = defaultLayout()
  save(fresh)
  return fresh
}

export function save(layout: Layout): void {
  writeStorage(STORAGE_KEY, JSON.stringify(layout))
}

// All app ids currently placed somewhere on the home screen (in a section or a folder).
export function placedAppIds(layout: Layout): Set<string> {
  const ids = new Set<string>()
  for (const section of layout.sections) {
    for (const tile of section.items) {
      if (tile.t === 'app') ids.add(tile.id)
      else for (const id of tile.items) ids.add(id)
    }
  }
  return ids
}

// Catalog apps not placed anywhere — i.e. hidden, shown in the tray.
export function hiddenAppIds(layout: Layout): string[] {
  const placed = placedAppIds(layout)
  return [...APP_BY_ID.keys()].filter(id => !placed.has(id))
}
