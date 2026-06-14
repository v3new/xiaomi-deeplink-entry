import {APP_BY_ID} from '../apps'
import {type FolderTile, genId, type Layout, placedAppIds, type Tile} from './layout'

export const DEFAULT_FOLDER_LABEL = 'Folder'

// Drops empty folders (and dissolves a 1-app folder back into a plain app tile).
function normalizeTiles(items: Tile[]): Tile[] {
  const out: Tile[] = []
  for (const tile of items) {
    if (tile.t === 'folder') {
      if (tile.items.length === 0) continue
      if (tile.items.length === 1) {
        out.push({t: 'app', id: tile.items[0]})
        continue
      }
    }
    out.push(tile)
  }
  return out
}

// Removes an app from wherever it sits (a section tile or inside a folder),
// then prunes any section left empty.
export function hideApp(layout: Layout, appId: string): Layout {
  const sections = layout.sections
    .map(section => {
      const items = normalizeTiles(
        section.items
          .map(tile => (tile.t === 'folder' ? {...tile, items: tile.items.filter(id => id !== appId)} : tile))
          .filter(tile => !(tile.t === 'app' && tile.id === appId)),
      )
      return {...section, items}
    })
    .filter(section => section.items.length > 0)
  return {...layout, sections}
}

// Drops sections that no longer contain any tiles. Applied on drop, not mid-drag,
// so a section briefly emptied while reordering doesn't vanish under the finger.
export function pruneEmptySections(layout: Layout): Layout {
  return {...layout, sections: layout.sections.filter(s => s.items.length > 0)}
}

// Moves a tile (by id) to a given index inside a target section. `toIndex` is an
// index into the target section's items *excluding* the moved tile.
export function moveTile(layout: Layout, tileId: string, toSectionId: string, toIndex: number): Layout {
  let moved: Tile | undefined
  const without = layout.sections.map(section => {
    const idx = section.items.findIndex(t => t.id === tileId)
    if (idx === -1) return section
    moved = section.items[idx]
    return {...section, items: [...section.items.slice(0, idx), ...section.items.slice(idx + 1)]}
  })
  if (!moved) return layout

  const sections = without.map(section => {
    if (section.id !== toSectionId) return section
    const items = [...section.items]
    items.splice(Math.max(0, Math.min(toIndex, items.length)), 0, moved as Tile)
    return {...section, items}
  })
  return {...layout, sections}
}

export function findTileById(layout: Layout, tileId: string): Tile | undefined {
  for (const section of layout.sections) {
    const found = section.items.find(t => t.id === tileId)
    if (found) return found
  }
  return undefined
}

// Removes an app tile (by id) from every section, returning the trimmed sections.
function removeAppTile(sections: Layout['sections'], appId: string): Layout['sections'] {
  return sections.map(section => {
    const idx = section.items.findIndex(t => t.t === 'app' && t.id === appId)
    if (idx === -1) return section
    return {...section, items: [...section.items.slice(0, idx), ...section.items.slice(idx + 1)]}
  })
}

// Drops the dragged app onto a target app, replacing the target with a new folder
// holding both. Returns the new layout plus the created folder id (for naming).
export function createFolder(layout: Layout, appId: string, targetAppId: string): {layout: Layout; folderId: string} {
  const folderId = genId('f')
  let sections = removeAppTile(layout.sections, appId)
  sections = sections.map(section => {
    const idx = section.items.findIndex(t => t.t === 'app' && t.id === targetAppId)
    if (idx === -1) return section
    const folder: Tile = {t: 'folder', id: folderId, label: DEFAULT_FOLDER_LABEL, items: [targetAppId, appId]}
    return {...section, items: [...section.items.slice(0, idx), folder, ...section.items.slice(idx + 1)]}
  })
  return {layout: {...layout, sections}, folderId}
}

// Adds the dragged app into an existing folder.
export function addToFolder(layout: Layout, appId: string, folderId: string): Layout {
  let sections = removeAppTile(layout.sections, appId)
  sections = sections.map(section => ({
    ...section,
    items: section.items.map(t =>
      t.t === 'folder' && t.id === folderId && !t.items.includes(appId) ? {...t, items: [...t.items, appId]} : t,
    ),
  }))
  return {...layout, sections}
}

// Pops an app out of its folder back onto the screen, right after the folder.
// The folder dissolves to a plain tile when only one app remains.
export function removeFromFolder(layout: Layout, appId: string): Layout {
  const sections = layout.sections.map(section => {
    const fi = section.items.findIndex(t => t.t === 'folder' && t.items.includes(appId))
    if (fi === -1) return section
    const folder = section.items[fi] as FolderTile
    const remaining = folder.items.filter(id => id !== appId)
    const popped: Tile = {t: 'app', id: appId}
    const replacement: Tile[] =
      remaining.length >= 2
        ? [{...folder, items: remaining}]
        : remaining.length === 1
          ? [{t: 'app', id: remaining[0]}]
          : []
    return {
      ...section,
      items: [...section.items.slice(0, fi), ...replacement, popped, ...section.items.slice(fi + 1)],
    }
  })
  return {...layout, sections}
}

// Appends a fresh empty section. Empty sections survive while editing (as drop
// targets) and are pruned on edit exit.
export function addSection(layout: Layout): Layout {
  return {...layout, sections: [...layout.sections, {id: genId('s'), label: null, items: []}]}
}

// Deletes a section; any apps it held become hidden (fall back to the tray).
export function deleteSection(layout: Layout, sectionId: string): Layout {
  return {...layout, sections: layout.sections.filter(s => s.id !== sectionId)}
}

// Moves a section to a new index. `toIndex` is into the list excluding the moved one.
export function moveSection(layout: Layout, sectionId: string, toIndex: number): Layout {
  const from = layout.sections.findIndex(s => s.id === sectionId)
  if (from === -1) return layout
  const sections = [...layout.sections]
  const [moved] = sections.splice(from, 1)
  sections.splice(Math.max(0, Math.min(toIndex, sections.length)), 0, moved)
  return {...layout, sections}
}

// Renames a section; an empty label clears it back to an unlabeled section.
export function renameSection(layout: Layout, sectionId: string, label: string): Layout {
  const trimmed = label.trim()
  return {
    ...layout,
    sections: layout.sections.map(s => (s.id === sectionId ? {...s, label: trimmed || null} : s)),
  }
}

export function renameFolder(layout: Layout, folderId: string, label: string): Layout {
  const sections = layout.sections.map(section => ({
    ...section,
    items: section.items.map(t => (t.t === 'folder' && t.id === folderId ? {...t, label} : t)),
  }))
  return {...layout, sections}
}

// Places a hidden app onto the screen. Without drag yet, it lands at the end of
// the last section (or a fresh unlabeled section if none exist).
export function showApp(layout: Layout, appId: string): Layout {
  if (!APP_BY_ID.has(appId)) return layout
  if (placedAppIds(layout).has(appId)) return layout
  const sections = [...layout.sections]
  if (sections.length === 0) {
    sections.push({id: genId('s'), label: null, items: [{t: 'app', id: appId}]})
  } else {
    const last = sections[sections.length - 1]
    sections[sections.length - 1] = {...last, items: [...last.items, {t: 'app', id: appId}]}
  }
  return {...layout, sections}
}
