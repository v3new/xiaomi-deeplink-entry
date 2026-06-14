<script lang="ts">
import {flip} from 'svelte/animate'
import {combineId, draggable, draggingId} from '../lib/dnd'
import {draggingSectionId, sectionDraggable} from '../lib/dnd-section'
import type {Section} from '../lib/layout'
import {deleteSection, renameSection} from '../lib/layout-ops'
import {editMode, layout} from '../lib/stores'
import Tile from './Tile.svelte'

let {section}: {section: Section} = $props()

const cols = $derived(Math.max(1, Math.min(section.items.length, 4)))
// Natural content width: columns + inner gaps + section padding. Used as the
// flex-basis so wrapping happens at the content size, then sections grow to fill.
const basis = $derived(cols * 84 + (cols - 1) * 10 + 24)
const compactBasis = $derived(cols * 72 + (cols - 1) * 8)

function rename(e: Event) {
  layout.update(l => renameSection(l, section.id, (e.target as HTMLInputElement).value))
}

function removeSection() {
  layout.update(l => deleteSection(l, section.id))
}
</script>

<div
  class="section"
  class:dragging-section={$draggingSectionId === section.id}
  style="--basis:{basis}px; --compact-basis:{compactBasis}px">
  {#if $editMode}
    <div class="section-head">
      <span class="section-grip" use:sectionDraggable={section.id} role="button" aria-label="Move section">⠿</span>
      <input
        class="section-name"
        value={section.label ?? ''}
        placeholder="Untitled"
        onchange={rename}
        maxlength="24" />
      <button type="button" class="section-delete" onclick={removeSection} aria-label="Delete section">
        <span aria-hidden="true">×</span>
      </button>
    </div>
  {:else if section.label}
    <h2 class="section-title">{section.label}</h2>
  {/if}

  <div class="container" class:empty={section.items.length === 0} data-section-id={section.id} style="--cols:{cols}">
    {#each section.items as tile (tile.id)}
      <div
        class="tile"
        class:dragging={$draggingId === tile.id}
        class:combine-target={$combineId === tile.id}
        data-tile-id={tile.id}
        use:draggable={tile.id}
        animate:flip={{duration: 180}}>
        <Tile {tile} />
      </div>
    {/each}
    {#if $editMode && section.items.length === 0}
      <div class="section-empty">Drop here</div>
    {/if}
  </div>
</div>
