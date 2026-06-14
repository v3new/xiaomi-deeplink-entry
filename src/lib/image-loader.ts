const MAX_ACTIVE_LOADS = 3
const INITIAL_LOAD_DELAY_MS = 900
const DEFAULT_TIMEOUT_MS = 4500

type ImageJob = {
  reject: (error: Error) => void
  resolve: (url: string) => void
  timeoutMs: number
  url: string
}

const queue: ImageJob[] = []

let activeLoads = 0
let delayElapsed = false
let delayTimer: number | null = null

function schedulePump(): void {
  if (delayElapsed) {
    pump()
    return
  }

  if (delayTimer !== null) return
  delayTimer = window.setTimeout(() => {
    delayElapsed = true
    delayTimer = null
    pump()
  }, INITIAL_LOAD_DELAY_MS)
}

function settle(job: ImageJob, image: HTMLImageElement, timer: number, error?: Error): void {
  window.clearTimeout(timer)
  image.onload = null
  image.onerror = null
  if (error) image.src = ''

  activeLoads -= 1
  if (error) job.reject(error)
  else job.resolve(job.url)
  pump()
}

function startJob(job: ImageJob): void {
  activeLoads += 1

  const image = new Image()
  let settled = false
  const finish = (error?: Error) => {
    if (settled) return
    settled = true
    settle(job, image, timer, error)
  }

  const timer = window.setTimeout(() => {
    finish(new Error(`Image request timed out: ${job.url}`))
  }, job.timeoutMs)

  image.decoding = 'async'
  image.referrerPolicy = 'no-referrer'
  image.onload = () => finish()
  image.onerror = () => finish(new Error(`Image request failed: ${job.url}`))
  image.src = job.url
}

function pump(): void {
  if (!delayElapsed) {
    schedulePump()
    return
  }

  while (activeLoads < MAX_ACTIVE_LOADS && queue.length > 0) {
    const job = queue.shift()
    if (job) startJob(job)
  }
}

export function loadQueuedImage(url: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<string> {
  if (typeof window === 'undefined' || typeof Image === 'undefined') {
    return Promise.reject(new Error('Image loading is unavailable'))
  }

  return new Promise((resolve, reject) => {
    queue.push({reject, resolve, timeoutMs, url})
    schedulePump()
  })
}
