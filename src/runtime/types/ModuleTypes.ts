export interface CmsUser {
  name: string
  password: string
}

export interface ModuleOptions {
  users: CmsUser[]
  secret: string
  projectLocation: string
  storage: {
    type: 'azure-app-configuration' | 'cloudflare-kv-binding' | 'fs' | 'github' | 'mongodb' | 'netlify-blobs' | 'planetscale' | 'redis' | 'vercel-kv'
    options: object
  }
  storageKey: string
  deployHookURL?: string
  addons: {
    deviceRecognition: AddonDeviceRecognition
  }
}

export interface AddonDeviceRecognition {
  defaultUserAgent: string
  responsiveContainerClass?: string
}
