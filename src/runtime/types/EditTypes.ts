import type { RouteComponent } from 'vue-router'

export type Lazy<T> = () => Promise<T>
export interface ContentCmsResponse {
  success: boolean
  body?: {
    content: Record<string, string>
  }
}
export interface Route {
  name: string
  path: string
  component: Lazy<RouteComponent> | RouteComponent | undefined | null
}
export interface MenuEntry {
  name: string
  click: () => void
  active: () => boolean
}
export interface ImageListResponse {
  body: {
    images: string[]
  }
}
export interface RequestState {
  loading: boolean
  success: boolean
  failed: boolean
}

export interface ApiResponse {
  success: boolean
  missingDeployHookURL?: boolean
}
