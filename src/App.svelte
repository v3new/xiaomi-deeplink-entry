<script lang="ts">
import {onMount} from 'svelte'
import settingsIcon from '../svg/settings.svg'
import FolderOverlay from './components/FolderOverlay.svelte'
import Home from './components/Home.svelte'
import InfoBlock from './components/InfoBlock.svelte'
import StatusBar from './components/StatusBar.svelte'
import Tray from './components/Tray.svelte'
import {setupAutoReload} from './lib/autoreload'
import {pruneEmptySections} from './lib/layout-ops'
import {editMode, layout} from './lib/stores'
import {initWeather} from './lib/weather'

let wasEditing = false

if (typeof window !== 'undefined') initWeather()

onMount(() => {
  setupAutoReload()
})

$effect(() => {
  const on = $editMode
  // Tidy up sections left empty during editing once the user is done.
  if (wasEditing && !on) layout.update(pruneEmptySections)
  wasEditing = on
})

function enterEdit() {
  editMode.set(true)
}
</script>

<svelte:body class:editing={$editMode} />

<div class="stars"></div>
<StatusBar />

{#if $editMode}
  <button type="button" class="edit-done" onclick={() => editMode.set(false)}>Done</button>
{/if}

<div class="wrapper">
  <InfoBlock />
  <Home />
  <div class="footer">
    <div class="links">
      <a href="https://t.me/XiaomiEVclub" class="xiaomi-club" target="_blank" rel="noreferrer">Xiaomi Enthusiasts</a>
      //
      Idea Hub //
      <a href="https://t.me/v3new" class="idea-hub" target="_blank" rel="noreferrer">@v3new</a>
    </div>
    <div
      class="settings-toggle"
      role="button"
      tabindex="0"
      onclick={enterEdit}
      onkeydown={e => (e.key === 'Enter' || e.key === ' ') && enterEdit()}>
      <img src={settingsIcon} alt="settings" />
    </div>
  </div>
</div>

<Tray />
<FolderOverlay />
