<script lang="ts">
import {onMount} from 'svelte'
import {loadQueuedImage} from '../lib/image-loader'

let {src, label, class: className = ''}: {class?: string; label: string; src: string} = $props()

let loadedSrc = $state('')
let failed = $state(false)

const initials = $derived(
  label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toLocaleUpperCase('ru-RU') ?? '')
    .join('') || '?',
)

onMount(() => {
  let mounted = true

  loadQueuedImage(src)
    .then(url => {
      if (mounted) loadedSrc = url
    })
    .catch(error => {
      if (!mounted) return
      failed = true
      console.warn('App icon failed to load', src, error)
    })

  return () => {
    mounted = false
  }
})
</script>

<span class={['app-icon-shell', className].filter(Boolean).join(' ')} aria-hidden="true">
  {#if loadedSrc && !failed}
    <img src={loadedSrc} alt="" decoding="async" />
  {:else}
    <span class="app-icon-initials">{initials}</span>
  {/if}
</span>
