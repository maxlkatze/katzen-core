import { createStorage, type Storage, type Driver } from 'unstorage'
import type { RuntimeConfig } from 'nuxt/schema'

interface StorageManagementDriver extends Storage {
  publishContent: (content: string) => Promise<void>
}

interface ExtendedRuntimeConfig extends RuntimeConfig {
  storageKey: string
  storage: {
    type: string
    options: object
  }
}

export const useContentStorage = async (_runtimeConfig: RuntimeConfig): Promise<StorageManagementDriver> => {
  const runtimeConfig = _runtimeConfig as ExtendedRuntimeConfig
  let driver: Driver
  try {
    driver = (await import(`unstorage/drivers/${runtimeConfig.storage.type}`))(runtimeConfig.storage.options)
  }
  catch (e) {
    try {
      driver = (await import(`unstorage/drivers/${runtimeConfig.storage.type}`)).default(JSON.parse(JSON.stringify(runtimeConfig.storage.options)))
    }
    catch (e) {
      console.error(e)
      throw new Error(`Driver ${runtimeConfig.storage.type} not found`)
    }
  }

  const storage = createStorage<object>({
    driver,
  }) as StorageManagementDriver
  // Add custom method to publish content
  storage.publishContent = async (content) => {
    // TODO
    console.log('Publishing content', content)
  }
  return storage
}
