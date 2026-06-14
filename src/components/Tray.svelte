<script lang="ts">
import type {App} from '../apps'
import {APP_BY_ID} from '../apps'
import {defaultLayout} from '../apps/default-layout'
import {hiddenAppIds} from '../lib/layout'
import {showApp} from '../lib/layout-ops'
import {editMode, layout} from '../lib/stores'
import AppIcon from './AppIcon.svelte'

const hidden = $derived(
  hiddenAppIds($layout)
    .map(id => APP_BY_ID.get(id))
    .filter((a): a is App => Boolean(a)),
)

function show(id: string) {
  layout.update(l => showApp(l, id))
}

function reset() {
  if (confirm('Reset layout to the default?')) layout.set(defaultLayout())
}
</script>

{#if $editMode}
  <div class="tray">
    <div class="tray-head">
      <button type="button" class="tray-reset" onclick={reset}>Reset layout</button>
    </div>
    {#if hidden.length}
      <div class="tray-row">
        {#each hidden as app (app.id)}
          <button type="button" class="tray-item" onclick={() => show(app.id)}>
            <AppIcon src={app.icon} label={app.name} class="app-icon" />
            <span>{app.name}</span>
          </button>
        {/each}
      </div>
    {:else}
      <div class="tray-empty">All apps are on the screen</div>
    {/if}
  </div>
{/if}
