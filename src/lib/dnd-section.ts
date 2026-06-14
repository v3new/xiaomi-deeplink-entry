import {get, writable} from 'svelte/store'
import {moveSection} from './layout-ops'
import {editMode, layout} from './stores'

// Id of the section currently being dragged (its placeholder is hidden).
export const draggingSectionId = writable<string | null>(null)

const THRESHOLD = 8

let pointerId = -1
let startX = 0
let startY = 0
let grabDX = 0
let grabDY = 0
let pendingId: string | null = null
let pendingSection: HTMLElement | null = null
let ghost: HTMLElement | null = null
let lastIndex = -1

// Svelte action on a section's drag handle; arms a section drag on press.
export function sectionDraggable(node: HTMLElement, sectionId: string) {
  let id = sectionId
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

function beginDrag(e: PointerEvent, sectionId: string, handle: HTMLElement) {
  if (!get(editMode) || e.button !== 0) return
  e.stopPropagation()
  pendingId = sectionId
  pendingSection = handle.closest('.section')
  startX = e.clientX
  startY = e.clientY
  pointerId = e.pointerId
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
  window.addEventListener('pointercancel', onUp)
}

function startDrag(e: PointerEvent) {
  const el = pendingSection
  if (!el) return
  const rect = el.getBoundingClientRect()
  grabDX = e.clientX - rect.left
  grabDY = e.clientY - rect.top
  lastIndex = -1

  ghost = el.cloneNode(true) as HTMLElement
  ghost.removeAttribute('style')
  // Drop ids inside the clone so section/tile hit-tests never match it.
  for (const n of ghost.querySelectorAll('[data-section-id],[data-tile-id]')) {
    n.removeAttribute('data-section-id')
    n.removeAttribute('data-tile-id')
  }
  Object.assign(ghost.style, {
    position: 'fixed',
    left: '0',
    top: '0',
    margin: '0',
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    pointerEvents: 'none',
    zIndex: '998',
    opacity: '0.95',
    animation: 'none',
  })
  ghost.classList.add('drag-ghost')
  document.body.appendChild(ghost)
  moveGhost(e.clientX, e.clientY)
  draggingSectionId.set(pendingId)
}

function moveGhost(px: number, py: number) {
  if (ghost) ghost.style.transform = `translate(${px - grabDX}px, ${py - grabDY}px) scale(1.03)`
}

function onMove(e: PointerEvent) {
  if (e.pointerId !== pointerId) return
  if (!get(draggingSectionId)) {
    if (Math.abs(e.clientX - startX) <= THRESHOLD && Math.abs(e.clientY - startY) <= THRESHOLD) return
    startDrag(e)
  }
  e.preventDefault()
  moveGhost(e.clientX, e.clientY)
  reorder(e.clientX, e.clientY)
}

function onUp(e: PointerEvent) {
  if (e.pointerId !== pointerId) return
  window.removeEventListener('pointermove', onMove)
  window.removeEventListener('pointerup', onUp)
  window.removeEventListener('pointercancel', onUp)
  if (ghost) {
    ghost.remove()
    ghost = null
  }
  draggingSectionId.set(null)
  pendingId = null
  pendingSection = null
  pointerId = -1
}

function reorder(px: number, py: number) {
  const dragId = get(draggingSectionId)
  if (!dragId) return
  const index = locate(px, py, dragId)
  if (index === lastIndex) return
  lastIndex = index
  layout.update(l => moveSection(l, dragId, index))
}

// Reading-order insertion index among the section cards, excluding the dragged one.
function locate(px: number, py: number, dragId: string): number {
  const sections = [...document.querySelectorAll<HTMLElement>('#sections [data-section-id]')]
    .map(c => ({id: c.dataset.sectionId, el: c.closest('.section') as HTMLElement}))
    .filter(s => s.id && s.id !== dragId && s.el)
  for (let i = 0; i < sections.length; i++) {
    const r = sections[i].el.getBoundingClientRect()
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    const after = py < cy - r.height / 2 || (Math.abs(py - cy) <= r.height / 2 && px < cx)
    if (after) return i
  }
  return sections.length
}
