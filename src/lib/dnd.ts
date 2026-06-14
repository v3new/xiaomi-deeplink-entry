import {get, writable} from 'svelte/store'
import {addToFolder, createFolder, findTileById, moveTile} from './layout-ops'
import {editMode, layout, openFolderId} from './stores'

// Id of the tile currently being dragged (its in-grid placeholder is hidden).
export const draggingId = writable<string | null>(null)

// Id of a tile the dragged app is hovering over to merge into a folder.
export const combineId = writable<string | null>(null)

const THRESHOLD = 8
const SCROLL_TOP = 90
const SCROLL_BOTTOM_GAP = 170
const SCROLL_STEP = 12

let pointerId = -1
let startX = 0
let startY = 0
let grabDX = 0
let grabDY = 0
let pendingTileId: string | null = null
let pendingEl: HTMLElement | null = null
let ghost: HTMLElement | null = null
let scrollTimer: ReturnType<typeof setInterval> | null = null
let scrollDir = 0
let lastSid: string | null = null
let lastIndex = -1
let draggingIsApp = false

// Svelte action attached to each tile wrapper; arms a potential drag on press.
export function draggable(node: HTMLElement, tileId: string) {
  let id = tileId
  const down = (e: PointerEvent) => beginDrag(e, id, node)
  node.addEventListener('pointerdown', down)
  return {
    update(next: string) {
      id = next
    },
    destroy() {
      node.removeEventListener('pointerdown', down)
    },
  }
}

function beginDrag(e: PointerEvent, tileId: string, el: HTMLElement) {
  if (!get(editMode) || e.button !== 0) return
  pendingTileId = tileId
  pendingEl = el
  startX = e.clientX
  startY = e.clientY
  pointerId = e.pointerId
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
  window.addEventListener('pointercancel', onUp)
}

function startDrag(e: PointerEvent) {
  const el = pendingEl
  if (!el) return
  const rect = el.getBoundingClientRect()
  grabDX = e.clientX - rect.left
  grabDY = e.clientY - rect.top
  lastSid = null
  lastIndex = -1
  draggingIsApp = findTileById(get(layout), pendingTileId ?? '')?.t === 'app'

  ghost = el.cloneNode(true) as HTMLElement
  ghost.querySelector('.tile-remove')?.remove()
  Object.assign(ghost.style, {
    position: 'fixed',
    left: '0',
    top: '0',
    margin: '0',
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    pointerEvents: 'none',
    zIndex: '999',
    opacity: '0.95',
    // The clone sits inside body.editing, so the wiggle keyframes would otherwise
    // override our translate() and pin it to the top-left corner.
    animation: 'none',
  })
  ghost.classList.add('drag-ghost')
  document.body.appendChild(ghost)
  moveGhost(e.clientX, e.clientY)
  draggingId.set(pendingTileId)
}

function moveGhost(px: number, py: number) {
  if (ghost) ghost.style.transform = `translate(${px - grabDX}px, ${py - grabDY}px) scale(1.07)`
}

function onMove(e: PointerEvent) {
  if (e.pointerId !== pointerId) return
  if (!get(draggingId)) {
    if (Math.abs(e.clientX - startX) <= THRESHOLD && Math.abs(e.clientY - startY) <= THRESHOLD) return
    startDrag(e)
  }
  e.preventDefault()
  moveGhost(e.clientX, e.clientY)
  update(e.clientX, e.clientY)
  edgeScroll(e.clientY)
}

function onUp(e: PointerEvent) {
  if (e.pointerId !== pointerId) return
  window.removeEventListener('pointermove', onMove)
  window.removeEventListener('pointerup', onUp)
  window.removeEventListener('pointercancel', onUp)
  stopEdgeScroll()
  if (ghost) {
    ghost.remove()
    ghost = null
  }

  const dragId = get(draggingId)
  const mergeInto = get(combineId)
  if (dragId && mergeInto) {
    const target = findTileById(get(layout), mergeInto)
    if (target?.t === 'folder') {
      layout.update(l => addToFolder(l, dragId, mergeInto))
    } else if (target?.t === 'app') {
      const {layout: next, folderId} = createFolder(get(layout), dragId, mergeInto)
      layout.set(next)
      openFolderId.set(folderId)
    }
  }

  combineId.set(null)
  draggingId.set(null)
  pendingTileId = null
  pendingEl = null
  pointerId = -1
}

// Decides between merging into a hovered tile (folder) and reordering between slots.
function update(px: number, py: number) {
  const dragId = get(draggingId)
  if (!dragId) return

  if (draggingIsApp) {
    const over = tileUnderPointer(px, py, dragId)
    if (over) {
      const r = over.getBoundingClientRect()
      const mx = r.width * 0.25
      const my = r.height * 0.25
      if (px >= r.left + mx && px <= r.right - mx && py >= r.top + my && py <= r.bottom - my) {
        combineId.set(over.dataset.tileId ?? null)
        lastSid = null
        lastIndex = -1
        return
      }
    }
  }

  combineId.set(null)
  const target = locate(px, py, dragId)
  if (!target) return
  if (target.sid === lastSid && target.index === lastIndex) return
  lastSid = target.sid
  lastIndex = target.index
  layout.update(l => moveTile(l, dragId, target.sid, target.index))
}

function tileUnderPointer(px: number, py: number, dragId: string): HTMLElement | null {
  const tiles = [...document.querySelectorAll<HTMLElement>('#sections [data-tile-id]')].filter(
    t => t.dataset.tileId !== dragId,
  )
  for (const t of tiles) {
    const r = t.getBoundingClientRect()
    if (px >= r.left && px <= r.right && py >= r.top && py <= r.bottom) return t
  }
  return null
}

// Finds the section under the pointer (or nearest vertically) and the insertion
// index among that section's tiles, excluding the dragged one.
function locate(px: number, py: number, dragId: string): {sid: string; index: number} | null {
  const containers = [...document.querySelectorAll<HTMLElement>('#sections [data-section-id]')]
  if (!containers.length) return null

  // 2D nearest-section search so several sections can share a row.
  let target: HTMLElement | null = null
  let best = Number.POSITIVE_INFINITY
  for (const c of containers) {
    const r = c.getBoundingClientRect()
    if (px >= r.left && px <= r.right && py >= r.top && py <= r.bottom) {
      target = c
      break
    }
    const dx = px < r.left ? r.left - px : px > r.right ? px - r.right : 0
    const dy = py < r.top ? r.top - py : py > r.bottom ? py - r.bottom : 0
    const d = Math.hypot(dx, dy)
    if (d < best) {
      best = d
      target = c
    }
  }
  if (!target?.dataset.sectionId) return null

  const tiles = [...target.querySelectorAll<HTMLElement>('[data-tile-id]')].filter(t => t.dataset.tileId !== dragId)
  let index = tiles.length
  for (let i = 0; i < tiles.length; i++) {
    const r = tiles[i].getBoundingClientRect()
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    if (py < cy - r.height / 4) {
      index = i
      break
    }
    if (py <= cy + r.height / 4 && px < cx) {
      index = i
      break
    }
  }
  return {sid: target.dataset.sectionId, index}
}

function edgeScroll(py: number) {
  const bottom = window.innerHeight - SCROLL_BOTTOM_GAP
  scrollDir = py < SCROLL_TOP ? -1 : py > bottom ? 1 : 0
  if (scrollDir && !scrollTimer) {
    scrollTimer = setInterval(() => window.scrollBy(0, scrollDir * SCROLL_STEP), 16)
  } else if (!scrollDir) {
    stopEdgeScroll()
  }
}

function stopEdgeScroll() {
  if (scrollTimer) {
    clearInterval(scrollTimer)
    scrollTimer = null
  }
  scrollDir = 0
}
