import {mount} from 'svelte'
import '../css/main.css'
import '../css/status.css'
import '../css/background.css'
import '../css/sections.css'
import '../css/edit.css'
import '../css/debug.css'
import App from './App.svelte'

const target = document.getElementById('app')
if (!target) throw new Error('#app mount target not found')

const app = mount(App, {target})

export default app
