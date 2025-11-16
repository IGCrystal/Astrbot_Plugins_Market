export interface PluginRecord {
  id: string
  name: string
  display_name: string
  desc?: string
  author?: string
  repo?: string
  homepage?: string
  social_link?: string
  logo?: string
  stars?: number
  version?: string
  tags: string[]
  updated_at?: string
  [key: string]: unknown
}
