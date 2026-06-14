<script lang="ts">
import type {App} from '../apps'
import {APP_BY_ID} from '../apps'
import type {FolderTile} from '../lib/layout'
import {openFolderId} from '../lib/stores'
import AppIcon from './AppIcon.svelte'

let {tile}: {tile: FolderTile} = $props()

const preview = $derived(
  tile.items
    .slice(0, 9)
    .map(id => APP_BY_ID.get(id))
    .filter((a): a is App => Boolean(a)),
)

// Fewer apps → fewer, larger preview icons (≤4 lays out 2-wide, otherwise 3-wide),
// centered in the box so it never looks lopsided.
const mini = $derived(preview.length <= 4 ? 20 : 13)

function open() {
  openFolderId.set(tile.id)
}
</script>

<button type="button" class="folder" onclick={open}>
  <span class="folder-grid" style="--mini:{mini}px">
    {#each preview as app (app.id)}
      <AppIcon src={app.icon} label={app.name} class="app-icon" />
    {/each}
  </span>
  <span class="folder-label">{tile.label}</span>
</button>
