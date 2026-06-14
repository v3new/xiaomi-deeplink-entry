<script lang="ts">
import {APP_BY_ID} from '../apps'
import {tryOpenDeeplink} from '../lib/deeplink'
import type {Tile} from '../lib/layout'
import {hideApp} from '../lib/layout-ops'
import {editMode, layout} from '../lib/stores'
import AppIcon from './AppIcon.svelte'
import Folder from './Folder.svelte'

let {tile}: {tile: Tile} = $props()

const app = $derived(tile.t === 'app' ? APP_BY_ID.get(tile.id) : undefined)
const folder = $derived(tile.t === 'folder' ? tile : undefined)

function onClick() {
  if ($editMode || !app) return
  tryOpenDeeplink(app.scheme, app.path, app.package, app.fallbackUrl)
}

function remove() {
  if (tile.t === 'app') layout.update(l => hideApp(l, tile.id))
}
</script>

{#if app}
  <button type="button" class="app-button" onclick={onClick}>
    <AppIcon src={app.icon} label={app.name} class="app-icon" />
    {app.name}
  </button>
  {#if $editMode}
    <button type="button" class="tile-remove" onclick={remove} aria-label="Hide {app.name}">
      <span aria-hidden="true">−</span>
    </button>
  {/if}
{:else if folder}
  <Folder tile={folder} />
{/if}
