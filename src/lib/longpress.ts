import type {ActionReturn} from 'svelte/action'

type Params = {duration?: number; moveTolerance?: number}
type Attributes = {onlongpress?: (e: CustomEvent<void>) => void}

// Svelte action: dispatches a `longpress` CustomEvent when the pointer is held
// still on the node for `duration` ms. Cancels on movement beyond tolerance.
export function longpress(node: HTMLElement, params: Params = {}): ActionReturn<Params, Attributes> {
  let duration = params.duration ?? 500
  let tolerance = params.moveTolerance ?? 10
  let timer: ReturnType<typeof setTimeout> | null = null
  let startX = 0
  let startY = 0

  const clear = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  const down = (e: PointerEvent) => {
    startX = e.clientX
    startY = e.clientY
    clear()
    timer = setTimeout(() => node.dispatchEvent(new CustomEvent('longpress')), duration)
  }

  const move = (e: PointerEvent) => {
    if (timer && (Math.abs(e.clientX - startX) > tolerance || Math.abs(e.clientY - startY) > tolerance)) clear()
  }

  node.addEventListener('pointerdown', down)
  node.addEventListener('pointermove', move)
  node.addEventListener('pointerup', clear)
  node.addEventListener('pointercancel', clear)
  node.addEventListener('pointerleave', clear)

  return {
    update(next: Params) {
      duration = next.duration ?? 500
      tolerance = next.moveTolerance ?? 10
    },
    destroy() {
      clear()
      node.removeEventListener('pointerdown', down)
      node.removeEventListener('pointermove', move)
      node.removeEventListener('pointerup', clear)
      node.removeEventListener('pointercancel', clear)
      node.removeEventListener('pointerleave', clear)
    },
  }
}
