import {ai} from './ai'
import {communication} from './communication'
import {entertainment} from './entertainment'
import {messengers} from './messengers'
import {music} from './music'
import {navigation} from './navigation'
import {tools} from './tools'
import type {App, Catalog} from './types'

// Order here defines app grouping and hidden tray order.
export const SERVICES: Catalog = {
  music,
  navigation,
  communication,
  ai,
  entertainment,
  messengers,
  tools,
}

export const ALL_APPS: App[] = Object.values(SERVICES).flat()

function assertUniqueAppIds(apps: App[]): void {
  const seen = new Set<string>()
  const duplicates = new Set<string>()

  for (const app of apps) {
    if (seen.has(app.id)) duplicates.add(app.id)
    seen.add(app.id)
  }

  if (duplicates.size > 0) {
    throw new Error(`Duplicate app ids: ${[...duplicates].join(', ')}`)
  }
}

assertUniqueAppIds(ALL_APPS)

export const APP_BY_ID: Map<string, App> = new Map(ALL_APPS.map(app => [app.id, app]))

export type {App, Catalog} from './types'
