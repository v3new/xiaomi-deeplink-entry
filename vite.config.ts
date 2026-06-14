import {svelte} from '@sveltejs/vite-plugin-svelte'
import {defineConfig} from 'vite'

export default defineConfig({
  base: '/',
  plugins: [svelte()],
  server: {
    port: 8080,
    host: true,
  },
  preview: {
    port: 8080,
    host: true,
  },
})
