import { createStorage, type Storage, type Driver } from 'unstorage'
import type { RuntimeConfig } from 'nuxt/schema'

interface StorageManagmentDriver extends Storage {
  publishContent: (content: string) => Promise<void>
}

export const useContentStorage = async (runtimeConfig: RuntimeConfig): Promise<StorageManagmentDriver> => {
  let driver: Driver
  try {
    driver = (await import(`unstorage/drivers/${runtimeConfig.storage.type}`))(runtimeConfig.storage.options)
  }
  catch (e) {
    try {
      driver = (await import(`unstorage/drivers/${runtimeConfig.storage.type}`)).default(JSON.parse(JSON.stringify(runtimeConfig.storage.options)))
    }
    catch (e) {
      throw new Error(`Driver ${runtimeConfig.storage.type} not found`)
    }
  }

  const storage = createStorage<object>({
    driver,
  }) as StorageManagmentDriver
  // Add custom method to publish content
  storage.publishContent = async (content) => {
    // TODO
    console.log('Publishing content', content)
  }
  return storage
}
