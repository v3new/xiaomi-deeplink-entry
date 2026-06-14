<script lang="ts">
import type {App} from '../apps'
import {APP_BY_ID} from '../apps'
import {tryOpenDeeplink} from '../lib/deeplink'
import type {FolderTile} from '../lib/layout'
import {DEFAULT_FOLDER_LABEL, removeFromFolder, renameFolder} from '../lib/layout-ops'
import {editMode, layout, openFolderId} from '../lib/stores'

const folder = $derived(
  $layout.sections.flatMap(s => s.items).find((t): t is FolderTile => t.t === 'folder' && t.id === $openFolderId),
)

const apps = $derived(folder ? folder.items.map(id => APP_BY_ID.get(id)).filter((a): a is App => Boolean(a)) : [])

// Close the overlay if its folder no longer exists (e.g. dissolved to one app).
$effect(() => {
  if ($openFolderId && !folder) openFolderId.set(null)
})

function close() {
  openFolderId.set(null)
}

function rename(e: Event) {
  if (!folder) return
  const value = (e.target as HTMLInputElement).value.trim()
  layout.update(l => renameFolder(l, folder.id, value || DEFAULT_FOLDER_LABEL))
}

function openApp(app: App) {
  if ($editMode) return
  tryOpenDeeplink(app.scheme, app.path, app.package, app.fallbackUrl)
}

function popOut(id: string) {
  layout.update(l => removeFromFolder(l, id))
}

function focusSelect(node: HTMLInputElement) {
  node.focus()
  node.select()
}
</script>

{#if folder}
  <div class="folder-overlay" role="presentation" onclick={close}>
    <div class="folder-panel" role="presentation" onclick={e => e.stopPropagation()}>
      {#if $editMode}
        <input class="folder-name" value={folder.label} onchange={rename} use:focusSelect maxlength="24" />
      {:else}
        <div class="folder-name folder-name-static">{folder.label}</div>
      {/if}
      <div class="folder-apps">
        {#each apps as app (app.id)}
          <div class="folder-app">
            <button type="button" class="app-button" onclick={() => openApp(app)}>
              <img src={app.icon} alt={app.name} class="app-icon" />
              {app.name}
            </button>
            {#if $editMode}
              <button type="button" class="tile-remove" onclick={() => popOut(app.id)} aria-label="Move {app.name} out">
                <span aria-hidden="true">−</span>
              </button>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  </div>
{/if}
