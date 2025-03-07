import type { RuntimeConfig } from 'nuxt/schema'

export type CmsUser = {
  name: string
  password: string
}

export interface ModuleOptions {
  users: CmsUser[]
  secret: string
  projectLocation: string
  storage: StorageDefinition
  storageKey: string
  deployHookURL?: string
  addons: {
    deviceRecognition: AddonDeviceRecognition
  }
}

export type StorageDefinition = {
  type: StorageType
  options: unknown
}

export type StorageType = 'azure-app-configuration' | 'cloudflare-kv-binding' | 'fs' | 'github' | 'mongodb' | 'netlify-blobs' | 'planetscale' | 'redis' | 'upstash' | 'vercel-kv'

export type AddonDeviceRecognition = {
  defaultUserAgent?: string
  responsiveContainerClass?: string
}

export interface ExtendedRuntimeConfig extends RuntimeConfig {
  storageKey: string
  storage: {
    type: StorageType
    options: unknown
  }
}
