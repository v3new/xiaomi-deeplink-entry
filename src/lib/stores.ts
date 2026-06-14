import {writable} from 'svelte/store'
import {type Layout, load, save} from './layout'

// Single source of truth for the home-screen arrangement; persisted on every change.
export const layout = writable<Layout>(load())
layout.subscribe(value => save(value))

// Whether the user is in edit (jiggle) mode.
export const editMode = writable(false)

// Id of the folder currently expanded over the screen, or null.
export const openFolderId = writable<string | null>(null)
