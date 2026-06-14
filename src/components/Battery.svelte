<script lang="ts">
import {battery} from '../lib/battery'
</script>

{#if $battery.supported}
  <div class="battery-area">
    <div
      class="battery-badge"
      class:blink={$battery.low}
      title={$battery.title}
      style:--battery-color={$battery.color}>
      {#if $battery.charging}
        <svg class="bat-bolt" viewBox="0 0 28 14" aria-hidden="true">
          <path d="M14 3 L10 8 h3 l-1 4 5-6 h-3 z" />
        </svg>
      {/if}
      <svg class="battery-icon" viewBox="0 0 28 14" aria-hidden="true">
        <rect class="bat-body" x="1" y="2" width="24" height="10" rx="3" />
        <rect class="bat-cap" x="26" y="5" width="2" height="4" rx="1" />
        <rect class="bat-fill" x="2" y="3" width={$battery.fillWidth} height="8" rx="2" />
        <text class="bat-text" x="13" y="7" text-anchor="middle" dominant-baseline="central">
          {$battery.pct}
        </text>
      </svg>
    </div>
  </div>
{/if}
