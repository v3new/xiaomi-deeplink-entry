export type App = {
  id: string
  name: string
  package?: string
  scheme?: string
  path?: string
  fallbackUrl?: string
  iconSource?: string
  icon: string
}

export type Catalog = Record<string, App[]>
