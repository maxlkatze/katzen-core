// Types for Route
export interface Route {
  name: string
  path: string
  slug?: string
  component: unknown
}

// Lazy type for async component loading
export type Lazy<T> = () => Promise<T>
