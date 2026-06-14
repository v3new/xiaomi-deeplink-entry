import type {Layout} from '../lib/layout'
import {APP_BY_ID} from './index'

export const LAYOUT_VERSION = 3 as const

// Builds the fresh-launch screen. Everything not listed here stays hidden in the tray.
export function defaultLayout(): Layout {
  const layout: Layout = {
    version: LAYOUT_VERSION,
    sections: [
      {
        id: 'music',
        label: 'Music',
        items: [
          {t: 'app', id: 'yandex-music'},
          {t: 'app', id: 'apple-music'},
        ],
      },
      {
        id: 'navigation',
        label: 'Navigation',
        items: [
          {t: 'app', id: 'yandex-navi'},
          {t: 'app', id: 'waze'},
        ],
      },
      {
        id: 'calls',
        label: null,
        items: [{t: 'app', id: 'zoom'}],
      },
      {
        id: 'ai-entertainment',
        label: null,
        items: [
          {t: 'app', id: 'chatgpt'},
          {t: 'folder', id: 'folder-ai', label: 'AI', items: ['claude', 'alice', 'grok', 'gemini']},
          {
            t: 'folder',
            id: 'folder-entertainment',
            label: 'Video',
            items: ['kinopub', 'tiktok', 'kinopoisk', 'youtube'],
          },
        ],
      },
    ],
  }

  assertKnownAppIds(layout)
  return layout
}

function assertKnownAppIds(layout: Layout): void {
  const unknownIds = placedAppIds(layout).filter(id => !APP_BY_ID.has(id))

  if (unknownIds.length > 0) {
    throw new Error(`Default layout references unknown app ids: ${unknownIds.join(', ')}`)
  }
}

function placedAppIds(layout: Layout): string[] {
  const ids = new Set<string>()

  for (const section of layout.sections) {
    for (const tile of section.items) {
      if (tile.t === 'app') ids.add(tile.id)
      else for (const id of tile.items) ids.add(id)
    }
  }

  return [...ids]
}
