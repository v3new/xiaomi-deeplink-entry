<script lang="ts">
import {addSection} from '../lib/layout-ops'
import {longpress} from '../lib/longpress'
import {editMode, layout} from '../lib/stores'
import Section from './Section.svelte'

function enterEdit() {
  editMode.set(true)
}
</script>

<div id="sections" use:longpress onlongpress={enterEdit}>
  {#each $layout.sections as section (section.id)}
    <Section {section} />
  {/each}
  {#if $editMode}
    <button type="button" class="add-section" onclick={() => layout.update(addSection)}>Add section</button>
  {/if}
</div>
