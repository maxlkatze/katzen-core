import { createStorage, type Storage, type Driver } from 'unstorage'
import type { RuntimeConfig } from 'nuxt/schema'

interface StorageManagementDriver extends Storage {
  publishContent: (content: string) => Promise<void>
}

interface ExtendedRuntimeConfig extends RuntimeConfig {
  storageKey: string
  storage: {
    type: 'azure-app-configuration' | 'cloudflare-kv-binding' | 'fs' | 'github' | 'mongodb' | 'netlify-blobs' | 'planetscale' | 'redis' | 'vercel-kv'
    options: unknown
  }
}

interface DynamicModuleImport {
  default: (opts: unknown) => Driver
}

interface DynamicNitroPackImport {
  (opts: unknown): Driver
}

export const useContentStorage = async (_runtimeConfig: RuntimeConfig): Promise<StorageManagementDriver> => {
  const runtimeConfig = _runtimeConfig as ExtendedRuntimeConfig
  let module: unknown
  switch (runtimeConfig.storage.type) {
    case 'azure-app-configuration':
      module = await import('unstorage/drivers/azure-app-configuration')
      break
    case 'cloudflare-kv-binding':
      module = await import('unstorage/drivers/cloudflare-kv-binding')
      break
    case 'fs':
      module = await import('unstorage/drivers/fs')
      break
    case 'github':
      module = await import('unstorage/drivers/github')
      break
    case 'mongodb':
      module = await import('unstorage/drivers/mongodb')
      break
    case 'netlify-blobs':
      module = await import('unstorage/drivers/netlify-blobs')
      break
    case 'planetscale':
      module = await import('unstorage/drivers/planetscale')
      break
    case 'redis':
      module = await import('unstorage/drivers/redis')
      break
    case 'vercel-kv':
      module = await import('unstorage/drivers/vercel-kv')
      break
    default:
      throw new Error(`Driver ${runtimeConfig.storage.type} not found`)
  }

  let driver: Driver
  const copiedOptions = JSON.parse(JSON.stringify(runtimeConfig.storage.options))
  try {
    const nitroPackImport = module as DynamicNitroPackImport
    driver = nitroPackImport(copiedOptions) as Driver
  }
  catch (e1) {
    try {
      const moduleImport = module as DynamicModuleImport
      driver = moduleImport.default(copiedOptions) as Driver
    }
    catch (e2) {
      console.log('\x1B[41m\x1B[30m !Katze \x1B[0m Have you installed the driver for the storage type? Consult the unstorage documentation for more information')
      throw new Error(`Driver ${runtimeConfig.storage.type} could not be imported, possible error: ${e1}, ${e2}`)
    }
  }

  const storage = createStorage<object>({
    driver,
  }) as StorageManagementDriver
  // Add custom method to publish content
  storage.publishContent = async (content) => {
    // TODO GITHUB ETC
    console.log('Publishing content', content)
  }
  return storage
}
