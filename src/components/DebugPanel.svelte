<script lang="ts">
import {clearDebugLogs, type DebugEntry, debugEnabled, debugLogs} from '../lib/debug'

let hidden = $state(false)
let copyStatus = $state('')
let copyTimer: number | null = null

function formatLogLine(log: DebugEntry): string {
  const details = log.details ? ` :: ${log.details}` : ''
  return `[${log.time}] ${log.scope.toUpperCase()} ${log.level.toUpperCase()} ${log.message}${details}`
}

function formatLogs(logs: DebugEntry[]): string {
  if (logs.length === 0) return '[--:--:--] BOOT INFO waiting for signal...'
  return logs.map(formatLogLine).join('\n')
}

function setCopyStatus(status: string): void {
  copyStatus = status
  if (copyTimer !== null) window.clearTimeout(copyTimer)
  copyTimer = window.setTimeout(() => {
    copyStatus = ''
    copyTimer = null
  }, 1600)
}

function copyWithFallback(text: string): void {
  const input = document.createElement('textarea')
  input.value = text
  input.setAttribute('readonly', '')
  input.style.position = 'fixed'
  input.style.left = '-9999px'
  document.body.append(input)
  input.select()

  try {
    if (!document.execCommand('copy')) throw new Error('execCommand copy returned false')
  } finally {
    input.remove()
  }
}

async function copyAll(): Promise<void> {
  const text = formatLogs($debugLogs)

  try {
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text)
    else copyWithFallback(text)
    setCopyStatus('copied')
  } catch (e) {
    console.warn('Debug copy failed', e)
    setCopyStatus('copy failed')
  }
}
</script>

{#if debugEnabled}
  {#if hidden}
    <button type="button" class="debug-tab" onclick={() => (hidden = false)}>DBG</button>
  {:else}
    <aside class="debug-panel" aria-label="Debug log">
      <div class="debug-head">
        <span class="debug-title">root@weather:~# tail -f signal.log</span>
        <div class="debug-actions">
          {#if copyStatus}
            <span class="debug-copy-status">{copyStatus}</span>
          {/if}
          <button type="button" onclick={copyAll}>copy all</button>
          <button type="button" onclick={clearDebugLogs}>clear</button>
          <button type="button" onclick={() => (hidden = true)}>hide</button>
        </div>
      </div>
      <div class="debug-log">
        {#if $debugLogs.length === 0}
          <div class="debug-line info">
            <span class="debug-time">--:--:--</span>
            <span class="debug-scope">boot</span>
            <span class="debug-message">waiting for signal...</span>
          </div>
        {:else}
          {#each $debugLogs as log (log.id)}
            <div class="debug-line {log.level}">
              <span class="debug-time">{log.time}</span>
              <span class="debug-scope">{log.scope}</span>
              <span class="debug-message">{log.message}</span>
              {#if log.details}
                <span class="debug-details">{log.details}</span>
              {/if}
            </div>
          {/each}
        {/if}
      </div>
    </aside>
  {/if}
{/if}
