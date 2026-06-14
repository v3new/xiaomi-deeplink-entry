<script lang="ts">
import {clearDebugLogs, debugEnabled, debugLogs} from '../lib/debug'

let hidden = $state(false)
</script>

{#if debugEnabled}
  {#if hidden}
    <button type="button" class="debug-tab" onclick={() => (hidden = false)}>DBG</button>
  {:else}
    <aside class="debug-panel" aria-label="Debug log">
      <div class="debug-head">
        <span class="debug-title">root@weather:~# tail -f signal.log</span>
        <div class="debug-actions">
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
